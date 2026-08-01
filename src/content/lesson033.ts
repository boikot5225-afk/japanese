import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson033Vocabulary: VocabularyItem[] = [
  { id: "word-issho-ni-33", type: "vocabulary", writtenForm: "一緒に", reading: "いっしょに", meaningsRu: ["вместе"], partOfSpeech: ["наречие"], jlptLevel: "N5" },
  { id: "word-nimotsu-33", type: "vocabulary", writtenForm: "荷物", reading: "にもつ", meaningsRu: ["багаж", "вещи", "поклажа"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-chotto-33", type: "vocabulary", writtenForm: "ちょっと", reading: "ちょっと", meaningsRu: ["немного", "слегка", "мягкое уклонение в отказе"], partOfSpeech: ["наречие", "разговорная формула"], jlptLevel: "N5" },
];

export const lesson033Grammar: GrammarPoint[] = [
  {
    id: "grammar-mashou-proposal", type: "grammar", title: "Предложение ～ましょう",
    meaningRu: "предлагает совместно выполнить действие: «давайте...»",
    explanationRu: "Замени окончание ～ます на ～ましょう: 行きます→行きましょう, 勉強します→勉強しましょう. Форма предлагает общее действие и обычно звучит увереннее, чем вопрос с ～ませんか.",
    formation: ["[основа перед ます] + ましょう", "行きます → 行きましょう", "勉強します → 勉強しましょう"],
    cautions: ["Это не форма будущего времени сама по себе: она выражает предложение или решение действовать вместе."],
    relatedGrammarIds: ["grammar-masu-polite"], jlptLevel: "N5",
  },
  {
    id: "grammar-masen-ka-invitation", type: "grammar", title: "Приглашение ～ませんか",
    meaningRu: "мягко приглашает собеседника выполнить действие вместе",
    explanationRu: "К вежливой отрицательной форме добавляется か: 一緒に勉強しませんか — «Не хотите позаниматься вместе?». Несмотря на внешнее ～ません, всё выражение работает как приглашение, а не как вопрос «вы не делаете?». Значение определяется контекстом и интонацией.",
    formation: ["[глагол в ～ません] + か", "行きませんか", "食べませんか"],
    cautions: ["Не переводи ～ませんか механически как простое отрицание; в ситуации совместного действия это приглашение."],
    relatedGrammarIds: ["grammar-masu-negative", "grammar-ka-question"], jlptLevel: "N5",
  },
  {
    id: "grammar-mashou-ka-offer", type: "grammar", title: "Предложение помощи ～ましょうか",
    meaningRu: "предлагает выполнить действие за собеседника или вместе решить, что делать",
    explanationRu: "Форма ～ましょうか часто означает «давайте я...?» или «может, ...?»: 荷物を持ちましょうか — «Давайте я понесу вещи?». В отличие от ～ませんか, говорящий нередко предлагает собственную помощь.",
    formation: ["[основа перед ます] + ましょうか", "持ちましょうか", "読みましょうか"],
    cautions: ["Конкретный смысл «я сделаю» или «сделаем вместе» зависит от действия и ситуации."],
    relatedGrammarIds: ["grammar-mashou-proposal", "grammar-ka-question"], jlptLevel: "N5",
  },
  {
    id: "grammar-invitation-responses", type: "grammar", title: "Ответ на приглашение",
    meaningRu: "принимает приглашение или мягко отказывается",
    explanationRu: "Согласие можно выразить はい、～ましょう: はい、行きましょう. Мягкий отказ часто не договаривают до конца: すみません、今日はちょっと… — буквально «извините, сегодня немного...». Собеседник понимает отказ без резкого いいえ.",
    formation: ["はい、～ましょう", "すみません、ちょっと…"],
    cautions: ["ちょっと само по себе не означает «нет», но в незавершённом ответе на приглашение обычно смягчает отказ."],
    relatedGrammarIds: ["grammar-mashou-proposal", "grammar-masen-ka-invitation"], jlptLevel: "N5",
  },
];

export const lesson033Sentences: ExampleSentence[] = [
  { id: "sentence-33-study-invitation", type: "sentence", japanese: "一緒に日本語を勉強しませんか。", reading: "いっしょににほんごをべんきょうしませんか。", translationRu: "Не хотите вместе позаниматься японским?", grammarIds: ["grammar-masen-ka-invitation", "grammar-masu-negative", "grammar-ka-question", "grammar-o-object"], vocabularyIds: ["word-issho-ni-33", "word-nihongo", "word-benkyoushimasu"] },
  { id: "sentence-33-study-accept", type: "sentence", japanese: "はい、勉強しましょう。", reading: "はい、べんきょうしましょう。", translationRu: "Да, давайте позанимаемся.", grammarIds: ["grammar-mashou-proposal", "grammar-invitation-responses"], vocabularyIds: ["word-benkyoushimasu"] },
  { id: "sentence-33-park-invitation", type: "sentence", japanese: "公園へ行きませんか。", reading: "こうえんへいきませんか。", translationRu: "Не хотите пойти в парк?", grammarIds: ["grammar-masen-ka-invitation", "grammar-ni-e-destination", "grammar-ka-question"], vocabularyIds: ["word-kouen", "word-ikimasu"] },
  { id: "sentence-33-luggage-offer", type: "sentence", japanese: "荷物を持ちましょうか。", reading: "にもつをもちましょうか。", translationRu: "Давайте я понесу вещи?", grammarIds: ["grammar-mashou-ka-offer", "grammar-o-object", "grammar-ka-question"], vocabularyIds: ["word-nimotsu-33", "word-mochimasu-28"] },
  { id: "sentence-33-soft-refusal", type: "sentence", japanese: "すみません、今日はちょっと…。", reading: "すみません、きょうはちょっと…。", translationRu: "Извините, сегодня не получится...", grammarIds: ["grammar-invitation-responses", "grammar-wa-topic", "grammar-time-without-ni"], vocabularyIds: ["word-chotto-33", "word-kyou"] },
];

const confusions = ["grammar-mashou-proposal", "grammar-masen-ka-invitation", "grammar-mashou-ka-offer", "grammar-invitation-responses", "grammar-masu-negative"];
export const lesson033Exercises: Exercise[] = [
  { id: "exercise-33-ikimashou", type: "conjugation", prompt: "Поставь 行きます в форму «давайте пойдём».", targetItemIds: ["grammar-mashou-proposal", "word-ikimasu"], correctAnswers: ["行きましょう"], acceptableAnswers: ["いきましょう"], distractors: ["行きません", "行きました", "行きましょうか"], explanationRu: "Убираем ます и добавляем ましょう: 行きます→行きましょう.", variantGroup: "lesson-033:proposal", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-33-invitation-meaning", type: "multiple-choice", prompt: "Что обычно означает 一緒に勉強しませんか в этой ситуации?", targetItemIds: ["grammar-masen-ka-invitation", "word-issho-ni-33", "word-benkyoushimasu"], correctAnswers: ["Не хотите позаниматься вместе?"], distractors: ["Вы не занимаетесь вместе?", "Нам нельзя заниматься вместе.", "Я уже позанимался вместе."], explanationRu: "～ませんか с совместным действием — мягкое приглашение.", variantGroup: "lesson-033:invitation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-33-offer-choice", type: "multiple-choice", prompt: "Как предложить: «Давайте я понесу вещи?»", targetItemIds: ["grammar-mashou-ka-offer", "word-nimotsu-33", "word-mochimasu-28"], correctAnswers: ["荷物を持ちましょうか"], distractors: ["荷物を持ちませんか", "荷物を持ってはいけません", "荷物を持ったことがありますか"], explanationRu: "Предложение собственной помощи выражается ～ましょうか.", variantGroup: "lesson-033:offer", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-33-builder", type: "sentence-builder", prompt: "Собери: Не хотите вместе позаниматься японским?", targetItemIds: ["grammar-masen-ka-invitation", "word-issho-ni-33", "word-nihongo", "word-benkyoushimasu"], correctAnswers: ["一緒に|日本語|を|勉強しません|か"], distractors: ["勉強します", "ましょう", "でした"], explanationRu: "Приглашение строится вежливой отрицательной формой + か.", variantGroup: "lesson-033:invitation", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-33-response", type: "multiple-choice", prompt: "Как естественно принять приглашение 公園へ行きませんか?", targetItemIds: ["grammar-invitation-responses", "word-kouen", "word-ikimasu"], correctAnswers: ["はい、行きましょう"], distractors: ["はい、行きません", "いいえ、行きましょう", "はい、行ったことがあります"], explanationRu: "Согласие на приглашение удобно выразить ～ましょう.", variantGroup: "lesson-033:response", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-33-input", type: "text-input", prompt: "Напиши по-японски: Не хотите пойти в парк?", targetItemIds: ["grammar-masen-ka-invitation", "word-kouen", "word-ikimasu"], correctAnswers: ["公園へ行きませんか", "公園へ行きませんか。"], acceptableAnswers: ["こうえんへいきませんか", "こうえんへいきませんか。", "公園に行きませんか", "公園に行きませんか。"], explanationRu: "Направление отмечается へ или に, приглашение — 行きませんか.", variantGroup: "lesson-033:invitation", difficulty: 3, confusionItemIds: confusions },
  { id: "exercise-33-listening", type: "listening", prompt: "Прослушай и выбери точное значение.", audioText: "荷物を持ちましょうか。", targetItemIds: ["grammar-mashou-ka-offer", "word-nimotsu-33", "word-mochimasu-28"], correctAnswers: ["Давайте я понесу вещи?"], distractors: ["Не хотите нести вещи?", "Вещи брать нельзя.", "Мне доводилось носить вещи."], explanationRu: "～ましょうか здесь предлагает помощь.", variantGroup: "lesson-033:offer", difficulty: 2, confusionItemIds: confusions },
];

export const lesson033: Lesson = { id: "lesson-033", unitId: "unit-010", order: 33, title: "Давайте вместе", description: "Предложения ～ましょう, приглашения ～ませんか, помощь через ～ましょうか и естественные ответы.", theory: lesson033Grammar.map((item) => item.explanationRu), itemIds: [...lesson033Vocabulary, ...lesson033Grammar, ...lesson033Sentences].map((item) => item.id), exerciseIds: lesson033Exercises.map((item) => item.id), estimatedMinutes: 20 };
export const lesson033Bundle: LessonBundle = { lesson: lesson033, vocabulary: lesson033Vocabulary, grammar: lesson033Grammar, sentences: lesson033Sentences, exercises: lesson033Exercises, outcomes: ["предлагать совместное действие", "мягко приглашать через ～ませんか", "предлагать помощь через ～ましょうか", "принимать приглашение и мягко отказываться"] };
