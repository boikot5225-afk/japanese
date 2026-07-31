import type { ExampleSentence, Exercise, ExerciseType } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

const TARGET_EXERCISE_COUNT = 12;

type GeneratedKind = "listening" | "text-input" | "meaning-choice" | "japanese-choice";

const generatedKinds: GeneratedKind[] = [
  "listening",
  "text-input",
  "meaning-choice",
  "japanese-choice",
];

const unique = (values: readonly string[]): string[] =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))];

const withoutTerminalPunctuation = (value: string): string =>
  value.trim().replace(/[。！？!?]+$/u, "");

const defaultDifficulty = (type: ExerciseType): 1 | 2 | 3 | 4 => {
  switch (type) {
    case "multiple-choice":
      return 1;
    case "listening":
      return 2;
    case "sentence-builder":
    case "particle-gap":
    case "conjugation":
      return 2;
    case "text-input":
    case "handwriting":
      return 3;
    default:
      return 2;
  }
};

const primaryTarget = (exercise: Exercise): string =>
  exercise.targetItemIds.find((id) => id.startsWith("grammar-")) ??
  exercise.targetItemIds[0] ??
  exercise.id;

const normalizeExistingExercise = (
  bundle: LessonBundle,
  exercise: Exercise,
): Exercise => {
  const lessonGrammarIds = bundle.grammar.map((item) => item.id);
  const fallbackConfusions = lessonGrammarIds.filter(
    (id) => !exercise.targetItemIds.includes(id),
  );
  return {
    ...exercise,
    variantGroup:
      exercise.variantGroup ?? `${bundle.lesson.id}:${primaryTarget(exercise)}`,
    difficulty: exercise.difficulty ?? defaultDifficulty(exercise.type),
    confusionItemIds:
      exercise.confusionItemIds ??
      (fallbackConfusions.length > 0 ? fallbackConfusions : undefined),
  };
};

const sentenceTargets = (sentence: ExampleSentence): string[] =>
  unique([
    sentence.id,
    ...sentence.grammarIds,
    ...sentence.vocabularyIds,
  ]);

const sentenceConfusions = (sentence: ExampleSentence): string[] | undefined => {
  const values = unique([
    ...sentence.grammarIds,
    ...sentence.vocabularyIds.slice(0, 2),
  ]);
  return values.length > 0 ? values : undefined;
};

const takeDistractors = (
  pool: readonly string[],
  correctAnswers: readonly string[],
  count = 3,
): string[] => {
  const correct = new Set(correctAnswers.map((value) => value.trim()));
  return unique(pool).filter((value) => !correct.has(value)).slice(0, count);
};

const generatedExerciseId = (
  bundle: LessonBundle,
  sentence: ExampleSentence,
  kind: GeneratedKind,
): string => `${bundle.lesson.id}-auto-${sentence.id}-${kind}`;

const createGeneratedExercise = (
  bundle: LessonBundle,
  sentence: ExampleSentence,
  kind: GeneratedKind,
  translationPool: readonly string[],
  japanesePool: readonly string[],
): Exercise => {
  const japanese = sentence.japanese.trim();
  const japaneseWithoutPunctuation = withoutTerminalPunctuation(japanese);
  const reading = sentence.reading?.trim();
  const readingWithoutPunctuation = reading
    ? withoutTerminalPunctuation(reading)
    : undefined;
  const targets = sentenceTargets(sentence);
  const confusions = sentenceConfusions(sentence);
  const variantGroup = `${bundle.lesson.id}:${sentence.id}:mixed-sentence`;
  const id = generatedExerciseId(bundle, sentence, kind);

  if (kind === "listening") {
    return {
      id,
      type: "listening",
      prompt: "Прослушай полное предложение и выбери его значение.",
      audioText: reading ?? japanese,
      targetItemIds: targets,
      correctAnswers: [sentence.translationRu],
      distractors: takeDistractors(translationPool, [sentence.translationRu]),
      explanationRu: `${japanese} — ${sentence.translationRu}`,
      variantGroup,
      difficulty: 2,
      confusionItemIds: confusions,
    };
  }

  if (kind === "text-input") {
    const correctAnswers = unique([japaneseWithoutPunctuation, japanese]);
    const acceptableAnswers = unique([
      readingWithoutPunctuation ?? "",
      reading ?? "",
    ]).filter((answer) => !correctAnswers.includes(answer));
    return {
      id,
      type: "text-input",
      prompt: `Напиши по-японски: ${sentence.translationRu}`,
      targetItemIds: targets,
      correctAnswers,
      acceptableAnswers:
        acceptableAnswers.length > 0 ? acceptableAnswers : undefined,
      explanationRu: `Целевая фраза: ${japanese}`,
      variantGroup,
      difficulty: 3,
      confusionItemIds: confusions,
    };
  }

  if (kind === "japanese-choice") {
    return {
      id,
      type: "multiple-choice",
      prompt: `Выбери японское предложение: ${sentence.translationRu}`,
      targetItemIds: targets,
      correctAnswers: [japanese],
      distractors: takeDistractors(japanesePool, [japanese]),
      explanationRu: `Правильная форма: ${japanese}`,
      variantGroup,
      difficulty: 2,
      confusionItemIds: confusions,
    };
  }

  return {
    id,
    type: "multiple-choice",
    prompt: `Выбери точный перевод: ${japanese}`,
    targetItemIds: targets,
    correctAnswers: [sentence.translationRu],
    distractors: takeDistractors(translationPool, [sentence.translationRu]),
    explanationRu: `${japanese} — ${sentence.translationRu}`,
    variantGroup,
    difficulty: 1,
    confusionItemIds: confusions,
  };
};

const buildGeneratedCandidates = (
  bundle: LessonBundle,
  allBundles: readonly LessonBundle[],
): Exercise[] => {
  if (bundle.sentences.length === 0) return [];

  const translationPool = allBundles.flatMap((item) =>
    item.sentences.map((sentence) => sentence.translationRu),
  );
  const japanesePool = allBundles.flatMap((item) =>
    item.sentences.map((sentence) => sentence.japanese.trim()),
  );

  const candidates: Exercise[] = [];
  for (let round = 0; round < bundle.sentences.length; round += 1) {
    generatedKinds.forEach((kind, kindIndex) => {
      const sentence = bundle.sentences[
        (round + kindIndex) % bundle.sentences.length
      ];
      if (!sentence) return;
      candidates.push(
        createGeneratedExercise(
          bundle,
          sentence,
          kind,
          translationPool,
          japanesePool,
        ),
      );
    });
  }
  return candidates;
};

const estimateExpandedMinutes = (
  bundle: LessonBundle,
  exercises: readonly Exercise[],
): number => {
  const exerciseMinutes = exercises.reduce((total, exercise) => {
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
  const studyMinutes =
    bundle.grammar.length * 1.1 +
    bundle.vocabulary.length * 0.2 +
    bundle.sentences.length * 0.35;
  return Math.max(
    bundle.lesson.estimatedMinutes,
    Math.ceil(studyMinutes + exerciseMinutes),
  );
};

export function expandLessonPractice(
  bundle: LessonBundle,
  allBundles: readonly LessonBundle[],
  targetCount = TARGET_EXERCISE_COUNT,
): LessonBundle {
  const normalizedExercises = bundle.exercises.map((exercise) =>
    normalizeExistingExercise(bundle, exercise),
  );
  const needed = Math.max(0, targetCount - normalizedExercises.length);
  const existingIds = new Set(normalizedExercises.map((exercise) => exercise.id));
  const additions = buildGeneratedCandidates(bundle, allBundles)
    .filter((exercise) => !existingIds.has(exercise.id))
    .slice(0, needed);
  const exercises = [...normalizedExercises, ...additions];

  return {
    ...bundle,
    lesson: {
      ...bundle.lesson,
      exerciseIds: exercises.map((exercise) => exercise.id),
      estimatedMinutes:
        additions.length > 0
          ? estimateExpandedMinutes(bundle, exercises)
          : bundle.lesson.estimatedMinutes,
    },
    exercises,
  };
}
