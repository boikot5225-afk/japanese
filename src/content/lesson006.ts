import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson006Vocabulary: VocabularyItem[] = [
  {
    id: "word-ie",
    type: "vocabulary",
    writtenForm: "家",
    reading: "いえ",
    meaningsRu: ["дом"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-eki",
    type: "vocabulary",
    writtenForm: "駅",
    reading: "えき",
    meaningsRu: ["станция", "вокзал"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-ikimasu",
    type: "vocabulary",
    writtenForm: "行きます",
    reading: "いきます",
    meaningsRu: ["идти", "ехать"],
    partOfSpeech: ["глагол"],
    jlptLevel: "N5",
  },
  {
    id: "word-benkyoushimasu",
    type: "vocabulary",
    writtenForm: "勉強します",
    reading: "べんきょうします",
    meaningsRu: ["учиться", "заниматься"],
    partOfSpeech: ["глагол"],
    jlptLevel: "N5",
  },
];

export const lesson006Grammar: GrammarPoint[] = [
  {
    id: "grammar-ni-e-destination",
    type: "grammar",
    title: "Направление с に и へ",
    meaningRu: "указывает цель движения",
    explanationRu:
      "После места назначения можно поставить に или へ. に сильнее подчёркивает точку назначения, へ — направление движения.",
    formation: ["[место] に 行きます", "[место] へ 行きます"],
    cautions: ["Частица へ в этой функции произносится え."],
    jlptLevel: "N5",
  },
  {
    id: "grammar-de-action-place",
    type: "grammar",
    title: "Частица で: место действия",
    meaningRu: "показывает, где происходит действие",
    explanationRu:
      "Частица で ставится после места, где кто-то что-то делает: 家で勉強します — «занимаюсь дома».",
    formation: ["[место] で [действие]"],
    cautions: ["に показывает место существования, а で — место активного действия."],
    jlptLevel: "N5",
  },
];

export const lesson006Sentences: ExampleSentence[] = [
  {
    id: "sentence-gakkou-e-ikimasu",
    type: "sentence",
    japanese: "私は学校へ行きます。",
    reading: "わたしはがっこうへいきます。",
    translationRu: "Я иду в школу.",
    grammarIds: ["grammar-wa-topic", "grammar-ni-e-destination", "grammar-masu-polite"],
    vocabularyIds: ["word-watashi", "word-gakkou", "word-ikimasu"],
  },
  {
    id: "sentence-ie-de-benkyou",
    type: "sentence",
    japanese: "私は家で日本語を勉強します。",
    reading: "わたしはいえでにほんごをべんきょうします。",
    translationRu: "Я занимаюсь японским дома.",
    grammarIds: ["grammar-de-action-place", "grammar-o-object", "grammar-masu-polite"],
    vocabularyIds: ["word-watashi", "word-ie", "word-nihongo", "word-benkyoushimasu"],
  },
  {
    id: "sentence-eki-ni-ikimasu",
    type: "sentence",
    japanese: "駅に行きます。",
    reading: "えきにいきます。",
    translationRu: "Иду на станцию.",
    grammarIds: ["grammar-ni-e-destination", "grammar-masu-polite"],
    vocabularyIds: ["word-eki", "word-ikimasu"],
  },
];

export const lesson006Exercises: Exercise[] = [
  {
    id: "exercise-destination-choice",
    type: "multiple-choice",
    prompt: "Выбери частицу направления: 学校 __ 行きます。",
    targetItemIds: ["grammar-ni-e-destination", "word-gakkou", "word-ikimasu"],
    correctAnswers: ["へ"],
    acceptableAnswers: ["に"],
    distractors: ["で", "を"],
    explanationRu: "С глаголом движения подходят に и へ; здесь основной ответ — へ.",
  },
  {
    id: "exercise-ie-de-builder",
    type: "sentence-builder",
    prompt: "Собери предложение: Я занимаюсь японским дома.",
    targetItemIds: ["grammar-de-action-place", "grammar-o-object", "word-ie", "word-benkyoushimasu"],
    correctAnswers: ["私|は|家|で|日本語|を|勉強します"],
    distractors: ["に", "行きます"],
    explanationRu: "Дом — место действия, поэтому で; японский язык — объект занятия, поэтому を.",
  },
  {
    id: "exercise-eki-input",
    type: "text-input",
    prompt: "Напиши по-японски: Иду на станцию.",
    targetItemIds: ["grammar-ni-e-destination", "word-eki", "word-ikimasu"],
    correctAnswers: ["駅に行きます", "駅に行きます。", "駅へ行きます", "駅へ行きます。"],
    acceptableAnswers: ["えきにいきます", "えきにいきます。", "えきへいきます", "えきへいきます。"],
    explanationRu: "Цель движения отмечается に или へ, затем ставится 行きます.",
  },
];

export const lesson006: Lesson = {
  id: "lesson-006",
  unitId: "unit-002",
  order: 6,
  title: "Иду в школу",
  description: "Направление движения с に／へ и место действия с частицей で.",
  theory: lesson006Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson006Vocabulary.map((item) => item.id),
    ...lesson006Grammar.map((item) => item.id),
    ...lesson006Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson006Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 17,
};

export const lesson006Bundle: LessonBundle = {
  lesson: lesson006,
  vocabulary: lesson006Vocabulary,
  grammar: lesson006Grammar,
  sentences: lesson006Sentences,
  exercises: lesson006Exercises,
  outcomes: [
    "указывать направление с に и へ",
    "отмечать место действия частицей で",
    "говорить, куда идёшь и где занимаешься",
  ],
};
