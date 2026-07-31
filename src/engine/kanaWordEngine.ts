import { kanaWords, type KanaWord } from "../kana/kanaWords.ts";

export interface KanaWordProgress {
  mastery: number;
  attempts: number;
  correct: number;
  lapses: number;
}

export type KanaWordProgressMap = Record<string, KanaWordProgress>;

export interface KanaWordSummary {
  total: number;
  started: number;
  mastered: number;
  averagePercent: number;
}

const MAX_MASTERY = 5;
const MASTERY_THRESHOLD = 3;

const emptyWordProgress = (): KanaWordProgress => ({
  mastery: 0,
  attempts: 0,
  correct: 0,
  lapses: 0,
});

export function createKanaWordSession(
  progress: KanaWordProgressMap,
  limit = 8,
): KanaWord[] {
  return [...kanaWords]
    .sort((left, right) => {
      const leftProgress = progress[left.id];
      const rightProgress = progress[right.id];
      const masteryDifference =
        (leftProgress?.mastery ?? 0) - (rightProgress?.mastery ?? 0);
      if (masteryDifference !== 0) return masteryDifference;
      const lapseDifference = (rightProgress?.lapses ?? 0) - (leftProgress?.lapses ?? 0);
      if (lapseDifference !== 0) return lapseDifference;
      return (leftProgress?.attempts ?? 0) - (rightProgress?.attempts ?? 0);
    })
    .slice(0, Math.max(1, limit));
}

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededShuffle = (values: string[], seedText: string): string[] => {
  const shuffled = [...values];
  let seed = hashString(seedText);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    const temporary = shuffled[index];
    shuffled[index] = shuffled[swapIndex] ?? shuffled[index] ?? "";
    shuffled[swapIndex] = temporary ?? shuffled[swapIndex] ?? "";
  }
  return shuffled;
};

const startsWithReadyAnswer = (pool: string[], word: KanaWord): boolean =>
  pool.slice(0, word.tokens.length).join("") === word.kana;

export function createWordTokenPool(word: KanaWord): string[] {
  let pool = seededShuffle(
    [...word.tokens, ...word.distractors],
    `${word.id}:${word.kana}:${word.tokens.length}`,
  );

  let rotations = 0;
  while (startsWithReadyAnswer(pool, word) && rotations < pool.length) {
    pool = [...pool.slice(1), ...(pool[0] ? [pool[0]] : [])];
    rotations += 1;
  }
  return pool;
}

export function isKanaWordAnswerCorrect(selectedTokens: string[], word: KanaWord): boolean {
  return selectedTokens.join("") === word.kana;
}

export function updateKanaWordProgress(
  progress: KanaWordProgressMap,
  wordId: string,
  correct: boolean,
): KanaWordProgressMap {
  const current = progress[wordId] ?? emptyWordProgress();
  const mastery = Math.max(
    0,
    Math.min(MAX_MASTERY, current.mastery + (correct ? 1 : -1)),
  );
  return {
    ...progress,
    [wordId]: {
      mastery,
      attempts: current.attempts + 1,
      correct: current.correct + (correct ? 1 : 0),
      lapses: current.lapses + (correct ? 0 : 1),
    },
  };
}

export function getKanaWordSummary(progress: KanaWordProgressMap): KanaWordSummary {
  let started = 0;
  let mastered = 0;
  let totalMastery = 0;

  kanaWords.forEach((word) => {
    const item = progress[word.id];
    if (!item) return;
    totalMastery += item.mastery;
    if (item.attempts > 0) started += 1;
    if (item.mastery >= MASTERY_THRESHOLD) mastered += 1;
  });

  return {
    total: kanaWords.length,
    started,
    mastered,
    averagePercent:
      kanaWords.length === 0
        ? 0
        : Math.round((totalMastery / (kanaWords.length * MAX_MASTERY)) * 100),
  };
}
