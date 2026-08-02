import type { Exercise, ExerciseType, KanjiItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";
import { n5KanjiCatalog } from "./kanjiCatalog";

const REQUIRED_PRACTICE_TYPES: readonly ExerciseType[] = [
  "listening",
  "text-input",
  "sentence-builder",
  "particle-gap",
  "conjugation",
  "handwriting",
];

const unique = (values: string[]): string[] => [...new Set(values)];

const hiraganaToKatakana = (value: string): string =>
  [...value].map((character) => {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined || codePoint < 0x3041 || codePoint > 0x3096) {
      return character;
    }
    return String.fromCodePoint(codePoint + 0x60);
  }).join("");

export const getLessonKanji = (lessonId: string): KanjiItem[] =>
  n5KanjiCatalog.filter((item) => item.introducedInLessonId === lessonId);

const distractorKanji = (target: KanjiItem, lessonKanji: readonly KanjiItem[]): KanjiItem[] => {
  const candidates = [
    ...lessonKanji.filter((item) => item.id !== target.id),
    ...n5KanjiCatalog.filter((item) => item.id !== target.id),
  ];
  const selected: KanjiItem[] = [];
  const usedMeanings = new Set(target.meaningsRu);

  for (const candidate of candidates) {
    const meaning = candidate.meaningsRu[0];
    if (!meaning || usedMeanings.has(meaning)) continue;
    selected.push(candidate);
    usedMeanings.add(meaning);
    if (selected.length === 3) break;
  }
  return selected;
};

const createRecognitionExercise = (
  lessonId: string,
  item: KanjiItem,
  lessonKanji: readonly KanjiItem[],
): Exercise => {
  const example = item.examples[0];
  const confusions = distractorKanji(item, lessonKanji);
  return {
    id: `${lessonId}-kanji-${item.literal}-recognition`,
    type: "multiple-choice",
    prompt: `Что означает кандзи ${item.literal}?`,
    targetItemIds: [item.id],
    correctAnswers: [item.meaningsRu[0] ?? item.literal],
    distractors: confusions.map((candidate) => candidate.meaningsRu[0] ?? candidate.literal),
    explanationRu: example
      ? `${item.literal} — ${item.meaningsRu.join(", ")}. Пример: ${example.written}（${example.reading}）— ${example.meaningRu}.`
      : `${item.literal} — ${item.meaningsRu.join(", ")}.`,
    variantGroup: `${lessonId}:kanji-guided`,
    contentKey: `kanji:${item.literal}:recognition`,
    difficulty: 1,
    skill: "recognition",
    confusionItemIds: confusions.map((candidate) => candidate.id),
  };
};

const createReadingExercise = (lessonId: string, item: KanjiItem): Exercise => {
  const example = item.examples[0];
  if (!example) {
    return createRecognitionExercise(lessonId, item, [item]);
  }
  const katakanaReading = hiraganaToKatakana(example.kanjiReading);
  return {
    id: `${lessonId}-kanji-${item.literal}-reading`,
    type: "text-input",
    prompt: `Как читается выделенный знак ${item.literal} в слове ${example.written}（${example.reading}）?`,
    targetItemIds: [item.id],
    correctAnswers: [example.kanjiReading],
    acceptableAnswers:
      katakanaReading === example.kanjiReading ? undefined : [katakanaReading],
    explanationRu: `В слове ${example.written} знак ${item.literal} читается ${example.kanjiReading}. Всё слово: ${example.reading} — ${example.meaningRu}.`,
    variantGroup: `${lessonId}:kanji-guided`,
    contentKey: `kanji:${item.literal}:reading`,
    difficulty: 2,
    skill: "reading",
  };
};

export const buildLessonKanjiExercises = (
  lessonId: string,
  lessonKanji: readonly KanjiItem[],
): Exercise[] => {
  const first = lessonKanji[0];
  if (!first) return [];

  const exercises: Exercise[] = [
    createRecognitionExercise(lessonId, first, lessonKanji),
    createReadingExercise(lessonId, first),
  ];

  lessonKanji.slice(1).forEach((item, index) => {
    exercises.push(
      index % 2 === 0
        ? createReadingExercise(lessonId, item)
        : createRecognitionExercise(lessonId, item, lessonKanji),
    );
  });
  return exercises;
};

const chooseReplacementIndexes = (
  exercises: readonly Exercise[],
  replacementCount: number,
): number[] => {
  const protectedIndexes = new Set<number>();

  REQUIRED_PRACTICE_TYPES.forEach((type) => {
    const index = exercises.findIndex((exercise) => exercise.type === type);
    if (index >= 0) protectedIndexes.add(index);
  });

  const hardExerciseIndex = exercises.findIndex((exercise) => exercise.difficulty === 4);
  if (hardExerciseIndex >= 0) protectedIndexes.add(hardExerciseIndex);

  const replaceable = exercises
    .map((exercise, index) => ({ exercise, index }))
    .filter(({ index }) => !protectedIndexes.has(index));
  const generated = replaceable
    .filter(({ exercise }) => exercise.id.includes("-auto-"))
    .reverse();
  const authored = replaceable
    .filter(({ exercise }) => !exercise.id.includes("-auto-"))
    .reverse();
  const candidates = [...generated, ...authored];

  if (candidates.length < replacementCount) {
    throw new Error(
      `${exercises[0]?.id ?? "lesson"}: недостаточно места для кандзи без потери обязательной практики`,
    );
  }

  return candidates
    .slice(0, replacementCount)
    .map(({ index }) => index)
    .sort((left, right) => left - right);
};

const replacePracticeWithKanji = (
  exercises: readonly Exercise[],
  kanjiExercises: readonly Exercise[],
): Exercise[] => {
  if (kanjiExercises.length === 0) return [...exercises];

  const replacementIndexes = chooseReplacementIndexes(exercises, kanjiExercises.length);
  const integrated = exercises.map((exercise) => ({ ...exercise }));
  kanjiExercises.forEach((exercise, index) => {
    const targetIndex = replacementIndexes[index];
    if (targetIndex !== undefined) integrated[targetIndex] = exercise;
  });
  return integrated;
};

const mergeExercisePools = (
  visibleExercises: readonly Exercise[],
  originalExercises: readonly Exercise[],
): Exercise[] => {
  const byId = new Map<string, Exercise>();
  [...visibleExercises, ...originalExercises].forEach((exercise) => {
    if (!byId.has(exercise.id)) byId.set(exercise.id, exercise);
  });
  return [...byId.values()];
};

export const integrateKanjiCurriculum = (bundle: LessonBundle): LessonBundle => {
  const lessonKanji = getLessonKanji(bundle.lesson.id);
  if (lessonKanji.length === 0) {
    return { ...bundle, kanji: [] };
  }

  const originalExercises = bundle.reviewExercises ?? bundle.exercises;
  const kanjiExercises = buildLessonKanjiExercises(bundle.lesson.id, lessonKanji);
  const exercises = replacePracticeWithKanji(bundle.exercises, kanjiExercises);
  const reviewExercises = mergeExercisePools(exercises, originalExercises);
  const itemIds = unique([
    ...bundle.vocabulary.map((item) => item.id),
    ...lessonKanji.map((item) => item.id),
    ...bundle.grammar.map((item) => item.id),
    ...bundle.sentences.map((item) => item.id),
  ]);

  return {
    ...bundle,
    kanji: lessonKanji,
    lesson: {
      ...bundle.lesson,
      itemIds,
      exerciseIds: exercises.map((exercise) => exercise.id),
    },
    exercises,
    reviewExercises,
  };
};
