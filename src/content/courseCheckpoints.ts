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
    title: "Контрольная точка: время и формы",
    description:
      "Проверка уроков 7–10: время, распорядок, отрицательные и прошедшие формы です／ます.",
    lessonIds: ["lesson-007", "lesson-008", "lesson-009", "lesson-010"],
    unlockLessonId: "lesson-011",
    questionCount: 18,
    passPercent: 80,
  },
  {
    id: "checkpoint-unit-004",
    unitId: "unit-004",
    title: "Контрольная точка: описание предметов и мест",
    description:
      "Проверка уроков 11–13: い- и な-прилагательные, отрицание, прошедшее время и формы いい／よい.",
    lessonIds: ["lesson-011", "lesson-012", "lesson-013"],
    unlockLessonId: "lesson-014",
    questionCount: 15,
    passPercent: 80,
  },
  {
    id: "checkpoint-unit-005",
    unitId: "unit-005",
    title: "Контрольная точка: состояния и сравнение",
    description:
      "Проверка уроков 14–16: состояния, предпочтения и способности с が, сравнение через より／ほうが и выбор через 一番.",
    lessonIds: ["lesson-014", "lesson-015", "lesson-016"],
    unlockLessonId: "lesson-017",
    questionCount: 15,
    passPercent: 80,
  },
  {
    id: "checkpoint-unit-006",
    unitId: "unit-006",
    title: "Контрольная точка: て-форма в действии",
    description:
      "Проверка уроков 17–20: образование て-формы, просьбы, разрешения, запреты, порядок действий и значения ～ています.",
    lessonIds: ["lesson-017", "lesson-018", "lesson-019", "lesson-020"],
    unlockLessonId: "lesson-021",
    questionCount: 18,
    passPercent: 80,
  },
  {
    id: "checkpoint-unit-007",
    unitId: "unit-007",
    title: "Контрольная точка: простые формы и возможности",
    description:
      "Проверка уроков 21–24: словарная форма, отрицание ～ない, желание ～たい и способность через ～ことができます.",
    lessonIds: ["lesson-021", "lesson-022", "lesson-023", "lesson-024"],
    unlockLessonId: "lesson-025",
    questionCount: 18,
    passPercent: 80,
  },
  {
    id: "checkpoint-unit-008",
    unitId: "unit-008",
    title: "Контрольная точка: прошлое, порядок и причины",
    description:
      "Проверка уроков 25–28: ～た, ～なかった, действия до и после, три значения から и причинные конструкции.",
    lessonIds: ["lesson-025", "lesson-026", "lesson-027", "lesson-028"],
    unlockLessonId: "lesson-029",
    questionCount: 18,
    passPercent: 80,
  },
  {
    id: "checkpoint-unit-009",
    unitId: "unit-009",
    title: "Контрольная точка: опыт, советы и необходимость",
    description:
      "Проверка уроков 29–32: ～たことがあります, ～たり～たりします, советы через ほうがいい и конструкции обязанности／отсутствия необходимости.",
    lessonIds: ["lesson-029", "lesson-030", "lesson-031", "lesson-032"],
    unlockLessonId: "lesson-033",
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
