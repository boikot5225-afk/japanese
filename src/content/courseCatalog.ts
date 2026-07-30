import { lesson001 } from "./lesson001";
import type { Lesson } from "../domain/course";

export interface CourseUnit {
  id: string;
  title: string;
  description: string;
  jlptLevel: "N5" | "N4" | "N3" | "N2" | "N1";
  lessons: Lesson[];
}

export const courseUnits: CourseUnit[] = [
  {
    id: "unit-001",
    title: "Первые предложения",
    description: "Основа японской фразы: тема, связка и простое представление себя.",
    jlptLevel: "N5",
    lessons: [lesson001],
  },
];
