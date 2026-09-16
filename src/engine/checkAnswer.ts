import { lessonBundles } from "../content/courseCatalog";
import { replaceJapaneseNumeralsWithArabic } from "./japaneseNumerals.ts";

export type AnswerStatus =
  | "correct"
  | "acceptable"
  | "target-mismatch"
  | "incorrect";

export interface AnswerCheckResult {
  status: AnswerStatus;
  normalizedAnswer: string;
  message: string;
}

interface ReadingAlias {
  writtenForm: string;
  reading: string;
}

const isIAdjective = (partOfSpeech: readonly string[]): boolean =>
  partOfSpeech.some((label) => label.includes("い-прилагательное"));

const createReadingAliases = (
  writtenForm: string,
  reading: string,
  partOfSpeech: readonly string[],
): ReadingAlias[] => {
  const aliases: ReadingAlias[] = [{ writtenForm, reading }];

  if (writtenForm.endsWith("ます") && reading.endsWith("ます")) {
    const writtenStem = writtenForm.slice(0, -2);
    const readingStem = reading.slice(0, -2);
    if (writtenStem && readingStem && writtenStem !== readingStem) {
      aliases.push({ writtenForm: writtenStem, reading: readingStem });
    }
  }

  if (
    isIAdjective(partOfSpeech) &&
    writtenForm.endsWith("い") &&
    reading.endsWith("い")
  ) {
    const writtenStem = writtenForm.slice(0, -1);
    const readingStem = reading.slice(0, -1);
    if (writtenStem && readingStem && writtenStem !== readingStem) {
      aliases.push(
        {
          writtenForm: `${writtenStem}くありませんでした`,
          reading: `${readingStem}くありませんでした`,
        },
        {
          writtenForm: `${writtenStem}くなかった`,
          reading: `${readingStem}くなかった`,
        },
        {
          writtenForm: `${writtenStem}くありません`,
          reading: `${readingStem}くありません`,
        },
        {
          writtenForm: `${writtenStem}かった`,
          reading: `${readingStem}かった`,
        },
        {
          writtenForm: `${writtenStem}くない`,
          reading: `${readingStem}くない`,
        },
      );
    }
  }

  return aliases;
};

const irregularGoodAliases: readonly ReadingAlias[] = [
  { writtenForm: "良くありませんでした", reading: "よくありませんでした" },
  { writtenForm: "良くなかった", reading: "よくなかった" },
  { writtenForm: "良くありません", reading: "よくありません" },
  { writtenForm: "良かった", reading: "よかった" },
  { writtenForm: "良くない", reading: "よくない" },
  { writtenForm: "良い", reading: "いい" },
];

const courseReadingAliases: ReadingAlias[] = Array.from(
  new Map(
    [
      ...irregularGoodAliases,
      ...lessonBundles
        .flatMap((bundle) => bundle.vocabulary)
        .filter((item) => item.writtenForm !== item.reading)
        .flatMap((item) =>
          createReadingAliases(
            item.writtenForm,
            item.reading,
            item.partOfSpeech,
          ),
        ),
    ].map((alias) => [alias.writtenForm, alias.reading] as const),
  ).entries(),
)
  .map(([writtenForm, reading]) => ({ writtenForm, reading }))
  .sort((left, right) => right.writtenForm.length - left.writtenForm.length);

const replaceTaughtKanjiWithReadings = (value: string): string =>
  courseReadingAliases.reduce(
    (normalized, alias) => normalized.split(alias.writtenForm).join(alias.reading),
    value,
  );

const normalizeEquivalentPoliteForms = (value: string): string =>
  value
    .replace(/くありませんでした/gu, "くなかったです")
    .replace(/くありません/gu, "くないです")
    .replace(/じゃありませんでした/gu, "ではありませんでした")
    .replace(/じゃなかったです/gu, "ではありませんでした")
    .replace(/ではなかったです/gu, "ではありませんでした")
    .replace(/じゃありません/gu, "ではありません")
    .replace(/じゃないです/gu, "ではありません")
    .replace(/ではないです/gu, "ではありません");

const normalizeJapanese = (value: string): string => {
  const compact = value
    .trim()
    .normalize("NFKC")
    .replace(/[。、！？!?.,，]/g, "")
    .replace(/[|\s]+/g, "");
  const numericCanonical = replaceJapaneseNumeralsWithArabic(compact);
  const politeCanonical = normalizeEquivalentPoliteForms(numericCanonical);
  return replaceTaughtKanjiWithReadings(politeCanonical);
};

export function checkAnswer(
  answer: string,
  correctAnswers: string[],
  acceptableAnswers: string[] = [],
): AnswerCheckResult {
  const normalizedAnswer = normalizeJapanese(answer);
  const normalizedCorrect = correctAnswers.map(normalizeJapanese);
  const normalizedAcceptable = acceptableAnswers.map(normalizeJapanese);

  if (normalizedCorrect.includes(normalizedAnswer)) {
    return {
      status: "correct",
      normalizedAnswer,
      message: "Верно.",
    };
  }

  if (normalizedAcceptable.includes(normalizedAnswer)) {
    return {
      status: "acceptable",
      normalizedAnswer,
      message: "Ответ допустим. Основной вариант записан иначе.",
    };
  }

  return {
    status: "incorrect",
    normalizedAnswer,
    message: "Ответ не совпадает с ожидаемой конструкцией.",
  };
}
