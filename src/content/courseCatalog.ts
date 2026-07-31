import {
  lesson001,
  lesson001Exercises,
  lesson001Grammar,
  lesson001Sentences,
  lesson001Vocabulary,
} from "./lesson001";
import { lesson002Bundle } from "./lesson002";
import { lesson003Bundle } from "./lesson003";
import { lesson004Bundle } from "./lesson004";
import { lesson005Bundle } from "./lesson005";
import { lesson006Bundle } from "./lesson006";
import { lesson007Bundle } from "./lesson007";
import { lesson008Bundle } from "./lesson008";
import { lesson009Bundle } from "./lesson009";
import { lesson010Bundle } from "./lesson010";
import type { Lesson } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";
import { diversifyLessonPractice } from "./practiceDiversity";
import { expandLessonPractice } from "./practiceExpansion";

export interface CourseUnit {
  id: string;
  title: string;
  description: string;
  jlptLevel: "N5" | "N4" | "N3" | "N2" | "N1";
  lessons: Lesson[];
}

const lesson001BaseBundle: LessonBundle = {
  lesson: lesson001,
  vocabulary: lesson001Vocabulary,
  grammar: lesson001Grammar,
  sentences: lesson001Sentences,
  exercises: lesson001Exercises,
  outcomes: [
    "отмечать тему предложения частицей は",
    "завершать именное предложение связкой です",
    "представляться простым японским предложением",
  ],
};

const baseLessonBundles: readonly LessonBundle[] = [
  lesson001BaseBundle,
  lesson002Bundle,
  lesson003Bundle,
  lesson004Bundle,
  lesson005Bundle,
  lesson006Bundle,
  lesson007Bundle,
  lesson008Bundle,
  lesson009Bundle,
  lesson010Bundle,
];

const expandedLessonBundles: readonly LessonBundle[] = baseLessonBundles.map((bundle) =>
  expandLessonPractice(bundle, baseLessonBundles),
);

export const lessonBundles: readonly LessonBundle[] = expandedLessonBundles.map((bundle) =>
  diversifyLessonPractice(bundle, expandedLessonBundles),
);

export const lesson001Bundle = lessonBundles[0] ?? lesson001BaseBundle;

export function findLessonBundle(lessonId: string): LessonBundle | undefined {
  return lessonBundles.find((bundle) => bundle.lesson.id === lessonId);
}

const requireLesson = (lessonId: string): Lesson => {
  const lesson = findLessonBundle(lessonId)?.lesson;
  if (!lesson) throw new Error(`В каталоге отсутствует ${lessonId}`);
  return lesson;
};

export const courseUnits: CourseUnit[] = [
  {
    id: "unit-001",
    title: "Первые предложения",
    description:
      "Тема, связка, указательные слова, принадлежность, вопросы и значение «тоже».",
    jlptLevel: "N5",
    lessons: [
      requireLesson("lesson-001"),
      requireLesson("lesson-002"),
      requireLesson("lesson-003"),
    ],
  },
  {
    id: "unit-002",
    title: "Место и действие",
    description:
      "Где кто-то находится, что человек делает, куда идёт и где происходит действие.",
    jlptLevel: "N5",
    lessons: [
      requireLesson("lesson-004"),
      requireLesson("lesson-005"),
      requireLesson("lesson-006"),
    ],
  },
  {
    id: "unit-003",
    title: "Время и формы",
    description:
      "Как назвать время, рассказать о распорядке и поставить です／ます в отрицание и прошедшее.",
    jlptLevel: "N5",
    lessons: [
      requireLesson("lesson-007"),
      requireLesson("lesson-008"),
      requireLesson("lesson-009"),
      requireLesson("lesson-010"),
    ],
  },
];
