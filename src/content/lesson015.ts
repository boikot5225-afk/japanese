import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson015Vocabulary: VocabularyItem[] = [
  {
    id: "word-suki-na",
    type: "vocabulary",
    writtenForm: "好き",
    reading: "すき",
    meaningsRu: ["нравится", "любимый"],
    partOfSpeech: ["な-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-kirai-na",
    type: "vocabulary",
    writtenForm: "嫌い",
    reading: "きらい",
    meaningsRu: ["не нравится", "нелюбимый"],
    partOfSpeech: ["な-прилагательное"],
    jlptLevel: "N5",
    tags: ["не обязательно означает сильную ненависть"],
  },
  {
    id: "word-jouzu-na",
    type: "vocabulary",
    writtenForm: "上手",
    reading: "じょうず",
    meaningsRu: ["умелый", "хорошо умеет"],
    partOfSpeech: ["な-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-heta-na",
    type: "vocabulary",
    writtenForm: "下手",
    reading: "へた",
    meaningsRu: ["неумелый", "плохо умеет"],
    partOfSpeech: ["な-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-ongaku",
    type: "vocabulary",
    writtenForm: "音楽",
    reading: "おんがく",
    meaningsRu: ["музыка"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-supootsu",
    type: "vocabulary",
    writtenForm: "スポーツ",
    reading: "スポーツ",
    meaningsRu: ["спорт"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-ryouri",
    type: "vocabulary",
    writtenForm: "料理",
    reading: "りょうり",
    meaningsRu: ["готовка", "блюдо", "кулинария"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
];

export const lesson015Grammar: GrammarPoint[] = [
  {
    id: "grammar-suki-kirai-ga",
    type: "grammar",
    title: "好き／嫌い с частицей が",
    meaningRu: "сообщает, что человеку что-то нравится или не нравится",
    explanationRu:
      "В типовой конструкции человек является темой с は, а предмет предпочтения отмечается が: 私は音楽が好きです. 好き и 嫌い грамматически ведут себя как な-прилагательные, а не как глаголы «любить» и «ненавидеть».",
    formation: ["[человек] は [предмет] が 好きです／嫌いです"],
    cautions: [
      "Не ставь を по аналогии с русским «любить что-то»: в базовой модели используется が.",
      "嫌い часто означает обычное «не люблю / не нравится», а не обязательно сильную ненависть."
    ],
    relatedGrammarIds: ["grammar-wa-topic", "grammar-na-adjective-predicate"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-jouzu-heta-ga",
    type: "grammar",
    title: "上手／下手 с частицей が",
    meaningRu: "сообщает, что человек хорошо или плохо владеет навыком",
    explanationRu:
      "Навык или область отмечается が: 田中さんは料理が上手です. 上手 означает, что кто-то умеет хорошо, 下手 — что навык даётся плохо. О себе 上手 обычно говорят осторожно, чтобы не звучать самодовольно.",
    formation: ["[человек] は [навык] が 上手です／下手です"],
    cautions: [
      "上手 и 下手 — な-прилагательные, поэтому перед существительным используются формы 上手な／下手な.",
      "Для нейтральной самооценки в более продвинутой речи часто используют 得意／苦手, но на N5 достаточно модели 上手／下手."
    ],
    relatedGrammarIds: ["grammar-ga-existence", "grammar-na-adjective-predicate"],
    jlptLevel: "N5",
  },
];

export const lesson015Sentences: ExampleSentence[] = [
  {
    id: "sentence-watashi-ongaku-suki",
    type: "sentence",
    japanese: "私は音楽が好きです。",
    reading: "わたしはおんがくがすきです。",
    translationRu: "Мне нравится музыка.",
    grammarIds: ["grammar-wa-topic", "grammar-suki-kirai-ga"],
    vocabularyIds: ["word-watashi", "word-ongaku", "word-suki-na"],
  },
  {
    id: "sentence-tanaka-supootsu-kirai",
    type: "sentence",
    japanese: "田中さんはスポーツが嫌いです。",
    reading: "たなかさんはスポーツがきらいです。",
    translationRu: "Танаке не нравится спорт.",
    grammarIds: ["grammar-wa-topic", "grammar-suki-kirai-ga"],
    vocabularyIds: ["word-tanaka-san", "word-supootsu", "word-kirai-na"],
  },
  {
    id: "sentence-tanaka-ryouri-jouzu",
    type: "sentence",
    japanese: "田中さんは料理が上手です。",
    reading: "たなかさんはりょうりがじょうずです。",
    translationRu: "Танака хорошо готовит.",
    grammarIds: ["grammar-wa-topic", "grammar-jouzu-heta-ga"],
    vocabularyIds: ["word-tanaka-san", "word-ryouri", "word-jouzu-na"],
  },
  {
    id: "sentence-watashi-nihongo-heta",
    type: "sentence",
    japanese: "私は日本語が下手です。",
    reading: "わたしはにほんごがへたです。",
    translationRu: "Я плохо владею японским.",
    grammarIds: ["grammar-wa-topic", "grammar-jouzu-heta-ga"],
    vocabularyIds: ["word-watashi", "word-nihongo", "word-heta-na"],
  },
];

export const lesson015Exercises: Exercise[] = [
  {
    id: "exercise-suki-particle-choice",
    type: "multiple-choice",
    prompt: "Выбери частицу: 私は音楽 __ 好きです。",
    targetItemIds: ["grammar-suki-kirai-ga", "word-ongaku", "word-suki-na"],
    correctAnswers: ["が"],
    distractors: ["を", "に", "で"],
    explanationRu: "Предмет предпочтения в базовой конструкции 好きです отмечается が.",
  },
  {
    id: "exercise-jouzu-particle-choice",
    type: "multiple-choice",
    prompt: "Выбери частицу: 田中さんは料理 __ 上手です。",
    targetItemIds: ["grammar-jouzu-heta-ga", "word-ryouri", "word-jouzu-na"],
    correctAnswers: ["が"],
    distractors: ["を", "へ", "と"],
    explanationRu: "Область навыка перед 上手／下手 отмечается частицей が.",
  },
  {
    id: "exercise-kirai-meaning-choice",
    type: "multiple-choice",
    prompt: "Что точнее всего означает スポーツが嫌いです?",
    targetItemIds: ["grammar-suki-kirai-ga", "word-supootsu", "word-kirai-na"],
    correctAnswers: ["Мне не нравится спорт"],
    distractors: ["Я плохо занимаюсь спортом", "Я сейчас занимаюсь спортом", "Спорт был трудным"],
    explanationRu: "嫌いです выражает неприязнь или отсутствие симпатии, а не уровень навыка.",
  },
  {
    id: "exercise-ongaku-suki-builder",
    type: "sentence-builder",
    prompt: "Собери: Мне нравится музыка.",
    targetItemIds: ["grammar-suki-kirai-ga", "word-watashi", "word-ongaku", "word-suki-na"],
    correctAnswers: ["私|は|音楽|が|好き|です"],
    distractors: ["を", "上手", "に"],
    explanationRu: "Человек — тема с は, предмет предпочтения — с が.",
  },
  {
    id: "exercise-tanaka-supootsu-kirai-input",
    type: "text-input",
    prompt: "Напиши по-японски: Танаке не нравится спорт.",
    targetItemIds: ["grammar-suki-kirai-ga", "word-tanaka-san", "word-supootsu", "word-kirai-na"],
    correctAnswers: ["田中さんはスポーツが嫌いです", "田中さんはスポーツが嫌いです。"],
    acceptableAnswers: ["たなかさんはスポーツがきらいです", "たなかさんはスポーツがきらいです。"],
    explanationRu: "Спорт отмечается が: スポーツが嫌いです.",
  },
  {
    id: "exercise-tanaka-ryouri-jouzu-input",
    type: "text-input",
    prompt: "Напиши по-японски: Танака хорошо готовит.",
    targetItemIds: ["grammar-jouzu-heta-ga", "word-tanaka-san", "word-ryouri", "word-jouzu-na"],
    correctAnswers: ["田中さんは料理が上手です", "田中さんは料理が上手です。"],
    acceptableAnswers: ["たなかさんはりょうりがじょうずです", "たなかさんはりょうりがじょうずです。"],
    explanationRu: "Навык 料理 отмечается が, оценка — 上手です.",
  },
  {
    id: "exercise-watashi-nihongo-heta-input",
    type: "text-input",
    prompt: "Напиши по-японски: Я плохо владею японским.",
    targetItemIds: ["grammar-jouzu-heta-ga", "word-watashi", "word-nihongo", "word-heta-na"],
    correctAnswers: ["私は日本語が下手です", "私は日本語が下手です。"],
    acceptableAnswers: ["わたしはにほんごがへたです", "わたしはにほんごがへたです。"],
    explanationRu: "日本語 — область навыка с が, 下手です — «плохо умею».",
  },
  {
    id: "exercise-supootsu-not-suki-input",
    type: "text-input",
    prompt: "Напиши по-японски: Мне не нравится спорт.",
    targetItemIds: ["grammar-suki-kirai-ga", "grammar-na-adjective-negative", "word-watashi", "word-supootsu", "word-suki-na"],
    correctAnswers: [
      "私はスポーツが好きではありません",
      "私はスポーツが好きではありません。"
    ],
    acceptableAnswers: [
      "私はスポーツが好きじゃありません",
      "私はスポーツが好きじゃありません。",
      "わたしはスポーツがすきではありません",
      "わたしはスポーツがすきではありません。"
    ],
    explanationRu: "好き — な-прилагательное, поэтому его вежливое отрицание — 好きではありません.",
  },
];

export const lesson015: Lesson = {
  id: "lesson-015",
  unitId: "unit-005",
  order: 15,
  title: "Мне нравится музыка",
  description: "Предпочтения и навыки через 好き／嫌い／上手／下手 и частицу が.",
  theory: lesson015Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson015Vocabulary.map((item) => item.id),
    ...lesson015Grammar.map((item) => item.id),
    ...lesson015Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson015Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 22,
};

export const lesson015Bundle: LessonBundle = {
  lesson: lesson015,
  vocabulary: lesson015Vocabulary,
  grammar: lesson015Grammar,
  sentences: lesson015Sentences,
  exercises: lesson015Exercises,
  outcomes: [
    "говорить о симпатиях и антипатиях через 好き／嫌い",
    "отмечать предмет предпочтения частицей が",
    "описывать уровень навыка через 上手／下手",
    "не подменять японскую модель русской конструкцией с прямым объектом を",
  ],
};
