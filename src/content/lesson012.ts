import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson012Vocabulary: VocabularyItem[] = [
  {
    id: "word-samui",
    type: "vocabulary",
    writtenForm: "寒い",
    reading: "さむい",
    meaningsRu: ["холодный", "холодно"],
    partOfSpeech: ["い-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-atsui",
    type: "vocabulary",
    writtenForm: "暑い",
    reading: "あつい",
    meaningsRu: ["жаркий", "жарко"],
    partOfSpeech: ["い-прилагательное"],
    jlptLevel: "N5",
    tags: ["о погоде и температуре воздуха"],
  },
  {
    id: "word-tanoshii",
    type: "vocabulary",
    writtenForm: "楽しい",
    reading: "たのしい",
    meaningsRu: ["весёлый", "приятный", "интересный"],
    partOfSpeech: ["い-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-isogashii",
    type: "vocabulary",
    writtenForm: "忙しい",
    reading: "いそがしい",
    meaningsRu: ["занятый", "загруженный"],
    partOfSpeech: ["い-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-ii-yoi",
    type: "vocabulary",
    writtenForm: "いい",
    reading: "いい",
    meaningsRu: ["хороший", "хорошо"],
    partOfSpeech: ["い-прилагательное", "особое изменение"],
    jlptLevel: "N5",
    tags: ["в изменяемых формах используется основа よ-"],
  },
  {
    id: "word-tenki",
    type: "vocabulary",
    writtenForm: "天気",
    reading: "てんき",
    meaningsRu: ["погода"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-ryokou",
    type: "vocabulary",
    writtenForm: "旅行",
    reading: "りょこう",
    meaningsRu: ["путешествие", "поездка"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-senshuu",
    type: "vocabulary",
    writtenForm: "先週",
    reading: "せんしゅう",
    meaningsRu: ["прошлая неделя", "на прошлой неделе"],
    partOfSpeech: ["существительное", "наречное употребление"],
    jlptLevel: "N5",
  },
];

export const lesson012Grammar: GrammarPoint[] = [
  {
    id: "grammar-i-adjective-past",
    type: "grammar",
    title: "Прошедшее い-прилагательных ～かったです",
    meaningRu: "описывает состояние или качество в прошлом",
    explanationRu:
      "Для прошедшей формы убирают конечное い и добавляют ～かったです: 寒い → 寒かったです, 高い → 高かったです. Прошедшее время находится внутри формы прилагательного, поэтому でした после обычного い-прилагательного не ставят.",
    formation: ["寒い → 寒かったです", "高い → 高かったです"],
    cautions: ["寒いでした — неверно. Правильно 寒かったです."],
    relatedGrammarIds: ["grammar-i-adjective-predicate", "grammar-desu-past"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-i-adjective-past-negative",
    type: "grammar",
    title: "Прошедшее отрицание ～くなかったです",
    meaningRu: "означает «не был таким / не было такого состояния»",
    explanationRu:
      "Для прошедшего отрицания убирают конечное い и добавляют ～くなかったです: 寒い → 寒くなかったです. Это прошедшая форма от ～くないです. Более формальный вежливый вариант ～くありませんでした также грамматически правильный и принимается в ответах.",
    formation: [
      "寒い → 寒くなかったです",
      "高い → 高くなかったです",
      "寒い → 寒くありませんでした"
    ],
    cautions: ["Не смешивай формы: 寒くないでした — неверно."],
    relatedGrammarIds: ["grammar-i-adjective-negative", "grammar-i-adjective-past"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-ii-irregular",
    type: "grammar",
    title: "Особое прилагательное いい／よい",
    meaningRu: "изменяет формы от основы よ-, а не い-",
    explanationRu:
      "В настоящем времени обычно говорят いいです, но остальные формы строятся от よい: よくないです, よかったです, よくなかったです. Формальные варианты よくありません и よくありませんでした строятся от той же основы. Формы いかった и いくない не существуют.",
    formation: [
      "いいです → よくないです／よくありません",
      "いいです → よかったです",
      "いいです → よくなかったです／よくありませんでした"
    ],
    cautions: ["Запомни эту модель отдельно: いい ведёт себя как よい во всех изменяемых формах."],
    relatedGrammarIds: [
      "grammar-i-adjective-negative",
      "grammar-i-adjective-past",
      "grammar-i-adjective-past-negative"
    ],
    jlptLevel: "N5",
  },
];

export const lesson012Sentences: ExampleSentence[] = [
  {
    id: "sentence-senshuu-isogashikatta",
    type: "sentence",
    japanese: "先週は忙しかったです。",
    reading: "せんしゅうはいそがしかったです。",
    translationRu: "На прошлой неделе я был занят.",
    grammarIds: ["grammar-wa-topic", "grammar-i-adjective-past"],
    vocabularyIds: ["word-senshuu", "word-isogashii"],
  },
  {
    id: "sentence-ryokou-tanoshikatta",
    type: "sentence",
    japanese: "旅行は楽しかったです。",
    reading: "りょこうはたのしかったです。",
    translationRu: "Путешествие было приятным.",
    grammarIds: ["grammar-wa-topic", "grammar-i-adjective-past"],
    vocabularyIds: ["word-ryokou", "word-tanoshii"],
  },
  {
    id: "sentence-kinou-samukunakatta",
    type: "sentence",
    japanese: "昨日は寒くなかったです。",
    reading: "きのうはさむくなかったです。",
    translationRu: "Вчера не было холодно.",
    grammarIds: ["grammar-wa-topic", "grammar-i-adjective-past-negative"],
    vocabularyIds: ["word-kinou", "word-samui"],
  },
  {
    id: "sentence-tenki-yokatta",
    type: "sentence",
    japanese: "天気はよかったです。",
    reading: "てんきはよかったです。",
    translationRu: "Погода была хорошей.",
    grammarIds: ["grammar-wa-topic", "grammar-ii-irregular", "grammar-i-adjective-past"],
    vocabularyIds: ["word-tenki", "word-ii-yoi"],
  },
];

export const lesson012Exercises: Exercise[] = [
  {
    id: "exercise-takai-past-choice",
    type: "multiple-choice",
    prompt: "Поставь 高い в вежливое прошедшее время.",
    targetItemIds: ["grammar-i-adjective-past", "word-takai"],
    correctAnswers: ["高かったです"],
    distractors: ["高いでした", "高くないです", "高くなかったです"],
    explanationRu: "Высокий или дорогой в прошлом — 高かったです.",
  },
  {
    id: "exercise-samui-past-negative-choice",
    type: "multiple-choice",
    prompt: "Какая форма означает «не было холодно»?",
    targetItemIds: ["grammar-i-adjective-past-negative", "word-samui"],
    correctAnswers: ["寒くなかったです"],
    acceptableAnswers: ["寒くありませんでした"],
    distractors: ["寒くないでした", "寒いではありませんでした", "寒かったです"],
    explanationRu: "Основная форма — 寒くなかったです; более формальный вариант 寒くありませんでした тоже правильный.",
  },
  {
    id: "exercise-ii-past-choice",
    type: "multiple-choice",
    prompt: "Выбери правильную прошедшую форму いい.",
    targetItemIds: ["grammar-ii-irregular", "word-ii-yoi"],
    correctAnswers: ["よかったです"],
    distractors: ["いかったです", "いいでした", "よくないです"],
    explanationRu: "いい изменяется от основы よ-: よかったです.",
  },
  {
    id: "exercise-senshuu-isogashikatta-builder",
    type: "sentence-builder",
    prompt: "Собери: На прошлой неделе я был занят.",
    targetItemIds: ["grammar-wa-topic", "grammar-i-adjective-past", "word-senshuu", "word-isogashii"],
    correctAnswers: ["先週|は|忙しかった|です"],
    distractors: ["忙しい", "でした", "に"],
    explanationRu: "Прошедшая форма 忙しい — 忙しかったです.",
  },
  {
    id: "exercise-ryokou-tanoshikatta-input",
    type: "text-input",
    prompt: "Напиши по-японски: Путешествие было приятным.",
    targetItemIds: ["grammar-i-adjective-past", "word-ryokou", "word-tanoshii"],
    correctAnswers: ["旅行は楽しかったです", "旅行は楽しかったです。"],
    acceptableAnswers: ["りょこうはたのしかったです", "りょこうはたのしかったです。"],
    explanationRu: "楽しい в прошедшем времени превращается в 楽しかったです.",
  },
  {
    id: "exercise-kinou-samukunakatta-input",
    type: "text-input",
    prompt: "Напиши по-японски: Вчера не было холодно.",
    targetItemIds: ["grammar-i-adjective-past-negative", "word-kinou", "word-samui"],
    correctAnswers: ["昨日は寒くなかったです", "昨日は寒くなかったです。"],
    acceptableAnswers: [
      "きのうはさむくなかったです",
      "きのうはさむくなかったです。",
      "昨日は寒くありませんでした",
      "昨日は寒くありませんでした。",
      "きのうはさむくありませんでした",
      "きのうはさむくありませんでした。"
    ],
    explanationRu: "Основная учебная форма — 寒くなかったです; 寒くありませんでした тоже является правильным вежливым вариантом.",
  },
  {
    id: "exercise-tenki-yokatta-input",
    type: "text-input",
    prompt: "Напиши по-японски: Погода была хорошей.",
    targetItemIds: ["grammar-ii-irregular", "word-tenki", "word-ii-yoi"],
    correctAnswers: ["天気はよかったです", "天気はよかったです。"],
    acceptableAnswers: ["てんきはよかったです", "てんきはよかったです。"],
    explanationRu: "Прошедшая форма いい — よかったです.",
  },
  {
    id: "exercise-atsui-reading-input",
    type: "text-input",
    prompt: "Напиши чтение слова 暑い.",
    targetItemIds: ["word-atsui"],
    correctAnswers: ["あつい"],
    explanationRu: "暑い читается あつい и относится прежде всего к жаркой погоде.",
  },
];

export const lesson012: Lesson = {
  id: "lesson-012",
  unitId: "unit-004",
  order: 12,
  title: "Погода была хорошей",
  description: "Прошедшие формы い-прилагательных и особое изменение いい／よい.",
  theory: lesson012Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson012Vocabulary.map((item) => item.id),
    ...lesson012Grammar.map((item) => item.id),
    ...lesson012Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson012Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 22,
};

export const lesson012Bundle: LessonBundle = {
  lesson: lesson012,
  vocabulary: lesson012Vocabulary,
  grammar: lesson012Grammar,
  sentences: lesson012Sentences,
  exercises: lesson012Exercises,
  outcomes: [
    "ставить い-прилагательные в прошедшую форму ～かったです",
    "строить прошедшее отрицание ～くなかったです и распознавать ～くありませんでした",
    "правильно изменять особое прилагательное いい через основу よ-",
    "различать неверные модели вроде 寒いでした и 寒くないでした",
  ],
};
