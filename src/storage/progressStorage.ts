import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AttemptLogEntry, ReviewItem } from "../engine/reviewEngine";

const STORAGE_KEY = "japanese.course-progress.v2";
const LEGACY_STORAGE_KEY = "japanese.course-progress.v1";

export interface CourseProgressSnapshot {
  version: 2;
  completedLessonIds: string[];
  lastLessonId: string | null;
  reviewItems: ReviewItem[];
  attemptHistory: AttemptLogEntry[];
  updatedAt: string;
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isReviewItem = (value: unknown): value is ReviewItem => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as Partial<ReviewItem>;
  return (
    typeof item.exerciseId === "string" &&
    typeof item.lessonId === "string" &&
    isStringArray(item.targetItemIds) &&
    typeof item.dueAt === "string" &&
    typeof item.intervalDays === "number" &&
    typeof item.ease === "number" &&
    typeof item.streak === "number" &&
    typeof item.correctCount === "number" &&
    typeof item.incorrectCount === "number" &&
    typeof item.lapseCount === "number" &&
    typeof item.lastStatus === "string" &&
    typeof item.lastAnsweredAt === "string"
  );
};

const isAttemptLogEntry = (value: unknown): value is AttemptLogEntry => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as Partial<AttemptLogEntry>;
  return (
    typeof item.id === "string" &&
    typeof item.exerciseId === "string" &&
    typeof item.lessonId === "string" &&
    isStringArray(item.targetItemIds) &&
    typeof item.status === "string" &&
    (item.source === "lesson" || item.source === "review") &&
    typeof item.answeredAt === "string"
  );
};

const readJson = async (key: string): Promise<unknown> => {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as unknown) : null;
};

export async function loadCourseProgress(): Promise<CourseProgressSnapshot | null> {
  try {
    const parsed = await readJson(STORAGE_KEY);
    if (parsed && typeof parsed === "object") {
      const candidate = parsed as Partial<CourseProgressSnapshot>;
      if (
        candidate.version === 2 &&
        isStringArray(candidate.completedLessonIds) &&
        (candidate.lastLessonId === null || typeof candidate.lastLessonId === "string") &&
        Array.isArray(candidate.reviewItems) &&
        candidate.reviewItems.every(isReviewItem) &&
        Array.isArray(candidate.attemptHistory) &&
        candidate.attemptHistory.every(isAttemptLogEntry)
      ) {
        return {
          version: 2,
          completedLessonIds: candidate.completedLessonIds,
          lastLessonId: candidate.lastLessonId,
          reviewItems: candidate.reviewItems,
          attemptHistory: candidate.attemptHistory,
          updatedAt:
            typeof candidate.updatedAt === "string"
              ? candidate.updatedAt
              : new Date(0).toISOString(),
        };
      }
    }

    const legacy = await readJson(LEGACY_STORAGE_KEY);
    if (legacy && typeof legacy === "object") {
      const candidate = legacy as {
        version?: unknown;
        completedLessonIds?: unknown;
        lastLessonId?: unknown;
      };
      if (
        candidate.version === 1 &&
        isStringArray(candidate.completedLessonIds) &&
        (candidate.lastLessonId === null || typeof candidate.lastLessonId === "string")
      ) {
        return {
          version: 2,
          completedLessonIds: candidate.completedLessonIds,
          lastLessonId: candidate.lastLessonId,
          reviewItems: [],
          attemptHistory: [],
          updatedAt: new Date(0).toISOString(),
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function saveCourseProgress(
  snapshot: Omit<CourseProgressSnapshot, "version" | "updatedAt">,
): Promise<void> {
  const stored: CourseProgressSnapshot = {
    version: 2,
    ...snapshot,
    attemptHistory: snapshot.attemptHistory.slice(0, 200),
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}
