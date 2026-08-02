import type { Exercise } from "../domain/course";
import type { ReviewItem } from "./reviewEngine";
import type { WritingGrade } from "./writingSession";
import { isPassingWritingGrade } from "./writingSession";

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export interface WritingReviewSchedule {
  dueAt: string;
  intervalDays: number;
  ease: number;
  streak: number;
  success: boolean;
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

export const calculateWritingReviewSchedule = (
  existing: ReviewItem | undefined,
  grade: WritingGrade,
  now: Date,
): WritingReviewSchedule => {
  const previousEase = existing?.ease ?? 2.3;
  const previousInterval = Math.max(existing?.intervalDays ?? 0, 0);
  const previousStreak = existing?.streak ?? 0;

  if (grade === 1) {
    return {
      dueAt: new Date(now.getTime() + 10 * MINUTE_MS).toISOString(),
      intervalDays: 10 / (24 * 60),
      ease: clamp(previousEase - 0.25, 1.3, 2.8),
      streak: 0,
      success: false,
    };
  }

  if (grade === 2) {
    return {
      dueAt: new Date(now.getTime() + 8 * 60 * MINUTE_MS).toISOString(),
      intervalDays: 1 / 3,
      ease: clamp(previousEase - 0.12, 1.3, 2.8),
      streak: 0,
      success: false,
    };
  }

  const streak = previousStreak + 1;
  let intervalDays: number;
  let ease: number;

  if (grade === 4) {
    ease = clamp(previousEase + 0.12, 1.3, 2.8);
    intervalDays = previousInterval > 0
      ? Math.max(7, Math.round(previousInterval * Math.max(3.1, ease + 0.5)))
      : 4;
  } else {
    ease = clamp(previousEase + 0.03, 1.3, 2.8);
    if (streak === 1) intervalDays = 1;
    else if (streak === 2) intervalDays = 3;
    else intervalDays = Math.max(7, Math.round(Math.max(previousInterval, 3) * ease));
  }

  return {
    dueAt: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    intervalDays,
    ease,
    streak,
    success: true,
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
    incorrectCount: (existing?.incorrectCount ?? 0) + (schedule.success ? 0 : 1),
    lapseCount: (existing?.lapseCount ?? 0) + (schedule.success ? 0 : 1),
    lastStatus: schedule.success ? "correct" : "incorrect",
    lastAnsweredAt: now.toISOString(),
  };
};

const formatInterval = (intervalDays: number): string => {
  const minutes = Math.round(intervalDays * 24 * 60);
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
): Record<WritingGrade, string> => ({
  1: formatInterval(calculateWritingReviewSchedule(existing, 1, now).intervalDays),
  2: formatInterval(calculateWritingReviewSchedule(existing, 2, now).intervalDays),
  3: formatInterval(calculateWritingReviewSchedule(existing, 3, now).intervalDays),
  4: formatInterval(calculateWritingReviewSchedule(existing, 4, now).intervalDays),
});

export const writingGradeStatus = (
  grade: WritingGrade,
): "correct" | "incorrect" =>
  isPassingWritingGrade(grade) ? "correct" : "incorrect";
