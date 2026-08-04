import type { ComponentType } from "react";

import { lessonBundles } from "./src/content/courseCatalog";
import type { CourseProgressSnapshot } from "./src/storage/progressStorage";

type ProgressStorageModule = {
  loadCourseProgress: () => Promise<CourseProgressSnapshot | null>;
};

type AppModule = {
  default: ComponentType;
};

const visibleExercises = lessonBundles.map((bundle) => bundle.exercises);
const visibleExerciseIds = new Set(
  lessonBundles.flatMap((bundle) => bundle.lesson.exerciseIds),
);
const fallbackExerciseIdByLesson = new Map(
  lessonBundles.map((bundle) => [bundle.lesson.id, bundle.lesson.exerciseIds[0]]),
);

const exposeReviewExercisePools = (): void => {
  lessonBundles.forEach((bundle) => {
    if (bundle.reviewExercises) bundle.exercises = bundle.reviewExercises;
  });
};

const restoreVisibleExercisePools = (): void => {
  lessonBundles.forEach((bundle, index) => {
    const exercises = visibleExercises[index];
    if (exercises) bundle.exercises = exercises;
  });
};

const withReviewExercisePools = async <T,>(work: () => Promise<T>): Promise<T> => {
  exposeReviewExercisePools();
  try {
    return await work();
  } finally {
    restoreVisibleExercisePools();
  }
};

const normalizeExerciseId = (lessonId: string, exerciseId: string): string => {
  if (visibleExerciseIds.has(exerciseId)) return exerciseId;
  return fallbackExerciseIdByLesson.get(lessonId) ?? exerciseId;
};

const normalizeProgressSnapshot = (
  snapshot: CourseProgressSnapshot | null,
): CourseProgressSnapshot | null => {
  if (!snapshot) return null;
  return {
    ...snapshot,
    reviewItems: snapshot.reviewItems.map((item) => ({
      ...item,
      exerciseId: normalizeExerciseId(item.lessonId, item.exerciseId),
    })),
    attemptHistory: snapshot.attemptHistory.map((item) => ({
      ...item,
      exerciseId: normalizeExerciseId(item.lessonId, item.exerciseId),
    })),
  };
};

// AppRoot builds its lesson-to-review index once at module load. Expose the
// compatibility pool for that single operation, then return lessons to their
// compact twelve-question queues before the first React render.
const progressStorage = require("./src/storage/progressStorage") as ProgressStorageModule;
const loadCourseProgress = progressStorage.loadCourseProgress;
progressStorage.loadCourseProgress = async () =>
  normalizeProgressSnapshot(
    await withReviewExercisePools(() => loadCourseProgress()),
  );

const loadAppRoot = (): ComponentType => {
  exposeReviewExercisePools();
  try {
    return (require("./AppRoot") as AppModule).default;
  } finally {
    restoreVisibleExercisePools();
  }
};

export default loadAppRoot();
