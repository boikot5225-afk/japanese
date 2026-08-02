import type { KanjiItem, Skill } from "../domain/course";
import {
  isSuccessfulStatus,
  type ReviewItem,
} from "./reviewEngine";

export type KanjiStudySkill = "meaning" | "reading" | "writing";
export type KanjiSkillState = "new" | "learning" | "review" | "weak";
export type KanjiStudyStatus = "new" | "learning" | "review" | "weak";

export interface KanjiSkillProgress {
  skill: KanjiStudySkill;
  mastery: number;
  attempts: number;
  correctCount: number;
  incorrectCount: number;
  lapseCount: number;
  dueAt: string | null;
  lastAnsweredAt: string | null;
  state: KanjiSkillState;
}

export interface KanjiProgressSummary {
  itemId: string;
  meaning: KanjiSkillProgress;
  reading: KanjiSkillProgress;
  writing: KanjiSkillProgress;
  overallMastery: number;
  status: KanjiStudyStatus;
  weak: boolean;
  nextDueAt: string | null;
}

const SKILLS_BY_STUDY_AREA: Record<KanjiStudySkill, readonly Skill[]> = {
  meaning: ["recognition", "recall"],
  reading: ["reading"],
  writing: ["writing"],
};

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const earliestDate = (values: readonly string[]): string | null => {
  if (values.length === 0) return null;
  return values.reduce((earliest, value) =>
    new Date(value).getTime() < new Date(earliest).getTime() ? value : earliest,
  );
};

const latestDate = (values: readonly string[]): string | null => {
  if (values.length === 0) return null;
  return values.reduce((latest, value) =>
    new Date(value).getTime() > new Date(latest).getTime() ? value : latest,
  );
};

const calculateMastery = (items: readonly ReviewItem[]): number => {
  const correctCount = items.reduce((sum, item) => sum + item.correctCount, 0);
  const incorrectCount = items.reduce((sum, item) => sum + item.incorrectCount, 0);
  const attempts = correctCount + incorrectCount;
  if (attempts === 0) return 0;

  const accuracy = correctCount / attempts;
  const strongestStreak = Math.max(0, ...items.map((item) => item.streak));
  const longestInterval = Math.max(0, ...items.map((item) => item.intervalDays));
  const lapseCount = items.reduce((sum, item) => sum + item.lapseCount, 0);
  const lastFailure = items.some((item) => !isSuccessfulStatus(item.lastStatus));

  const raw =
    accuracy * 0.55 +
    Math.min(strongestStreak / 4, 1) * 0.25 +
    Math.min(longestInterval / 21, 1) * 0.2 -
    Math.min(lapseCount * 0.08, 0.4);
  const score = Math.round(clamp(raw, 0, 1) * 100);

  return lastFailure ? Math.min(score, 45) : score;
};

const buildSkillProgress = (
  itemId: string,
  skill: KanjiStudySkill,
  reviewItems: readonly ReviewItem[],
): KanjiSkillProgress => {
  const acceptedSkills = SKILLS_BY_STUDY_AREA[skill];
  const items = reviewItems.filter(
    (item) => item.itemId === itemId && acceptedSkills.includes(item.skill),
  );
  const correctCount = items.reduce((sum, item) => sum + item.correctCount, 0);
  const incorrectCount = items.reduce((sum, item) => sum + item.incorrectCount, 0);
  const attempts = correctCount + incorrectCount;
  const lapseCount = items.reduce((sum, item) => sum + item.lapseCount, 0);
  const mastery = calculateMastery(items);
  const hasFailure = items.some((item) => !isSuccessfulStatus(item.lastStatus));

  let state: KanjiSkillState = "learning";
  if (attempts === 0) {
    state = "new";
  } else if (hasFailure || mastery < 40) {
    state = "weak";
  } else if (mastery >= 70) {
    state = "review";
  }

  return {
    skill,
    mastery,
    attempts,
    correctCount,
    incorrectCount,
    lapseCount,
    dueAt: earliestDate(items.map((item) => item.dueAt)),
    lastAnsweredAt: latestDate(items.map((item) => item.lastAnsweredAt)),
    state,
  };
};

export const buildKanjiProgress = (
  item: Pick<KanjiItem, "id">,
  reviewItems: readonly ReviewItem[],
): KanjiProgressSummary => {
  const meaning = buildSkillProgress(item.id, "meaning", reviewItems);
  const reading = buildSkillProgress(item.id, "reading", reviewItems);
  const writing = buildSkillProgress(item.id, "writing", reviewItems);
  const activeSkills = [meaning, reading, writing];
  const overallMastery = Math.round(
    activeSkills.reduce((sum, progress) => sum + progress.mastery, 0) /
      activeSkills.length,
  );
  const weak = activeSkills.some((progress) => progress.state === "weak");

  let status: KanjiStudyStatus = "learning";
  if (activeSkills.every((progress) => progress.state === "new")) {
    status = "new";
  } else if (weak) {
    status = "weak";
  } else if (activeSkills.every((progress) => progress.state === "review")) {
    status = "review";
  }

  return {
    itemId: item.id,
    meaning,
    reading,
    writing,
    overallMastery,
    status,
    weak,
    nextDueAt: earliestDate(
      activeSkills
        .map((progress) => progress.dueAt)
        .filter((value): value is string => Boolean(value)),
    ),
  };
};

export const buildKanjiProgressCatalog = (
  items: readonly KanjiItem[],
  reviewItems: readonly ReviewItem[],
): KanjiProgressSummary[] =>
  items.map((item) => buildKanjiProgress(item, reviewItems));