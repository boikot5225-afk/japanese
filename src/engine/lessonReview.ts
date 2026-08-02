import type { Exercise, Skill } from "../domain/course";
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

interface TargetSessionResult {
  itemId: string;
  skill: Skill;
  exercise: Exercise;
  status: AnswerStatus;
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
        sessionResults.set(key, { itemId, skill, exercise, status: attempt.status });
        return;
      }
      const status = worseStatus(previous.status, attempt.status);
      sessionResults.set(key, {
        itemId,
        skill,
        exercise: status === attempt.status ? exercise : previous.exercise,
        status,
      });
    });
  });

  const results = [...sessionResults.values()];
  const scheduledItems = results.reduce((currentItems, target) => {
    const key = reviewItemKey(target);
    const existing = currentItems.find((item) => reviewItemKey(item) === key);
    return upsertReviewItem(
      currentItems,
      scheduleItemReview(
        existing,
        target.itemId,
        target.skill,
        target.exercise,
        lessonId,
        target.status,
        now,
      ),
    );
  }, items);

  return seedUnseenKanjiSkills(scheduledItems, results, lessonId, now);
}