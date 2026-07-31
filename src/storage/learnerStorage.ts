import AsyncStorage from "@react-native-async-storage/async-storage";

import type { KanaProgressMap, KanaSkillProgress } from "../engine/kanaEngine";
import type { KanaWordProgress, KanaWordProgressMap } from "../engine/kanaWordEngine";

const PROFILE_KEY = "japanese.learner-profile.v1";
const KANA_PROGRESS_KEY = "japanese.kana-progress.v1";
const KANA_WORD_PROGRESS_KEY = "japanese.kana-word-progress.v1";

export type LearnerStartLevel = "zero" | "hiragana" | "kana";

export interface LearnerProfile {
  version: 1;
  onboardingComplete: boolean;
  startLevel: LearnerStartLevel;
  updatedAt: string;
}

const isStartLevel = (value: unknown): value is LearnerStartLevel =>
  value === "zero" || value === "hiragana" || value === "kana";

const isFiniteScore = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 5;

const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const isKanaSkillProgress = (value: unknown): value is KanaSkillProgress => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<KanaSkillProgress>;
  return (
    isFiniteScore(item.recognition) &&
    isFiniteScore(item.reading) &&
    isFiniteScore(item.listening) &&
    isFiniteScore(item.typing) &&
    isNonNegativeNumber(item.attempts) &&
    isNonNegativeNumber(item.correct)
  );
};

const isKanaWordProgress = (value: unknown): value is KanaWordProgress => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<KanaWordProgress>;
  return (
    isFiniteScore(item.mastery) &&
    isNonNegativeNumber(item.attempts) &&
    isNonNegativeNumber(item.correct) &&
    isNonNegativeNumber(item.lapses)
  );
};

export async function loadLearnerProfile(): Promise<LearnerProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Partial<LearnerProfile>;
    if (
      candidate.version !== 1 ||
      candidate.onboardingComplete !== true ||
      !isStartLevel(candidate.startLevel)
    ) {
      return null;
    }
    return {
      version: 1,
      onboardingComplete: true,
      startLevel: candidate.startLevel,
      updatedAt:
        typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export async function saveLearnerProfile(startLevel: LearnerStartLevel): Promise<void> {
  const profile: LearnerProfile = {
    version: 1,
    onboardingComplete: true,
    startLevel,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function loadKanaProgress(): Promise<KanaProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(KANA_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => isKanaSkillProgress(value)),
    );
  } catch {
    return {};
  }
}

export async function saveKanaProgress(progress: KanaProgressMap): Promise<void> {
  await AsyncStorage.setItem(KANA_PROGRESS_KEY, JSON.stringify(progress));
}

export async function loadKanaWordProgress(): Promise<KanaWordProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(KANA_WORD_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => isKanaWordProgress(value)),
    );
  } catch {
    return {};
  }
}

export async function saveKanaWordProgress(progress: KanaWordProgressMap): Promise<void> {
  await AsyncStorage.setItem(KANA_WORD_PROGRESS_KEY, JSON.stringify(progress));
}
