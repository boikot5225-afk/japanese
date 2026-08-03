import type { Exercise, Skill } from "../domain/course";

export interface ReviewHeaderPresentation {
  title: string;
  focus: string;
}

const skillLabel = (skill: Skill | undefined): string => {
  switch (skill) {
    case "recognition":
      return "узнавание";
    case "recall":
      return "воспроизведение";
    case "reading":
      return "чтение";
    case "listening":
      return "аудирование";
    case "writing":
      return "письмо";
    case "usage":
      return "употребление";
    default:
      return "повторение";
  }
};

const skillTitle = (skill: Skill | undefined): string => {
  switch (skill) {
    case "recognition":
      return "Узнавание";
    case "recall":
      return "Воспроизведение";
    case "reading":
      return "Чтение";
    case "listening":
      return "Аудирование";
    case "writing":
      return "Письмо";
    case "usage":
      return "Употребление";
    default:
      return "Повторение";
  }
};

const getKanjiLiteral = (exercise: Exercise): string | null => {
  const match = exercise.contentKey?.match(/^kanji:([^:]+):/u);
  return match?.[1] ?? null;
};

const removeLeadingItemLabel = (focusLabel: string): string =>
  focusLabel.replace(/^.+? — /u, "");

/**
 * The review header must never reveal the answer that the card below asks for.
 * The exercise prompt remains the source of context; the header only names the
 * skill being tested. Kanji writing is the sole exception: its Russian meaning
 * is the intentional recall cue, while the literal itself must stay hidden.
 */
export const buildReviewHeaderPresentation = (
  exercise: Exercise,
  lessonTitle: string,
  focusLabel: string,
): ReviewHeaderPresentation => {
  if (focusLabel === "Материал урока") {
    return {
      title: lessonTitle,
      focus: `Проверяем навык: ${skillLabel(exercise.skill)}`,
    };
  }

  const literal = getKanjiLiteral(exercise);
  if (literal) {
    if (exercise.skill === "writing") {
      return {
        title: "Письмо по памяти",
        focus: removeLeadingItemLabel(focusLabel),
      };
    }
    if (exercise.skill === "reading") {
      return {
        title: `Кандзи ${literal}`,
        focus: "Проверяем чтение в слове",
      };
    }
    if (exercise.skill === "recognition" || exercise.skill === "recall") {
      return {
        title: `Кандзи ${literal}`,
        focus: "Проверяем значение знака",
      };
    }
    return {
      title: `Кандзи ${literal}`,
      focus: `Проверяем навык: ${skillLabel(exercise.skill)}`,
    };
  }

  return {
    title: skillTitle(exercise.skill),
    focus: `Проверяем навык: ${skillLabel(exercise.skill)}`,
  };
};
