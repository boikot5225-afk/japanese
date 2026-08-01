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
import { lesson011Bundle } from "./lesson011";
import { lesson012Bundle } from "./lesson012";
import { lesson013Bundle } from "./lesson013";
import { lesson014Bundle } from "./lesson014";
import { lesson015Bundle } from "./lesson015";
import { lesson016Bundle } from "./lesson016";
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
  lesson011Bundle,
  lesson012Bundle,
  lesson013Bundle,
  lesson014Bundle,
  lesson015Bundle,
  lesson016Bundle,
];

const expandedLessonBundles: readonly LessonBundle[] = baseLessonBundles.map((bundle) =>
  expandLessonPractice(bundle, baseLessonBundles),
);

const exerciseMinutes = (bundle: LessonBundle): number =>
  bundle.exercises.reduce((total, exercise) => {
    switch (exercise.type) {
      case "multiple-choice":
        return total + 0.45;
      case "listening":
        return total + 0.7;
      case "sentence-builder":
      case "particle-gap":
      case "conjugation":
        return total + 0.9;
      case "text-input":
        return total + 1.15;
      case "handwriting":
        return total + 1.4;
      default:
        return total + 0.8;
    }
  }, 0);

const withReviewedDuration = (bundle: LessonBundle): LessonBundle => {
  if (bundle.lesson.order <= 10) return bundle;

  const studyMinutes =
    bundle.grammar.length * 1.1 +
    bundle.vocabulary.length * 0.2 +
    bundle.sentences.length * 0.35;
  const estimatedMinutes = Math.ceil(studyMinutes + exerciseMinutes(bundle));

  return {
    ...bundle,
    lesson: {
      ...bundle.lesson,
      estimatedMinutes,
    },
  };
};

export const lessonBundles: readonly LessonBundle[] = expandedLessonBundles
  .map((bundle) => diversifyLessonPractice(bundle, expandedLessonBundles))
  .map(withReviewedDuration);

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
  {
    id: "unit-004",
    title: "Описание предметов и мест",
    description:
      "い- и な-прилагательные: описание, отрицание, прошедшее время и особая форма いい／よい.",
    jlptLevel: "N5",
    lessons: [
      requireLesson("lesson-011"),
      requireLesson("lesson-012"),
      requireLesson("lesson-013"),
    ],
  },
  {
    id: "unit-005",
    title: "Состояния, предпочтения и сравнение",
    description:
      "Прошедшие формы な-прилагательных, симпатии и навыки с が, сравнение через より／ほうが и выбор через 一番.",
    jlptLevel: "N5",
    lessons: [
      requireLesson("lesson-014"),
      requireLesson("lesson-015"),
      requireLesson("lesson-016"),
    ],
  },
];
