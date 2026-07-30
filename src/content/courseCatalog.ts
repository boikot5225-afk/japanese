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
];
