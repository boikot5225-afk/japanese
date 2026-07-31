import type { Exercise, ExerciseType } from "../domain/course";

const exerciseTypeOrder: readonly ExerciseType[] = [
  "listening",
  "text-input",
  "sentence-builder",
  "particle-gap",
  "conjugation",
  "multiple-choice",
  "handwriting",
];

const isGeneratedExercise = (exercise: Exercise): boolean =>
  exercise.id.includes("-auto-") || exercise.id.includes("-diverse-");

export const getExerciseContentKey = (exercise: Exercise): string =>
  exercise.contentKey?.trim() || `exercise:${exercise.id}`;

const compareCandidates = (left: Exercise, right: Exercise): number => {
  const generatedDifference =
    Number(isGeneratedExercise(left)) - Number(isGeneratedExercise(right));
  if (generatedDifference !== 0) return generatedDifference;

  const difficultyDifference =
    (left.difficulty ?? 2) - (right.difficulty ?? 2);
  if (difficultyDifference !== 0) return difficultyDifference;

  return left.id.localeCompare(right.id);
};

export function buildUniqueExerciseQueue(
  exercises: readonly Exercise[],
  limit = 12,
): Exercise[] {
  const candidates = exercises
    .filter((exercise) => exercise.sessionRole !== "remediation")
    .slice()
    .sort(compareCandidates);
  const selected: Exercise[] = [];
  const usedContentKeys = new Set<string>();

  while (selected.length < limit) {
    let addedThisRound = false;

    for (const type of exerciseTypeOrder) {
      const next = candidates.find(
        (exercise) =>
          exercise.type === type &&
          !usedContentKeys.has(getExerciseContentKey(exercise)),
      );
      if (!next) continue;

      selected.push({ ...next, sessionRole: "core" });
      usedContentKeys.add(getExerciseContentKey(next));
      addedThisRound = true;
      if (selected.length >= limit) break;
    }

    if (!addedThisRound) break;
  }

  return selected;
}

export function selectUniqueByExercise<T>(
  items: readonly T[],
  resolveExercise: (item: T) => Exercise | undefined,
  limit: number,
): T[] {
  const selected: T[] = [];
  const usedContentKeys = new Set<string>();

  for (const item of items) {
    const exercise = resolveExercise(item);
    if (!exercise) continue;
    const contentKey = getExerciseContentKey(exercise);
    if (usedContentKeys.has(contentKey)) continue;

    selected.push(item);
    usedContentKeys.add(contentKey);
    if (selected.length >= limit) break;
  }

  return selected;
}
