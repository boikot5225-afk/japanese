import { basicHiragana, type KanaSymbol } from "../kana/hiragana.ts";

export type KanaSkill = "recognition" | "reading" | "listening" | "typing";

export interface KanaSkillProgress {
  recognition: number;
  reading: number;
  listening: number;
  typing: number;
  attempts: number;
  correct: number;
}

export type KanaProgressMap = Record<string, KanaSkillProgress>;

export interface KanaQuestion {
  id: string;
  symbolId: string;
  skill: KanaSkill;
  prompt: string;
  correctAnswer: string;
  options: string[];
  speakText?: string;
}

export interface KanaMasterySummary {
  total: number;
  started: number;
  mastered: number;
  averagePercent: number;
}

const MAX_SKILL_SCORE = 5;
const MASTERY_THRESHOLD = 3;

export const emptyKanaSkillProgress = (): KanaSkillProgress => ({
  recognition: 0,
  reading: 0,
  listening: 0,
  typing: 0,
  attempts: 0,
  correct: 0,
});

const skillScore = (progress: KanaSkillProgress | undefined, skill: KanaSkill): number =>
  progress?.[skill] ?? 0;

const totalSkillScore = (progress: KanaSkillProgress | undefined): number =>
  progress
    ? progress.recognition + progress.reading + progress.listening + progress.typing
    : 0;

const uniqueOptions = (
  pool: readonly KanaSymbol[],
  targetIndex: number,
  value: (symbol: KanaSymbol) => string,
): string[] => {
  const correct = pool[targetIndex];
  if (!correct) return [];
  const choices = [value(correct)];
  let offset = 1;
  while (choices.length < 4 && offset < pool.length + 1) {
    const candidate = pool[(targetIndex + offset) % pool.length];
    if (candidate) {
      const candidateValue = value(candidate);
      if (!choices.includes(candidateValue)) choices.push(candidateValue);
    }
    offset += 1;
  }
  return choices;
};

const rotateOptions = (options: string[], seed: number): string[] => {
  if (options.length < 2) return options;
  const shift = seed % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
};

export function createKanaQuestion(
  symbol: KanaSymbol,
  skill: KanaSkill,
  pool: readonly KanaSymbol[] = basicHiragana,
): KanaQuestion {
  const targetIndex = Math.max(0, pool.findIndex((item) => item.id === symbol.id));
  const kanaOptions = rotateOptions(uniqueOptions(pool, targetIndex, (item) => item.kana), targetIndex);
  const romajiOptions = rotateOptions(
    uniqueOptions(pool, targetIndex, (item) => item.romaji),
    targetIndex + 1,
  );

  if (skill === "recognition") {
    return {
      id: `${skill}-${symbol.id}`,
      symbolId: symbol.id,
      skill,
      prompt: `Найди знак для «${symbol.romaji}»`,
      correctAnswer: symbol.kana,
      options: kanaOptions,
    };
  }

  if (skill === "reading") {
    return {
      id: `${skill}-${symbol.id}`,
      symbolId: symbol.id,
      skill,
      prompt: `Как читается ${symbol.kana}?`,
      correctAnswer: symbol.romaji,
      options: romajiOptions,
    };
  }

  if (skill === "listening") {
    return {
      id: `${skill}-${symbol.id}`,
      symbolId: symbol.id,
      skill,
      prompt: "Какой знак прозвучал?",
      correctAnswer: symbol.kana,
      options: kanaOptions,
      speakText: symbol.kana,
    };
  }

  return {
    id: `${skill}-${symbol.id}`,
    symbolId: symbol.id,
    skill,
    prompt: `Введи ромадзи для ${symbol.kana}`,
    correctAnswer: symbol.romaji,
    options: [],
  };
}

export function createKanaSession(
  skill: KanaSkill,
  progress: KanaProgressMap,
  limit = 10,
): KanaQuestion[] {
  return [...basicHiragana]
    .sort((left, right) => {
      const leftProgress = progress[left.id];
      const rightProgress = progress[right.id];
      const skillDifference = skillScore(leftProgress, skill) - skillScore(rightProgress, skill);
      if (skillDifference !== 0) return skillDifference;
      const attemptDifference = (leftProgress?.attempts ?? 0) - (rightProgress?.attempts ?? 0);
      if (attemptDifference !== 0) return attemptDifference;
      return totalSkillScore(leftProgress) - totalSkillScore(rightProgress);
    })
    .slice(0, Math.max(1, limit))
    .map((symbol) => createKanaQuestion(symbol, skill));
}

const romajiAliases: Record<string, string[]> = {
  shi: ["shi", "si"],
  chi: ["chi", "ti"],
  tsu: ["tsu", "tu"],
  fu: ["fu", "hu"],
};

const normalize = (value: string): string =>
  value.trim().toLowerCase().normalize("NFKC").replace(/\s+/g, "");

export function isKanaAnswerCorrect(answer: string, question: KanaQuestion): boolean {
  const normalizedAnswer = normalize(answer);
  const normalizedCorrect = normalize(question.correctAnswer);
  if (normalizedAnswer === normalizedCorrect) return true;
  const aliases = romajiAliases[normalizedCorrect];
  return aliases ? aliases.includes(normalizedAnswer) : false;
}

export function updateKanaProgress(
  progress: KanaProgressMap,
  symbolId: string,
  skill: KanaSkill,
  correct: boolean,
): KanaProgressMap {
  const current = progress[symbolId] ?? emptyKanaSkillProgress();
  const nextScore = Math.max(
    0,
    Math.min(MAX_SKILL_SCORE, current[skill] + (correct ? 1 : -1)),
  );
  return {
    ...progress,
    [symbolId]: {
      ...current,
      [skill]: nextScore,
      attempts: current.attempts + 1,
      correct: current.correct + (correct ? 1 : 0),
    },
  };
}

export function createKnownHiraganaProgress(): KanaProgressMap {
  return Object.fromEntries(
    basicHiragana.map((symbol) => [
      symbol.id,
      {
        recognition: MAX_SKILL_SCORE,
        reading: MAX_SKILL_SCORE,
        listening: MASTERY_THRESHOLD,
        typing: MASTERY_THRESHOLD,
        attempts: 0,
        correct: 0,
      } satisfies KanaSkillProgress,
    ]),
  );
}

export function getKanaMasterySummary(progress: KanaProgressMap): KanaMasterySummary {
  let started = 0;
  let mastered = 0;
  let totalScore = 0;

  basicHiragana.forEach((symbol) => {
    const item = progress[symbol.id];
    if (!item) return;
    const scores = [item.recognition, item.reading, item.listening, item.typing];
    totalScore += scores.reduce((sum, score) => sum + score, 0);
    if (scores.some((score) => score > 0)) started += 1;
    if (scores.every((score) => score >= MASTERY_THRESHOLD)) mastered += 1;
  });

  const maximumScore = basicHiragana.length * 4 * MAX_SKILL_SCORE;
  return {
    total: basicHiragana.length,
    started,
    mastered,
    averagePercent: maximumScore === 0 ? 0 : Math.round((totalScore / maximumScore) * 100),
  };
}

export function getSkillAverage(progress: KanaProgressMap, skill: KanaSkill): number {
  const total = basicHiragana.reduce(
    (sum, symbol) => sum + skillScore(progress[symbol.id], skill),
    0,
  );
  return Math.round((total / (basicHiragana.length * MAX_SKILL_SCORE)) * 100);
}
