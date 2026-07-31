import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson004Vocabulary: VocabularyItem[] = [
  {
    id: "word-koko",
    type: "vocabulary",
    writtenForm: "ここ",
    reading: "ここ",
    meaningsRu: ["здесь", "это место рядом с говорящим"],
    partOfSpeech: ["указательное слово"],
    jlptLevel: "N5",
  },
  {
    id: "word-soko",
    type: "vocabulary",
    writtenForm: "そこ",
    reading: "そこ",
    meaningsRu: ["там, рядом с собеседником", "ранее упомянутое место"],
    partOfSpeech: ["указательное слово"],
    jlptLevel: "N5",
  },
  {
    id: "word-gakkou",
    type: "vocabulary",
    writtenForm: "学校",
    reading: "がっこう",
    meaningsRu: ["школа"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-neko",
    type: "vocabulary",
    writtenForm: "猫",
    reading: "ねこ",
    meaningsRu: ["кошка"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
];

export const lesson004Grammar: GrammarPoint[] = [
  {
    id: "grammar-arimasu-imasu",
    type: "grammar",
    title: "あります и います",
    meaningRu: "есть, находится",
    explanationRu:
      "あります используется для неодушевлённых предметов, растений и явлений. います — для людей и животных.",
    formation: ["[место] に [предмет] が あります", "[место] に [человек/животное] が います"],
    cautions: ["Для кошки, собаки или человека выбирай います, а не あります."],
    jlptLevel: "N5",
  },
  {
    id: "grammar-ni-location",
    type: "grammar",
    title: "Частица に: место существования",
    meaningRu: "указывает, где кто-то или что-то находится",
    explanationRu:
      "Перед あります／います частица に отмечает место существования: そこに猫がいます — «Рядом с вами есть кошка».",
    formation: ["[место] に [кто/что] が あります／います"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-ga-existence",
    type: "grammar",
    title: "Частица が в предложении существования",
    meaningRu: "отмечает того или то, что существует",
    explanationRu:
      "В конструкции с あります／います частица が ставится после предмета, человека или животного, чьё наличие сообщается: 猫がいます — «есть кошка».",
    formation: ["[кто/что] が あります／います"],
    cautions: ["に отмечает место, а が — того или то, что там находится."],
    jlptLevel: "N5",
  },
];

export const lesson004Sentences: ExampleSentence[] = [
  {
    id: "sentence-koko-gakkou",
    type: "sentence",
    japanese: "ここは学校です。",
    reading: "ここはがっこうです。",
    translationRu: "Это место — школа.",
    grammarIds: ["grammar-wa-topic", "grammar-desu"],
    vocabularyIds: ["word-koko", "word-gakkou"],
  },
  {
    id: "sentence-soko-neko-imasu",
    type: "sentence",
    japanese: "そこに猫がいます。",
    reading: "そこにねこがいます。",
    translationRu: "Рядом с вами есть кошка.",
    grammarIds: ["grammar-arimasu-imasu", "grammar-ni-location", "grammar-ga-existence"],
    vocabularyIds: ["word-soko", "word-neko"],
  },
  {
    id: "sentence-soko-hon-arimasu",
    type: "sentence",
    japanese: "そこに本があります。",
    reading: "そこにほんがあります。",
    translationRu: "Рядом с вами есть книга.",
    grammarIds: ["grammar-arimasu-imasu", "grammar-ni-location", "grammar-ga-existence"],
    vocabularyIds: ["word-soko", "word-hon"],
  },
];

export const lesson004Exercises: Exercise[] = [
  {
    id: "exercise-imasu-choice",
    type: "multiple-choice",
    prompt: "Выбери глагол для кошки: そこに猫が __。",
    targetItemIds: ["grammar-arimasu-imasu", "word-neko"],
    correctAnswers: ["います"],
    distractors: ["あります", "です", "食べます"],
    explanationRu: "Животные считаются одушевлёнными, поэтому используется います.",
  },
  {
    id: "exercise-neko-location-builder",
    type: "sentence-builder",
    prompt: "Место рядом с собеседником. Собери: Там есть кошка.",
    targetItemIds: ["grammar-arimasu-imasu", "grammar-ni-location", "grammar-ga-existence", "word-neko"],
    correctAnswers: ["そこ|に|猫|が|います"],
    distractors: ["は", "あります"],
    explanationRu:
      "Место рядом с собеседником обозначается そこ и отмечается に. Кошка отмечается が, для животного используется います.",
  },
  {
    id: "exercise-gakkou-input",
    type: "text-input",
    prompt: "Напиши по-японски: Это место — школа.",
    targetItemIds: ["word-koko", "word-gakkou", "grammar-wa-topic"],
    correctAnswers: ["ここは学校です", "ここは学校です。"],
    acceptableAnswers: [
      "ここはがっこうです",
      "ここはがっこうです。",
      "これは学校です",
      "これは学校です。",
      "これはがっこうです",
      "これはがっこうです。",
    ],
    explanationRu:
      "Если «это» указывает на место, целевая форма — ここは学校です. Если имеется в виду конкретное здание или объект, これは学校です тоже естественно и принимается. «Здесь есть школа» строится иначе: ここに学校があります.",
  },
];

export const lesson004: Lesson = {
  id: "lesson-004",
  unitId: "unit-002",
  order: 4,
  title: "Здесь школа, там кошка",
  description: "Местоположение с ここ／そこ, частицами に／が и глаголами あります／います.",
  theory: lesson004Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson004Vocabulary.map((item) => item.id),
    ...lesson004Grammar.map((item) => item.id),
    ...lesson004Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson004Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 17,
};

export const lesson004Bundle: LessonBundle = {
  lesson: lesson004,
  vocabulary: lesson004Vocabulary,
  grammar: lesson004Grammar,
  sentences: lesson004Sentences,
  exercises: lesson004Exercises,
  outcomes: [
    "говорить «здесь» и «там» с учётом положения собеседника",
    "различать あります и います",
    "указывать место существования частицей に",
    "отмечать существующий предмет или живое существо частицей が",
  ],
};