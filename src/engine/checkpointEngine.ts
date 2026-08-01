import {
  courseCheckpoints,
  type CourseCheckpoint,
} from "../content/courseCheckpoints";
import { lessonBundles } from "../content/courseCatalog";
import type { LessonBundle } from "../content/lessonBundle";
import type { Exercise, Skill } from "../domain/course";
import { getExerciseContentKey } from "./exerciseIdentity";
import type { ExerciseAttempt } from "./lessonSession";
import { inferExerciseSkill, isSuccessfulStatus } from "./reviewEngine";

export interface CheckpointQuestion {
  exercise: Exercise;
  lessonId: string;
  skill: Skill;
}

export interface CheckpointResult {
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  requiredPercent: number;
}

export interface CheckpointProgress {
  checkpointId: string;
  passed: boolean;
  bestPercent: number;
  lastPercent: number;
  attemptCount: number;
  lastAttemptAt: string;
}

const skillOrder: Skill[] = [
  "listening",
  "usage",
  "recall",
  "recognition",
  "reading",
  "writing",
];

const isObjectivelyGradableCheckpointExercise = (exercise: Exercise): boolean =>
  exercise.type !== "handwriting";

const weaknessHits = (exercise: Exercise, weakTargetIds: Set<string>): number =>
  exercise.targetItemIds.filter((itemId) => weakTargetIds.has(itemId)).length;

const compareQuestions = (
  left: CheckpointQuestion,
  right: CheckpointQuestion,
  weakTargetIds: Set<string>,
): number => {
  const weaknessDifference =
    weaknessHits(right.exercise, weakTargetIds) - weaknessHits(left.exercise, weakTargetIds);
  if (weaknessDifference !== 0) return weaknessDifference;

  const difficultyDifference =
    (right.exercise.difficulty ?? 1) - (left.exercise.difficulty ?? 1);
  if (difficultyDifference !== 0) return difficultyDifference;

  return left.exercise.id.localeCompare(right.exercise.id);
};

export function buildCheckpointQueue(
  checkpoint: CourseCheckpoint,
  bundles: readonly LessonBundle[],
  weakTargetIds: readonly string[] = [],
): CheckpointQuestion[] {
  const checkpointLessonIds = new Set(checkpoint.lessonIds);
  const weaknessSet = new Set(weakTargetIds);
  const pool = bundles
    .filter((bundle) => checkpointLessonIds.has(bundle.lesson.id))
    .flatMap((bundle) =>
      bundle.exercises
        .filter(isObjectivelyGradableCheckpointExercise)
        .map((exercise) => ({
          exercise: { ...exercise, sessionRole: "core" as const },
          lessonId: bundle.lesson.id,
          skill: inferExerciseSkill(exercise),
        })),
    );

  const groups = new Map<Skill, CheckpointQuestion[]>();
  skillOrder.forEach((skill) => groups.set(skill, []));
  pool.forEach((question) => {
    const group = groups.get(question.skill) ?? [];
    group.push(question);
    groups.set(question.skill, group);
  });
  groups.forEach((questions) =>
    questions.sort((left, right) => compareQuestions(left, right, weaknessSet)),
  );

  const selected: CheckpointQuestion[] = [];
  const selectedIds = new Set<string>();
  const selectedContentKeys = new Set<string>();
  while (selected.length < checkpoint.questionCount) {
    let addedThisRound = false;
    for (const skill of skillOrder) {
      const next = groups.get(skill)?.find((question) => {
        const contentKey = getExerciseContentKey(question.exercise);
        return (
          !selectedIds.has(question.exercise.id) &&
          !selectedContentKeys.has(contentKey)
        );
      });
      if (!next) continue;
      selected.push(next);
      selectedIds.add(next.exercise.id);
      selectedContentKeys.add(getExerciseContentKey(next.exercise));
      addedThisRound = true;
      if (selected.length >= checkpoint.questionCount) break;
    }
    if (!addedThisRound) break;
  }

  if (selected.length < checkpoint.questionCount) {
    const remaining = pool
      .filter((question) => {
        const contentKey = getExerciseContentKey(question.exercise);
        return (
          !selectedIds.has(question.exercise.id) &&
          !selectedContentKeys.has(contentKey)
        );
      })
      .sort((left, right) => compareQuestions(left, right, weaknessSet));
    for (const question of remaining) {
      selected.push(question);
      selectedIds.add(question.exercise.id);
      selectedContentKeys.add(getExerciseContentKey(question.exercise));
      if (selected.length >= checkpoint.questionCount) break;
    }
  }

  return selected;
}

export function calculateCheckpointResult(
  attempts: readonly ExerciseAttempt[],
  requiredPercent: number,
): CheckpointResult {
  const total = attempts.length;
  const correct = attempts.filter((attempt) => isSuccessfulStatus(attempt.status)).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return {
    correct,
    total,
    percent,
    passed: total > 0 && percent >= requiredPercent,
    requiredPercent,
  };
}

export function updateCheckpointProgress(
  progress: readonly CheckpointProgress[],
  checkpointId: string,
  result: CheckpointResult,
  now: Date,
): CheckpointProgress[] {
  const existing = progress.find((item) => item.checkpointId === checkpointId);
  const updated: CheckpointProgress = {
    checkpointId,
    passed: (existing?.passed ?? false) || result.passed,
    bestPercent: Math.max(existing?.bestPercent ?? 0, result.percent),
    lastPercent: result.percent,
    attemptCount: (existing?.attemptCount ?? 0) + 1,
    lastAttemptAt: now.toISOString(),
  };
  return [updated, ...progress.filter((item) => item.checkpointId !== checkpointId)];
}

export function reconcileCheckpointProgress(
  progress: readonly CheckpointProgress[],
  completedLessonIds: readonly string[],
): CheckpointProgress[] {
  const completedIndexes = completedLessonIds
    .map((lessonId) => lessonBundles.findIndex((bundle) => bundle.lesson.id === lessonId))
    .filter((index) => index >= 0);
  if (completedIndexes.length === 0) return [...progress];

  const furthestCompletedIndex = Math.max(...completedIndexes);
  return courseCheckpoints.reduce<CheckpointProgress[]>((items, checkpoint) => {
    if (!checkpoint.unlockLessonId) return items;
    const unlockIndex = lessonBundles.findIndex(
      (bundle) => bundle.lesson.id === checkpoint.unlockLessonId,
    );
    if (unlockIndex < 0 || furthestCompletedIndex < unlockIndex) return items;

    const existing = items.find((item) => item.checkpointId === checkpoint.id);
    if (existing?.passed) return items;

    const inferred: CheckpointProgress = {
      checkpointId: checkpoint.id,
      passed: true,
      bestPercent: 100,
      lastPercent: existing?.lastPercent ?? 100,
      attemptCount: Math.max(existing?.attemptCount ?? 0, 1),
      lastAttemptAt: existing?.lastAttemptAt ?? new Date(0).toISOString(),
    };
    return [inferred, ...items.filter((item) => item.checkpointId !== checkpoint.id)];
  }, [...progress]);
}

export const isCheckpointPassed = (
  checkpointId: string,
  progress: readonly CheckpointProgress[],
): boolean => progress.some((item) => item.checkpointId === checkpointId && item.passed);

export const isCheckpointAvailable = (
  checkpoint: CourseCheckpoint,
  completedLessonIds: readonly string[],
): boolean => checkpoint.lessonIds.every((lessonId) => completedLessonIds.includes(lessonId));

export function isLessonUnlocked(
  lessonId: string,
  completedLessonIds: readonly string[],
  checkpointProgress: readonly CheckpointProgress[],
): boolean {
  if (completedLessonIds.includes(lessonId)) return true;

  const targetIndex = lessonBundles.findIndex((bundle) => bundle.lesson.id === lessonId);
  if (targetIndex < 0) return false;

  return courseCheckpoints.every((checkpoint) => {
    if (!checkpoint.unlockLessonId) return true;
    const unlockIndex = lessonBundles.findIndex(
      (bundle) => bundle.lesson.id === checkpoint.unlockLessonId,
    );
    if (unlockIndex < 0 || targetIndex < unlockIndex) return true;
    return isCheckpointPassed(checkpoint.id, checkpointProgress);
  });
}
