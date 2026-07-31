import { lessonBundles } from "../content/courseCatalog";

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

const courseReadingAliases: ReadingAlias[] = Array.from(
  new Map(
    lessonBundles
      .flatMap((bundle) => bundle.vocabulary)
      .filter((item) => item.writtenForm !== item.reading)
      .map((item) => [item.writtenForm, item.reading] as const),
  ).entries(),
)
  .map(([writtenForm, reading]) => ({ writtenForm, reading }))
  .sort((left, right) => right.writtenForm.length - left.writtenForm.length);

const replaceTaughtKanjiWithReadings = (value: string): string =>
  courseReadingAliases.reduce(
    (normalized, alias) => normalized.split(alias.writtenForm).join(alias.reading),
    value,
  );

const normalizeJapanese = (value: string): string =>
  replaceTaughtKanjiWithReadings(
    value
      .trim()
      .normalize("NFKC")
      .replace(/[。！？!?.,，]/g, "")
      .replace(/[|\s]+/g, ""),
  );

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
