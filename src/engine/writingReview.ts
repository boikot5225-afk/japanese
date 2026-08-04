import type { Exercise } from "../domain/course";
import type { ReviewItem } from "./reviewEngine";
import type { WritingGrade } from "./writingSession";

const SECOND_MS = 1000;
const DAY_SECONDS = 24 * 60 * 60;
const INITIAL_RIGHT_SECONDS = 7 * DAY_SECONDS;
const MAX_INTERVAL_SECONDS = 31_556_952;

export interface WritingReviewSchedule {
  dueAt: string;
  intervalDays: number;
  ease: number;
  streak: number;
  success: boolean;
}

type RandomSource = () => number;

const randomizeInterval = (
  intervalSeconds: number,
  random: RandomSource,
): number =>
  Math.round(intervalSeconds * (0.925 + random() * 0.15));

const initialInterval = (
  grade: WritingGrade,
  random: RandomSource,
): number => {
  switch (grade) {
    case 1:
      return 30;
    case 2:
    case 3:
      return DAY_SECONDS;
    case 4:
      return randomizeInterval(INITIAL_RIGHT_SECONDS * 4, random);
  }
};

/**
 * Reproduces Skritter Classic's non-continuous interval calculation. Scores above
 * one count as successful; forgotten items return after 30 seconds, while every
 * successful review is spaced at least one day.
 */
export const calculateWritingReviewSchedule = (
  existing: ReviewItem | undefined,
  grade: WritingGrade,
  now: Date,
  random: RandomSource = Math.random,
): WritingReviewSchedule => {
  const previousIntervalSeconds = Math.max(
    0,
    (existing?.intervalDays ?? 0) * DAY_SECONDS,
  );
  const reviews =
    (existing?.correctCount ?? 0) + (existing?.incorrectCount ?? 0);
  const successes = existing?.correctCount ?? 0;
  const success = grade > 1;

  let intervalSeconds: number;
  if (!existing || previousIntervalSeconds <= 0 || !existing.lastAnsweredAt) {
    intervalSeconds = initialInterval(grade, random);
  } else {
    const lastSeconds = new Date(existing.lastAnsweredAt).getTime() / SECOND_MS;
    const dueSeconds = new Date(existing.dueAt).getTime() / SECOND_MS;
    const nowSeconds = now.getTime() / SECOND_MS;
    const actualInterval = Math.max(nowSeconds - lastSeconds, 1);
    const scheduledInterval = Math.max(
      dueSeconds - lastSeconds,
      previousIntervalSeconds,
      1,
    );

    let factor: number;
    if (grade === 2) factor = 0.9;
    else if (grade === 4) factor = 3.5;
    else factor = grade === 1 ? 0.25 : 2.2;

    if (grade > 2) {
      factor = (factor - 1) * (actualInterval / scheduledInterval) + 1;
    }

    if (successes === reviews && reviews < 5) {
      factor *= 1.5;
    }

    if (reviews > 8 && reviews > 0 && successes / reviews < 0.5) {
      factor *= (successes / reviews) ** 0.7;
    }

    intervalSeconds = randomizeInterval(previousIntervalSeconds * factor, random);

    if (grade === 1) intervalSeconds = 30;
    if (grade > 1) intervalSeconds = Math.max(DAY_SECONDS, intervalSeconds);
    if (intervalSeconds > MAX_INTERVAL_SECONDS) {
      intervalSeconds = randomizeInterval(MAX_INTERVAL_SECONDS, random);
    }
  }

  return {
    dueAt: new Date(now.getTime() + intervalSeconds * SECOND_MS).toISOString(),
    intervalDays: intervalSeconds / DAY_SECONDS,
    ease: existing?.ease ?? 2.3,
    streak: success ? (existing?.streak ?? 0) + 1 : 0,
    success,
  };
};

export const scheduleWritingReview = (
  existing: ReviewItem | undefined,
  itemId: string,
  exercise: Exercise,
  lessonId: string,
  grade: WritingGrade,
  now: Date,
): ReviewItem => {
  const schedule = calculateWritingReviewSchedule(existing, grade, now);
  return {
    itemId,
    skill: "writing",
    exerciseId: exercise.id,
    lessonId,
    dueAt: schedule.dueAt,
    intervalDays: schedule.intervalDays,
    ease: schedule.ease,
    streak: schedule.streak,
    correctCount: (existing?.correctCount ?? 0) + (schedule.success ? 1 : 0),
    incorrectCount:
      (existing?.incorrectCount ?? 0) + (schedule.success ? 0 : 1),
    lapseCount:
      (existing?.lapseCount ?? 0) + (grade === 1 ? 1 : 0),
    lastStatus:
      grade === 1 ? "incorrect" : grade === 2 ? "acceptable" : "correct",
    lastAnsweredAt: now.toISOString(),
  };
};

const formatInterval = (intervalDays: number): string => {
  const seconds = Math.round(intervalDays * DAY_SECONDS);
  if (seconds < 60) return `${seconds} сек`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ч`;
  const days = Math.round(intervalDays);
  if (days < 14) return `${days} дн`;
  const weeks = Math.round(days / 7);
  if (weeks < 9) return `${weeks} нед`;
  const months = Math.round(days / 30);
  return `${months} мес`;
};

export const previewWritingGradeIntervals = (
  existing: ReviewItem | undefined,
  now = new Date(),
): Record<WritingGrade, string> => {
  const centerRandom = () => 0.5;
  return {
    1: formatInterval(
      calculateWritingReviewSchedule(existing, 1, now, centerRandom).intervalDays,
    ),
    2: formatInterval(
      calculateWritingReviewSchedule(existing, 2, now, centerRandom).intervalDays,
    ),
    3: formatInterval(
      calculateWritingReviewSchedule(existing, 3, now, centerRandom).intervalDays,
    ),
    4: formatInterval(
      calculateWritingReviewSchedule(existing, 4, now, centerRandom).intervalDays,
    ),
  };
};

export const writingGradeStatus = (
  grade: WritingGrade,
): "correct" | "incorrect" =>
  grade === 1 ? "incorrect" : "correct";
