import type { Exercise, Skill } from "../domain/course";
import { getExerciseContentKey } from "./exerciseIdentity";
import type { AnswerStatus } from "./checkAnswer";

export type AttemptSource = "lesson" | "review" | "practice";

export interface ReviewItem {
  itemId: string;
  skill: Skill;
  exerciseId: string;
  lessonId: string;
  dueAt: string;
  intervalDays: number;
  ease: number;
  streak: number;
  correctCount: number;
  incorrectCount: number;
  lapseCount: number;
  lastStatus: AnswerStatus;
  lastAnsweredAt: string;
}

export interface LegacyReviewItemV2 {
  exerciseId: string;
  lessonId: string;
  targetItemIds: string[];
  dueAt: string;
  intervalDays: number;
  ease: number;
  streak: number;
  correctCount: number;
  incorrectCount: number;
  lapseCount: number;
  lastStatus: AnswerStatus;
  lastAnsweredAt: string;
}

export interface AttemptLogEntry {
  id: string;
  exerciseId: string;
  contentKey?: string;
  lessonId: string;
  targetItemIds: string[];
  status: AnswerStatus;
  source: AttemptSource;
  answeredAt: string;
}

export interface ReviewSessionQuestion {
  id: string;
  lessonId: string;
  exercise: Exercise;
  items: ReviewItem[];
  remediation?: boolean;
}

export interface ReviewSessionOptions {
  excludedContentKeys?: ReadonlySet<string>;
  recentAttemptLimit?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const successfulStatuses: AnswerStatus[] = ["correct", "acceptable"];
const WEAKNESS_THRESHOLD = 5;
const DEFAULT_RECENT_ATTEMPT_LIMIT = 40;

export const isSuccessfulStatus = (status: AnswerStatus): boolean =>
  successfulStatuses.includes(status);

export const inferExerciseSkill = (exercise: Exercise): Skill => {
  switch (exercise.type) {
    case "listening":
      return "listening";
    case "handwriting":
      return "writing";
    case "multiple-choice":
      return "recognition";
    case "text-input":
      return "recall";
    case "sentence-builder":
    case "particle-gap":
    case "conjugation":
      return "usage";
    default:
      return "recall";
  }
};

export const reviewItemKey = (item: Pick<ReviewItem, "itemId" | "skill">): string =>
  `${item.itemId}:${item.skill}`;

export const reviewQuestionCoverageKey = (
  question: Pick<ReviewSessionQuestion, "items">,
): string => question.items.map(reviewItemKey).sort().join("|");

const addDays = (date: Date, days: number): string =>
  new Date(date.getTime() + days * DAY_MS).toISOString();

const weaknessScore = (item: ReviewItem): number =>
  item.incorrectCount * 4 + item.lapseCount * 3 - item.correctCount +
  (isSuccessfulStatus(item.lastStatus) ? 0 : 6);

export const isWeakReviewItem = (item: ReviewItem): boolean => {
  if (!isSuccessfulStatus(item.lastStatus)) return true;
  return item.streak < 3 && weaknessScore(item) >= WEAKNESS_THRESHOLD;
};

export function scheduleItemReview(
  existing: ReviewItem | undefined,
  itemId: string,
  skill: Skill,
  exercise: Exercise,
  lessonId: string,
  status: AnswerStatus,
  now: Date,
): ReviewItem {
  const success = isSuccessfulStatus(status);
  const previousStreak = existing?.streak ?? 0;
  const streak = success ? previousStreak + 1 : 0;
  const previousEase = existing?.ease ?? 2.3;
  const ease = success
    ? Math.min(2.8, previousEase + (status === "correct" ? 0.05 : 0))
    : Math.max(1.3, previousEase - 0.2);

  let intervalDays = 0;
  if (success) {
    if (streak === 1) {
      intervalDays = 1;
    } else if (streak === 2) {
      intervalDays = 3;
    } else {
      intervalDays = Math.max(
        7,
        Math.round(Math.max(existing?.intervalDays ?? 3, 3) * ease),
      );
    }
  }

  return {
    itemId,
    skill,
    exerciseId: exercise.id,
    lessonId,
    dueAt: success ? addDays(now, intervalDays) : now.toISOString(),
    intervalDays,
    ease,
    streak,
    correctCount: (existing?.correctCount ?? 0) + (success ? 1 : 0),
    incorrectCount: (existing?.incorrectCount ?? 0) + (success ? 0 : 1),
    lapseCount: (existing?.lapseCount ?? 0) + (success ? 0 : 1),
    lastStatus: status,
    lastAnsweredAt: now.toISOString(),
  };
}

export function scheduleExerciseReview(
  existing: ReviewItem | undefined,
  exercise: Exercise,
  lessonId: string,
  status: AnswerStatus,
  now: Date,
): ReviewItem {
  const itemId = existing?.itemId ?? exercise.targetItemIds[0] ?? exercise.id;
  const skill = existing?.skill ?? inferExerciseSkill(exercise);
  return scheduleItemReview(existing, itemId, skill, exercise, lessonId, status, now);
}

export function upsertReviewItem(
  items: ReviewItem[],
  updated: ReviewItem,
): ReviewItem[] {
  const updatedKey = reviewItemKey(updated);
  return [updated, ...items.filter((item) => reviewItemKey(item) !== updatedKey)];
}

export function getDueReviewItems(items: ReviewItem[], now: Date): ReviewItem[] {
  const nowMs = now.getTime();
  return items
    .filter((item) => new Date(item.dueAt).getTime() <= nowMs)
    .sort((left, right) => {
      const dueDifference = new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
      if (dueDifference !== 0) {
        return dueDifference;
      }
      return weaknessScore(right) - weaknessScore(left);
    });
}

export function getNextReviewAt(items: ReviewItem[]): string | null {
  if (items.length === 0) {
    return null;
  }

  return items.reduce<string | null>((earliest, item) => {
    if (!earliest || new Date(item.dueAt).getTime() < new Date(earliest).getTime()) {
      return item.dueAt;
    }
    return earliest;
  }, null);
}

export function getWeakTargetIds(items: ReviewItem[]): string[] {
  const weakIds = new Set<string>();
  items
    .filter(isWeakReviewItem)
    .sort((left, right) => weaknessScore(right) - weaknessScore(left))
    .forEach((item) => weakIds.add(item.itemId));
  return [...weakIds];
}

const stableHash = (value: string): number => {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const exactSkillCandidates = (
  item: ReviewItem,
  exercises: readonly Exercise[],
): Exercise[] => exercises.filter(
  (exercise) =>
    exercise.targetItemIds.includes(item.itemId) &&
    inferExerciseSkill(exercise) === item.skill,
);

const recentContentRanks = (
  attempts: readonly AttemptLogEntry[],
  exerciseById: ReadonlyMap<string, Exercise>,
  limit: number,
): Map<string, number> => {
  const ranks = new Map<string, number>();
  attempts
    .filter((attempt) => attempt.source === "review")
    .slice(0, limit)
    .forEach((attempt, index) => {
      const contentKey =
        attempt.contentKey ??
        (exerciseById.get(attempt.exerciseId)
          ? getExerciseContentKey(exerciseById.get(attempt.exerciseId) as Exercise)
          : `exercise:${attempt.exerciseId}`);
      if (!ranks.has(contentKey)) ranks.set(contentKey, index);
    });
  return ranks;
};

export function selectExerciseForReview(
  item: ReviewItem,
  exercises: readonly Exercise[],
  excludedContentKeys: ReadonlySet<string> = new Set<string>(),
  recentRanks: ReadonlyMap<string, number> = new Map<string, number>(),
): Exercise | undefined {
  const candidates = exactSkillCandidates(item, exercises).filter(
    (exercise) => !excludedContentKeys.has(getExerciseContentKey(exercise)),
  );
  if (candidates.length === 0) return undefined;

  const attempts = item.correctCount + item.incorrectCount;
  const rotationOffset = stableHash(reviewItemKey(item)) % candidates.length;
  const ordered = candidates
    .map((exercise, index) => {
      const contentKey = getExerciseContentKey(exercise);
      const recentRank = recentRanks.get(contentKey);
      const recentPenalty = recentRank === undefined
        ? 0
        : 1000 - Math.min(recentRank, 999);
      const sameExercisePenalty = exercise.id === item.exerciseId ? 100 : 0;
      const rotationPenalty =
        (index - ((attempts + rotationOffset) % candidates.length) + candidates.length) %
        candidates.length;
      return {
        exercise,
        score: recentPenalty + sameExercisePenalty + rotationPenalty,
      };
    })
    .sort((left, right) => left.score - right.score || left.exercise.id.localeCompare(right.exercise.id));

  return ordered[0]?.exercise;
}

export function buildReviewSession(
  dueItems: readonly ReviewItem[],
  exercisesByLesson: ReadonlyMap<string, readonly Exercise[]>,
  attemptHistory: readonly AttemptLogEntry[],
  limit = 20,
  options: ReviewSessionOptions = {},
): ReviewSessionQuestion[] {
  if (limit <= 0) return [];

  const allExercises = [...exercisesByLesson.values()].flatMap((items) => [...items]);
  const exerciseById = new Map(allExercises.map((exercise) => [exercise.id, exercise]));
  const recentRanks = recentContentRanks(
    attemptHistory,
    exerciseById,
    options.recentAttemptLimit ?? DEFAULT_RECENT_ATTEMPT_LIMIT,
  );
  const usedContentKeys = new Set(options.excludedContentKeys ?? []);
  const assignedItemKeys = new Set<string>();
  const questions: ReviewSessionQuestion[] = [];

  for (const item of dueItems) {
    const itemKey = reviewItemKey(item);
    if (assignedItemKeys.has(itemKey)) continue;

    const lessonExercises = exercisesByLesson.get(item.lessonId) ?? [];
    const exercise = selectExerciseForReview(
      item,
      lessonExercises,
      usedContentKeys,
      recentRanks,
    );
    if (!exercise) continue;

    const skill = inferExerciseSkill(exercise);
    const coveredItems = dueItems.filter(
      (candidate) =>
        !assignedItemKeys.has(reviewItemKey(candidate)) &&
        candidate.lessonId === item.lessonId &&
        candidate.skill === skill &&
        exercise.targetItemIds.includes(candidate.itemId),
    );
    if (coveredItems.length === 0) continue;

    const contentKey = getExerciseContentKey(exercise);
    coveredItems.forEach((covered) => assignedItemKeys.add(reviewItemKey(covered)));
    usedContentKeys.add(contentKey);
    questions.push({
      id: `${contentKey}:${reviewQuestionCoverageKey({ items: coveredItems })}`,
      lessonId: item.lessonId,
      exercise,
      items: coveredItems,
    });
    if (questions.length >= limit) break;
  }

  return questions;
}

export function migrateLegacyReviewItems(
  legacyItems: LegacyReviewItemV2[],
  exercises: Exercise[],
): ReviewItem[] {
  const exerciseById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  return [...legacyItems].reverse().reduce<ReviewItem[]>((items, legacy) => {
    const exercise = exerciseById.get(legacy.exerciseId);
    if (!exercise) return items;
    const skill = inferExerciseSkill(exercise);
    return legacy.targetItemIds.reduce((current, itemId) =>
      upsertReviewItem(current, {
        itemId,
        skill,
        exerciseId: legacy.exerciseId,
        lessonId: legacy.lessonId,
        dueAt: legacy.dueAt,
        intervalDays: legacy.intervalDays,
        ease: legacy.ease,
        streak: legacy.streak,
        correctCount: legacy.correctCount,
        incorrectCount: legacy.incorrectCount,
        lapseCount: legacy.lapseCount,
        lastStatus: legacy.lastStatus,
        lastAnsweredAt: legacy.lastAnsweredAt,
      }), items);
  }, []);
}

export function createAttemptLogEntry(
  exercise: Exercise,
  lessonId: string,
  status: AnswerStatus,
  source: AttemptSource,
  now: Date,
): AttemptLogEntry {
  return {
    id: `${now.getTime()}-${exercise.id}-${source}`,
    exerciseId: exercise.id,
    contentKey: getExerciseContentKey(exercise),
    lessonId,
    targetItemIds: exercise.targetItemIds,
    status,
    source,
    answeredAt: now.toISOString(),
  };
}
