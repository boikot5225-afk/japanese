import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson002Vocabulary: VocabularyItem[] = [
  {
    id: "word-kore",
    type: "vocabulary",
    writtenForm: "これ",
    reading: "これ",
    meaningsRu: ["это", "эта вещь рядом с говорящим"],
    partOfSpeech: ["местоимение"],
    jlptLevel: "N5",
  },
  {
    id: "word-sore",
    type: "vocabulary",
    writtenForm: "それ",
    reading: "それ",
    meaningsRu: ["то", "эта вещь рядом с собеседником"],
    partOfSpeech: ["местоимение"],
    jlptLevel: "N5",
  },
  {
    id: "word-hon",
    type: "vocabulary",
    writtenForm: "本",
    reading: "ほん",
    meaningsRu: ["книга"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-nihongo",
    type: "vocabulary",
    writtenForm: "日本語",
    reading: "にほんご",
    meaningsRu: ["японский язык"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
];

export const lesson002Grammar: GrammarPoint[] = [
  {
    id: "grammar-no-link",
    type: "grammar",
    title: "Частица の",
    meaningRu: "связывает два существительных",
    explanationRu:
      "Частица の ставится между существительными. Первое слово уточняет второе: принадлежность, происхождение, назначение или вид.",
    formation: ["[уточнение] の [главное существительное]"],
    cautions: ["Главным обычно является слово после の."],
    jlptLevel: "N5",
  },
  {
    id: "grammar-kore-sore",
    type: "grammar",
    title: "これ и それ",
    meaningRu: "указательные местоимения для предметов рядом с говорящим или собеседником",
    explanationRu:
      "これ указывает на вещь рядом с говорящим. それ — на вещь рядом с собеседником или уже упомянутую вещь. Русское «это» само по себе такого различия не передаёт, поэтому в заданиях всегда будет указан контекст.",
    formation: ["これは…です", "それは…です"],
    jlptLevel: "N5",
  },
];

export const lesson002Sentences: ExampleSentence[] = [
  {
    id: "sentence-kore-watashi-hon",
    type: "sentence",
    japanese: "これは私の本です。",
    reading: "これはわたしのほんです。",
    translationRu: "Это рядом со мной — моя книга.",
    grammarIds: ["grammar-wa-topic", "grammar-desu", "grammar-no-link", "grammar-kore-sore"],
    vocabularyIds: ["word-kore", "word-watashi", "word-hon"],
  },
  {
    id: "sentence-sore-nihongo-hon",
    type: "sentence",
    japanese: "それは日本語の本です。",
    reading: "それはにほんごのほんです。",
    translationRu: "То, что рядом с вами, — книга на японском языке.",
    grammarIds: ["grammar-wa-topic", "grammar-desu", "grammar-no-link", "grammar-kore-sore"],
    vocabularyIds: ["word-sore", "word-nihongo", "word-hon"],
  },
];

export const lesson002Exercises: Exercise[] = [
  {
    id: "exercise-no-choice",
    type: "multiple-choice",
    prompt: "Какая частица связывает два существительных: 私 __ 本?",
    targetItemIds: ["grammar-no-link"],
    correctAnswers: ["の"],
    distractors: ["は", "を", "に"],
    explanationRu: "私の本 означает «моя книга»: 私 уточняет слово 本.",
  },
  {
    id: "exercise-kore-builder",
    type: "sentence-builder",
    prompt: "Предмет находится рядом с говорящим. Собери: Это моя книга.",
    targetItemIds: ["grammar-no-link", "grammar-kore-sore", "word-kore", "word-hon"],
    correctAnswers: ["これ|は|私|の|本|です"],
    distractors: ["それ", "を"],
    explanationRu: "Предмет рядом с говорящим обозначается これ. 私の уточняет слово 本.",
  },
  {
    id: "exercise-sore-input",
    type: "text-input",
    prompt:
      "Предмет находится рядом с собеседником. Напиши по-японски: Это книга на японском языке.",
    targetItemIds: ["grammar-no-link", "grammar-kore-sore", "word-sore", "word-nihongo", "word-hon"],
    correctAnswers: ["それは日本語の本です", "それは日本語の本です。"],
    acceptableAnswers: ["それはにほんごのほんです", "それはにほんごのほんです。"],
    explanationRu:
      "Предмет рядом с собеседником обозначается それ. 日本語の本 означает «книга на японском языке».",
  },
];

export const lesson002: Lesson = {
  id: "lesson-002",
  unitId: "unit-001",
  order: 2,
  title: "Это моя книга",
  description: "Указательные слова これ／それ и связь существительных через の.",
  theory: lesson002Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson002Vocabulary.map((item) => item.id),
    ...lesson002Grammar.map((item) => item.id),
    ...lesson002Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson002Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 14,
};

export const lesson002Bundle: LessonBundle = {
  lesson: lesson002,
  vocabulary: lesson002Vocabulary,
  grammar: lesson002Grammar,
  sentences: lesson002Sentences,
  exercises: lesson002Exercises,
  outcomes: [
    "различать これ и それ по положению предмета",
    "связывать существительные частицей の",
    "говорить, кому принадлежит предмет",
  ],
};
