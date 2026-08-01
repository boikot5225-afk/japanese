import type { Exercise } from "../domain/course";

export type PracticeInteractionMode =
  | "choice"
  | "text"
  | "builder"
  | "handwriting";

export const HANDWRITING_RETRY_ANSWER = "__handwriting_needs_review__";

export function getPracticeInteractionMode(
  exercise: Exercise,
): PracticeInteractionMode {
  if (exercise.type === "multiple-choice" || exercise.type === "listening") {
    return "choice";
  }
  if (exercise.type === "sentence-builder") return "builder";
  if (exercise.type === "handwriting") return "handwriting";
  return "text";
}

export function getHandwritingAssessmentAnswer(
  exercise: Exercise,
  looksCorrect: boolean,
): string {
  const reference = exercise.correctAnswers[0]?.trim();
  if (!looksCorrect || !reference) return HANDWRITING_RETRY_ANSWER;
  return reference;
}
