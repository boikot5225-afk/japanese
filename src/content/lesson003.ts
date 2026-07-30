import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson003Vocabulary: VocabularyItem[] = [
  {
    id: "word-hai",
    type: "vocabulary",
    writtenForm: "はい",
    reading: "はい",
    meaningsRu: ["да"],
    partOfSpeech: ["ответная реплика"],
    jlptLevel: "N5",
  },
  {
    id: "word-iie",
    type: "vocabulary",
    writtenForm: "いいえ",
    reading: "いいえ",
    meaningsRu: ["нет"],
    partOfSpeech: ["ответная реплика"],
    jlptLevel: "N5",
  },
  {
    id: "word-kaishain",
    type: "vocabulary",
    writtenForm: "会社員",
    reading: "かいしゃいん",
    meaningsRu: ["сотрудник компании"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
];

export const lesson003Grammar: GrammarPoint[] = [
  {
    id: "grammar-ka-question",
    type: "grammar",
    title: "Вопросительная частица か",
    meaningRu: "превращает вежливое предложение в вопрос",
    explanationRu:
      "Частица か ставится в самом конце вежливого предложения. Порядок слов не меняется. Если из ситуации понятно, о ком спрашивают, тему обычно опускают: 会社員ですか — «Вы сотрудник компании?»",
    formation: ["[предложение] です か", "[предложение] ます か"],
    cautions: [
      "После か в обычном японском тексте вопросительный знак необязателен.",
      "Не вставляй あなた механически: имя, обращение или нулевая тема часто звучат естественнее.",
    ],
    jlptLevel: "N5",
  },
  {
    id: "grammar-mo-also",
    type: "grammar",
    title: "Частица も",
    meaningRu: "тоже, также",
    explanationRu:
      "Частица も заменяет は, когда к новой теме относится то же сообщение: 私も学生です — «Я тоже студент».",
    formation: ["[тема] も [сообщение]"],
    cautions: ["Не ставь は и も одновременно после одной темы."],
    jlptLevel: "N5",
  },
];

export const lesson003Sentences: ExampleSentence[] = [
  {
    id: "sentence-kaishain-question",
    type: "sentence",
    japanese: "会社員ですか。",
    reading: "かいしゃいんですか。",
    translationRu: "Вы сотрудник компании?",
    grammarIds: ["grammar-desu", "grammar-ka-question"],
    vocabularyIds: ["word-kaishain"],
  },
  {
    id: "sentence-hai-kaishain",
    type: "sentence",
    japanese: "はい、会社員です。",
    reading: "はい、かいしゃいんです。",
    translationRu: "Да, я сотрудник компании.",
    grammarIds: ["grammar-desu"],
    vocabularyIds: ["word-hai", "word-kaishain"],
  },
  {
    id: "sentence-iie-gakusei",
    type: "sentence",
    japanese: "いいえ、学生です。",
    reading: "いいえ、がくせいです。",
    translationRu: "Нет, я студент.",
    grammarIds: ["grammar-desu"],
    vocabularyIds: ["word-iie", "word-gakusei"],
  },
  {
    id: "sentence-watashi-mo-gakusei",
    type: "sentence",
    japanese: "私も学生です。",
    reading: "わたしもがくせいです。",
    translationRu: "Я тоже студент.",
    grammarIds: ["grammar-mo-also", "grammar-desu"],
    vocabularyIds: ["word-watashi", "word-gakusei"],
  },
];

export const lesson003Exercises: Exercise[] = [
  {
    id: "exercise-ka-question-choice",
    type: "multiple-choice",
    prompt: "Какой частицей заканчивается вежливый вопрос?",
    targetItemIds: ["grammar-ka-question"],
    correctAnswers: ["か"],
    distractors: ["は", "も", "の"],
    explanationRu: "か ставится в конце и превращает утверждение в вопрос.",
  },
  {
    id: "exercise-mo-builder",
    type: "sentence-builder",
    prompt: "Собери предложение: Я тоже студент.",
    targetItemIds: ["grammar-mo-also", "word-watashi", "word-gakusei"],
    correctAnswers: ["私|も|学生|です"],
    distractors: ["は", "か"],
    explanationRu: "も заменяет は и передаёт значение «тоже».",
  },
  {
    id: "exercise-kaishain-question-input",
    type: "text-input",
    prompt: "Напиши по-японски: Вы сотрудник компании?",
    targetItemIds: ["grammar-ka-question", "word-kaishain"],
    correctAnswers: ["会社員ですか", "会社員ですか。"],
    acceptableAnswers: [
      "かいしゃいんですか",
      "かいしゃいんですか。",
      "あなたは会社員ですか",
      "あなたは会社員ですか。",
      "あなたはかいしゃいんですか",
      "あなたはかいしゃいんですか。",
    ],
    explanationRu:
      "Вопрос 会社員ですか естественен без местоимения: собеседник понятен из ситуации. あなたは会社員ですか грамматически возможно, но не нужно вставлять あなた автоматически.",
  },
];

export const lesson003: Lesson = {
  id: "lesson-003",
  unitId: "unit-001",
  order: 3,
  title: "Вопросы и «тоже»",
  description: "Вежливые вопросы с か, ответы はい／いいえ и значение «тоже» с も.",
  theory: lesson003Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson003Vocabulary.map((item) => item.id),
    ...lesson003Grammar.map((item) => item.id),
    ...lesson003Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson003Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 15,
};

export const lesson003Bundle: LessonBundle = {
  lesson: lesson003,
  vocabulary: lesson003Vocabulary,
  grammar: lesson003Grammar,
  sentences: lesson003Sentences,
  exercises: lesson003Exercises,
  outcomes: [
    "задавать простые вежливые вопросы с か",
    "отвечать はい и いいえ",
    "говорить «я тоже» с частицей も",
    "не злоупотреблять местоимением あなた",
  ],
};