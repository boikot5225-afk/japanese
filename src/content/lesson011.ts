import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson011Vocabulary: VocabularyItem[] = [
  {
    id: "word-ookii",
    type: "vocabulary",
    writtenForm: "大きい",
    reading: "おおきい",
    meaningsRu: ["большой"],
    partOfSpeech: ["い-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-chiisai",
    type: "vocabulary",
    writtenForm: "小さい",
    reading: "ちいさい",
    meaningsRu: ["маленький"],
    partOfSpeech: ["い-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-atarashii",
    type: "vocabulary",
    writtenForm: "新しい",
    reading: "あたらしい",
    meaningsRu: ["новый"],
    partOfSpeech: ["い-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-furui",
    type: "vocabulary",
    writtenForm: "古い",
    reading: "ふるい",
    meaningsRu: ["старый", "давний"],
    partOfSpeech: ["い-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-takai",
    type: "vocabulary",
    writtenForm: "高い",
    reading: "たかい",
    meaningsRu: ["дорогой", "высокий"],
    partOfSpeech: ["い-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-yasui",
    type: "vocabulary",
    writtenForm: "安い",
    reading: "やすい",
    meaningsRu: ["дешёвый"],
    partOfSpeech: ["い-прилагательное"],
    jlptLevel: "N5",
  },
  {
    id: "word-heya",
    type: "vocabulary",
    writtenForm: "部屋",
    reading: "へや",
    meaningsRu: ["комната"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-kuruma",
    type: "vocabulary",
    writtenForm: "車",
    reading: "くるま",
    meaningsRu: ["машина", "автомобиль"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
];

export const lesson011Grammar: GrammarPoint[] = [
  {
    id: "grammar-i-adjective-predicate",
    type: "grammar",
    title: "い-прилагательное в конце предложения",
    meaningRu: "описывает тему и само образует сказуемое",
    explanationRu:
      "い-прилагательное может завершать предложение без отдельной связки: 部屋は大きい. В вежливой речи после него добавляют です: 部屋は大きいです. Само прилагательное при этом не теряет い.",
    formation: ["[тема] は [い-прилагательное] です"],
    cautions: [
      "Не ставь だ после い-прилагательного: 大きいだ — неверно.",
      "В форме 大きいです слово です добавляет вежливость, но не заменяет окончание прилагательного.",
    ],
    relatedGrammarIds: ["grammar-wa-topic", "grammar-desu"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-i-adjective-noun",
    type: "grammar",
    title: "い-прилагательное перед существительным",
    meaningRu: "непосредственно определяет существительное",
    explanationRu:
      "Перед существительным い-прилагательное ставится прямо, без частиц и связки: 新しい車, 大きい部屋. Конечное い сохраняется.",
    formation: ["[い-прилагательное] + [существительное]"],
    cautions: ["Между い-прилагательным и существительным не ставится の: 新しいの車 — неверно."],
    relatedGrammarIds: ["grammar-i-adjective-predicate"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-i-adjective-negative",
    type: "grammar",
    title: "Отрицание い-прилагательных ～くないです",
    meaningRu: "означает «не такой / не является таким»",
    explanationRu:
      "Для отрицания убирают конечное い и добавляют ～くないです: 高い → 高くないです, 大きい → 大きくないです. Разговорная форма без です тоже возможна, но курс пока использует вежливую речь.",
    formation: ["高い → 高くないです", "大きい → 大きくないです"],
    cautions: [
      "Не добавляй ではありません прямо к い-прилагательному: 高いではありません — неверно.",
      "Особое слово いい изменяется как よい; оно будет разобрано в следующем уроке.",
    ],
    relatedGrammarIds: ["grammar-i-adjective-predicate"],
    jlptLevel: "N5",
  },
];

export const lesson011Sentences: ExampleSentence[] = [
  {
    id: "sentence-heya-ookii",
    type: "sentence",
    japanese: "部屋は大きいです。",
    reading: "へやはおおきいです。",
    translationRu: "Комната большая.",
    grammarIds: ["grammar-wa-topic", "grammar-i-adjective-predicate"],
    vocabularyIds: ["word-heya", "word-ookii"],
  },
  {
    id: "sentence-chiisai-kuruma",
    type: "sentence",
    japanese: "小さい車です。",
    reading: "ちいさいくるまです。",
    translationRu: "Это маленькая машина.",
    grammarIds: ["grammar-i-adjective-noun", "grammar-desu"],
    vocabularyIds: ["word-chiisai", "word-kuruma"],
  },
  {
    id: "sentence-atarashii-kuruma-takai",
    type: "sentence",
    japanese: "新しい車は高いです。",
    reading: "あたらしいくるまはたかいです。",
    translationRu: "Новая машина дорогая.",
    grammarIds: [
      "grammar-i-adjective-noun",
      "grammar-wa-topic",
      "grammar-i-adjective-predicate"
    ],
    vocabularyIds: ["word-atarashii", "word-kuruma", "word-takai"],
  },
  {
    id: "sentence-furui-kuruma-yasukunai",
    type: "sentence",
    japanese: "古い車は安くないです。",
    reading: "ふるいくるまはやすくないです。",
    translationRu: "Старая машина недешёвая.",
    grammarIds: [
      "grammar-i-adjective-noun",
      "grammar-wa-topic",
      "grammar-i-adjective-negative"
    ],
    vocabularyIds: ["word-furui", "word-kuruma", "word-yasui"],
  },
];

export const lesson011Exercises: Exercise[] = [
  {
    id: "exercise-takai-negative-choice",
    type: "multiple-choice",
    prompt: "Какая форма означает «не дорогой»?",
    targetItemIds: ["grammar-i-adjective-negative", "word-takai"],
    correctAnswers: ["高くないです"],
    distractors: ["高いではありません", "高いません", "高かったです"],
    explanationRu: "У 高い убирается конечное い и добавляется ～くないです: 高くないです.",
  },
  {
    id: "exercise-small-car-choice",
    type: "multiple-choice",
    prompt: "Выбери правильное сочетание «маленькая машина».",
    targetItemIds: ["grammar-i-adjective-noun", "word-chiisai", "word-kuruma"],
    correctAnswers: ["小さい車"],
    distractors: ["小さいの車", "小さく車", "小さいです車"],
    explanationRu: "い-прилагательное ставится прямо перед существительным: 小さい車.",
  },
  {
    id: "exercise-heya-ookii-builder",
    type: "sentence-builder",
    prompt: "Собери: Комната большая.",
    targetItemIds: ["grammar-wa-topic", "grammar-i-adjective-predicate", "word-heya", "word-ookii"],
    correctAnswers: ["部屋|は|大きい|です"],
    distractors: ["を", "大きく", "だ"],
    explanationRu: "Тема отмечается は, а вежливое сказуемое — 大きいです.",
  },
  {
    id: "exercise-atarashii-kuruma-input",
    type: "text-input",
    prompt: "Напиши по-японски: Новая машина дорогая.",
    targetItemIds: [
      "grammar-i-adjective-noun",
      "grammar-wa-topic",
      "grammar-i-adjective-predicate",
      "word-atarashii",
      "word-kuruma",
      "word-takai"
    ],
    correctAnswers: ["新しい車は高いです", "新しい車は高いです。"],
    acceptableAnswers: ["あたらしいくるまはたかいです", "あたらしいくるまはたかいです。"],
    explanationRu: "新しい стоит прямо перед 車, а 高い завершает предложение с вежливым です.",
  },
  {
    id: "exercise-furui-kuruma-input",
    type: "text-input",
    prompt: "Напиши по-японски: Старая машина недешёвая.",
    targetItemIds: [
      "grammar-i-adjective-noun",
      "grammar-i-adjective-negative",
      "word-furui",
      "word-kuruma",
      "word-yasui"
    ],
    correctAnswers: ["古い車は安くないです", "古い車は安くないです。"],
    acceptableAnswers: ["ふるいくるまはやすくないです", "ふるいくるまはやすくないです。"],
    explanationRu: "安い превращается в 安くないです; 古い перед 車 не изменяется.",
  },
  {
    id: "exercise-ookii-heya-builder",
    type: "sentence-builder",
    prompt: "Собери словосочетание и связку: Это большая комната.",
    targetItemIds: ["grammar-i-adjective-noun", "grammar-desu", "word-ookii", "word-heya"],
    correctAnswers: ["大きい|部屋|です"],
    distractors: ["大きく", "の", "は"],
    explanationRu: "Перед существительным используется неизменённая форма 大きい: 大きい部屋です.",
  },
  {
    id: "exercise-chiisakunai-choice",
    type: "multiple-choice",
    prompt: "Как правильно сказать «комната не маленькая»?",
    targetItemIds: ["grammar-i-adjective-negative", "word-heya", "word-chiisai"],
    correctAnswers: ["部屋は小さくないです"],
    distractors: ["部屋は小さいではありません", "部屋は小さいません", "部屋は小さくありませんでした"],
    explanationRu: "Отрицание 小さい — 小さくないです.",
  },
  {
    id: "exercise-yasui-reading-input",
    type: "text-input",
    prompt: "Напиши хираганой чтение слова 安い.",
    targetItemIds: ["word-yasui"],
    correctAnswers: ["やすい"],
    explanationRu: "安い читается やすい.",
  },
];

export const lesson011: Lesson = {
  id: "lesson-011",
  unitId: "unit-004",
  order: 11,
  title: "Комната большая",
  description: "い-прилагательные перед существительным, в конце предложения и в отрицании.",
  theory: lesson011Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson011Vocabulary.map((item) => item.id),
    ...lesson011Grammar.map((item) => item.id),
    ...lesson011Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson011Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 22,
};

export const lesson011Bundle: LessonBundle = {
  lesson: lesson011,
  vocabulary: lesson011Vocabulary,
  grammar: lesson011Grammar,
  sentences: lesson011Sentences,
  exercises: lesson011Exercises,
  outcomes: [
    "описывать предмет через い-прилагательное и вежливое です",
    "ставить い-прилагательное прямо перед существительным",
    "образовывать отрицание через ～くないです",
    "не смешивать модели い-прилагательных и именных предложений",
  ],
};
