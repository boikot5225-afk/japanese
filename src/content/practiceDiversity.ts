import type {
  Exercise,
  ExerciseType,
  GrammarPoint,
  VocabularyItem,
} from "../domain/course";
import { buildUniqueExerciseQueue } from "../engine/exerciseIdentity";
import type { LessonBundle } from "./lessonBundle";

const SESSION_EXERCISE_COUNT = 12;

const unique = (values: readonly string[]): string[] =>
  [...new Set(values.map((value) => value.trim()).filter(Boolean))];

const normalizeText = (value: string): string =>
  value
    .toLocaleLowerCase("ru-RU")
    .replace(/[\s|_。、，！？!?.,:;「」『』（）()［\][\]{}"'«»—–-]+/gu, "");

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

const exerciseTextFields = (exercise: Exercise): string[] =>
  unique([
    exercise.prompt,
    exercise.audioText ?? "",
    exercise.explanationRu ?? "",
    ...exercise.correctAnswers,
    ...(exercise.acceptableAnswers ?? []),
  ]).map(normalizeText);

const inferSentenceContentKey = (
  bundle: LessonBundle,
  exercise: Exercise,
): string | undefined => {
  const explicitSentenceId = exercise.targetItemIds.find((id) =>
    id.startsWith("sentence-"),
  );
  if (explicitSentenceId) return `sentence:${explicitSentenceId}`;

  const fields = exerciseTextFields(exercise);
  const matchedSentence = bundle.sentences.find((sentence) => {
    const needles = unique([
      sentence.japanese,
      sentence.reading ?? "",
      sentence.translationRu,
    ])
      .map(normalizeText)
      .filter((value) => value.length >= 4);
    return needles.some((needle) =>
      fields.some((field) => field.includes(needle)),
    );
  });

  return matchedSentence ? `sentence:${matchedSentence.id}` : undefined;
};

const normalizeExistingExercise = (
  bundle: LessonBundle,
  exercise: Exercise,
): Exercise => {
  const contentKey =
    exercise.contentKey ??
    inferSentenceContentKey(bundle, exercise) ??
    `exercise:${exercise.id}`;
  return {
    ...exercise,
    contentKey,
    variantGroup: exercise.variantGroup ?? contentKey,
    difficulty: exercise.difficulty ?? defaultDifficulty(exercise.type),
  };
};

const takeDistractors = (
  pool: readonly string[],
  correctAnswers: readonly string[],
  count = 3,
): string[] => {
  const correct = new Set(correctAnswers.map((value) => value.trim()));
  return unique(pool).filter((value) => !correct.has(value)).slice(0, count);
};

const vocabularyConfusions = (
  bundle: LessonBundle,
  wordId: string,
): string[] | undefined => {
  const ids = bundle.vocabulary
    .map((word) => word.id)
    .filter((id) => id !== wordId)
    .slice(0, 4);
  return ids.length > 0 ? ids : undefined;
};

const grammarConfusions = (
  bundle: LessonBundle,
  grammarId: string,
): string[] | undefined => {
  const ids = bundle.grammar
    .map((grammar) => grammar.id)
    .filter((id) => id !== grammarId)
    .slice(0, 4);
  return ids.length > 0 ? ids : undefined;
};

const vocabularyExerciseId = (
  bundle: LessonBundle,
  word: VocabularyItem,
  suffix: string,
): string => `${bundle.lesson.id}-diverse-${word.id}-${suffix}`;

const grammarExerciseId = (
  bundle: LessonBundle,
  grammar: GrammarPoint,
  suffix: string,
): string => `${bundle.lesson.id}-diverse-${grammar.id}-${suffix}`;

const createVocabularyExercises = (
  bundle: LessonBundle,
  word: VocabularyItem,
  allBundles: readonly LessonBundle[],
): Exercise[] => {
  const words = allBundles.flatMap((item) => item.vocabulary);
  const meaning = word.meaningsRu[0] ?? word.writtenForm;
  const meaningPool = words.flatMap((item) => item.meaningsRu);
  const readingPool = words.map((item) => item.reading);
  const writtenPool = words.map((item) => item.writtenForm);
  const confusions = vocabularyConfusions(bundle, word.id);

  const meaningKey = `vocabulary:${word.id}:meaning`;
  const readingKey = `vocabulary:${word.id}:reading`;
  const writtenKey = `vocabulary:${word.id}:written`;

  return [
    {
      id: vocabularyExerciseId(bundle, word, "meaning-choice"),
      type: "multiple-choice",
      prompt: `Что значит ${word.writtenForm}?`,
      targetItemIds: [word.id],
      correctAnswers: [meaning],
      acceptableAnswers: word.meaningsRu.slice(1),
      distractors: takeDistractors(meaningPool, word.meaningsRu),
      explanationRu: `${word.writtenForm}（${word.reading}）— ${word.meaningsRu.join(", ")}.`,
      variantGroup: meaningKey,
      contentKey: meaningKey,
      difficulty: 1,
      confusionItemIds: confusions,
    },
    {
      id: vocabularyExerciseId(bundle, word, "meaning-listening"),
      type: "listening",
      prompt: "Прослушай слово и выбери его значение.",
      audioText: word.reading || word.writtenForm,
      targetItemIds: [word.id],
      correctAnswers: [meaning],
      acceptableAnswers: word.meaningsRu.slice(1),
      distractors: takeDistractors(meaningPool, word.meaningsRu),
      explanationRu: `${word.writtenForm}（${word.reading}）— ${word.meaningsRu.join(", ")}.`,
      variantGroup: meaningKey,
      contentKey: meaningKey,
      difficulty: 2,
      confusionItemIds: confusions,
    },
    {
      id: vocabularyExerciseId(bundle, word, "reading-choice"),
      type: "multiple-choice",
      prompt: `Выбери чтение слова ${word.writtenForm}.`,
      targetItemIds: [word.id],
      correctAnswers: [word.reading],
      distractors: takeDistractors(readingPool, [word.reading]),
      explanationRu: `${word.writtenForm} читается ${word.reading}.`,
      variantGroup: readingKey,
      contentKey: readingKey,
      difficulty: 2,
      confusionItemIds: confusions,
    },
    {
      id: vocabularyExerciseId(bundle, word, "reading-input"),
      type: "text-input",
      prompt: `Напиши хираганой чтение слова ${word.writtenForm}.`,
      targetItemIds: [word.id],
      correctAnswers: [word.reading],
      explanationRu: `${word.writtenForm} читается ${word.reading}.`,
      variantGroup: readingKey,
      contentKey: readingKey,
      difficulty: 3,
      confusionItemIds: confusions,
    },
    {
      id: vocabularyExerciseId(bundle, word, "written-choice"),
      type: "multiple-choice",
      prompt: `Выбери японское слово: ${meaning}.`,
      targetItemIds: [word.id],
      correctAnswers: [word.writtenForm],
      distractors: takeDistractors(writtenPool, [word.writtenForm]),
      explanationRu: `${meaning} — ${word.writtenForm}（${word.reading}）.`,
      variantGroup: writtenKey,
      contentKey: writtenKey,
      difficulty: 2,
      confusionItemIds: confusions,
    },
    {
      id: vocabularyExerciseId(bundle, word, "written-listening"),
      type: "listening",
      prompt: "Прослушай слово и выбери его написание.",
      audioText: word.reading || word.writtenForm,
      targetItemIds: [word.id],
      correctAnswers: [word.writtenForm],
      distractors: takeDistractors(writtenPool, [word.writtenForm]),
      explanationRu: `${word.reading} — ${word.writtenForm}.`,
      variantGroup: writtenKey,
      contentKey: writtenKey,
      difficulty: 2,
      confusionItemIds: confusions,
    },
  ];
};

const createGrammarExercises = (
  bundle: LessonBundle,
  grammar: GrammarPoint,
  allBundles: readonly LessonBundle[],
): Exercise[] => {
  const grammarPool = allBundles.flatMap((item) => item.grammar);
  const titlePool = grammarPool.map((item) => item.title);
  const meaningPool = grammarPool.map((item) => item.meaningRu);
  const formationPool = grammarPool.flatMap((item) => item.formation);
  const formation = grammar.formation[0] ?? grammar.title;
  const confusions = grammarConfusions(bundle, grammar.id);
  const meaningKey = `grammar:${grammar.id}:meaning`;
  const formationKey = `grammar:${grammar.id}:formation`;

  const exercises: Exercise[] = [
    {
      id: grammarExerciseId(bundle, grammar, "meaning-choice"),
      type: "multiple-choice",
      prompt: `Что выражает «${grammar.title}»?`,
      targetItemIds: [grammar.id],
      correctAnswers: [grammar.meaningRu],
      distractors: takeDistractors(meaningPool, [grammar.meaningRu]),
      explanationRu: grammar.explanationRu,
      variantGroup: meaningKey,
      contentKey: meaningKey,
      difficulty: 1,
      confusionItemIds: confusions,
    },
    {
      id: grammarExerciseId(bundle, grammar, "title-choice"),
      type: "multiple-choice",
      prompt: `Выбери тему, которая ${grammar.meaningRu}.`,
      targetItemIds: [grammar.id],
      correctAnswers: [grammar.title],
      distractors: takeDistractors(titlePool, [grammar.title]),
      explanationRu: grammar.explanationRu,
      variantGroup: meaningKey,
      contentKey: meaningKey,
      difficulty: 2,
      confusionItemIds: confusions,
    },
    {
      id: grammarExerciseId(bundle, grammar, "formation-choice"),
      type: "multiple-choice",
      prompt: `Выбери основную схему для «${grammar.title}».`,
      targetItemIds: [grammar.id],
      correctAnswers: [formation],
      distractors: takeDistractors(formationPool, [formation]),
      explanationRu: `Основная схема: ${formation}`,
      variantGroup: formationKey,
      contentKey: formationKey,
      difficulty: 2,
      confusionItemIds: confusions,
    },
    {
      id: grammarExerciseId(bundle, grammar, "formation-title-choice"),
      type: "multiple-choice",
      prompt: `Какой теме соответствует схема: ${formation}?`,
      targetItemIds: [grammar.id],
      correctAnswers: [grammar.title],
      distractors: takeDistractors(titlePool, [grammar.title]),
      explanationRu: `${formation} — схема темы «${grammar.title}».`,
      variantGroup: formationKey,
      contentKey: formationKey,
      difficulty: 2,
      confusionItemIds: confusions,
    },
  ];

  const caution = grammar.cautions?.[0];
  if (caution) {
    const cautionPool = grammarPool.flatMap((item) => [
      ...(item.cautions ?? []),
      item.meaningRu,
    ]);
    const cautionKey = `grammar:${grammar.id}:caution`;
    exercises.push({
      id: grammarExerciseId(bundle, grammar, "caution-choice"),
      type: "multiple-choice",
      prompt: `Какое замечание относится к теме «${grammar.title}»?`,
      targetItemIds: [grammar.id],
      correctAnswers: [caution],
      distractors: takeDistractors(cautionPool, [caution]),
      explanationRu: caution,
      variantGroup: cautionKey,
      contentKey: cautionKey,
      difficulty: 3,
      confusionItemIds: confusions,
    });
  }

  return exercises;
};

const deduplicateById = (exercises: readonly Exercise[]): Exercise[] => {
  const seen = new Set<string>();
  return exercises.filter((exercise) => {
    if (seen.has(exercise.id)) return false;
    seen.add(exercise.id);
    return true;
  });
};

export function diversifyLessonPractice(
  bundle: LessonBundle,
  allBundles: readonly LessonBundle[],
): LessonBundle {
  const normalizedExisting = bundle.exercises.map((exercise) =>
    normalizeExistingExercise(bundle, exercise),
  );
  const generatedVocabulary = bundle.vocabulary.flatMap((word) =>
    createVocabularyExercises(bundle, word, allBundles),
  );
  const generatedGrammar = bundle.grammar.flatMap((grammar) =>
    createGrammarExercises(bundle, grammar, allBundles),
  );
  const exercises = deduplicateById([
    ...normalizedExisting,
    ...generatedVocabulary,
    ...generatedGrammar,
  ]);
  const sessionQueue = buildUniqueExerciseQueue(
    exercises,
    SESSION_EXERCISE_COUNT,
  );

  return {
    ...bundle,
    lesson: {
      ...bundle.lesson,
      exerciseIds: exercises.map((exercise) => exercise.id),
      estimatedMinutes:
        sessionQueue.length >= SESSION_EXERCISE_COUNT
          ? bundle.lesson.estimatedMinutes
          : Math.max(8, bundle.lesson.estimatedMinutes - 2),
    },
    exercises,
  };
}
