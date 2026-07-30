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
    id: "word-anata",
    type: "vocabulary",
    writtenForm: "あなた",
    reading: "あなた",
    meaningsRu: ["вы", "ты"],
    partOfSpeech: ["местоимение"],
    jlptLevel: "N5",
  },
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
    meaningsRu: ["служащий компании"],
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
      "Частица か ставится в самом конце вежливого предложения. Порядок слов не меняется: добавляется только か.",
    formation: ["[предложение] です か", "[предложение] ます か"],
    cautions: ["После か в обычном японском тексте вопросительный знак необязателен."],
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
    id: "sentence-anata-kaishain-question",
    type: "sentence",
    japanese: "あなたは会社員ですか。",
    reading: "あなたはかいしゃいんですか。",
    translationRu: "Вы служащий компании?",
    grammarIds: ["grammar-wa-topic", "grammar-desu", "grammar-ka-question"],
    vocabularyIds: ["word-anata", "word-kaishain"],
  },
  {
    id: "sentence-hai-kaishain",
    type: "sentence",
    japanese: "はい、会社員です。",
    reading: "はい、かいしゃいんです。",
    translationRu: "Да, я служащий компании.",
    grammarIds: ["grammar-desu"],
    vocabularyIds: ["word-hai", "word-kaishain"],
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
    prompt: "Напиши по-японски: Вы служащий компании?",
    targetItemIds: ["grammar-ka-question", "word-anata", "word-kaishain"],
    correctAnswers: ["あなたは会社員ですか", "あなたは会社員ですか。"],
    acceptableAnswers: ["あなたはかいしゃいんですか", "あなたはかいしゃいんですか。"],
    explanationRu: "Сохраняем обычный порядок слов и добавляем か после です.",
  },
];

export const lesson003: Lesson = {
  id: "lesson-003",
  unitId: "unit-001",
  order: 3,
  title: "Вы студент?",
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
  ],
};
