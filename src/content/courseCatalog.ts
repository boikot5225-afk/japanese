import {
  lesson001,
  lesson001Exercises,
  lesson001Grammar,
  lesson001Sentences,
  lesson001Vocabulary,
} from "./lesson001";
import { lesson002, lesson002Bundle } from "./lesson002";
import { lesson003, lesson003Bundle } from "./lesson003";
import { lesson004, lesson004Bundle } from "./lesson004";
import { lesson005, lesson005Bundle } from "./lesson005";
import { lesson006, lesson006Bundle } from "./lesson006";
import { lesson007, lesson007Bundle } from "./lesson007";
import { lesson008, lesson008Bundle } from "./lesson008";
import { lesson009, lesson009Bundle } from "./lesson009";
import { lesson010, lesson010Bundle } from "./lesson010";
import type { Lesson } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export interface CourseUnit {
  id: string;
  title: string;
  description: string;
  jlptLevel: "N5" | "N4" | "N3" | "N2" | "N1";
  lessons: Lesson[];
}

export const lesson001Bundle: LessonBundle = {
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

export const lessonBundles: readonly LessonBundle[] = [
  lesson001Bundle,
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

export function findLessonBundle(lessonId: string): LessonBundle | undefined {
  return lessonBundles.find((bundle) => bundle.lesson.id === lessonId);
}

export const courseUnits: CourseUnit[] = [
  {
    id: "unit-001",
    title: "Первые предложения",
    description:
      "Тема, связка, указательные слова, принадлежность, вопросы и значение «тоже».",
    jlptLevel: "N5",
    lessons: [lesson001, lesson002, lesson003],
  },
  {
    id: "unit-002",
    title: "Место и действие",
    description:
      "Где кто-то находится, что человек делает, куда идёт и где происходит действие.",
    jlptLevel: "N5",
    lessons: [lesson004, lesson005, lesson006],
  },
  {
    id: "unit-003",
    title: "Время и формы",
    description:
      "Как назвать время, рассказать о распорядке и поставить です／ます в отрицание и прошедшее.",
    jlptLevel: "N5",
    lessons: [lesson007, lesson008, lesson009, lesson010],
  },
];
