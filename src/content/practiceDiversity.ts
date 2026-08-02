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

const getWordReadings = (word: VocabularyItem): string[] =>
  unique([word.reading, ...(word.alternativeReadings ?? [])]);

const getWordReadingLabel = (word: VocabularyItem): string =>
  getWordReadings(word).join(" / ");

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
  const sentence = bundle.sentences.find((item) => {
    const needles = unique([
      item.japanese,
      item.reading ?? "",
      item.translationRu,
    ])
      .map(normalizeText)
      .filter((value) => value.length >= 4);
    return needles.some((needle) =>
      fields.some((field) => field.includes(needle)),
    );
  });

  return sentence ? `sentence:${sentence.id}` : undefined;
};

const inferVocabularyContentKey = (
  bundle: LessonBundle,
  exercise: Exercise,
): string | undefined => {
  if (exercise.targetItemIds.length !== 1) return undefined;

  const wordId = exercise.targetItemIds[0];
  if (!wordId?.startsWith("word-")) return undefined;
  const word = bundle.vocabulary.find((item) => item.id === wordId);
  if (!word) return undefined;

  const answers = unique([
    ...exercise.correctAnswers,
    ...(exercise.acceptableAnswers ?? []),
  ]).map(normalizeText);
  const readings = getWordReadings(word).map(normalizeText);
  const written = normalizeText(word.writtenForm);
  const meanings = word.meaningsRu.map(normalizeText);

  if (answers.some((answer) => readings.includes(answer))) {
    return `vocabulary:${word.id}:reading`;
  }
  if (answers.includes(written)) return `vocabulary:${word.id}:written`;
  if (answers.some((answer) => meanings.includes(answer))) {
    return `vocabulary:${word.id}:meaning`;
  }
  return undefined;
};

const normalizeExistingExercise = (
  bundle: LessonBundle,
  exercise: Exercise,
): Exercise => {
  const contentKey =
    exercise.contentKey ??
    inferSentenceContentKey(bundle, exercise) ??
    inferVocabularyContentKey(bundle, exercise) ??
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
  const readings = getWordReadings(word);
  const primaryReading = readings[0] ?? word.reading;
  const readingLabel = getWordReadingLabel(word);
  const meaning = word.meaningsRu[0] ?? word.writtenForm;
  const meaningPool = words.flatMap((item) => item.meaningsRu);
  const readingPool = words.flatMap(getWordReadings);
  const writtenPool = words.map((item) => item.writtenForm);
  const confusions = vocabularyConfusions(bundle, word.id);
  const variantGroup = `vocabulary:${word.id}:practice`;
  const meaningKey = `vocabulary:${word.id}:meaning`;
  const readingKey = `vocabulary:${word.id}:reading`;
  const writtenKey = `vocabulary:${word.id}:written`;
  const writtenAlreadyShowsReading = readings.some(
    (reading) => normalizeText(reading) === normalizeText(word.writtenForm),
  );

  const exercises: Exercise[] = [
    {
      id: vocabularyExerciseId(bundle, word, "meaning-choice"),
      type: "multiple-choice",
      prompt: `Что значит ${word.writtenForm}?`,
      targetItemIds: [word.id],
      correctAnswers: [meaning],
      acceptableAnswers: word.meaningsRu.slice(1),
      distractors: takeDistractors(meaningPool, word.meaningsRu),
      explanationRu: `${word.writtenForm}（${readingLabel}）— ${word.meaningsRu.join(", ")}.`,
      variantGroup,
      contentKey: meaningKey,
      difficulty: 1,
      confusionItemIds: confusions,
    },
    {
      id: vocabularyExerciseId(bundle, word, "meaning-listening"),
      type: "listening",
      prompt: "Прослушай слово и выбери его значение.",
      audioText: primaryReading || word.writtenForm,
      targetItemIds: [word.id],
      correctAnswers: [meaning],
      acceptableAnswers: word.meaningsRu.slice(1),
      distractors: takeDistractors(meaningPool, word.meaningsRu),
      explanationRu: `${word.writtenForm}（${readingLabel}）— ${word.meaningsRu.join(", ")}.`,
      variantGroup,
      contentKey: meaningKey,
      difficulty: 2,
      confusionItemIds: confusions,
    },
    {
      id: vocabularyExerciseId(bundle, word, "reading-choice"),
      type: "multiple-choice",
      prompt:
        readings.length > 1
          ? `Выбери основное чтение слова ${word.writtenForm}.`
          : `Выбери чтение слова ${word.writtenForm}.`,
      targetItemIds: [word.id],
      correctAnswers: [primaryReading],
      distractors: takeDistractors(readingPool, readings),
      explanationRu: `${word.writtenForm}: ${readingLabel}.`,
      variantGroup,
      contentKey: readingKey,
      difficulty: 2,
      confusionItemIds: confusions,
    },
    {
      id: vocabularyExerciseId(bundle, word, "reading-input"),
      type: "text-input",
      prompt:
        readings.length > 1
          ? `Напиши одно из допустимых чтений слова ${word.writtenForm}.`
          : `Напиши чтение слова ${word.writtenForm}.`,
      targetItemIds: [word.id],
      correctAnswers: [primaryReading],
      acceptableAnswers: readings.length > 1 ? readings.slice(1) : undefined,
      explanationRu: `${word.writtenForm}: ${readingLabel}.`,
      variantGroup,
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
      explanationRu: `${meaning} — ${word.writtenForm}（${readingLabel}）.`,
      variantGroup,
      contentKey: writtenKey,
      difficulty: 2,
      confusionItemIds: confusions,
    },
    {
      id: vocabularyExerciseId(bundle, word, "written-listening"),
      type: "listening",
      prompt: "Прослушай слово и выбери его написание.",
      audioText: primaryReading || word.writtenForm,
      targetItemIds: [word.id],
      correctAnswers: [word.writtenForm],
      distractors: takeDistractors(writtenPool, [word.writtenForm]),
      explanationRu: `${primaryReading} — ${word.writtenForm}.`,
      variantGroup,
      contentKey: writtenKey,
      difficulty: 2,
      confusionItemIds: confusions,
    },
  ];

  return exercises.filter((exercise) => {
    if (writtenAlreadyShowsReading && exercise.contentKey === readingKey) {
      return false;
    }
    return (
      exercise.type !== "listening" ||
      normalizeText(exercise.audioText ?? "").length >= 2
    );
  });
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
  const variantGroup = `grammar:${grammar.id}:practice`;
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
      variantGroup,
      contentKey: meaningKey,
      difficulty: 1,
      confusionItemIds: confusions,
    },
    {
      id: grammarExerciseId(bundle, grammar, "title-choice"),
      type: "multiple-choice",
      prompt: `Какой грамматической теме соответствует описание: «${grammar.meaningRu}»?`,
      targetItemIds: [grammar.id],
      correctAnswers: [grammar.title],
      distractors: takeDistractors(titlePool, [grammar.title]),
      explanationRu: grammar.explanationRu,
      variantGroup,
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
      variantGroup,
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
      variantGroup,
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
    exercises.push({
      id: grammarExerciseId(bundle, grammar, "caution-choice"),
      type: "multiple-choice",
      prompt: `Какое замечание относится к теме «${grammar.title}»?`,
      targetItemIds: [grammar.id],
      correctAnswers: [caution],
      distractors: takeDistractors(cautionPool, [caution]),
      explanationRu: caution,
      variantGroup,
      contentKey: `grammar:${grammar.id}:caution`,
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
  const pool = deduplicateById([
    ...bundle.exercises.map((exercise) =>
      normalizeExistingExercise(bundle, exercise),
    ),
    ...bundle.vocabulary.flatMap((word) =>
      createVocabularyExercises(bundle, word, allBundles),
    ),
    ...bundle.grammar.flatMap((grammar) =>
      createGrammarExercises(bundle, grammar, allBundles),
    ),
  ]);
  const exercises = buildUniqueExerciseQueue(
    pool,
    SESSION_EXERCISE_COUNT,
  );

  return {
    ...bundle,
    lesson: {
      ...bundle.lesson,
      exerciseIds: exercises.map((exercise) => exercise.id),
    },
    exercises,
  };
}
