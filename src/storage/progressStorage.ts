import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "japanese.course-progress.v1";

export interface CourseProgressSnapshot {
  version: 1;
  completedLessonIds: string[];
  lastLessonId: string | null;
  updatedAt: string;
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export async function loadCourseProgress(): Promise<CourseProgressSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const candidate = parsed as Partial<CourseProgressSnapshot>;
    if (
      candidate.version !== 1 ||
      !isStringArray(candidate.completedLessonIds) ||
      (candidate.lastLessonId !== null && typeof candidate.lastLessonId !== "string")
    ) {
      return null;
    }

    return {
      version: 1,
      completedLessonIds: candidate.completedLessonIds,
      lastLessonId: candidate.lastLessonId,
      updatedAt:
        typeof candidate.updatedAt === "string"
          ? candidate.updatedAt
          : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export async function saveCourseProgress(
  completedLessonIds: string[],
  lastLessonId: string | null,
): Promise<void> {
  const snapshot: CourseProgressSnapshot = {
    version: 1,
    completedLessonIds,
    lastLessonId,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}
