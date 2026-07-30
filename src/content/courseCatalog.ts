import {
  lesson001,
  lesson001Exercises,
  lesson001Grammar,
  lesson001Sentences,
  lesson001Vocabulary,
} from "./lesson001";
import { lesson002, lesson002Bundle } from "./lesson002";
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

export const lessonBundles = [lesson001Bundle, lesson002Bundle] as const;

export function findLessonBundle(lessonId: string): LessonBundle | undefined {
  return lessonBundles.find((bundle) => bundle.lesson.id === lessonId);
}

export const courseUnits: CourseUnit[] = [
  {
    id: "unit-001",
    title: "Первые предложения",
    description: "Основа японской фразы: тема, связка, указательные слова и связь существительных.",
    jlptLevel: "N5",
    lessons: [lesson001, lesson002],
  },
];
