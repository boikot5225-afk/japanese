import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson014Vocabulary: VocabularyItem[] = [
  {
    id: "word-nigiyaka-na",
    type: "vocabulary",
    writtenForm: "にぎやか",
    reading: "にぎやか",
    meaningsRu: ["оживлённый", "шумный"],
    partOfSpeech: ["な-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-hima-na",
    type: "vocabulary",
    writtenForm: "暇",
    reading: "ひま",
    meaningsRu: ["свободный", "незанятый", "свободное время"],
    partOfSpeech: ["な-прилагательное", "существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-shinsetsu-na",
    type: "vocabulary",
    writtenForm: "親切",
    reading: "しんせつ",
    meaningsRu: ["добрый", "любезный", "отзывчивый"],
    partOfSpeech: ["な-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-kantan-na",
    type: "vocabulary",
    writtenForm: "簡単",
    reading: "かんたん",
    meaningsRu: ["простой", "лёгкий"],
    partOfSpeech: ["な-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-tesuto",
    type: "vocabulary",
    writtenForm: "テスト",
    reading: "テスト",
    meaningsRu: ["тест", "контрольная работа"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
];

export const lesson014Grammar: GrammarPoint[] = [
  {
    id: "grammar-na-adjective-past",
    type: "grammar",
    title: "Прошедшее な-прилагательных ～でした",
    meaningRu: "описывает качество или состояние в прошлом",
    explanationRu:
      "な-прилагательные образуют прошедшее время так же, как существительные: 静かです → 静かでした, 元気です → 元気でした. Частица な в конце предложения не появляется.",
    formation: ["静かです → 静かでした", "元気です → 元気でした"],
    cautions: [
      "静かなでした — неверно: な используется только перед существительным.",
      "Не применяй модель ～かったです: она относится к い-прилагательным."
    ],
    relatedGrammarIds: ["grammar-na-adjective-predicate", "grammar-desu-past"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-na-adjective-past-negative",
    type: "grammar",
    title: "Прошедшее отрицание ～ではありませんでした",
    meaningRu: "означает «не был таким / не находился в таком состоянии»",
    explanationRu:
      "Прошедшее отрицание な-прилагательных строится по именной модели: 便利です → 便利ではありませんでした. Разговорный вежливый вариант — 便利じゃありませんでした.",
    formation: [
      "便利です → 便利ではありませんでした",
      "元気です → 元気じゃありませんでした"
    ],
    cautions: [
      "便利くなかったです — неверно: ～くなかったです относится к い-прилагательным.",
      "Полная форма ではありませんでした заканчивается на でした."
    ],
    relatedGrammarIds: [
      "grammar-na-adjective-negative",
      "grammar-desu-past-negative"
    ],
    jlptLevel: "N5",
  },
];

export const lesson014Sentences: ExampleSentence[] = [
  {
    id: "sentence-kinou-machi-shizuka-deshita",
    type: "sentence",
    japanese: "昨日、町は静かでした。",
    reading: "きのう、まちはしずかでした。",
    translationRu: "Вчера город был тихим.",
    grammarIds: ["grammar-wa-topic", "grammar-na-adjective-past"],
    vocabularyIds: ["word-kinou", "word-machi", "word-shizuka-na"],
  },
  {
    id: "sentence-kouen-nigiyaka-deshita",
    type: "sentence",
    japanese: "公園はにぎやかでした。",
    reading: "こうえんはにぎやかでした。",
    translationRu: "Парк был оживлённым.",
    grammarIds: ["grammar-wa-topic", "grammar-na-adjective-past"],
    vocabularyIds: ["word-kouen", "word-nigiyaka-na"],
  },
  {
    id: "sentence-tanaka-genki-dewa-arimasen-deshita",
    type: "sentence",
    japanese: "田中さんは元気ではありませんでした。",
    reading: "たなかさんはげんきではありませんでした。",
    translationRu: "Танака был не в форме.",
    grammarIds: ["grammar-wa-topic", "grammar-na-adjective-past-negative"],
    vocabularyIds: ["word-tanaka-san", "word-genki-na"],
  },
  {
    id: "sentence-tesuto-kantan-dewa-arimasen-deshita",
    type: "sentence",
    japanese: "テストは簡単ではありませんでした。",
    reading: "テストはかんたんではありませんでした。",
    translationRu: "Тест не был лёгким.",
    grammarIds: ["grammar-wa-topic", "grammar-na-adjective-past-negative"],
    vocabularyIds: ["word-tesuto", "word-kantan-na"],
  },
];

export const lesson014Exercises: Exercise[] = [
  {
    id: "exercise-shizuka-past-choice",
    type: "multiple-choice",
    prompt: "Поставь 静かです в прошедшее время.",
    targetItemIds: ["grammar-na-adjective-past", "word-shizuka-na"],
    correctAnswers: ["静かでした"],
    distractors: ["静かったです", "静かなでした", "静かではありません"],
    explanationRu: "な-прилагательное использует именную прошедшую форму: 静かでした.",
  },
  {
    id: "exercise-benri-past-negative-choice",
    type: "multiple-choice",
    prompt: "Какая форма означает «не был удобным»?",
    targetItemIds: ["grammar-na-adjective-past-negative", "word-benri-na"],
    correctAnswers: ["便利ではありませんでした"],
    acceptableAnswers: ["便利じゃありませんでした"],
    distractors: ["便利くなかったです", "便利ではありません", "便利でした"],
    explanationRu: "Прошедшее отрицание な-прилагательного — ではありませんでした.",
  },
  {
    id: "exercise-kouen-nigiyaka-builder",
    type: "sentence-builder",
    prompt: "Собери: Парк был оживлённым.",
    targetItemIds: ["grammar-wa-topic", "grammar-na-adjective-past", "word-kouen", "word-nigiyaka-na"],
    correctAnswers: ["公園|は|にぎやか|でした"],
    distractors: ["な", "かったです", "で"],
    explanationRu: "В конце прошедшего предложения используется にぎやかでした.",
  },
  {
    id: "exercise-kinou-machi-shizuka-input",
    type: "text-input",
    prompt: "Напиши по-японски: Вчера город был тихим.",
    targetItemIds: ["grammar-na-adjective-past", "word-kinou", "word-machi", "word-shizuka-na"],
    correctAnswers: ["昨日、町は静かでした", "昨日、町は静かでした。", "昨日町は静かでした", "昨日町は静かでした。"],
    acceptableAnswers: ["きのう、まちはしずかでした", "きのう、まちはしずかでした。", "きのうまちはしずかでした", "きのうまちはしずかでした。"],
    explanationRu: "静かです в прошлом становится 静かでした.",
  },
  {
    id: "exercise-tanaka-genki-past-negative-input",
    type: "text-input",
    prompt: "Напиши по-японски: Танака был не в форме.",
    targetItemIds: ["grammar-na-adjective-past-negative", "word-tanaka-san", "word-genki-na"],
    correctAnswers: [
      "田中さんは元気ではありませんでした",
      "田中さんは元気ではありませんでした。"
    ],
    acceptableAnswers: [
      "田中さんは元気じゃありませんでした",
      "田中さんは元気じゃありませんでした。",
      "たなかさんはげんきではありませんでした",
      "たなかさんはげんきではありませんでした。"
    ],
    explanationRu: "元気 — な-прилагательное, поэтому используется 元気ではありませんでした.",
  },
  {
    id: "exercise-tesuto-kantan-past-negative-input",
    type: "text-input",
    prompt: "Напиши по-японски: Тест не был лёгким.",
    targetItemIds: ["grammar-na-adjective-past-negative", "word-tesuto", "word-kantan-na"],
    correctAnswers: ["テストは簡単ではありませんでした", "テストは簡単ではありませんでした。"],
    acceptableAnswers: [
      "テストは簡単じゃありませんでした",
      "テストは簡単じゃありませんでした。",
      "テストはかんたんではありませんでした",
      "テストはかんたんではありませんでした。"
    ],
    explanationRu: "簡単です → 簡単ではありませんでした.",
  },
  {
    id: "exercise-hima-past-choice",
    type: "multiple-choice",
    prompt: "Как правильно сказать «был свободен»?",
    targetItemIds: ["grammar-na-adjective-past", "word-hima-na"],
    correctAnswers: ["暇でした"],
    distractors: ["暇かったです", "暇なでした", "暇くなかったです"],
    explanationRu: "暇 — な-прилагательное: 暇でした.",
  },
  {
    id: "exercise-shinsetsu-reading-input",
    type: "text-input",
    prompt: "Напиши хираганой чтение слова 親切.",
    targetItemIds: ["word-shinsetsu-na"],
    correctAnswers: ["しんせつ"],
    explanationRu: "親切 читается しんせつ.",
  },
];

export const lesson014: Lesson = {
  id: "lesson-014",
  unitId: "unit-005",
  order: 14,
  title: "Город был тихим",
  description: "Прошедшие утвердительные и отрицательные формы な-прилагательных.",
  theory: lesson014Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson014Vocabulary.map((item) => item.id),
    ...lesson014Grammar.map((item) => item.id),
    ...lesson014Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson014Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 21,
};

export const lesson014Bundle: LessonBundle = {
  lesson: lesson014,
  vocabulary: lesson014Vocabulary,
  grammar: lesson014Grammar,
  sentences: lesson014Sentences,
  exercises: lesson014Exercises,
  outcomes: [
    "ставить な-прилагательные в прошедшую форму ～でした",
    "строить прошедшее отрицание ～ではありませんでした",
    "не добавлять な в конце предложения",
    "не смешивать именную модель な-прилагательных с формами ～かった／～くなかった",
  ],
};
