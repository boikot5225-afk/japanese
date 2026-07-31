import AsyncStorage from "@react-native-async-storage/async-storage";

import { lessonBundles } from "../content/courseCatalog";
import type { Skill } from "../domain/course";
import {
  migrateLegacyReviewItems,
  type AttemptLogEntry,
  type LegacyReviewItemV2,
  type ReviewItem,
} from "../engine/reviewEngine";

const STORAGE_KEY = "japanese.course-progress.v3";
const LEGACY_V2_STORAGE_KEY = "japanese.course-progress.v2";
const LEGACY_V1_STORAGE_KEY = "japanese.course-progress.v1";

export interface CourseProgressSnapshot {
  version: 3;
  completedLessonIds: string[];
  lastLessonId: string | null;
  reviewItems: ReviewItem[];
  attemptHistory: AttemptLogEntry[];
  updatedAt: string;
}

interface LegacyCourseProgressV2 {
  version: 2;
  completedLessonIds: string[];
  lastLessonId: string | null;
  reviewItems: LegacyReviewItemV2[];
  attemptHistory: AttemptLogEntry[];
  updatedAt?: string;
}

const skills: Skill[] = [
  "recognition",
  "recall",
  "reading",
  "listening",
  "writing",
  "usage",
];

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const hasReviewCounters = (item: Record<string, unknown>): boolean =>
  typeof item.exerciseId === "string" &&
  typeof item.lessonId === "string" &&
  typeof item.dueAt === "string" &&
  typeof item.intervalDays === "number" &&
  typeof item.ease === "number" &&
  typeof item.streak === "number" &&
  typeof item.correctCount === "number" &&
  typeof item.incorrectCount === "number" &&
  typeof item.lapseCount === "number" &&
  typeof item.lastStatus === "string" &&
  typeof item.lastAnsweredAt === "string";

const isReviewItem = (value: unknown): value is ReviewItem => {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    hasReviewCounters(item) &&
    typeof item.itemId === "string" &&
    typeof item.skill === "string" &&
    skills.includes(item.skill as Skill)
  );
};

const isLegacyReviewItemV2 = (value: unknown): value is LegacyReviewItemV2 => {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return hasReviewCounters(item) && isStringArray(item.targetItemIds);
};

const isAttemptLogEntry = (value: unknown): value is AttemptLogEntry => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<AttemptLogEntry>;
  return (
    typeof item.id === "string" &&
    typeof item.exerciseId === "string" &&
    typeof item.lessonId === "string" &&
    isStringArray(item.targetItemIds) &&
    typeof item.status === "string" &&
    (item.source === "lesson" || item.source === "review" || item.source === "practice") &&
    typeof item.answeredAt === "string"
  );
};

const readJson = async (key: string): Promise<unknown> => {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as unknown) : null;
};

const validCommonSnapshot = (
  candidate: Record<string, unknown>,
): candidate is Record<string, unknown> & {
  completedLessonIds: string[];
  lastLessonId: string | null;
  attemptHistory: AttemptLogEntry[];
} =>
  isStringArray(candidate.completedLessonIds) &&
  (candidate.lastLessonId === null || typeof candidate.lastLessonId === "string") &&
  Array.isArray(candidate.attemptHistory) &&
  candidate.attemptHistory.every(isAttemptLogEntry);

export async function loadCourseProgress(): Promise<CourseProgressSnapshot | null> {
  try {
    const parsed = await readJson(STORAGE_KEY);
    if (parsed && typeof parsed === "object") {
      const candidate = parsed as Record<string, unknown>;
      if (
        candidate.version === 3 &&
        validCommonSnapshot(candidate) &&
        Array.isArray(candidate.reviewItems) &&
        candidate.reviewItems.every(isReviewItem)
      ) {
        return {
          version: 3,
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

    const legacyV2 = await readJson(LEGACY_V2_STORAGE_KEY);
    if (legacyV2 && typeof legacyV2 === "object") {
      const candidate = legacyV2 as Record<string, unknown>;
      if (
        candidate.version === 2 &&
        validCommonSnapshot(candidate) &&
        Array.isArray(candidate.reviewItems) &&
        candidate.reviewItems.every(isLegacyReviewItemV2)
      ) {
        const typed = candidate as unknown as LegacyCourseProgressV2;
        const exercises = lessonBundles.flatMap((bundle) => bundle.exercises);
        return {
          version: 3,
          completedLessonIds: typed.completedLessonIds,
          lastLessonId: typed.lastLessonId,
          reviewItems: migrateLegacyReviewItems(typed.reviewItems, exercises),
          attemptHistory: typed.attemptHistory,
          updatedAt: typed.updatedAt ?? new Date(0).toISOString(),
        };
      }
    }

    const legacyV1 = await readJson(LEGACY_V1_STORAGE_KEY);
    if (legacyV1 && typeof legacyV1 === "object") {
      const candidate = legacyV1 as {
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
          version: 3,
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
    version: 3,
    ...snapshot,
    attemptHistory: snapshot.attemptHistory.slice(0, 200),
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}
