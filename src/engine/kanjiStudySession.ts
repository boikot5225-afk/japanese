import { buildKanjiReviewExercises } from "../content/kanjiCurriculum";
import type { Exercise, KanjiItem, Skill } from "../domain/course";
import type { AnswerStatus } from "./checkAnswer";
import type { KanjiProgressSummary } from "./kanjiProgress";
import type { ReviewItem } from "./reviewEngine";
import type { WritingGrade } from "./writingSession";

export type KanjiStudyMode = "learn" | "review";

export type KanjiStudyPart =
  | "preview"
  | "definition"
  | "reading"
  | "writing-teach"
  | "writing-snap"
  | "writing-recall";

export interface KanjiStudyCard {
  id: string;
  itemId: string;
  mode: KanjiStudyMode;
  part: KanjiStudyPart;
  isNew: boolean;
  remediation: boolean;
  repetition: number;
}

export interface KanjiStudyResult {
  questionId: string;
  exercise: Exercise;
  answer: string;
  status: AnswerStatus;
  grade: WritingGrade;
}

const LEARN_PARTS: readonly KanjiStudyPart[] = [
  "preview",
  "definition",
  "reading",
  "writing-teach",
  "writing-snap",
  "writing-recall",
] as const;

const cardKey = (itemId: string, part: KanjiStudyPart): string =>
  `${itemId}:${part}`;

const createCard = (
  itemId: string,
  mode: KanjiStudyMode,
  part: KanjiStudyPart,
  isNew: boolean,
  repetition = 0,
  remediation = false,
): KanjiStudyCard => ({
  id: `${cardKey(itemId, part)}:${mode}:${repetition}`,
  itemId,
  mode,
  part,
  isNew,
  remediation,
  repetition,
});

const isDue = (item: ReviewItem, now: Date): boolean => {
  const dueAt = new Date(item.dueAt).getTime();
  return Number.isFinite(dueAt) && dueAt <= now.getTime();
};

const reviewPartBySkill = (
  skill: Skill,
): "definition" | "reading" | "writing-recall" | null => {
  switch (skill) {
    case "recognition":
    case "recall":
      return "definition";
    case "reading":
      return "reading";
    case "writing":
      return "writing-recall";
    default:
      return null;
  }
};

const progressById = (
  progress: readonly KanjiProgressSummary[],
): ReadonlyMap<string, KanjiProgressSummary> =>
  new Map(progress.map((entry) => [entry.itemId, entry]));

/**
 * A kanji remains in Learn until all three independent Skritter parts exist.
 * This also repairs progress made by the broken 0.22.0 build, which could save
 * definition or reading before the six-stage Learn flow was finished.
 */
export const isKanjiPendingLearn = (
  progress: KanjiProgressSummary | undefined,
): boolean =>
  !progress ||
  progress.meaning.attempts === 0 ||
  progress.reading.attempts === 0 ||
  progress.writing.attempts === 0;

export const findNextNewKanjiId = (
  catalog: readonly KanjiItem[],
  progress: readonly KanjiProgressSummary[],
  afterItemId?: string,
): string | null => {
  const byId = progressById(progress);
  const foundIndex = afterItemId
    ? catalog.findIndex((item) => item.id === afterItemId)
    : -1;
  const startIndex = foundIndex >= 0 ? foundIndex + 1 : 0;
  const ordered = [
    ...catalog.slice(startIndex),
    ...catalog.slice(0, startIndex),
  ];
  return ordered.find(
    (item) => item.id !== afterItemId && isKanjiPendingLearn(byId.get(item.id)),
  )?.id ?? null;
};

/**
 * Skritter Learn handles exactly one new vocabulary item at a time. Japanese
 * kanji follow six stages and none of the teaching stages is graded visibly:
 * preview → definition → reading → writing teach → writing snap → recall.
 */
export const buildKanjiLearnQueue = (
  catalog: readonly KanjiItem[],
  progress: readonly KanjiProgressSummary[],
  requestedItemId?: string,
): KanjiStudyCard[] => {
  const byId = progressById(progress);
  const requested = requestedItemId
    ? catalog.find(
        (item) =>
          item.id === requestedItemId && isKanjiPendingLearn(byId.get(item.id)),
      )
    : undefined;
  const itemId = requested?.id ?? findNextNewKanjiId(catalog, progress);
  if (!itemId) return [];
  return LEARN_PARTS.map((part) =>
    createCard(itemId, "learn", part, true),
  );
};

interface DueCardCandidate {
  card: KanjiStudyCard;
  dueAt: number;
  lapseCount: number;
  failed: boolean;
}

const orderReviewCandidates = (
  candidates: readonly DueCardCandidate[],
): KanjiStudyCard[] => {
  const remaining = [...candidates].sort((left, right) => {
    if (left.dueAt !== right.dueAt) return left.dueAt - right.dueAt;
    if (left.failed !== right.failed) return left.failed ? -1 : 1;
    return right.lapseCount - left.lapseCount;
  });
  const result: KanjiStudyCard[] = [];

  while (remaining.length > 0) {
    const previousItemId = result.at(-1)?.itemId;
    const differentIndex = remaining.findIndex(
      (candidate) => candidate.card.itemId !== previousItemId,
    );
    const index = differentIndex >= 0 ? differentIndex : 0;
    const [next] = remaining.splice(index, 1);
    if (next) result.push(next.card);
  }

  return result;
};

/**
 * Review is separate from Learn and contains due skill cards only. Recognition
 * and legacy recall records collapse into Skritter's single definition part.
 */
export const buildKanjiReviewQueue = (
  catalog: readonly KanjiItem[],
  reviewItems: readonly ReviewItem[],
  now = new Date(),
  limit = 20,
): KanjiStudyCard[] => {
  if (limit <= 0) return [];
  const catalogIds = new Set(catalog.map((item) => item.id));
  const seen = new Set<string>();
  const candidates: DueCardCandidate[] = [];

  reviewItems
    .filter(
      (reviewItem) =>
        catalogIds.has(reviewItem.itemId) && isDue(reviewItem, now),
    )
    .forEach((reviewItem) => {
      const part = reviewPartBySkill(reviewItem.skill);
      if (!part) return;
      const key = cardKey(reviewItem.itemId, part);
      if (seen.has(key)) return;
      seen.add(key);
      candidates.push({
        card: createCard(reviewItem.itemId, "review", part, false),
        dueAt: new Date(reviewItem.dueAt).getTime(),
        lapseCount: reviewItem.lapseCount,
        failed:
          reviewItem.lastStatus !== "correct" &&
          reviewItem.lastStatus !== "acceptable",
      });
    });

  return orderReviewCandidates(candidates).slice(0, limit);
};

export const countDueKanjiCards = (
  catalog: readonly KanjiItem[],
  reviewItems: readonly ReviewItem[],
  now = new Date(),
): number =>
  buildKanjiReviewQueue(
    catalog,
    reviewItems,
    now,
    Number.MAX_SAFE_INTEGER,
  ).length;

export const countNewKanji = (
  catalog: readonly KanjiItem[],
  progress: readonly KanjiProgressSummary[],
): number => {
  const byId = progressById(progress);
  return catalog.filter((item) => isKanjiPendingLearn(byId.get(item.id))).length;
};

export const findKanjiStudyExercise = (
  item: KanjiItem,
  part: "definition" | "reading" | "writing-recall",
): Exercise => {
  const exercises = buildKanjiReviewExercises(item.introducedInLessonId, [item]);
  const skill: Skill =
    part === "definition"
      ? "recognition"
      : part === "reading"
        ? "reading"
        : "writing";
  const exercise = exercises.find((candidate) => candidate.skill === skill);
  if (!exercise) {
    throw new Error(`Не найдено задание ${part} для ${item.literal}`);
  }
  return exercise;
};

export const gradeKanjiStudyAnswer = (grade: WritingGrade): AnswerStatus => {
  if (grade === 1) return "incorrect";
  if (grade === 2) return "acceptable";
  return "correct";
};

export const isRecordableKanjiStudyPart = (
  part: KanjiStudyPart,
): part is "definition" | "reading" | "writing-recall" =>
  part === "definition" || part === "reading" || part === "writing-recall";

export const buildKanjiStudyResult = (
  card: KanjiStudyCard,
  item: KanjiItem,
  grade: WritingGrade,
): KanjiStudyResult => {
  if (!isRecordableKanjiStudyPart(card.part)) {
    throw new Error(`Этап ${card.part} не записывается в SRS`);
  }
  const baseExercise = findKanjiStudyExercise(item, card.part);
  const exercise: Exercise = {
    ...baseExercise,
    difficulty: grade,
    variantGroup: `kanji-self-grade:${grade}`,
  };
  return {
    questionId: card.id,
    exercise,
    answer: exercise.correctAnswers[0] ?? item.literal,
    status: gradeKanjiStudyAnswer(grade),
    grade,
  };
};

/** Build the hidden definition and reading reviews committed at Learn finish. */
export const buildKanjiLearnKnowledgeResults = (
  item: KanjiItem,
): readonly KanjiStudyResult[] => [
  buildKanjiStudyResult(
    createCard(item.id, "learn", "definition", true),
    item,
    3,
  ),
  buildKanjiStudyResult(
    createCard(item.id, "learn", "reading", true),
    item,
    3,
  ),
];

/**
 * Skritter repeats only forgotten review cards. Grade 1 goes to the queue tail;
 * hard, got-it and easy continue normally.
 */
export const requeueForgottenKanjiCard = (
  remaining: readonly KanjiStudyCard[],
  card: KanjiStudyCard,
  grade: WritingGrade,
): KanjiStudyCard[] => {
  if (card.mode !== "review" || grade !== 1) return [...remaining];
  return [
    ...remaining,
    createCard(
      card.itemId,
      "review",
      card.part,
      false,
      card.repetition + 1,
      true,
    ),
  ];
};

export const kanjiStudyPartLabel = (part: KanjiStudyPart): string => {
  switch (part) {
    case "preview":
      return "Новое слово";
    case "definition":
      return "Значение";
    case "reading":
      return "Чтение";
    case "writing-teach":
      return "Письмо · обучение";
    case "writing-snap":
      return "Письмо · контур";
    case "writing-recall":
      return "Письмо";
  }
};
