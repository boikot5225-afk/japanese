import type { Exercise, KanjiItem } from "../domain/course";
import { checkAnswer, type AnswerStatus } from "./checkAnswer";

export type KanjiStudyQuestionKind =
  | "meaning"
  | "reading-guided"
  | "reading-recall";

export interface KanjiStudyQuestion {
  id: string;
  kind: KanjiStudyQuestionKind;
  title: string;
  prompt: string;
  exercise: Exercise;
  choices: string[];
  recordResult: boolean;
}

export interface KanjiStudyResult {
  questionId: string;
  exercise: Exercise;
  answer: string;
  status: AnswerStatus;
}

const unique = (values: readonly string[]): string[] => [
  ...new Set(values.filter((value) => value.trim().length > 0)),
];

const stableHash = (value: string): number => {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const rotate = <T>(values: readonly T[], offset: number): T[] => {
  if (values.length === 0) return [];
  const normalized = offset % values.length;
  return [...values.slice(normalized), ...values.slice(0, normalized)];
};

const orderedChoices = (
  correct: string,
  distractors: readonly string[],
  seed: string,
): string[] => {
  const values = unique([correct, ...distractors]).slice(0, 4);
  return rotate(values, stableHash(seed) % Math.max(values.length, 1));
};

const findExercise = (
  item: KanjiItem,
  exercises: readonly Exercise[],
  skill: "recognition" | "reading",
  preferredType?: Exercise["type"],
): Exercise | undefined => {
  const candidates = exercises.filter(
    (exercise) =>
      exercise.targetItemIds.includes(item.id) && exercise.skill === skill,
  );
  return (
    candidates.find((exercise) => exercise.type === preferredType) ?? candidates[0]
  );
};

const fallbackMeaningExercise = (
  item: KanjiItem,
  catalog: readonly KanjiItem[],
): Exercise => ({
  id: `${item.introducedInLessonId}-kanji-${item.literal}-recognition`,
  type: "multiple-choice",
  prompt: `Что означает кандзи ${item.literal}?`,
  targetItemIds: [item.id],
  correctAnswers: [item.meaningsRu[0] ?? item.literal],
  distractors: unique(
    catalog
      .filter((candidate) => candidate.id !== item.id)
      .map((candidate) => candidate.meaningsRu[0] ?? candidate.literal),
  ).slice(0, 3),
  explanationRu: `${item.literal} — ${item.meaningsRu.join(", ")}.`,
  contentKey: `kanji:${item.literal}:recognition`,
  skill: "recognition",
});

const fallbackReadingExercise = (
  item: KanjiItem,
  catalog: readonly KanjiItem[],
): Exercise => {
  const example = item.examples[0];
  const correct = example?.kanjiReading ?? example?.reading ?? item.literal;
  return {
    id: `${item.introducedInLessonId}-kanji-${item.literal}-reading`,
    type: "text-input",
    prompt: example
      ? `Как читается ${item.literal} в слове ${example.written}（${example.reading}）?`
      : `Введи чтение кандзи ${item.literal}.`,
    targetItemIds: [item.id],
    correctAnswers: [correct],
    distractors: unique(
      catalog
        .filter((candidate) => candidate.id !== item.id)
        .map((candidate) => candidate.examples[0]?.kanjiReading ?? ""),
    ).slice(0, 3),
    explanationRu: example
      ? `В слове ${example.written} знак ${item.literal} читается ${correct}.`
      : `${item.literal} читается ${correct}.`,
    contentKey: `kanji:${item.literal}:reading`,
    skill: "reading",
  };
};

export const buildKanjiStudyQuestions = (
  item: KanjiItem,
  exercises: readonly Exercise[],
  catalog: readonly KanjiItem[],
): KanjiStudyQuestion[] => {
  const meaningExercise =
    findExercise(item, exercises, "recognition", "multiple-choice") ??
    fallbackMeaningExercise(item, catalog);
  const readingExercise =
    findExercise(item, exercises, "reading", "text-input") ??
    fallbackReadingExercise(item, catalog);
  const meaningAnswer = meaningExercise.correctAnswers[0] ?? item.meaningsRu[0] ?? item.literal;
  const readingAnswer =
    readingExercise.correctAnswers[0] ??
    item.examples[0]?.kanjiReading ??
    item.literal;
  const readingDistractors = unique([
    ...(readingExercise.distractors ?? []),
    ...catalog
      .filter((candidate) => candidate.id !== item.id)
      .map((candidate) => candidate.examples[0]?.kanjiReading ?? ""),
  ]).filter((value) => value !== readingAnswer);

  return [
    {
      id: `${item.id}:meaning`,
      kind: "meaning",
      title: "1. Узнай значение",
      prompt: meaningExercise.prompt,
      exercise: meaningExercise,
      choices: orderedChoices(
        meaningAnswer,
        meaningExercise.distractors ?? [],
        `${item.id}:meaning`,
      ),
      recordResult: true,
    },
    {
      id: `${item.id}:reading-guided`,
      kind: "reading-guided",
      title: "2. Найди чтение в слове",
      prompt: readingExercise.prompt,
      exercise: {
        ...readingExercise,
        id: `${readingExercise.id}-guided`,
        type: "multiple-choice",
        distractors: readingDistractors.slice(0, 3),
      },
      choices: orderedChoices(
        readingAnswer,
        readingDistractors,
        `${item.id}:reading-guided`,
      ),
      recordResult: false,
    },
    {
      id: `${item.id}:reading-recall`,
      kind: "reading-recall",
      title: "3. Вспомни чтение сам",
      prompt: readingExercise.prompt,
      exercise: readingExercise,
      choices: [],
      recordResult: true,
    },
  ];
};

export const checkKanjiStudyAnswer = (
  question: KanjiStudyQuestion,
  answer: string,
): AnswerStatus =>
  checkAnswer(
    answer,
    question.exercise.correctAnswers,
    question.exercise.acceptableAnswers,
  ).status;
