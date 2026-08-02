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

const readingDistractors = (target: KanjiItem): string[] => {
  const correct = target.examples[0]?.kanjiReading;
  const values: string[] = [];
  for (const candidate of n5KanjiCatalog) {
    const reading = candidate.examples[0]?.kanjiReading;
    if (!reading || reading === correct || values.includes(reading)) continue;
    values.push(reading);
    if (values.length === 3) break;
  }
  return values;
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

const createReadingExercise = (
  lessonId: string,
  item: KanjiItem,
  activeRecall: boolean,
): Exercise => {
  const example = item.examples[0];
  if (!example) {
    return createRecognitionExercise(lessonId, item, [item]);
  }
  const katakanaReading = hiraganaToKatakana(example.kanjiReading);
  const common = {
    id: `${lessonId}-kanji-${item.literal}-reading`,
    prompt: `Как читается выделенный знак ${item.literal} в слове ${example.written}（${example.reading}）?`,
    targetItemIds: [item.id],
    correctAnswers: [example.kanjiReading],
    explanationRu: `В слове ${example.written} знак ${item.literal} читается ${example.kanjiReading}. Всё слово: ${example.reading} — ${example.meaningRu}.`,
    variantGroup: `${lessonId}:kanji-guided`,
    contentKey: `kanji:${item.literal}:reading`,
    difficulty: activeRecall ? 2 as const : 1 as const,
    skill: "reading" as const,
  };

  if (!activeRecall) {
    return {
      ...common,
      type: "multiple-choice",
      distractors: readingDistractors(item),
    };
  }

  return {
    ...common,
    type: "text-input",
    acceptableAnswers:
      katakanaReading === example.kanjiReading ? undefined : [katakanaReading],
  };
};

export const createKanjiWritingExercise = (
  lessonId: string,
  item: KanjiItem,
): Exercise => ({
  id: `${lessonId}-kanji-${item.literal}-writing`,
  type: "handwriting",
  prompt: `Напиши кандзи ${item.literal} в правильном порядке черт.`,
  targetItemIds: [item.id],
  correctAnswers: [item.literal],
  explanationRu: `${item.literal} — ${item.meaningsRu.join(", ")}. Порядок и форма штрихов проверяются автоматически.`,
  variantGroup: `${lessonId}:kanji-writing`,
  contentKey: `kanji:${item.literal}:writing`,
  difficulty: 2,
  skill: "writing",
});

export const buildLessonKanjiExercises = (
  lessonId: string,
  lessonKanji: readonly KanjiItem[],
): Exercise[] => {
  const first = lessonKanji[0];
  if (!first) return [];

  const exercises: Exercise[] = [
    createRecognitionExercise(lessonId, first, lessonKanji),
    createReadingExercise(lessonId, first, true),
  ];

  lessonKanji.slice(1).forEach((item, index) => {
    exercises.push(
      index % 2 === 0
        ? createReadingExercise(lessonId, item, false)
        : createRecognitionExercise(lessonId, item, lessonKanji),
    );
  });
  return exercises;
};

export const buildKanjiReviewExercises = (
  lessonId: string,
  lessonKanji: readonly KanjiItem[],
): Exercise[] =>
  lessonKanji.flatMap((item) => [
    createRecognitionExercise(lessonId, item, lessonKanji),
    createReadingExercise(lessonId, item, true),
    createKanjiWritingExercise(lessonId, item),
  ]);

const countByType = (exercises: readonly Exercise[]): Map<ExerciseType, number> => {
  const counts = new Map<ExerciseType, number>();
  exercises.forEach((exercise) => {
    counts.set(exercise.type, (counts.get(exercise.type) ?? 0) + 1);
  });
  return counts;
};

const countProtectedTargets = (
  exercises: readonly Exercise[],
  protectedTargetIds: ReadonlySet<string>,
): Map<string, number> => {
  const counts = new Map<string, number>();
  protectedTargetIds.forEach((id) => counts.set(id, 0));
  exercises.forEach((exercise) => {
    exercise.targetItemIds.forEach((id) => {
      if (protectedTargetIds.has(id)) counts.set(id, (counts.get(id) ?? 0) + 1);
    });
  });
  return counts;
};

const chooseReplacementIndexes = (
  exercises: readonly Exercise[],
  replacementCount: number,
  protectedTargetIds: ReadonlySet<string>,
): number[] => {
  const typeCounts = countByType(exercises);
  const targetCounts = countProtectedTargets(exercises, protectedTargetIds);
  let hardCount = exercises.filter((exercise) => exercise.difficulty === 4).length;
  const generated = exercises
    .map((exercise, index) => ({ exercise, index }))
    .filter(({ exercise }) => exercise.id.includes("-auto-"))
    .reverse();
  const authored = exercises
    .map((exercise, index) => ({ exercise, index }))
    .filter(({ exercise }) => !exercise.id.includes("-auto-"))
    .reverse();
  const candidates = [...generated, ...authored];
  const selected: number[] = [];

  for (const { exercise, index } of candidates) {
    if (selected.length >= replacementCount) break;

    const typeMustRemain = REQUIRED_PRACTICE_TYPES.includes(exercise.type);
    if (typeMustRemain && (typeCounts.get(exercise.type) ?? 0) <= 1) continue;
    if (exercise.difficulty === 4 && hardCount <= 1) continue;

    const removesOnlyProtectedTarget = exercise.targetItemIds.some(
      (id) => protectedTargetIds.has(id) && (targetCounts.get(id) ?? 0) <= 1,
    );
    if (removesOnlyProtectedTarget) continue;

    selected.push(index);
    typeCounts.set(exercise.type, (typeCounts.get(exercise.type) ?? 0) - 1);
    if (exercise.difficulty === 4) hardCount -= 1;
    exercise.targetItemIds.forEach((id) => {
      if (protectedTargetIds.has(id)) {
        targetCounts.set(id, (targetCounts.get(id) ?? 0) - 1);
      }
    });
  }

  if (selected.length < replacementCount) {
    throw new Error(
      `${exercises[0]?.id ?? "lesson"}: недостаточно места для кандзи без потери обязательной практики`,
    );
  }

  return selected.sort((left, right) => left - right);
};

const replacePracticeWithKanji = (
  exercises: readonly Exercise[],
  kanjiExercises: readonly Exercise[],
  protectedTargetIds: ReadonlySet<string>,
): Exercise[] => {
  if (kanjiExercises.length === 0) return [...exercises];

  const replacementIndexes = chooseReplacementIndexes(
    exercises,
    kanjiExercises.length,
    protectedTargetIds,
  );
  const integrated = exercises.map((exercise) => ({ ...exercise }));
  kanjiExercises.forEach((exercise, index) => {
    const targetIndex = replacementIndexes[index];
    if (targetIndex !== undefined) integrated[targetIndex] = exercise;
  });
  return integrated;
};

const mergeExercisePools = (
  ...exercisePools: readonly (readonly Exercise[])[]
): Exercise[] => {
  const byId = new Map<string, Exercise>();
  exercisePools.flat().forEach((exercise) => {
    if (!byId.has(exercise.id)) byId.set(exercise.id, exercise);
  });
  return [...byId.values()];
};

const grammarNeedingDirectPractice = (bundle: LessonBundle): Set<string> => {
  const grammarUsedInExamples = new Set(
    bundle.sentences.flatMap((sentence) => sentence.grammarIds),
  );
  return new Set(
    bundle.grammar
      .map((grammar) => grammar.id)
      .filter((id) => !grammarUsedInExamples.has(id)),
  );
};

export const integrateKanjiCurriculum = (bundle: LessonBundle): LessonBundle => {
  const lessonKanji = getLessonKanji(bundle.lesson.id);
  if (lessonKanji.length === 0) {
    return { ...bundle, kanji: [] };
  }

  const originalExercises = bundle.reviewExercises ?? bundle.exercises;
  const kanjiExercises = buildLessonKanjiExercises(bundle.lesson.id, lessonKanji);
  const kanjiReviewExercises = buildKanjiReviewExercises(
    bundle.lesson.id,
    lessonKanji,
  );
  const exercises = replacePracticeWithKanji(
    bundle.exercises,
    kanjiExercises,
    grammarNeedingDirectPractice(bundle),
  );
  const reviewExercises = mergeExercisePools(
    exercises,
    originalExercises,
    kanjiReviewExercises,
  );
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