import type {
  Exercise,
  KanjiExample,
  KanjiItem,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";
import { n5KanjiCatalog } from "./kanjiCatalog";

const unique = (values: string[]): string[] => [...new Set(values)];
const HAN_PATTERN = /\p{Script=Han}/gu;
const JAPANESE_SEGMENT_PATTERN =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々〆ヶー]+/gu;

const n5KanjiByLiteral = new Map(
  n5KanjiCatalog.map((item) => [item.literal, item] as const),
);

const hiraganaToKatakana = (value: string): string =>
  [...value].map((character) => {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined || codePoint < 0x3041 || codePoint > 0x3096) {
      return character;
    }
    return String.fromCodePoint(codePoint + 0x60);
  }).join("");

const katakanaToHiragana = (value: string): string =>
  [...value].map((character) => {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined || codePoint < 0x30a1 || codePoint > 0x30f6) {
      return character;
    }
    return String.fromCodePoint(codePoint - 0x60);
  }).join("");

export const extractKanjiLiterals = (value: string): string[] =>
  value.match(HAN_PATTERN) ?? [];

const exerciseJapaneseTexts = (exercise: Exercise): string[] => [
  exercise.prompt,
  ...exercise.correctAnswers,
  ...(exercise.acceptableAnswers ?? []),
  ...(exercise.distractors ?? []),
  ...(exercise.audioText ? [exercise.audioText] : []),
];

/**
 * The lesson gate must cover what the learner will actually see and answer.
 * Vocabulary is ordered first, then examples, then any extra glyphs introduced
 * only by practice. This preserves a deterministic, pedagogical order.
 */
export const getRequiredLessonKanjiLiterals = (bundle: LessonBundle): string[] =>
  unique([
    ...bundle.vocabulary.flatMap((item) => extractKanjiLiterals(item.writtenForm)),
    ...bundle.grammar.flatMap((item) =>
      [item.title, ...item.formation].flatMap(extractKanjiLiterals),
    ),
    ...bundle.sentences.flatMap((item) => extractKanjiLiterals(item.japanese)),
    ...bundle.exercises.flatMap((exercise) =>
      exerciseJapaneseTexts(exercise).flatMap(extractKanjiLiterals),
    ),
  ]);

const japaneseSegmentContaining = (value: string, literal: string): string | null =>
  (value.match(JAPANESE_SEGMENT_PATTERN) ?? []).find((segment) =>
    segment.includes(literal),
  ) ?? null;

const countKanji = (value: string): number => extractKanjiLiterals(value).length;

const exactReadingForSingleKanjiWord = (
  written: string,
  reading: string,
  literal: string,
): string | null => {
  if (countKanji(written) !== 1) return null;
  const literalIndex = written.indexOf(literal);
  if (literalIndex < 0) return null;

  const writtenPrefix = katakanaToHiragana(written.slice(0, literalIndex));
  const writtenSuffix = katakanaToHiragana(
    written.slice(literalIndex + literal.length),
  );
  let remaining = katakanaToHiragana(reading);

  if (writtenPrefix) {
    if (!remaining.startsWith(writtenPrefix)) return null;
    remaining = remaining.slice(writtenPrefix.length);
  }
  if (writtenSuffix) {
    if (!remaining.endsWith(writtenSuffix)) return null;
    remaining = remaining.slice(0, -writtenSuffix.length);
  }
  return remaining || null;
};

interface LessonKanjiContext {
  example: KanjiExample;
  vocabulary?: VocabularyItem;
}

const contextFromVocabulary = (
  item: VocabularyItem,
  literal: string,
  curated: KanjiItem | undefined,
): LessonKanjiContext => {
  const curatedSameWord = curated?.examples.find(
    (example) => example.written === item.writtenForm,
  );
  const exactReading =
    curatedSameWord?.kanjiReading ??
    exactReadingForSingleKanjiWord(item.writtenForm, item.reading, literal);

  return {
    vocabulary: item,
    example: {
      written: item.writtenForm,
      reading: item.reading,
      kanjiReading: exactReading ?? item.reading,
      meaningRu: item.meaningsRu.join(", "),
      readingScope: exactReading ? "character" : "word",
    },
  };
};

const findLessonContext = (
  bundle: LessonBundle,
  literal: string,
  curated: KanjiItem | undefined,
): LessonKanjiContext => {
  const vocabulary = bundle.vocabulary.find((item) =>
    item.writtenForm.includes(literal),
  );
  if (vocabulary) return contextFromVocabulary(vocabulary, literal, curated);

  const sentence = bundle.sentences.find((item) => item.japanese.includes(literal));
  if (sentence) {
    return {
      example: {
        written: sentence.japanese.replace(/[。！？!?]$/u, ""),
        reading: sentence.reading?.replace(/[。！？!?]$/u, "") ?? sentence.japanese,
        kanjiReading:
          sentence.reading?.replace(/[。！？!?]$/u, "") ??
          curated?.examples[0]?.kanjiReading ??
          literal,
        meaningRu: sentence.translationRu,
        readingScope: "word",
      },
    };
  }

  for (const exercise of bundle.exercises) {
    for (const text of exerciseJapaneseTexts(exercise)) {
      const segment = japaneseSegmentContaining(text.replaceAll("|", ""), literal);
      if (!segment) continue;
      const curatedExample = curated?.examples[0];
      return {
        example: {
          written: segment,
          reading: curatedExample?.written === segment
            ? curatedExample.reading
            : curatedExample?.reading ?? segment,
          kanjiReading: curatedExample?.written === segment
            ? curatedExample.kanjiReading
            : curatedExample?.reading ?? segment,
          meaningRu:
            exercise.explanationRu ??
            curated?.meaningsRu.join(", ") ??
            "материал текущего урока",
          readingScope:
            curatedExample?.written === segment ? "character" : "word",
        },
      };
    }
  }

  const fallback = curated?.examples[0];
  return {
    example: fallback
      ? { ...fallback, readingScope: "character" }
      : {
          written: literal,
          reading: literal,
          kanjiReading: literal,
          meaningRu: "материал текущего урока",
          readingScope: "word",
        },
  };
};

const createLessonKanjiItem = (
  bundle: LessonBundle,
  literal: string,
): KanjiItem => {
  const curated = n5KanjiByLiteral.get(literal);
  const context = findLessonContext(bundle, literal, curated);
  const meaningsRu = curated?.meaningsRu ??
    context.vocabulary?.meaningsRu ??
    [context.example.meaningRu];

  return {
    id: `kanji-${literal}`,
    type: "kanji",
    literal,
    meaningsRu,
    jlptLevel: curated?.jlptLevel ?? "N5",
    introducedInLessonId: bundle.lesson.id,
    examples: [context.example],
    contextualOnly: curated === undefined,
  };
};

export const getLessonKanji = (
  bundle: LessonBundle,
  previouslyIntroduced: ReadonlySet<string> = new Set<string>(),
): KanjiItem[] =>
  getRequiredLessonKanjiLiterals(bundle)
    .filter((literal) => !previouslyIntroduced.has(literal))
    .map((literal) => createLessonKanjiItem(bundle, literal));

const distractorKanji = (
  target: KanjiItem,
  lessonKanji: readonly KanjiItem[],
): KanjiItem[] => {
  const candidates = [
    ...lessonKanji.filter((item) => item.id !== target.id),
    ...n5KanjiCatalog.filter((item) => item.id !== target.id),
  ];
  const selected: KanjiItem[] = [];
  const targetAnswer = target.contextualOnly
    ? target.examples[0]?.meaningRu
    : target.meaningsRu[0];
  const usedMeanings = new Set(targetAnswer ? [targetAnswer] : []);

  for (const candidate of candidates) {
    const meaning = candidate.contextualOnly
      ? candidate.examples[0]?.meaningRu
      : candidate.meaningsRu[0];
    if (!meaning || usedMeanings.has(meaning)) continue;
    selected.push(candidate);
    usedMeanings.add(meaning);
    if (selected.length === 3) break;
  }
  return selected;
};

const readingDistractors = (
  target: KanjiItem,
  lessonKanji: readonly KanjiItem[],
): string[] => {
  const example = target.examples[0];
  const wordReading = example?.readingScope === "word";
  const correct = wordReading ? example?.reading : example?.kanjiReading;
  const values: string[] = [];
  const candidates = [...lessonKanji, ...n5KanjiCatalog];
  for (const candidate of candidates) {
    const candidateExample = candidate.examples[0];
    const reading = wordReading
      ? candidateExample?.reading
      : candidateExample?.kanjiReading;
    if (!reading || reading === correct || values.includes(reading)) continue;
    values.push(reading);
    if (values.length === 3) break;
  }
  return values;
};

const createRecognitionExercise = (
  lessonId: string,
  item: KanjiItem,
  lessonKanji: readonly KanjiItem[],
): Exercise => {
  const example = item.examples[0];
  const confusions = distractorKanji(item, lessonKanji);
  const contextual = item.contextualOnly && example;
  const answer = contextual
    ? example.meaningRu
    : item.meaningsRu[0] ?? item.literal;
  return {
    id: `${lessonId}-kanji-${item.literal}-recognition`,
    type: "multiple-choice",
    prompt: contextual
      ? `Что означает слово ${example.written}, в котором встречается ${item.literal}?`
      : `Что означает кандзи ${item.literal}?`,
    targetItemIds: [item.id],
    correctAnswers: [answer],
    distractors: confusions.map((candidate) =>
      candidate.contextualOnly
        ? candidate.examples[0]?.meaningRu ?? candidate.literal
        : candidate.meaningsRu[0] ?? candidate.literal,
    ),
    explanationRu: example
      ? `${item.literal} встречается в ${example.written}（${example.reading}）— ${example.meaningRu}.`
      : `${item.literal} — ${item.meaningsRu.join(", ")}.`,
    variantGroup: `${lessonId}:kanji-guided`,
    contentKey: `kanji:${item.literal}:recognition`,
    difficulty: 1,
    skill: "recognition",
    confusionItemIds: confusions
      .filter((candidate) => lessonKanji.some((item) => item.id === candidate.id))
      .map((candidate) => candidate.id),
  };
};

const createReadingExercise = (
  lessonId: string,
  item: KanjiItem,
  lessonKanji: readonly KanjiItem[],
  activeRecall: boolean,
): Exercise => {
  const example = item.examples[0];
  if (!example) {
    return createRecognitionExercise(lessonId, item, [item]);
  }
  const asksForWord = example.readingScope === "word";
  const correctReading = asksForWord ? example.reading : example.kanjiReading;
  const katakanaReading = hiraganaToKatakana(correctReading);
  const common = {
    id: `${lessonId}-kanji-${item.literal}-reading`,
    prompt: asksForWord
      ? `Как читается слово ${example.written}?`
      : `Как читается знак ${item.literal} в слове ${example.written}?`,
    targetItemIds: [item.id],
    correctAnswers: [correctReading],
    explanationRu: asksForWord
      ? `${example.written} читается ${example.reading} — ${example.meaningRu}.`
      : `В слове ${example.written} знак ${item.literal} читается ${example.kanjiReading}. Всё слово: ${example.reading} — ${example.meaningRu}.`,
    variantGroup: `${lessonId}:kanji-guided`,
    contentKey: `kanji:${item.literal}:reading`,
    difficulty: activeRecall ? 2 as const : 1 as const,
    skill: "reading" as const,
  };

  if (!activeRecall) {
    return {
      ...common,
      type: "multiple-choice",
      distractors: readingDistractors(item, lessonKanji),
    };
  }

  return {
    ...common,
    type: "text-input",
    acceptableAnswers:
      katakanaReading === correctReading ? undefined : [katakanaReading],
  };
};

export const maskKanjiInExample = (item: KanjiItem): string => {
  const written = item.examples[0]?.written ?? "";
  const index = written.indexOf(item.literal);
  if (index < 0) return "□";
  return `${written.slice(0, index)}□${written.slice(index + item.literal.length)}`;
};

export const createKanjiWritingExercise = (
  lessonId: string,
  item: KanjiItem,
): Exercise => {
  const example = item.examples[0];
  const contextualPrompt = example
    ? `Напиши пропущенный кандзи: ${maskKanjiInExample(item)}（${example.reading}）— ${example.meaningRu}.`
    : `Напиши по памяти кандзи со значением «${item.meaningsRu[0] ?? "заданное значение"}» в правильном порядке черт.`;
  return {
    id: `${lessonId}-kanji-${item.literal}-writing`,
    type: "handwriting",
    prompt: contextualPrompt,
    targetItemIds: [item.id],
    correctAnswers: [item.literal],
    explanationRu: example
      ? `${item.literal} в слове ${example.written}（${example.reading}）— ${example.meaningRu}. Порядок и форма штрихов проверяются автоматически.`
      : `${item.literal} — ${item.meaningsRu.join(", ")}. Порядок и форма штрихов проверяются автоматически.`,
    variantGroup: `${lessonId}:kanji-writing`,
    contentKey: `kanji:${item.literal}:writing`,
    difficulty: 2,
    skill: "writing",
  };
};

export const buildLessonKanjiExercises = (
  lessonId: string,
  lessonKanji: readonly KanjiItem[],
): Exercise[] => {
  const first = lessonKanji[0];
  if (!first) return [];

  const exercises: Exercise[] = [
    createRecognitionExercise(lessonId, first, lessonKanji),
    createReadingExercise(lessonId, first, lessonKanji, true),
  ];

  lessonKanji.slice(1).forEach((item, index) => {
    exercises.push(
      index % 2 === 0
        ? createReadingExercise(lessonId, item, lessonKanji, false)
        : createRecognitionExercise(lessonId, item, lessonKanji),
    );
  });
  return exercises;
};

export const buildKanjiReviewExercises = (
  lessonId: string,
  lessonKanji: readonly KanjiItem[],
): Exercise[] =>
  lessonKanji.flatMap((item) => [
    createRecognitionExercise(lessonId, item, lessonKanji),
    createReadingExercise(lessonId, item, lessonKanji, true),
    createKanjiWritingExercise(lessonId, item),
  ]);

const mergeExercisePools = (
  ...exercisePools: readonly (readonly Exercise[])[]
): Exercise[] => {
  const byId = new Map<string, Exercise>();
  exercisePools.flat().forEach((exercise) => {
    if (!byId.has(exercise.id)) byId.set(exercise.id, exercise);
  });
  return [...byId.values()];
};

export const integrateKanjiCurriculum = (
  bundle: LessonBundle,
  lessonKanji: readonly KanjiItem[] = getLessonKanji(bundle),
): LessonBundle => {
  if (lessonKanji.length === 0) {
    return {
      ...bundle,
      kanji: [],
      reviewExercises: bundle.reviewExercises ?? bundle.exercises,
    };
  }

  const exercises = bundle.exercises.map((exercise) => ({ ...exercise }));
  const originalExercises = bundle.reviewExercises ?? exercises;
  const kanjiReviewExercises = buildKanjiReviewExercises(
    bundle.lesson.id,
    lessonKanji,
  );
  const reviewExercises = mergeExercisePools(
    exercises,
    originalExercises,
    kanjiReviewExercises,
  );
  const itemIds = unique([
    ...bundle.vocabulary.map((item) => item.id),
    ...lessonKanji.map((item) => item.id),
    ...bundle.grammar.map((item) => item.id),
    ...bundle.sentences.map((item) => item.id),
  ]);

  return {
    ...bundle,
    kanji: [...lessonKanji],
    lesson: {
      ...bundle.lesson,
      itemIds,
      exerciseIds: exercises.map((exercise) => exercise.id),
    },
    exercises,
    reviewExercises,
  };
};

/**
 * A glyph is introduced exactly once: in the first lesson whose vocabulary,
 * examples or practice actually uses it. Later lessons reuse its existing SRS
 * knowledge instead of forcing another fake "new" cycle.
 */
export const integrateKanjiCurriculumSequence = (
  bundles: readonly LessonBundle[],
): LessonBundle[] => {
  const introduced = new Set<string>();
  return bundles.map((bundle) => {
    const lessonKanji = getLessonKanji(bundle, introduced);
    lessonKanji.forEach((item) => introduced.add(item.literal));
    return integrateKanjiCurriculum(bundle, lessonKanji);
  });
};
