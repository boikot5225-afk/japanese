import type { Exercise, Skill } from "../domain/course";
import type { AnswerStatus } from "./checkAnswer";

export type AttemptSource = "lesson" | "review" | "practice";

export interface ReviewItem {
  itemId: string;
  skill: Skill;
  exerciseId: string;
  lessonId: string;
  dueAt: string;
  intervalDays: number;
  ease: number;
  streak: number;
  correctCount: number;
  incorrectCount: number;
  lapseCount: number;
  lastStatus: AnswerStatus;
  lastAnsweredAt: string;
}

export interface LegacyReviewItemV2 {
  exerciseId: string;
  lessonId: string;
  targetItemIds: string[];
  dueAt: string;
  intervalDays: number;
  ease: number;
  streak: number;
  correctCount: number;
  incorrectCount: number;
  lapseCount: number;
  lastStatus: AnswerStatus;
  lastAnsweredAt: string;
}

export interface AttemptLogEntry {
  id: string;
  exerciseId: string;
  lessonId: string;
  targetItemIds: string[];
  status: AnswerStatus;
  source: AttemptSource;
  answeredAt: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const successfulStatuses: AnswerStatus[] = ["correct", "acceptable"];
const WEAKNESS_THRESHOLD = 5;

export const isSuccessfulStatus = (status: AnswerStatus): boolean =>
  successfulStatuses.includes(status);

export const inferExerciseSkill = (exercise: Exercise): Skill => {
  switch (exercise.type) {
    case "listening":
      return "listening";
    case "handwriting":
      return "writing";
    case "multiple-choice":
      return "recognition";
    case "text-input":
      return "recall";
    case "sentence-builder":
    case "particle-gap":
    case "conjugation":
      return "usage";
    default:
      return "recall";
  }
};

export const reviewItemKey = (item: Pick<ReviewItem, "itemId" | "skill">): string =>
  `${item.itemId}:${item.skill}`;

const addDays = (date: Date, days: number): string =>
  new Date(date.getTime() + days * DAY_MS).toISOString();

const weaknessScore = (item: ReviewItem): number =>
  item.incorrectCount * 4 + item.lapseCount * 3 - item.correctCount +
  (isSuccessfulStatus(item.lastStatus) ? 0 : 6);

export const isWeakReviewItem = (item: ReviewItem): boolean => {
  if (!isSuccessfulStatus(item.lastStatus)) return true;
  return item.streak < 3 && weaknessScore(item) >= WEAKNESS_THRESHOLD;
};

export function scheduleItemReview(
  existing: ReviewItem | undefined,
  itemId: string,
  skill: Skill,
  exercise: Exercise,
  lessonId: string,
  status: AnswerStatus,
  now: Date,
): ReviewItem {
  const success = isSuccessfulStatus(status);
  const previousStreak = existing?.streak ?? 0;
  const streak = success ? previousStreak + 1 : 0;
  const previousEase = existing?.ease ?? 2.3;
  const ease = success
    ? Math.min(2.8, previousEase + (status === "correct" ? 0.05 : 0))
    : Math.max(1.3, previousEase - 0.2);

  let intervalDays = 0;
  if (success) {
    if (streak === 1) {
      intervalDays = 1;
    } else if (streak === 2) {
      intervalDays = 3;
    } else {
      intervalDays = Math.max(
        7,
        Math.round(Math.max(existing?.intervalDays ?? 3, 3) * ease),
      );
    }
  }

  return {
    itemId,
    skill,
    exerciseId: exercise.id,
    lessonId,
    dueAt: success ? addDays(now, intervalDays) : now.toISOString(),
    intervalDays,
    ease,
    streak,
    correctCount: (existing?.correctCount ?? 0) + (success ? 1 : 0),
    incorrectCount: (existing?.incorrectCount ?? 0) + (success ? 0 : 1),
    lapseCount: (existing?.lapseCount ?? 0) + (success ? 0 : 1),
    lastStatus: status,
    lastAnsweredAt: now.toISOString(),
  };
}

export function scheduleExerciseReview(
  existing: ReviewItem | undefined,
  exercise: Exercise,
  lessonId: string,
  status: AnswerStatus,
  now: Date,
): ReviewItem {
  const itemId = existing?.itemId ?? exercise.targetItemIds[0] ?? exercise.id;
  const skill = existing?.skill ?? inferExerciseSkill(exercise);
  return scheduleItemReview(existing, itemId, skill, exercise, lessonId, status, now);
}

export function upsertReviewItem(
  items: ReviewItem[],
  updated: ReviewItem,
): ReviewItem[] {
  const updatedKey = reviewItemKey(updated);
  return [updated, ...items.filter((item) => reviewItemKey(item) !== updatedKey)];
}

export function getDueReviewItems(items: ReviewItem[], now: Date): ReviewItem[] {
  const nowMs = now.getTime();
  return items
    .filter((item) => new Date(item.dueAt).getTime() <= nowMs)
    .sort((left, right) => {
      const dueDifference = new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
      if (dueDifference !== 0) {
        return dueDifference;
      }
      return weaknessScore(right) - weaknessScore(left);
    });
}

export function getNextReviewAt(items: ReviewItem[]): string | null {
  if (items.length === 0) {
    return null;
  }

  return items.reduce<string | null>((earliest, item) => {
    if (!earliest || new Date(item.dueAt).getTime() < new Date(earliest).getTime()) {
      return item.dueAt;
    }
    return earliest;
  }, null);
}

export function getWeakTargetIds(items: ReviewItem[]): string[] {
  const weakIds = new Set<string>();
  items
    .filter(isWeakReviewItem)
    .sort((left, right) => weaknessScore(right) - weaknessScore(left))
    .forEach((item) => weakIds.add(item.itemId));
  return [...weakIds];
}

export function selectExerciseForReview(
  item: ReviewItem,
  exercises: Exercise[],
): Exercise | undefined {
  const matchingItem = exercises.filter((exercise) =>
    exercise.targetItemIds.includes(item.itemId),
  );
  const matchingSkill = matchingItem.filter(
    (exercise) => inferExerciseSkill(exercise) === item.skill,
  );
  const candidates = matchingSkill.length > 0 ? matchingSkill : matchingItem;
  if (candidates.length === 0) {
    return exercises.find((exercise) => exercise.id === item.exerciseId);
  }
  const completedAttempts = item.correctCount + item.incorrectCount;
  return candidates[completedAttempts % candidates.length];
}

export function migrateLegacyReviewItems(
  legacyItems: LegacyReviewItemV2[],
  exercises: Exercise[],
): ReviewItem[] {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  return [...legacyItems].reverse().reduce<ReviewItem[]>((items, legacy) => {
    const exercise = exerciseById.get(legacy.exerciseId);
    if (!exercise) return items;
    const skill = inferExerciseSkill(exercise);
    return legacy.targetItemIds.reduce((current, itemId) =>
      upsertReviewItem(current, {
        itemId,
        skill,
        exerciseId: legacy.exerciseId,
        lessonId: legacy.lessonId,
        dueAt: legacy.dueAt,
        intervalDays: legacy.intervalDays,
        ease: legacy.ease,
        streak: legacy.streak,
        correctCount: legacy.correctCount,
        incorrectCount: legacy.incorrectCount,
        lapseCount: legacy.lapseCount,
        lastStatus: legacy.lastStatus,
        lastAnsweredAt: legacy.lastAnsweredAt,
      }), items);
  }, []);
}

export function createAttemptLogEntry(
  exercise: Exercise,
  lessonId: string,
  status: AnswerStatus,
  source: AttemptSource,
  now: Date,
): AttemptLogEntry {
  return {
    id: `${now.getTime()}-${exercise.id}-${source}`,
    exerciseId: exercise.id,
    lessonId,
    targetItemIds: exercise.targetItemIds,
    status,
    source,
    answeredAt: now.toISOString(),
  };
}
