import type { Exercise } from "../domain/course";
import type { AnswerStatus } from "./checkAnswer";
import {
  inferExerciseSkill,
  reviewItemKey,
  scheduleItemReview,
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
    const skill = inferExerciseSkill(exercise);

    return [...new Set(exercise.targetItemIds)].reduce((targetItems, itemId) => {
      const key = reviewItemKey({ itemId, skill });
      const existing = targetItems.find((item) => reviewItemKey(item) === key);
      return upsertReviewItem(
        targetItems,
        scheduleItemReview(
          existing,
          itemId,
          skill,
          exercise,
          lessonId,
          attempt.status,
          now,
        ),
      );
    }, currentItems);
  }, items);
}
