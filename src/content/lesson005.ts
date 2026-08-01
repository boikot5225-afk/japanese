import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson005Vocabulary: VocabularyItem[] = [
  {
    id: "word-pan",
    type: "vocabulary",
    writtenForm: "パン",
    reading: "パン",
    meaningsRu: ["хлеб"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-mizu",
    type: "vocabulary",
    writtenForm: "水",
    reading: "みず",
    meaningsRu: ["вода"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-tabemasu",
    type: "vocabulary",
    writtenForm: "食べます",
    reading: "たべます",
    meaningsRu: ["есть"],
    partOfSpeech: ["глагол", "вежливая форма"],
    jlptLevel: "N5",
  },
  {
    id: "word-nomimasu",
    type: "vocabulary",
    writtenForm: "飲みます",
    reading: "のみます",
    meaningsRu: ["пить"],
    partOfSpeech: ["глагол", "вежливая форма"],
    jlptLevel: "N5",
  },
];

export const lesson005Grammar: GrammarPoint[] = [
  {
    id: "grammar-o-object",
    type: "grammar",
    title: "Частица を",
    meaningRu: "отмечает прямой объект действия",
    explanationRu:
      "Частица を ставится после того, на что непосредственно направлено действие: パンを食べます — «ем хлеб».",
    formation: ["[объект] を [глагол]"],
    cautions: ["Частица пишется を, но в современной речи произносится как お."],
    jlptLevel: "N5",
  },
  {
    id: "grammar-masu-polite",
    type: "grammar",
    title: "Вежливая форма ～ます",
    meaningRu: "нейтрально-вежливое настоящее, привычное или будущее действие",
    explanationRu:
      "Форма ～ます используется в вежливой речи. В зависимости от контекста 食べます может означать «ем обычно» или «буду есть», но не обязательно «ем прямо сейчас».",
    formation: ["食べる → 食べます", "飲む → 飲みます"],
    cautions: [
      "Пока запоминай 食べます и 飲みます как готовые формы. Общего правила спряжения ещё недостаточно: оно зависит от группы глагола.",
    ],
    jlptLevel: "N5",
  },
];

export const lesson005Sentences: ExampleSentence[] = [
  {
    id: "sentence-pan-tabemasu",
    type: "sentence",
    japanese: "私はパンを食べます。",
    reading: "わたしはパンをたべます。",
    translationRu: "Я ем хлеб.",
    grammarIds: ["grammar-wa-topic", "grammar-o-object", "grammar-masu-polite"],
    vocabularyIds: ["word-watashi", "word-pan", "word-tabemasu"],
  },
  {
    id: "sentence-mizu-nomimasu",
    type: "sentence",
    japanese: "私は水を飲みます。",
    reading: "わたしはみずをのみます。",
    translationRu: "Я пью воду.",
    grammarIds: ["grammar-wa-topic", "grammar-o-object", "grammar-masu-polite"],
    vocabularyIds: ["word-watashi", "word-mizu", "word-nomimasu"],
  },
];

export const lesson005Exercises: Exercise[] = [
  {
    id: "exercise-o-choice",
    type: "multiple-choice",
    prompt: "Выбери частицу: パン __ 食べます。",
    targetItemIds: ["grammar-o-object", "word-pan", "word-tabemasu"],
    correctAnswers: ["を"],
    distractors: ["は", "に", "で"],
    explanationRu: "Хлеб — прямой объект действия «есть», поэтому используется を.",
  },
  {
    id: "exercise-mizu-builder",
    type: "sentence-builder",
    prompt: "Собери полную фразу: Я пью воду.",
    targetItemIds: ["grammar-o-object", "word-mizu", "word-nomimasu"],
    correctAnswers: ["私|は|水|を|飲みます"],
    distractors: ["食べます", "に"],
    explanationRu:
      "В полной учебной фразе тема отмечается は, вода как объект — を, затем ставится глагол. В разговоре понятное 私は можно опустить.",
  },
  {
    id: "exercise-pan-input",
    type: "text-input",
    prompt: "Напиши по-японски: Я ем хлеб (как обычное действие).",
    targetItemIds: ["grammar-o-object", "grammar-masu-polite", "word-pan", "word-tabemasu"],
    correctAnswers: ["私はパンを食べます", "私はパンを食べます。"],
    acceptableAnswers: [
      "わたしはパンをたべます",
      "わたしはパンをたべます。",
      "パンを食べます",
      "パンを食べます。",
      "パンをたべます",
      "パンをたべます。",
    ],
    explanationRu:
      "パン отмечается частицей を, действие выражается формой 食べます. Если тема понятна, 私は естественно опустить.",
  },
];

export const lesson005: Lesson = {
  id: "lesson-005",
  unitId: "unit-002",
  order: 5,
  title: "Я пью воду",
  description: "Прямой объект с を и первые вежливые глаголы в форме ～ます.",
  theory: lesson005Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson005Vocabulary.map((item) => item.id),
    ...lesson005Grammar.map((item) => item.id),
    ...lesson005Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson005Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 16,
};

export const lesson005Bundle: LessonBundle = {
  lesson: lesson005,
  vocabulary: lesson005Vocabulary,
  grammar: lesson005Grammar,
  sentences: lesson005Sentences,
  exercises: lesson005Exercises,
  outcomes: [
    "отмечать прямой объект частицей を",
    "строить простые предложения с глаголом",
    "использовать 食べます и 飲みます",
    "понимать, что ～ます не означает действие только прямо сейчас",
  ],
};