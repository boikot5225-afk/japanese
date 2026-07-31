export type NumberSetId =
  | "basic"
  | "tens"
  | "hundreds"
  | "thousands"
  | "man"
  | "people"
  | "long"
  | "flat"
  | "general"
  | "hours"
  | "minutes";

export type NumberSessionId = NumberSetId | "mixed";

export type NumberQuestionMode =
  | "digits-to-kana"
  | "kana-to-digits"
  | "listening-to-digits"
  | "choice-reading";

export interface NumberTrainingSet {
  id: NumberSetId;
  section: "numbers" | "counters";
  title: string;
  shortTitle: string;
  description: string;
  example: string;
  suffix?: string;
}

export interface NumberQuestion {
  id: string;
  semanticKey: string;
  sourceSetId: NumberSetId;
  mode: NumberQuestionMode;
  value: number;
  prompt: string;
  displayText?: string;
  speechText?: string;
  keyboard: "numeric" | "default";
  correctAnswers: string[];
  choices?: string[];
  explanation: string;
  remediation?: boolean;
}

export interface NumberSkillProgress {
  mastery: number;
  attempts: number;
  correct: number;
  lapses: number;
  streak: number;
  bestStreak: number;
  lastPracticedAt: string;
}

export type NumberProgressMap = Record<string, NumberSkillProgress>;

export interface NumberAnswerResult {
  correct: boolean;
  correctAnswer: string;
  feedback: string;
}

const digitReadings: Record<number, string> = {
  0: "れい",
  1: "いち",
  2: "に",
  3: "さん",
  4: "よん",
  5: "ご",
  6: "ろく",
  7: "なな",
  8: "はち",
  9: "きゅう",
};

export const numberTrainingSets: readonly NumberTrainingSet[] = [
  {
    id: "basic",
    section: "numbers",
    title: "Числа от 0 до 20",
    shortTitle: "0–20",
    description: "Базовые чтения, じゅう и первые составные числа.",
    example: "4 よん · 10 じゅう · 17 じゅうなな",
  },
  {
    id: "tens",
    section: "numbers",
    title: "Десятки до 99",
    shortTitle: "21–99",
    description: "Составляй десятки без кальки с русского порядка слов.",
    example: "47 よんじゅうなな",
  },
  {
    id: "hundreds",
    section: "numbers",
    title: "Сотни",
    shortTitle: "100–999",
    description: "Особые чтения 300, 600 и 800.",
    example: "300 さんびゃく · 800 はっぴゃく",
  },
  {
    id: "thousands",
    section: "numbers",
    title: "Тысячи",
    shortTitle: "1 000–9 999",
    description: "Особые чтения 3 000 и 8 000, затем составные числа.",
    example: "8 000 はっせん",
  },
  {
    id: "man",
    section: "numbers",
    title: "Разряд 万",
    shortTitle: "10 000+",
    description: "Японская группировка по десять тысяч, а не по тысяче.",
    example: "23 456 にまんさんぜんよんひゃくごじゅうろく",
  },
  {
    id: "people",
    section: "counters",
    title: "Люди — 人",
    shortTitle: "人",
    description: "ひとり, ふたり и обычное чтение с にん.",
    example: "1人 ひとり · 4人 よにん",
    suffix: "人",
  },
  {
    id: "long",
    section: "counters",
    title: "Длинные предметы — 本",
    shortTitle: "本",
    description: "Бутылки, зонты, карандаши и изменения ほん／ぼん／ぽん.",
    example: "1本 いっぽん · 3本 さんぼん",
    suffix: "本",
  },
  {
    id: "flat",
    section: "counters",
    title: "Плоские предметы — 枚",
    shortTitle: "枚",
    description: "Бумага, билеты, одежда и другие плоские предметы.",
    example: "4枚 よんまい",
    suffix: "枚",
  },
  {
    id: "general",
    section: "counters",
    title: "Небольшие предметы — 個",
    shortTitle: "個",
    description: "Универсальный счётчик с изменениями こ／っこ.",
    example: "6個 ろっこ · 8個 はっこ",
    suffix: "個",
  },
  {
    id: "hours",
    section: "counters",
    title: "Часы — 時",
    shortTitle: "時",
    description: "Время на часах: よじ, しちじ и くじ.",
    example: "4時 よじ · 9時 くじ",
    suffix: "時",
  },
  {
    id: "minutes",
    section: "counters",
    title: "Минуты — 分",
    shortTitle: "分",
    description: "Чередование ふん／ぷん и удвоение согласного.",
    example: "1分 いっぷん · 6分 ろっぷん",
    suffix: "分",
  },
];

const setById = new Map(numberTrainingSets.map((set) => [set.id, set]));

const underTenThousandToKana = (value: number): string => {
  if (value === 0) return "";
  const thousands = Math.floor(value / 1000);
  const hundreds = Math.floor((value % 1000) / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;
  const parts: string[] = [];

  if (thousands > 0) {
    if (thousands === 1) parts.push("せん");
    else if (thousands === 3) parts.push("さんぜん");
    else if (thousands === 8) parts.push("はっせん");
    else parts.push(`${digitReadings[thousands]}せん`);
  }
  if (hundreds > 0) {
    if (hundreds === 1) parts.push("ひゃく");
    else if (hundreds === 3) parts.push("さんびゃく");
    else if (hundreds === 6) parts.push("ろっぴゃく");
    else if (hundreds === 8) parts.push("はっぴゃく");
    else parts.push(`${digitReadings[hundreds]}ひゃく`);
  }
  if (tens > 0) parts.push(tens === 1 ? "じゅう" : `${digitReadings[tens]}じゅう`);
  if (ones > 0) parts.push(digitReadings[ones]);
  return parts.join("");
};

export function numberToKana(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 99_999_999) {
    throw new Error(`Unsupported Japanese number: ${value}`);
  }
  if (value === 0) return "れい";
  const man = Math.floor(value / 10_000);
  const remainder = value % 10_000;
  const manPart = man > 0 ? `${underTenThousandToKana(man)}まん` : "";
  return `${manPart}${underTenThousandToKana(remainder)}`;
}

const decadePrefix = (value: number): string => {
  if (value < 10) return "";
  const last = value % 10;
  return last === 0 ? "" : numberToKana(value - last);
};

const counterEnding = (
  value: number,
  forms: Record<number, string>,
  tenEnding: string,
): string => {
  const last = value % 10;
  if (last === 0) return numberToKana(value).replace(/じゅう$/u, tenEnding);
  return `${decadePrefix(value)}${forms[last]}`;
};

export function counterToKana(setId: NumberSetId, value: number): string {
  if (!Number.isInteger(value) || value < 1 || value > 59) {
    throw new Error(`Unsupported counter value: ${value}`);
  }

  if (setId === "people") {
    if (value === 1) return "ひとり";
    if (value === 2) return "ふたり";
    const forms: Record<number, string> = {
      1: "いちにん",
      2: "ににん",
      3: "さんにん",
      4: "よにん",
      5: "ごにん",
      6: "ろくにん",
      7: "ななにん",
      8: "はちにん",
      9: "きゅうにん",
    };
    const last = value % 10;
    return last === 0 ? `${numberToKana(value)}にん` : `${decadePrefix(value)}${forms[last]}`;
  }

  if (setId === "long") {
    return counterEnding(value, {
      1: "いっぽん", 2: "にほん", 3: "さんぼん", 4: "よんほん", 5: "ごほん",
      6: "ろっぽん", 7: "ななほん", 8: "はっぽん", 9: "きゅうほん",
    }, "じゅっぽん");
  }

  if (setId === "general") {
    return counterEnding(value, {
      1: "いっこ", 2: "にこ", 3: "さんこ", 4: "よんこ", 5: "ごこ",
      6: "ろっこ", 7: "ななこ", 8: "はっこ", 9: "きゅうこ",
    }, "じゅっこ");
  }

  if (setId === "minutes") {
    return counterEnding(value, {
      1: "いっぷん", 2: "にふん", 3: "さんぷん", 4: "よんぷん", 5: "ごふん",
      6: "ろっぷん", 7: "ななふん", 8: "はっぷん", 9: "きゅうふん",
    }, "じゅっぷん");
  }

  if (setId === "hours") {
    const last = value % 10;
    if (last === 0) return `${numberToKana(value)}じ`;
    const forms: Record<number, string> = {
      1: "いちじ", 2: "にじ", 3: "さんじ", 4: "よじ", 5: "ごじ",
      6: "ろくじ", 7: "しちじ", 8: "はちじ", 9: "くじ",
    };
    return `${decadePrefix(value)}${forms[last]}`;
  }

  if (setId === "flat") return `${numberToKana(value)}まい`;
  throw new Error(`${setId} is not a counter set`);
}

const isCounterSet = (setId: NumberSetId): boolean =>
  setById.get(setId)?.section === "counters";

const readingFor = (setId: NumberSetId, value: number): string =>
  isCounterSet(setId) ? counterToKana(setId, value) : numberToKana(value);

const acceptableReadings = (setId: NumberSetId, value: number): string[] => {
  if (!isCounterSet(setId)) return value === 0 ? ["れい", "ぜろ"] : [numberToKana(value)];
  const canonical = counterToKana(setId, value);
  const variants = [canonical];
  if (["long", "general", "minutes"].includes(setId) && value % 10 === 0) {
    variants.push(canonical.replace(/じゅっ/u, "じっ"));
  }
  if (setId === "people" && value % 10 === 7) {
    variants.push(canonical.replace(/ななにん$/u, "しちにん"));
  }
  return [...new Set(variants)];
};

const normalizeKana = (value: string): string =>
  value
    .trim()
    .toLocaleLowerCase("ja-JP")
    .replace(/[\s　。、，！？!?.,:;・ー\-]/gu, "")
    .replace(/[ァ-ヶ]/gu, (character) =>
      String.fromCharCode(character.charCodeAt(0) - 0x60),
    );

const normalizeDigits = (value: string): string =>
  value
    .trim()
    .replace(/[０-９]/gu, (character) =>
      String.fromCharCode(character.charCodeAt(0) - 0xfee0),
    )
    .replace(/[\s　,，._]/gu, "");

const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0 || 0x9e3779b9;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
};

const shuffle = <T>(values: readonly T[], seed: number): T[] => {
  const result = [...values];
  const random = seededRandom(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other] as T, result[index] as T];
  }
  return result;
};

const fixedValues: Record<NumberSetId, number[]> = {
  basic: Array.from({ length: 21 }, (_, index) => index),
  tens: [21, 24, 27, 30, 35, 40, 47, 50, 58, 64, 70, 77, 86, 90, 99, 32, 68, 73],
  hundreds: [100, 105, 219, 300, 340, 468, 600, 606, 777, 800, 888, 999, 430, 684, 803],
  thousands: [1000, 1001, 2024, 3000, 3480, 4305, 6006, 6800, 8000, 8199, 8888, 9999, 7504, 3050],
  man: [10000, 12000, 14007, 23456, 30000, 48000, 60001, 70800, 76032, 80808, 88888, 99999, 50120, 42006],
  people: Array.from({ length: 20 }, (_, index) => index + 1),
  long: Array.from({ length: 20 }, (_, index) => index + 1),
  flat: Array.from({ length: 20 }, (_, index) => index + 1),
  general: Array.from({ length: 20 }, (_, index) => index + 1),
  hours: Array.from({ length: 24 }, (_, index) => index + 1),
  minutes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 16, 18, 20, 21, 24, 30, 35, 40, 45, 50, 59],
};

export const numberSkillKey = (
  setId: NumberSetId,
  mode: NumberQuestionMode,
): string => `${setId}:${mode}`;

const modes: readonly NumberQuestionMode[] = [
  "digits-to-kana",
  "kana-to-digits",
  "listening-to-digits",
  "choice-reading",
];

const modeMastery = (
  progress: NumberProgressMap,
  setId: NumberSetId,
  mode: NumberQuestionMode,
): number => progress[numberSkillKey(setId, mode)]?.mastery ?? 0;

const orderedModes = (
  progress: NumberProgressMap,
  setId: NumberSetId,
  seed: number,
): NumberQuestionMode[] =>
  shuffle(modes, seed).sort(
    (left, right) => modeMastery(progress, setId, left) - modeMastery(progress, setId, right),
  );

const nearbyChoices = (setId: NumberSetId, value: number, seed: number): string[] => {
  const distractors = shuffle(
    fixedValues[setId].filter((candidate) => candidate !== value),
    seed,
  )
    .slice(0, 3)
    .map((candidate) => readingFor(setId, candidate));
  return shuffle([readingFor(setId, value), ...distractors], seed + 91);
};

const quantityLabel = (setId: NumberSetId, value: number): string =>
  `${value}${setById.get(setId)?.suffix ?? ""}`;

export function createNumberQuestion(
  setId: NumberSetId,
  value: number,
  mode: NumberQuestionMode,
  seed = 1,
): NumberQuestion {
  const set = setById.get(setId);
  if (!set) throw new Error(`Unknown number set: ${setId}`);
  const reading = readingFor(setId, value);
  const label = quantityLabel(setId, value);
  const semanticKey = `${setId}:value:${value}`;
  const common = {
    id: `${semanticKey}:${mode}`,
    semanticKey,
    sourceSetId: setId,
    mode,
    value,
    speechText: reading,
    explanation: `${label} — ${reading}. ${
      set.section === "counters"
        ? "Следи за изменением звука у счётного слова."
        : setId === "hundreds" || setId === "thousands"
          ? "Проверь особые чтения сотен и тысяч."
          : setId === "man"
            ? "Сначала выдели разряд まん — десять тысяч."
            : "Собирай число слева направо по разрядам."
    }`,
  } as const;

  if (mode === "digits-to-kana") {
    return {
      ...common,
      prompt: set.section === "counters"
        ? `Напиши чтение количества ${label}.`
        : `Напиши число ${value.toLocaleString("ru-RU")} хираганой.`,
      displayText: label,
      keyboard: "default",
      correctAnswers: acceptableReadings(setId, value),
    };
  }
  if (mode === "kana-to-digits") {
    return {
      ...common,
      prompt: set.section === "counters"
        ? `Сколько предметов или единиц обозначает ${reading}? Введи только число.`
        : `Какое число записано: ${reading}?`,
      displayText: reading,
      keyboard: "numeric",
      correctAnswers: [String(value)],
    };
  }
  if (mode === "listening-to-digits") {
    return {
      ...common,
      prompt: set.section === "counters"
        ? "Прослушай количество и введи только число."
        : "Прослушай число и введи его цифрами.",
      keyboard: "numeric",
      correctAnswers: [String(value)],
    };
  }
  return {
    ...common,
    prompt: set.section === "counters"
      ? `Выбери правильное чтение ${label}.`
      : `Выбери правильное чтение числа ${value.toLocaleString("ru-RU")}.`,
    displayText: label,
    keyboard: "default",
    correctAnswers: acceptableReadings(setId, value),
    choices: nearbyChoices(setId, value, seed),
  };
}

export function buildNumberSession(
  sessionId: NumberSessionId,
  progress: NumberProgressMap,
  seed = Date.now(),
): NumberQuestion[] {
  const count = sessionId === "mixed" ? 15 : 12;
  if (sessionId !== "mixed") {
    const values = shuffle(fixedValues[sessionId], seed).slice(0, count);
    const modeOrder = orderedModes(progress, sessionId, seed + 13);
    return values.map((value, index) =>
      createNumberQuestion(
        sessionId,
        value,
        modeOrder[index % modeOrder.length] as NumberQuestionMode,
        seed + index * 29,
      ),
    );
  }

  const selectedSets = shuffle(numberTrainingSets.map((set) => set.id), seed);
  const questions: NumberQuestion[] = [];
  let round = 0;
  while (questions.length < count) {
    const setId = selectedSets[round % selectedSets.length] as NumberSetId;
    const usedValues = new Set(
      questions
        .filter((question) => question.sourceSetId === setId)
        .map((question) => question.value),
    );
    const value = shuffle(fixedValues[setId], seed + round * 17)
      .find((candidate) => !usedValues.has(candidate));
    if (value === undefined) break;
    const modeOrder = orderedModes(progress, setId, seed + round * 31);
    questions.push(
      createNumberQuestion(
        setId,
        value,
        modeOrder[round % modeOrder.length] as NumberQuestionMode,
        seed + round * 43,
      ),
    );
    round += 1;
  }
  return questions;
}

export function buildNumberRemediation(
  failedQuestion: NumberQuestion,
  usedSemanticKeys: readonly string[],
  seed = Date.now(),
): NumberQuestion | null {
  const used = new Set(usedSemanticKeys);
  const value = shuffle(fixedValues[failedQuestion.sourceSetId], seed).find(
    (candidate) =>
      candidate !== failedQuestion.value &&
      !used.has(`${failedQuestion.sourceSetId}:value:${candidate}`),
  );
  if (value === undefined) return null;
  return {
    ...createNumberQuestion(
      failedQuestion.sourceSetId,
      value,
      failedQuestion.mode,
      seed + 101,
    ),
    remediation: true,
  };
}

export function checkNumberAnswer(
  question: NumberQuestion,
  answer: string,
): NumberAnswerResult {
  const expectsDigits =
    question.mode === "kana-to-digits" || question.mode === "listening-to-digits";
  const normalize = expectsDigits ? normalizeDigits : normalizeKana;
  const normalizedAnswer = normalize(answer);
  const correct = question.correctAnswers.map(normalize).includes(normalizedAnswer);
  if (correct) {
    return {
      correct: true,
      correctAnswer: question.correctAnswers[0] ?? "",
      feedback: "Верно.",
    };
  }

  let feedback = "Получилось другое значение.";
  if (expectsDigits) {
    if (!/^\d+$/u.test(normalizedAnswer)) feedback = "Здесь нужны только арабские цифры.";
    else if (normalizedAnswer.length !== String(question.value).length) {
      feedback = "Проверь разрядность: возможно, потерян или добавлен ноль.";
    } else feedback = "Проверь порядок разрядов числа.";
  } else if (isCounterSet(question.sourceSetId)) {
    feedback = "Основа числа узнаваема, но проверь изменение звука у счётного слова.";
  } else if (["hundreds", "thousands"].includes(question.sourceSetId)) {
    feedback = "Проверь особые чтения 300/600/800 или 3 000/8 000.";
  } else if (question.sourceSetId === "man") {
    feedback = "Раздели число на блок まん и остаток меньше 10 000.";
  }
  return {
    correct: false,
    correctAnswer: question.correctAnswers[0] ?? "",
    feedback,
  };
}

export function updateNumberProgress(
  progress: NumberProgressMap,
  question: NumberQuestion,
  correct: boolean,
  now = new Date(),
): NumberProgressMap {
  const key = numberSkillKey(question.sourceSetId, question.mode);
  const previous = progress[key] ?? {
    mastery: 0,
    attempts: 0,
    correct: 0,
    lapses: 0,
    streak: 0,
    bestStreak: 0,
    lastPracticedAt: new Date(0).toISOString(),
  };
  const streak = correct ? previous.streak + 1 : 0;
  return {
    ...progress,
    [key]: {
      mastery: correct ? Math.min(5, previous.mastery + 1) : Math.max(0, previous.mastery - 2),
      attempts: previous.attempts + 1,
      correct: previous.correct + (correct ? 1 : 0),
      lapses: previous.lapses + (correct ? 0 : 1),
      streak,
      bestStreak: Math.max(previous.bestStreak, streak),
      lastPracticedAt: now.toISOString(),
    },
  };
}

export function getNumberSetMastery(
  progress: NumberProgressMap,
  setId: NumberSetId,
): number {
  const scores = modes.map((mode) => progress[numberSkillKey(setId, mode)]?.mastery ?? 0);
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function getNumberTrainerSummary(progress: NumberProgressMap): {
  startedSets: number;
  masteredSets: number;
  totalAttempts: number;
} {
  const startedSets = numberTrainingSets.filter((set) =>
    modes.some((mode) => (progress[numberSkillKey(set.id, mode)]?.attempts ?? 0) > 0),
  ).length;
  const masteredSets = numberTrainingSets.filter(
    (set) => getNumberSetMastery(progress, set.id) >= 4,
  ).length;
  const totalAttempts = Object.values(progress).reduce(
    (sum, item) => sum + item.attempts,
    0,
  );
  return { startedSets, masteredSets, totalAttempts };
}
