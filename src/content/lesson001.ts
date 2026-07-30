import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";

export const lesson001Vocabulary: VocabularyItem[] = [
  {
    id: "word-watashi",
    type: "vocabulary",
    writtenForm: "私",
    reading: "わたし",
    meaningsRu: ["я"],
    partOfSpeech: ["местоимение"],
    jlptLevel: "N5",
  },
  {
    id: "word-gakusei",
    type: "vocabulary",
    writtenForm: "学生",
    reading: "がくせい",
    meaningsRu: ["студент", "учащийся"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-sensei",
    type: "vocabulary",
    writtenForm: "先生",
    reading: "せんせい",
    meaningsRu: ["учитель", "преподаватель"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
];

export const lesson001Grammar: GrammarPoint[] = [
  {
    id: "grammar-wa-topic",
    type: "grammar",
    title: "Частица は",
    meaningRu: "отмечает тему высказывания",
    explanationRu:
      "Частица は показывает, о ком или о чём дальше говорится. В роли частицы она пишется は, но произносится わ.",
    formation: ["[тема] は [сообщение]"],
    cautions: ["Не путать с обычным чтением は как «ха»."],
    jlptLevel: "N5",
  },
  {
    id: "grammar-desu",
    type: "grammar",
    title: "Связка です",
    meaningRu: "вежливо завершает именное предложение",
    explanationRu:
      "です ставится после существительного или прилагательного и делает высказывание вежливым. В русском отдельное слово часто не переводится.",
    formation: ["[существительное] です"],
    jlptLevel: "N5",
  },
];

export const lesson001Sentences: ExampleSentence[] = [
  {
    id: "sentence-watashi-gakusei",
    type: "sentence",
    japanese: "私は学生です。",
    reading: "わたしはがくせいです。",
    translationRu: "Я студент.",
    grammarIds: ["grammar-wa-topic", "grammar-desu"],
    vocabularyIds: ["word-watashi", "word-gakusei"],
  },
  {
    id: "sentence-watashi-sensei",
    type: "sentence",
    japanese: "私は先生です。",
    reading: "わたしはせんせいです。",
    translationRu: "Я преподаватель.",
    grammarIds: ["grammar-wa-topic", "grammar-desu"],
    vocabularyIds: ["word-watashi", "word-sensei"],
  },
];

export const lesson001Exercises: Exercise[] = [
  {
    id: "exercise-wa-choice",
    type: "multiple-choice",
    prompt: "Какая частица отмечает тему высказывания?",
    targetItemIds: ["grammar-wa-topic"],
    correctAnswers: ["は"],
    distractors: ["を", "に", "で"],
    explanationRu: "Частица は отмечает тему и произносится わ.",
  },
  {
    id: "exercise-gakusei-input",
    type: "text-input",
    prompt: "Напиши по-японски: Я студент.",
    targetItemIds: [
      "grammar-wa-topic",
      "grammar-desu",
      "word-watashi",
      "word-gakusei",
    ],
    correctAnswers: ["私は学生です", "私は学生です。"],
    acceptableAnswers: ["わたしはがくせいです", "わたしはがくせいです。"],
    explanationRu: "Тема 私 отмечается частицей は, а предложение завершается です.",
  },
  {
    id: "exercise-build-sentence",
    type: "sentence-builder",
    prompt: "Собери предложение: Я преподаватель.",
    targetItemIds: [
      "grammar-wa-topic",
      "grammar-desu",
      "word-watashi",
      "word-sensei",
    ],
    correctAnswers: ["私|は|先生|です"],
    distractors: ["を", "学生"],
  },
];

export const lesson001: Lesson = {
  id: "lesson-001",
  unitId: "unit-001",
  order: 1,
  title: "Я — студент",
  description: "Первое японское предложение: тема с は и вежливая связка です.",
  theory: [
    lesson001Grammar[0].explanationRu,
    lesson001Grammar[1].explanationRu,
  ],
  itemIds: [
    ...lesson001Vocabulary.map((item) => item.id),
    ...lesson001Grammar.map((item) => item.id),
    ...lesson001Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson001Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 12,
};
