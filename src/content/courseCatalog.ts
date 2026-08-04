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
import { lesson017Bundle } from "./lesson017";
import { lesson018Bundle } from "./lesson018";
import { lesson019Bundle } from "./lesson019";
import { lesson020Bundle } from "./lesson020";
import { lesson021Bundle } from "./lesson021";
import { lesson022Bundle } from "./lesson022";
import { lesson023Bundle } from "./lesson023";
import { lesson024Bundle } from "./lesson024";
import { lesson025Bundle } from "./lesson025";
import { lesson026Bundle } from "./lesson026";
import { lesson027Bundle } from "./lesson027";
import { lesson028Bundle } from "./lesson028";
import { lesson029Bundle } from "./lesson029";
import { lesson030Bundle } from "./lesson030";
import { lesson031Bundle } from "./lesson031";
import { lesson032Bundle } from "./lesson032";
import { lesson033Bundle } from "./lesson033";
import { lesson034Bundle } from "./lesson034";
import { lesson035Bundle } from "./lesson035";
import { lesson036Bundle } from "./lesson036";
import { lesson037Bundle } from "./lesson037";
import { lesson038Bundle } from "./lesson038";
import { lesson039Bundle } from "./lesson039";
import { lesson040Bundle } from "./lesson040";
import type { Lesson } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";
import { integrateKanjiCurriculumSequence } from "./kanjiCurriculum";
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
  lesson017Bundle,
  lesson018Bundle,
  lesson019Bundle,
  lesson020Bundle,
  lesson021Bundle,
  lesson022Bundle,
  lesson023Bundle,
  lesson024Bundle,
  lesson025Bundle,
  lesson026Bundle,
  lesson027Bundle,
  lesson028Bundle,
  lesson029Bundle,
  lesson030Bundle,
  lesson031Bundle,
  lesson032Bundle,
  lesson033Bundle,
  lesson034Bundle,
  lesson035Bundle,
  lesson036Bundle,
  lesson037Bundle,
  lesson038Bundle,
  lesson039Bundle,
  lesson040Bundle,
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
  const studyMinutes =
    bundle.grammar.length * 1.1 +
    bundle.vocabulary.length * 0.2 +
    (bundle.kanji?.length ?? 0) * 2.4 +
    bundle.sentences.length * 0.35;
  const guidedReviewMinutes = 1.5;
  const calculatedMinutes = Math.ceil(
    studyMinutes + exerciseMinutes(bundle) + guidedReviewMinutes,
  );
  const estimatedMinutes = Math.min(30, Math.max(14, calculatedMinutes));

  return {
    ...bundle,
    lesson: {
      ...bundle.lesson,
      estimatedMinutes,
    },
  };
};

const diversifiedLessonBundles: readonly LessonBundle[] = expandedLessonBundles
  .map((bundle) => diversifyLessonPractice(bundle, expandedLessonBundles));

export const lessonBundles: readonly LessonBundle[] = integrateKanjiCurriculumSequence(
  diversifiedLessonBundles,
).map(withReviewedDuration);

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
  {
    id: "unit-006",
    title: "て-форма в действии",
    description:
      "Образование て-формы, просьбы, разрешения, запреты, порядок действий и ～ています.",
    jlptLevel: "N5",
    lessons: [
      requireLesson("lesson-017"),
      requireLesson("lesson-018"),
      requireLesson("lesson-019"),
      requireLesson("lesson-020"),
    ],
  },
  {
    id: "unit-007",
    title: "Простые формы, желания и возможности",
    description:
      "Словарная форма, отрицание ～ない, желание ～たい и способность через ～ことができます.",
    jlptLevel: "N5",
    lessons: [
      requireLesson("lesson-021"),
      requireLesson("lesson-022"),
      requireLesson("lesson-023"),
      requireLesson("lesson-024"),
    ],
  },
  {
    id: "unit-008",
    title: "Прошлое, порядок и причины",
    description:
      "Простое прошедшее ～た, отрицание ～なかった, действия до и после, объяснение причины через から.",
    jlptLevel: "N5",
    lessons: [
      requireLesson("lesson-025"),
      requireLesson("lesson-026"),
      requireLesson("lesson-027"),
      requireLesson("lesson-028"),
    ],
  },
  {
    id: "unit-009",
    title: "Опыт, варианты и необходимость",
    description:
      "Прошлый опыт, перечисление характерных действий, советы, обязанность и отсутствие необходимости.",
    jlptLevel: "N5",
    lessons: [
      requireLesson("lesson-029"),
      requireLesson("lesson-030"),
      requireLesson("lesson-031"),
      requireLesson("lesson-032"),
    ],
  },
  {
    id: "unit-010",
    title: "Разговор о действиях и времени",
    description:
      "Приглашения и предложения, уже завершённые и ещё не завершённые действия, связанные описания и временные конструкции с ～とき.",
    jlptLevel: "N5",
    lessons: [
      requireLesson("lesson-033"),
      requireLesson("lesson-034"),
      requireLesson("lesson-035"),
      requireLesson("lesson-036"),
    ],
  },
  {
    id: "unit-011",
    title: "Мысли, речь и планы",
    description:
      "Мнения и предположения через ～と思います, прямая и косвенная речь, намерения ～つもり, конкретные планы ～予定 и вероятность ～でしょう.",
    jlptLevel: "N4",
    lessons: [
      requireLesson("lesson-037"),
      requireLesson("lesson-038"),
      requireLesson("lesson-039"),
      requireLesson("lesson-040"),
    ],
  },
];
