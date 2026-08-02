import { buildKanjiReviewExercises } from "../content/kanjiCurriculum";
import type { Exercise, KanjiItem, Skill } from "../domain/course";
import type { KanjiProgressSummary } from "./kanjiProgress";
import type { AnswerStatus } from "./checkAnswer";
import type { ReviewItem } from "./reviewEngine";
import type { WritingGrade } from "./writingSession";

export type KanjiStudyPart = "preview" | "meaning" | "reading" | "writing";

export interface KanjiStudyCard {
  id: string;
  itemId: string;
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

export interface KanjiStudyQueueOptions {
  newItemLimit?: number;
  reviewCardLimit?: number;
}

const DEFAULT_NEW_ITEM_LIMIT = 5;
const DEFAULT_REVIEW_CARD_LIMIT = 20;

const partBySkill = (skill: Skill): Exclude<KanjiStudyPart, "preview"> | null => {
  switch (skill) {
    case "recognition":
    case "recall":
      return "meaning";
    case "reading":
      return "reading";
    case "writing":
      return "writing";
    default:
      return null;
  }
};

const cardKey = (itemId: string, part: KanjiStudyPart): string =>
  `${itemId}:${part}`;

const createCard = (
  itemId: string,
  part: KanjiStudyPart,
  isNew: boolean,
  repetition = 0,
  remediation = false,
): KanjiStudyCard => ({
  id: `${cardKey(itemId, part)}:${isNew ? "new" : "review"}:${repetition}`,
  itemId,
  part,
  isNew,
  remediation,
  repetition,
});

const isDue = (item: ReviewItem, now: Date): boolean =>
  new Date(item.dueAt).getTime() <= now.getTime();

const progressById = (
  progress: readonly KanjiProgressSummary[],
): ReadonlyMap<string, KanjiProgressSummary> =>
  new Map(progress.map((entry) => [entry.itemId, entry]));

const orderDueCards = (
  reviewItems: readonly ReviewItem[],
  itemIds: ReadonlySet<string>,
  now: Date,
): KanjiStudyCard[] => {
  const seen = new Set<string>();
  return [...reviewItems]
    .filter((reviewItem) => itemIds.has(reviewItem.itemId) && isDue(reviewItem, now))
    .sort((left, right) => {
      const dueDifference =
        new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
      if (dueDifference !== 0) return dueDifference;
      if (left.lastStatus !== right.lastStatus) {
        return left.lastStatus === "incorrect" ? -1 : 1;
      }
      return right.lapseCount - left.lapseCount;
    })
    .flatMap((reviewItem) => {
      const part = partBySkill(reviewItem.skill);
      if (!part) return [];
      const key = cardKey(reviewItem.itemId, part);
      if (seen.has(key)) return [];
      seen.add(key);
      return [createCard(reviewItem.itemId, part, false)];
    });
};

const newItemCards = (itemId: string): KanjiStudyCard[] => [
  createCard(itemId, "preview", true),
  createCard(itemId, "meaning", true),
  createCard(itemId, "reading", true),
  createCard(itemId, "writing", true),
];

/**
 * Builds one Skritter-style session for the only currently available list: JLPT N5.
 * Overdue skill cards come first. New characters are then introduced as a complete
 * preview → meaning → contextual reading → writing sequence.
 */
export const buildKanjiStudyQueue = (
  catalog: readonly KanjiItem[],
  progress: readonly KanjiProgressSummary[],
  reviewItems: readonly ReviewItem[],
  now = new Date(),
  options: KanjiStudyQueueOptions = {},
): KanjiStudyCard[] => {
  const newItemLimit = options.newItemLimit ?? DEFAULT_NEW_ITEM_LIMIT;
  const reviewCardLimit = options.reviewCardLimit ?? DEFAULT_REVIEW_CARD_LIMIT;
  const catalogIds = new Set(catalog.map((item) => item.id));
  const byId = progressById(progress);
  const dueCards = orderDueCards(reviewItems, catalogIds, now).slice(
    0,
    reviewCardLimit,
  );

  const dueItemIds = new Set(dueCards.map((card) => card.itemId));
  const newItems = catalog
    .filter((item) => byId.get(item.id)?.status === "new")
    .filter((item) => !dueItemIds.has(item.id))
    .slice(0, newItemLimit);

  const queue = [
    ...dueCards,
    ...newItems.flatMap((item) => newItemCards(item.id)),
  ];

  if (queue.length > 0) return queue;

  // "Study now" must remain useful even when nothing is formally due.
  return [...progress]
    .filter((entry) => catalogIds.has(entry.itemId) && entry.status !== "new")
    .sort((left, right) => {
      if (left.weak !== right.weak) return left.weak ? -1 : 1;
      return left.overallMastery - right.overallMastery;
    })
    .slice(0, Math.min(10, reviewCardLimit))
    .flatMap((entry) => {
      const weakest = [entry.meaning, entry.reading, entry.writing]
        .sort((left, right) => left.mastery - right.mastery)[0];
      if (!weakest) return [];
      return [createCard(entry.itemId, weakest.skill, false)];
    });
};

export const countDueKanjiCards = (
  catalog: readonly KanjiItem[],
  reviewItems: readonly ReviewItem[],
  now = new Date(),
): number =>
  orderDueCards(
    reviewItems,
    new Set(catalog.map((item) => item.id)),
    now,
  ).length;

export const countNewKanji = (
  catalog: readonly KanjiItem[],
  progress: readonly KanjiProgressSummary[],
): number => {
  const byId = progressById(progress);
  return catalog.filter((item) => byId.get(item.id)?.status === "new").length;
};

export const findKanjiStudyExercise = (
  item: KanjiItem,
  part: Exclude<KanjiStudyPart, "preview">,
): Exercise => {
  const exercises = buildKanjiReviewExercises(item.introducedInLessonId, [item]);
  const skill: Skill =
    part === "meaning" ? "recognition" : part === "reading" ? "reading" : "writing";
  const exercise = exercises.find((candidate) => candidate.skill === skill);
  if (!exercise) {
    throw new Error(`Не найдено задание ${part} для ${item.literal}`);
  }
  return exercise;
};

export const gradeKanjiStudyAnswer = (grade: WritingGrade): AnswerStatus => {
  if (grade <= 2) return "incorrect";
  if (grade === 3) return "acceptable";
  return "correct";
};

export const buildKanjiStudyResult = (
  card: KanjiStudyCard,
  item: KanjiItem,
  grade: WritingGrade,
): KanjiStudyResult => {
  if (card.part === "preview") {
    throw new Error("Карточка знакомства не записывается в SRS");
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

/**
 * Forgotten and hard cards return later in the same session instead of being
 * repeated immediately. The gap prevents short-term visual echo from posing as memory.
 */
export const requeueKanjiStudyCard = (
  remaining: readonly KanjiStudyCard[],
  card: KanjiStudyCard,
  grade: WritingGrade,
): KanjiStudyCard[] => {
  if (grade >= 3 || card.part === "preview") return [...remaining];
  const distance = grade === 1 ? 3 : 6;
  const insertionIndex = Math.min(distance, remaining.length);
  const repeated = createCard(
    card.itemId,
    card.part,
    false,
    card.repetition + 1,
    true,
  );
  return [
    ...remaining.slice(0, insertionIndex),
    repeated,
    ...remaining.slice(insertionIndex),
  ];
};

export const kanjiStudyPartLabel = (part: KanjiStudyPart): string => {
  switch (part) {
    case "preview":
      return "Новое слово";
    case "meaning":
      return "Значение";
    case "reading":
      return "Чтение";
    case "writing":
      return "Письмо";
  }
};
