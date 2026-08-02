import type { Exercise, KanjiItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";
import { n5KanjiCatalog } from "./kanjiCatalog";

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

export const integrateKanjiCurriculum = (bundle: LessonBundle): LessonBundle => {
  const lessonKanji = getLessonKanji(bundle.lesson.id);
  const kanjiExercises = buildLessonKanjiExercises(bundle.lesson.id, lessonKanji);
  const exercises = [...bundle.exercises, ...kanjiExercises];
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
  };
};
