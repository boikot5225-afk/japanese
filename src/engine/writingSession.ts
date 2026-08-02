export type WritingMode = "teach" | "guided" | "recall" | "freeform";
export type WritingGrade = 1 | 2 | 3 | 4;

export interface WritingSessionMetrics {
  mode: WritingMode;
  strokeCount: number;
  mistakes: number;
  attempts: number;
  hints: number;
  revealAll: boolean;
  completed: boolean;
}

export interface WritingGradeDefinition {
  grade: WritingGrade;
  label: string;
  shortLabel: string;
  description: string;
  passing: boolean;
}

export const WRITING_GRADE_DEFINITIONS: readonly WritingGradeDefinition[] = [
  {
    grade: 1,
    label: "Забыл",
    shortLabel: "Снова",
    description: "Не вспомнил знак или пришлось открыть ответ.",
    passing: false,
  },
  {
    grade: 2,
    label: "Трудно",
    shortLabel: "Трудно",
    description: "Знак вспомнился, но были серьёзные ошибки.",
    passing: false,
  },
  {
    grade: 3,
    label: "Знаю",
    shortLabel: "Знаю",
    description: "Написал правильно с допустимыми исправлениями.",
    passing: true,
  },
  {
    grade: 4,
    label: "Легко",
    shortLabel: "Легко",
    description: "Написал уверенно и без подсказок.",
    passing: true,
  },
] as const;

export const isPassingWritingGrade = (grade: WritingGrade): boolean => grade >= 3;

const DEFAULT_WRITING_GRADE: WritingGradeDefinition = {
  grade: 3,
  label: "Знаю",
  shortLabel: "Знаю",
  description: "Написал правильно с допустимыми исправлениями.",
  passing: true,
};

export const getWritingGradeDefinition = (
  grade: WritingGrade,
): WritingGradeDefinition =>
  WRITING_GRADE_DEFINITIONS.find((item) => item.grade === grade) ??
  DEFAULT_WRITING_GRADE;

const failedEnoughForForgotten = (
  strokeCount: number,
  mistakes: number,
): boolean => {
  if (strokeCount > 11) return mistakes > 3;
  if (strokeCount > 6) return mistakes > 3;
  if (strokeCount > 2) return mistakes > 2;
  return mistakes > 1;
};

/**
 * Mirrors the observable Skritter grading behaviour without copying its code:
 * revealing the whole answer is always a lapse, repeated stroke failures are a
 * lapse based on character complexity, and ordinary corrections default to hard.
 * Grade 4 remains a deliberate self-assessment rather than an automatic reward.
 */
export const getMaximumWritingGrade = (
  metrics: WritingSessionMetrics,
): WritingGrade => {
  if (!metrics.completed || metrics.revealAll || metrics.hints >= 2) return 1;
  if (failedEnoughForForgotten(metrics.strokeCount, metrics.mistakes)) return 1;
  if (
    metrics.mode === "teach" ||
    metrics.hints > 0 ||
    metrics.mistakes > 0
  ) {
    return 2;
  }
  if (metrics.mode === "guided") return 3;
  return 4;
};

export const deriveAutomaticWritingGrade = (
  metrics: WritingSessionMetrics,
): WritingGrade => {
  const maximum = getMaximumWritingGrade(metrics);
  return maximum <= 2 ? maximum : 3;
};

export const getInitialWritingMode = (
  attempts: number,
  mastery: number,
): WritingMode => {
  if (attempts === 0) return "teach";
  if (attempts < 3 || mastery < 45) return "guided";
  return "recall";
};

export const nextLearningWritingMode = (
  mode: WritingMode,
): WritingMode | null => {
  switch (mode) {
    case "teach":
      return "guided";
    case "guided":
      return "recall";
    case "recall":
    case "freeform":
      return null;
  }
};

export const writingModeLabel = (mode: WritingMode): string => {
  switch (mode) {
    case "teach":
      return "Обучение";
    case "guided":
      return "С контуром";
    case "recall":
      return "По памяти";
    case "freeform":
      return "Свободно";
  }
};
