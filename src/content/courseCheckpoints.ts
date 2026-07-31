export interface CourseCheckpoint {
  id: string;
  unitId: string;
  title: string;
  description: string;
  lessonIds: string[];
  unlockLessonId?: string;
  questionCount: number;
  passPercent: number;
}

export const courseCheckpoints: readonly CourseCheckpoint[] = [
  {
    id: "checkpoint-unit-001",
    unitId: "unit-001",
    title: "Контрольная точка: первые предложения",
    description:
      "Проверка тем уроков 1–3: は, です, указательные слова, принадлежность, вопросы и も.",
    lessonIds: ["lesson-001", "lesson-002", "lesson-003"],
    unlockLessonId: "lesson-004",
    questionCount: 12,
    passPercent: 80,
  },
  {
    id: "checkpoint-unit-002",
    unitId: "unit-002",
    title: "Контрольная точка: место и действие",
    description:
      "Смешанная проверка уроков 4–6: существование, действия, направление и место действия.",
    lessonIds: ["lesson-004", "lesson-005", "lesson-006"],
    unlockLessonId: "lesson-007",
    questionCount: 15,
    passPercent: 80,
  },
  {
    id: "checkpoint-unit-003",
    unitId: "unit-003",
    title: "Итоговая проверка блока N5",
    description:
      "Проверка уроков 7–10: время, распорядок, отрицательные и прошедшие формы です／ます.",
    lessonIds: ["lesson-007", "lesson-008", "lesson-009", "lesson-010"],
    questionCount: 18,
    passPercent: 80,
  },
];

export const findCheckpoint = (checkpointId: string): CourseCheckpoint | undefined =>
  courseCheckpoints.find((checkpoint) => checkpoint.id === checkpointId);

export const findCheckpointForUnit = (unitId: string): CourseCheckpoint | undefined =>
  courseCheckpoints.find((checkpoint) => checkpoint.unitId === unitId);

export const findCheckpointBlockingLesson = (
  lessonId: string,
): CourseCheckpoint | undefined =>
  courseCheckpoints.find((checkpoint) => checkpoint.unlockLessonId === lessonId);
