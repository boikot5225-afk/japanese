import type { Exercise } from "../domain/course";
import type { AnswerStatus } from "./checkAnswer";
import {
  scheduleExerciseReview,
  upsertReviewItem,
  type ReviewItem,
} from "./reviewEngine";

export type LessonRunMode = "learning" | "practice";

interface LessonReviewAttempt {
  exerciseId: string;
  status: AnswerStatus;
}

interface CommitLessonReviewParams {
  items: ReviewItem[];
  exercises: Exercise[];
  attempts: LessonReviewAttempt[];
  lessonId: string;
  mode: LessonRunMode;
  passed: boolean;
  now: Date;
}

export function commitLessonReviewItems({
  items,
  exercises,
  attempts,
  lessonId,
  mode,
  passed,
  now,
}: CommitLessonReviewParams): ReviewItem[] {
  if (mode !== "learning" || !passed) return items;

  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  return attempts.reduce((currentItems, attempt) => {
    const exercise = exerciseById.get(attempt.exerciseId);
    if (!exercise) return currentItems;
    const existing = currentItems.find((item) => item.exerciseId === exercise.id);
    return upsertReviewItem(
      currentItems,
      scheduleExerciseReview(existing, exercise, lessonId, attempt.status, now),
    );
  }, items);
}
