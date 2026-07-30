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

const normalizeJapanese = (value: string): string =>
  value
    .trim()
    .normalize("NFKC")
    .replace(/[。！？!?.,，]/g, "")
    .replace(/[|\s]+/g, "");

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
