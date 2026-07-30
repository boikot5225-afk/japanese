import type { AnswerStatus } from "./checkAnswer";

export interface ExerciseAttempt {
  exerciseId: string;
  status: AnswerStatus;
}

export interface LessonResult {
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
}

const successfulStatuses: AnswerStatus[] = ["correct", "acceptable"];

export function calculateLessonResult(attempts: ExerciseAttempt[]): LessonResult {
  const total = attempts.length;
  const correct = attempts.filter((attempt) =>
    successfulStatuses.includes(attempt.status),
  ).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);

  return {
    correct,
    total,
    percent,
    passed: total > 0 && percent >= 70,
  };
}
