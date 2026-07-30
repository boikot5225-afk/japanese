import type { Exercise } from "../domain/course";
import type { AnswerStatus } from "./checkAnswer";

export type AttemptSource = "lesson" | "review";

export interface ReviewItem {
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

export const isSuccessfulStatus = (status: AnswerStatus): boolean =>
  successfulStatuses.includes(status);

const addDays = (date: Date, days: number): string =>
  new Date(date.getTime() + days * DAY_MS).toISOString();

const weaknessScore = (item: ReviewItem): number =>
  item.incorrectCount * 4 + item.lapseCount * 3 - item.correctCount +
  (isSuccessfulStatus(item.lastStatus) ? 0 : 6);

export function scheduleExerciseReview(
  existing: ReviewItem | undefined,
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
    exerciseId: exercise.id,
    lessonId,
    targetItemIds: exercise.targetItemIds,
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

export function upsertReviewItem(
  items: ReviewItem[],
  updated: ReviewItem,
): ReviewItem[] {
  return [updated, ...items.filter((item) => item.exerciseId !== updated.exerciseId)];
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
    .filter((item) => item.incorrectCount > 0)
    .sort((left, right) => weaknessScore(right) - weaknessScore(left))
    .forEach((item) => item.targetItemIds.forEach((id) => weakIds.add(id)));
  return [...weakIds];
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
