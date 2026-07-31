import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson010Vocabulary: VocabularyItem[] = [
  {
    id: "word-ashita",
    type: "vocabulary",
    writtenForm: "明日",
    reading: "あした",
    meaningsRu: ["завтра"],
    partOfSpeech: ["существительное", "наречное употребление"],
    jlptLevel: "N5",
  },
  {
    id: "word-mimasu",
    type: "vocabulary",
    writtenForm: "見ます",
    reading: "みます",
    meaningsRu: ["смотреть", "видеть"],
    partOfSpeech: ["глагол", "вежливая форма"],
    jlptLevel: "N5",
  },
  {
    id: "word-yomimasu",
    type: "vocabulary",
    writtenForm: "読みます",
    reading: "よみます",
    meaningsRu: ["читать"],
    partOfSpeech: ["глагол", "вежливая форма"],
    jlptLevel: "N5",
  },
  {
    id: "word-kaerimasu",
    type: "vocabulary",
    writtenForm: "帰ります",
    reading: "かえります",
    meaningsRu: ["возвращаться", "идти домой"],
    partOfSpeech: ["глагол", "вежливая форма"],
    jlptLevel: "N5",
  },
  {
    id: "word-terebi",
    type: "vocabulary",
    writtenForm: "テレビ",
    reading: "テレビ",
    meaningsRu: ["телевизор", "телевидение"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-shinbun",
    type: "vocabulary",
    writtenForm: "新聞",
    reading: "しんぶん",
    meaningsRu: ["газета"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-eiga",
    type: "vocabulary",
    writtenForm: "映画",
    reading: "えいが",
    meaningsRu: ["фильм", "кино"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
];

export const lesson010Grammar: GrammarPoint[] = [
  {
    id: "grammar-masu-negative",
    type: "grammar",
    title: "Отрицание ～ません",
    meaningRu: "вежливо сообщает, что действие не происходит",
    explanationRu:
      "Чтобы сделать знакомую вежливую форму отрицательной, окончание ～ます заменяют на ～ません: 食べます → 食べません.",
    formation: ["食べます → 食べません", "飲みます → 飲みません"],
    cautions: [
      "～ません относится к глаголам. Для именного предложения используется ではありません.",
      "Пока изменяй уже знакомые формы на ～ます. Словарные формы и группы глаголов будут разобраны отдельно.",
    ],
    relatedGrammarIds: ["grammar-masu-polite", "grammar-desu-negative"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-masu-past",
    type: "grammar",
    title: "Прошедшее ～ました",
    meaningRu: "вежливо сообщает о завершившемся действии",
    explanationRu:
      "Для прошедшего времени ～ます заменяется на ～ました: 読みます → 読みました. Маркер времени вроде 昨日 помогает понять контекст, но сама форма глагола тоже должна быть прошедшей.",
    formation: ["読みます → 読みました", "行きます → 行きました"],
    cautions: ["Не используй でした после глагола: правильно 食べました, а не 食べでした."],
    relatedGrammarIds: ["grammar-masu-polite", "grammar-desu-past"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-masu-past-negative",
    type: "grammar",
    title: "Прошедшее отрицание ～ませんでした",
    meaningRu: "означает «не делал / не произошло»",
    explanationRu:
      "Прошедшее отрицание образуется заменой ～ます на ～ませんでした: 行きます → 行きませんでした.",
    formation: ["行きます → 行きませんでした", "飲みます → 飲みませんでした"],
    cautions: ["Полная форма заканчивается на ませんでした; не опускай でした в прошедшем контексте."],
    relatedGrammarIds: ["grammar-masu-negative", "grammar-masu-past"],
    jlptLevel: "N5",
  },
];

export const lesson010Sentences: ExampleSentence[] = [
  {
    id: "sentence-kyou-terebi-mimasen",
    type: "sentence",
    japanese: "今日はテレビを見ません。",
    reading: "きょうはテレビをみません。",
    translationRu: "Сегодня я не буду смотреть телевизор.",
    grammarIds: ["grammar-wa-topic", "grammar-o-object", "grammar-masu-negative", "grammar-time-without-ni"],
    vocabularyIds: ["word-kyou", "word-terebi", "word-mimasu"],
  },
  {
    id: "sentence-kinou-shinbun-yomimashita",
    type: "sentence",
    japanese: "昨日、新聞を読みました。",
    reading: "きのう、しんぶんをよみました。",
    translationRu: "Вчера я читал газету.",
    grammarIds: ["grammar-o-object", "grammar-masu-past", "grammar-time-without-ni"],
    vocabularyIds: ["word-kinou", "word-shinbun", "word-yomimasu"],
  },
  {
    id: "sentence-kinou-gakkou-ikimasen-deshita",
    type: "sentence",
    japanese: "昨日は学校へ行きませんでした。",
    reading: "きのうはがっこうへいきませんでした。",
    translationRu: "Вчера я не ходил в школу.",
    grammarIds: ["grammar-wa-topic", "grammar-ni-e-destination", "grammar-masu-past-negative"],
    vocabularyIds: ["word-kinou", "word-gakkou", "word-ikimasu"],
  },
  {
    id: "sentence-ashita-ie-kaerimasu",
    type: "sentence",
    japanese: "明日、家に帰ります。",
    reading: "あした、いえにかえります。",
    translationRu: "Завтра я вернусь домой.",
    grammarIds: ["grammar-time-without-ni", "grammar-ni-e-destination", "grammar-masu-polite"],
    vocabularyIds: ["word-ashita", "word-ie", "word-kaerimasu"],
  },
];

export const lesson010Exercises: Exercise[] = [
  {
    id: "exercise-tabemasu-negative",
    type: "text-input",
    prompt: "Поставь в вежливое отрицание: 食べます。",
    targetItemIds: ["grammar-masu-negative", "word-tabemasu"],
    correctAnswers: ["食べません", "食べません。"],
    acceptableAnswers: ["たべません", "たべません。"],
    explanationRu: "Окончание ～ます заменяется на ～ません.",
  },
  {
    id: "exercise-nomimasu-past",
    type: "text-input",
    prompt: "Поставь в прошедшее время: 飲みます。",
    targetItemIds: ["grammar-masu-past", "word-nomimasu"],
    correctAnswers: ["飲みました", "飲みました。"],
    acceptableAnswers: ["のみました", "のみました。"],
    explanationRu: "Прошедшая вежливая форма заканчивается на ～ました.",
  },
  {
    id: "exercise-ikimasu-past-negative",
    type: "text-input",
    prompt: "Поставь в прошедшее отрицание: 行きます。",
    targetItemIds: ["grammar-masu-past-negative", "word-ikimasu"],
    correctAnswers: ["行きませんでした", "行きませんでした。"],
    acceptableAnswers: ["いきませんでした", "いきませんでした。"],
    explanationRu: "Прошедшее отрицание знакомой формы 行きます — 行きませんでした.",
  },
  {
    id: "exercise-masu-form-choice",
    type: "multiple-choice",
    prompt: "Какая форма означает «не пил»?",
    targetItemIds: ["grammar-masu-past-negative", "word-nomimasu"],
    correctAnswers: ["飲みませんでした"],
    distractors: ["飲みません", "飲みました", "飲みではありませんでした"],
    explanationRu: "«Не пил» сочетает отрицание и прошедшее время: ～ませんでした.",
  },
  {
    id: "exercise-kinou-shinbun-builder",
    type: "sentence-builder",
    prompt: "Собери: Вчера я читал газету.",
    targetItemIds: ["grammar-masu-past", "grammar-o-object", "word-kinou", "word-shinbun", "word-yomimasu"],
    correctAnswers: ["昨日|新聞|を|読みました"],
    distractors: ["読みます", "に", "明日"],
    explanationRu: "昨日 задаёт прошлый контекст, газета отмечается を, глагол принимает форму 読みました.",
  },
  {
    id: "exercise-kyou-terebi-input",
    type: "text-input",
    prompt: "Напиши по-японски: Сегодня я не буду смотреть телевизор.",
    targetItemIds: ["grammar-masu-negative", "grammar-o-object", "word-kyou", "word-terebi", "word-mimasu"],
    correctAnswers: ["今日はテレビを見ません", "今日はテレビを見ません。"],
    acceptableAnswers: [
      "今日テレビを見ません",
      "今日テレビを見ません。",
      "きょうはテレビをみません",
      "きょうはテレビをみません。"
    ],
    explanationRu: "テレビ — объект с を, отрицательная форма 見ます — 見ません. ～ます-форма может описывать и будущее по контексту.",
  },
  {
    id: "exercise-kinou-gakkou-input",
    type: "text-input",
    prompt: "Напиши по-японски: Вчера я не ходил в школу.",
    targetItemIds: ["grammar-masu-past-negative", "grammar-ni-e-destination", "word-kinou", "word-gakkou", "word-ikimasu"],
    correctAnswers: [
      "昨日は学校へ行きませんでした",
      "昨日は学校へ行きませんでした。",
      "昨日は学校に行きませんでした",
      "昨日は学校に行きませんでした。"
    ],
    acceptableAnswers: [
      "昨日学校へ行きませんでした",
      "昨日学校へ行きませんでした。",
      "きのうはがっこうへいきませんでした",
      "きのうはがっこうへいきませんでした。"
    ],
    explanationRu: "Прошедшее отрицание 行きます — 行きませんでした. Направление можно отметить へ или に.",
  },
  {
    id: "exercise-ashita-future-choice",
    type: "multiple-choice",
    prompt: "Выбери правильное предложение: «Завтра я посмотрю фильм».",
    targetItemIds: ["grammar-masu-polite", "grammar-time-without-ni", "word-ashita", "word-eiga", "word-mimasu"],
    correctAnswers: ["明日映画を見ます"],
    distractors: ["明日映画を見ました", "明日に映画を見ます", "明日映画を見ませんでした"],
    explanationRu: "Форма ～ます является непрошедшей и по контексту 明日 выражает будущее. После 明日 частица に обычно не нужна.",
  },
];

export const lesson010: Lesson = {
  id: "lesson-010",
  unitId: "unit-003",
  order: 10,
  title: "Вчера я не ходил",
  description: "Отрицательные и прошедшие формы вежливых глаголов на ～ます.",
  theory: lesson010Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson010Vocabulary.map((item) => item.id),
    ...lesson010Grammar.map((item) => item.id),
    ...lesson010Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson010Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 24,
};

export const lesson010Bundle: LessonBundle = {
  lesson: lesson010,
  vocabulary: lesson010Vocabulary,
  grammar: lesson010Grammar,
  sentences: lesson010Sentences,
  exercises: lesson010Exercises,
  outcomes: [
    "строить отрицание глагола через ～ません",
    "говорить о завершившемся действии с ～ました",
    "строить прошедшее отрицание ～ませんでした",
    "понимать непрошедшую форму ～ます как настоящее или будущее по контексту",
  ],
};
