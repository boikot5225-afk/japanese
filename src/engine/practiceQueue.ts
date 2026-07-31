import type { Exercise } from "../domain/course";

export interface RemediationQueueResult {
  queue: Exercise[];
  scheduledKey: string | null;
}

const overlapCount = (left: string[], right: string[]): number => {
  const rightSet = new Set(right);
  return left.filter((item) => rightSet.has(item)).length;
};

export function scheduleLessonRemediation(
  queue: Exercise[],
  currentIndex: number,
  failedExercise: Exercise,
  lessonExercises: Exercise[],
  scheduledKeys: string[],
): RemediationQueueResult {
  const group = failedExercise.variantGroup;
  if (!group) return { queue, scheduledKey: null };

  const failedConceptIds = [
    ...failedExercise.targetItemIds,
    ...(failedExercise.confusionItemIds ?? []),
  ];

  const candidates = lessonExercises
    .filter(
      (exercise) =>
        exercise.variantGroup === group &&
        exercise.id !== failedExercise.id &&
        exercise.sessionRole !== "remediation",
    )
    .map((exercise) => ({
      exercise,
      key: `${group}:${exercise.id}`,
      overlap: overlapCount(
        [...exercise.targetItemIds, ...(exercise.confusionItemIds ?? [])],
        failedConceptIds,
      ),
      difficultyDistance: Math.abs(
        (exercise.difficulty ?? 1) - (failedExercise.difficulty ?? 1),
      ),
    }))
    .filter((candidate) => !scheduledKeys.includes(candidate.key))
    .sort((left, right) => {
      if (right.overlap !== left.overlap) return right.overlap - left.overlap;
      if (left.difficultyDistance !== right.difficultyDistance) {
        return left.difficultyDistance - right.difficultyDistance;
      }
      return left.exercise.id.localeCompare(right.exercise.id);
    });

  const selected = candidates[0];
  if (!selected) return { queue, scheduledKey: null };

  const remediationExercise: Exercise = {
    ...selected.exercise,
    sessionRole: "remediation",
  };
  const insertAt = Math.min(currentIndex + 3, queue.length);

  return {
    queue: [
      ...queue.slice(0, insertAt),
      remediationExercise,
      ...queue.slice(insertAt),
    ],
    scheduledKey: selected.key,
  };
}
