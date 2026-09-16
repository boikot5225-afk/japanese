import type { Exercise, Skill } from "../domain/course";
import type { AnswerStatus } from "./checkAnswer";
import { scheduleWritingReview } from "./writingReview";
import type { WritingGrade } from "./writingSession";
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
  writingGrade?: WritingGrade;
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

interface TargetSessionResult {
  itemId: string;
  skill: Skill;
  exercise: Exercise;
  status: AnswerStatus;
  writingGrade?: WritingGrade;
}

const statusPriority: Record<AnswerStatus, number> = {
  correct: 0,
  acceptable: 1,
  "target-mismatch": 2,
  incorrect: 3,
};

const KANJI_CORE_SKILLS: readonly Skill[] = [
  "recognition",
  "reading",
  "writing",
];

const worseStatus = (left: AnswerStatus, right: AnswerStatus): AnswerStatus =>
  statusPriority[right] > statusPriority[left] ? right : left;

const worseWritingGrade = (
  left: WritingGrade | undefined,
  right: WritingGrade | undefined,
): WritingGrade | undefined => {
  if (left === undefined) return right;
  if (right === undefined) return left;
  return Math.min(left, right) as WritingGrade;
};

const seedUnseenKanjiSkills = (
  items: ReviewItem[],
  sessionResults: readonly TargetSessionResult[],
  lessonId: string,
  now: Date,
): ReviewItem[] => {
  const sourceExerciseByItem = new Map<string, Exercise>();
  sessionResults.forEach((result) => {
    if (
      result.itemId.startsWith("kanji-") &&
      KANJI_CORE_SKILLS.includes(result.skill) &&
      !sourceExerciseByItem.has(result.itemId)
    ) {
      sourceExerciseByItem.set(result.itemId, result.exercise);
    }
  });

  return [...sourceExerciseByItem.entries()].reduce(
    (currentItems, [itemId, sourceExercise]) =>
      KANJI_CORE_SKILLS.reduce((skillItems, skill) => {
        const key = reviewItemKey({ itemId, skill });
        if (skillItems.some((item) => reviewItemKey(item) === key)) {
          return skillItems;
        }

        return upsertReviewItem(skillItems, {
          itemId,
          skill,
          exerciseId: sourceExercise.id,
          lessonId,
          dueAt: now.toISOString(),
          intervalDays: 0,
          ease: 2.3,
          streak: 0,
          correctCount: 0,
          incorrectCount: 0,
          lapseCount: 0,
          lastStatus: "acceptable",
          lastAnsweredAt: now.toISOString(),
        });
      }, currentItems),
    items,
  );
};

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
  const sessionResults = new Map<string, TargetSessionResult>();

  attempts.forEach((attempt) => {
    const exercise = exerciseById.get(attempt.exerciseId);
    if (!exercise) return;
    const skill = inferExerciseSkill(exercise);

    [...new Set(exercise.targetItemIds)].forEach((itemId) => {
      const key = reviewItemKey({ itemId, skill });
      const previous = sessionResults.get(key);
      if (!previous) {
        sessionResults.set(key, {
          itemId,
          skill,
          exercise,
          status: attempt.status,
          writingGrade: attempt.writingGrade,
        });
        return;
      }
      const status = worseStatus(previous.status, attempt.status);
      const writingGrade = worseWritingGrade(
        previous.writingGrade,
        attempt.writingGrade,
      );
      const useCurrentExercise =
        statusPriority[attempt.status] > statusPriority[previous.status] ||
        (status === previous.status &&
          attempt.writingGrade !== undefined &&
          writingGrade === attempt.writingGrade);
      sessionResults.set(key, {
        itemId,
        skill,
        exercise: useCurrentExercise ? exercise : previous.exercise,
        status,
        writingGrade,
      });
    });
  });

  const results = [...sessionResults.values()];
  const scheduledItems = results.reduce((currentItems, target) => {
    const key = reviewItemKey(target);
    const existing = currentItems.find((item) => reviewItemKey(item) === key);
    const scheduled =
      target.skill === "writing" && target.writingGrade !== undefined
        ? scheduleWritingReview(
            existing,
            target.itemId,
            target.exercise,
            lessonId,
            target.writingGrade,
            now,
          )
        : scheduleItemReview(
            existing,
            target.itemId,
            target.skill,
            target.exercise,
            lessonId,
            target.status,
            now,
          );
    return upsertReviewItem(currentItems, scheduled);
  }, items);

  return seedUnseenKanjiSkills(scheduledItems, results, lessonId, now);
}