import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson013Vocabulary: VocabularyItem[] = [
  {
    id: "word-shizuka-na",
    type: "vocabulary",
    writtenForm: "静か",
    reading: "しずか",
    meaningsRu: ["тихий", "спокойный"],
    partOfSpeech: ["な-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-genki-na",
    type: "vocabulary",
    writtenForm: "元気",
    reading: "げんき",
    meaningsRu: ["здоровый", "бодрый", "в порядке"],
    partOfSpeech: ["な-прилагательное", "существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-yuumei-na",
    type: "vocabulary",
    writtenForm: "有名",
    reading: "ゆうめい",
    meaningsRu: ["известный", "знаменитый"],
    partOfSpeech: ["な-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-benri-na",
    type: "vocabulary",
    writtenForm: "便利",
    reading: "べんり",
    meaningsRu: ["удобный", "практичный"],
    partOfSpeech: ["な-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-kirei-na",
    type: "vocabulary",
    writtenForm: "きれい",
    reading: "きれい",
    meaningsRu: ["красивый", "чистый"],
    partOfSpeech: ["な-прилагательное"],
    jlptLevel: "N5",
    tags: ["несмотря на конечное い, это な-прилагательное"],
  },
  {
    id: "word-machi",
    type: "vocabulary",
    writtenForm: "町",
    reading: "まち",
    meaningsRu: ["город", "район", "посёлок"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-kouen",
    type: "vocabulary",
    writtenForm: "公園",
    reading: "こうえん",
    meaningsRu: ["парк"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-toshokan",
    type: "vocabulary",
    writtenForm: "図書館",
    reading: "としょかん",
    meaningsRu: ["библиотека"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
];

export const lesson013Grammar: GrammarPoint[] = [
  {
    id: "grammar-na-adjective-predicate",
    type: "grammar",
    title: "な-прилагательное в конце предложения",
    meaningRu: "описывает тему через модель ～です",
    explanationRu:
      "В конце вежливого предложения な-прилагательное ставится перед です без な: 町は静かです, 田中さんは元気です. Частица な здесь не нужна, потому что после прилагательного нет существительного.",
    formation: ["[тема] は [な-прилагательное] です"],
    cautions: ["静かなです — неверно. В конце предложения правильно 静かです."],
    relatedGrammarIds: ["grammar-wa-topic", "grammar-desu"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-na-adjective-noun",
    type: "grammar",
    title: "な-прилагательное перед существительным",
    meaningRu: "соединяет признак с существительным при помощи な",
    explanationRu:
      "Перед существительным к основе な-прилагательного добавляется な: 静かな町, 便利な図書館, きれいな公園. Это главное внешнее отличие от い-прилагательных.",
    formation: ["[な-прилагательное] な [существительное]"],
    cautions: [
      "Не пропускай な перед существительным: 静か町 — неверно.",
      "きれい — な-прилагательное, хотя слово заканчивается на い: きれいな公園."
    ],
    relatedGrammarIds: ["grammar-i-adjective-noun"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-na-adjective-negative",
    type: "grammar",
    title: "Отрицание な-прилагательных ～ではありません",
    meaningRu: "вежливо отрицает качество или состояние",
    explanationRu:
      "Отрицание строится как у существительных: 静かではありません. В разговорной вежливой речи часто используется じゃありません или じゃないです. В отличие от い-прилагательных, форма ～くない здесь не применяется.",
    formation: [
      "静かです → 静かではありません",
      "便利です → 便利じゃありません／便利じゃないです"
    ],
    cautions: [
      "静かくないです — неверно: ～くない относится к い-прилагательным.",
      "В нейтрально-вежливом учебном стиле основной вариант — ではありません."
    ],
    relatedGrammarIds: ["grammar-desu-negative", "grammar-i-adjective-negative"],
    jlptLevel: "N5",
  },
];

export const lesson013Sentences: ExampleSentence[] = [
  {
    id: "sentence-machi-shizuka",
    type: "sentence",
    japanese: "町は静かです。",
    reading: "まちはしずかです。",
    translationRu: "Город тихий.",
    grammarIds: ["grammar-wa-topic", "grammar-na-adjective-predicate"],
    vocabularyIds: ["word-machi", "word-shizuka-na"],
  },
  {
    id: "sentence-shizukana-machi",
    type: "sentence",
    japanese: "静かな町です。",
    reading: "しずかなまちです。",
    translationRu: "Это тихий город.",
    grammarIds: ["grammar-na-adjective-noun", "grammar-desu"],
    vocabularyIds: ["word-shizuka-na", "word-machi"],
  },
  {
    id: "sentence-kouen-kirei",
    type: "sentence",
    japanese: "公園はきれいです。",
    reading: "こうえんはきれいです。",
    translationRu: "Парк красивый.",
    grammarIds: ["grammar-wa-topic", "grammar-na-adjective-predicate"],
    vocabularyIds: ["word-kouen", "word-kirei-na"],
  },
  {
    id: "sentence-toshokan-benri-dewa-arimasen",
    type: "sentence",
    japanese: "図書館は便利ではありません。",
    reading: "としょかんはべんりではありません。",
    translationRu: "Библиотека неудобна.",
    grammarIds: ["grammar-wa-topic", "grammar-na-adjective-negative"],
    vocabularyIds: ["word-toshokan", "word-benri-na"],
  },
  {
    id: "sentence-tanaka-genki",
    type: "sentence",
    japanese: "田中さんは元気です。",
    reading: "たなかさんはげんきです。",
    translationRu: "Танака хорошо себя чувствует.",
    grammarIds: ["grammar-wa-topic", "grammar-na-adjective-predicate"],
    vocabularyIds: ["word-tanaka-san", "word-genki-na"],
  },
];

export const lesson013Exercises: Exercise[] = [
  {
    id: "exercise-shizukana-machi-choice",
    type: "multiple-choice",
    prompt: "Выбери правильное сочетание «тихий город».",
    targetItemIds: ["grammar-na-adjective-noun", "word-shizuka-na", "word-machi"],
    correctAnswers: ["静かな町"],
    distractors: ["静か町", "静かい町", "静かの町"],
    explanationRu: "Перед существительным な-прилагательное соединяется с ним через な: 静かな町.",
  },
  {
    id: "exercise-kirei-class-choice",
    type: "multiple-choice",
    prompt: "Какое сочетание с きれい правильное?",
    targetItemIds: ["grammar-na-adjective-noun", "word-kirei-na", "word-kouen"],
    correctAnswers: ["きれいな公園"],
    distractors: ["きれい公園", "きれいい公園", "きれいの公園"],
    explanationRu: "きれい заканчивается на い, но грамматически является な-прилагательным.",
  },
  {
    id: "exercise-benri-negative-choice",
    type: "multiple-choice",
    prompt: "Выбери вежливую форму «неудобный».",
    targetItemIds: ["grammar-na-adjective-negative", "word-benri-na"],
    correctAnswers: ["便利ではありません"],
    acceptableAnswers: ["便利じゃありません", "便利じゃないです"],
    distractors: ["便利くないです", "便利ないです", "便利ではありませんでした"],
    explanationRu: "な-прилагательные отрицаются по именной модели: 便利ではありません. Варианты 便利じゃありません и 便利じゃないです тоже правильные.",
  },
  {
    id: "exercise-kireina-kouen-builder",
    type: "sentence-builder",
    prompt: "Собери: Это красивый парк.",
    targetItemIds: [
      "grammar-na-adjective-noun",
      "grammar-desu",
      "word-kirei-na",
      "word-kouen"
    ],
    correctAnswers: ["きれい|な|公園|です"],
    distractors: ["は", "きれいい", "の"],
    explanationRu: "Перед существительным 公園 слово きれい соединяется с ним через な: きれいな公園です.",
  },
  {
    id: "exercise-shizukana-machi-input",
    type: "text-input",
    prompt: "Напиши по-японски: Это тихий город.",
    targetItemIds: ["grammar-na-adjective-noun", "grammar-desu", "word-shizuka-na", "word-machi"],
    correctAnswers: ["静かな町です", "静かな町です。"],
    acceptableAnswers: ["しずかなまちです", "しずかなまちです。"],
    explanationRu: "Перед 町 используется 静かな, затем вежливая связка です.",
  },
  {
    id: "exercise-kouen-kirei-input",
    type: "text-input",
    prompt: "Напиши по-японски: Парк красивый.",
    targetItemIds: ["grammar-na-adjective-predicate", "word-kouen", "word-kirei-na"],
    correctAnswers: ["公園はきれいです", "公園はきれいです。"],
    acceptableAnswers: ["こうえんはきれいです", "こうえんはきれいです。"],
    explanationRu: "Здесь きれい описывает внешний вид парка; в конце предложения な не ставится.",
  },
  {
    id: "exercise-toshokan-benri-negative-input",
    type: "text-input",
    prompt: "Напиши по-японски: Библиотека неудобна.",
    targetItemIds: ["grammar-na-adjective-negative", "word-toshokan", "word-benri-na"],
    correctAnswers: [
      "図書館は便利ではありません",
      "図書館は便利ではありません。"
    ],
    acceptableAnswers: [
      "図書館は便利じゃありません",
      "図書館は便利じゃありません。",
      "図書館は便利じゃないです",
      "図書館は便利じゃないです。",
      "としょかんはべんりではありません",
      "としょかんはべんりではありません。"
    ],
    explanationRu: "Отрицание 便利です — 便利ではありません; разговорные вежливые варианты с じゃ тоже принимаются.",
  },
  {
    id: "exercise-yuumei-reading-input",
    type: "text-input",
    prompt: "Напиши чтение слова 有名.",
    targetItemIds: ["word-yuumei-na"],
    correctAnswers: ["ゆうめい"],
    explanationRu: "有名 читается ゆうめい.",
  },
];

export const lesson013: Lesson = {
  id: "lesson-013",
  unitId: "unit-004",
  order: 13,
  title: "Это тихий город",
  description: "な-прилагательные в сказуемом, перед существительным и в отрицании.",
  theory: lesson013Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson013Vocabulary.map((item) => item.id),
    ...lesson013Grammar.map((item) => item.id),
    ...lesson013Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson013Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 23,
};

export const lesson013Bundle: LessonBundle = {
  lesson: lesson013,
  vocabulary: lesson013Vocabulary,
  grammar: lesson013Grammar,
  sentences: lesson013Sentences,
  exercises: lesson013Exercises,
  outcomes: [
    "использовать な-прилагательное в конце предложения без な",
    "добавлять な перед определяемым существительным",
    "строить отрицание через ～ではありません и распознавать варианты с じゃ",
    "распознавать きれい как な-прилагательное, несмотря на конечное い",
  ],
};
