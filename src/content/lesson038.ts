import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson038Vocabulary: VocabularyItem[] = [
  { id: "word-iimasu-38", type: "vocabulary", writtenForm: "言います", reading: "いいます", meaningsRu: ["говорить", "сказать"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N4" },
  { id: "word-shukudai-38", type: "vocabulary", writtenForm: "宿題", reading: "しゅくだい", meaningsRu: ["домашнее задание"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
];

export const lesson038Grammar: GrammarPoint[] = [
  {
    id: "grammar-direct-quote-to-iimasu", type: "grammar", title: "Прямая речь: 「…」と言います",
    meaningRu: "передаёт слова собеседника как цитату",
    explanationRu: "Точные слова помещают в японские кавычки 「」, после цитаты ставят と и 言います／言いました: 先生は「宿題をしてください」と言いました — «Преподаватель сказал: “Сделайте домашнее задание”».",
    formation: ["[говорящий] は 「[точные слова]」 と 言います／言いました"],
    cautions: ["Частица と стоит после всей цитаты, а не внутри кавычек."],
    relatedGrammarIds: ["grammar-te-kudasai", "grammar-masu-past"], jlptLevel: "N4",
  },
  {
    id: "grammar-indirect-quote-to-iimasu", type: "grammar", title: "Косвенная речь: простая форма + と言います",
    meaningRu: "передаёт содержание сказанного без обязательного дословного цитирования",
    explanationRu: "Перед と言います используется простая форма: 田中さんは毎日働くと言いました — «Танака сказал, что работает каждый день». Для существительных и な-прилагательных действует та же модель с だ, что и перед と思います: 先生だと言いました, 好きだと言いました.",
    formation: ["[простая форма] + と + 言います", "先生だ + と言いました", "好きだ + と言いました"],
    cautions: ["Не ставь ～ます／です внутри нейтральной косвенной цитаты: 働きますと言いました неверно для изучаемой модели."],
    relatedGrammarIds: ["grammar-to-omoimasu", "grammar-da-before-omoimasu", "grammar-plain-nonpast"], jlptLevel: "N4",
  },
  {
    id: "grammar-iimasu-tense", type: "grammar", title: "Время глагола 言います",
    meaningRu: "показывает, когда произошло высказывание",
    explanationRu: "Финальный глагол определяет время акта речи: と言います — «говорит / скажет», と言いました — «сказал». Форма внутри цитаты передаёт содержание, а не автоматически время самого произнесения.",
    formation: ["…と言います — говорит", "…と言いました — сказал"],
    cautions: ["Не меняй внутреннюю форму только потому, что 言いました стоит в прошлом: содержание может относиться к настоящему или будущему."],
    relatedGrammarIds: ["grammar-direct-quote-to-iimasu", "grammar-indirect-quote-to-iimasu", "grammar-masu-past"], jlptLevel: "N4",
  },
  {
    id: "grammar-omoimasu-vs-iimasu", type: "grammar", title: "思います и 言います",
    meaningRu: "различает внутреннюю мысль и произнесённые слова",
    explanationRu: "～と思います сообщает, что говорящий думает. ～と言います сообщает, что кто-то говорит. Одна и та же часть перед と может быть содержанием мысли или речи: 高いと思います — «думаю, дорого»; 高いと言いました — «сказал, что дорого».",
    formation: ["[содержание] + と思います", "[содержание] + と言います"],
    cautions: ["Не заменяй 言います на 思います, когда важно, что слова были произнесены."],
    relatedGrammarIds: ["grammar-to-omoimasu", "grammar-indirect-quote-to-iimasu"], jlptLevel: "N4",
  },
];

export const lesson038Sentences: ExampleSentence[] = [
  { id: "sentence-38-teacher-homework", type: "sentence", japanese: "先生は「宿題をしてください」と言いました。", reading: "せんせいは「しゅくだいをしてください」といいました。", translationRu: "Преподаватель сказал: «Сделайте домашнее задание».", grammarIds: ["grammar-direct-quote-to-iimasu", "grammar-te-kudasai", "grammar-masu-past"], vocabularyIds: ["word-sensei", "word-shukudai-38", "word-iimasu-38"] },
  { id: "sentence-38-tanaka-works", type: "sentence", japanese: "田中さんは毎日働くと言いました。", reading: "たなかさんはまいにちはたらくといいました。", translationRu: "Танака сказал, что работает каждый день.", grammarIds: ["grammar-indirect-quote-to-iimasu", "grammar-iimasu-tense", "grammar-plain-nonpast", "grammar-time-without-ni"], vocabularyIds: ["word-tanaka-san", "word-mainichi", "word-hatarakimasu", "word-iimasu-38"] },
  { id: "sentence-38-i-like-japanese", type: "sentence", japanese: "私は日本語が好きだと言いました。", reading: "わたしはにほんごがすきだといいました。", translationRu: "Я сказал, что мне нравится японский.", grammarIds: ["grammar-indirect-quote-to-iimasu", "grammar-da-before-omoimasu", "grammar-suki-kirai-ga"], vocabularyIds: ["word-watashi", "word-nihongo", "word-suki-na", "word-iimasu-38"] },
  { id: "sentence-38-room-large", type: "sentence", japanese: "田中さんは部屋が大きいと言いました。", reading: "たなかさんはへやがおおきいといいました。", translationRu: "Танака сказал, что комната большая.", grammarIds: ["grammar-indirect-quote-to-iimasu", "grammar-iimasu-tense", "grammar-i-adjective-predicate"], vocabularyIds: ["word-tanaka-san", "word-heya", "word-ookii", "word-iimasu-38"] },
  { id: "sentence-38-think-vs-say", type: "sentence", japanese: "この車は高いと思いますが、田中さんは安いと言いました。", reading: "このくるまはたかいとおもいますが、たなかさんはやすいといいました。", translationRu: "Я думаю, эта машина дорогая, но Танака сказал, что она дешёвая.", grammarIds: ["grammar-omoimasu-vs-iimasu", "grammar-to-omoimasu", "grammar-indirect-quote-to-iimasu"], vocabularyIds: ["word-kuruma", "word-takai", "word-yasui", "word-tanaka-san", "word-omoimasu-37", "word-iimasu-38"] },
];

const confusions = ["grammar-direct-quote-to-iimasu", "grammar-indirect-quote-to-iimasu", "grammar-iimasu-tense", "grammar-omoimasu-vs-iimasu"];
export const lesson038Exercises: Exercise[] = [
  { id: "exercise-38-direct-order", type: "multiple-choice", prompt: "Выбери правильно оформленную прямую речь.", targetItemIds: ["grammar-direct-quote-to-iimasu", "word-sensei", "word-shukudai-38", "word-iimasu-38"], correctAnswers: ["先生は「宿題をしてください」と言いました"], distractors: ["先生は「宿題をしてくださいと」言いました", "先生は宿題をしてくださいと言いました", "先生は「宿題をします」とください"], explanationRu: "Точная цитата помещается в 「」, а と ставится после кавычек.", variantGroup: "lesson-038:direct", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-38-plain-verb", type: "multiple-choice", prompt: "Заполни: 田中さんは毎日 __ と言いました。", targetItemIds: ["grammar-indirect-quote-to-iimasu", "word-hatarakimasu", "word-mainichi"], correctAnswers: ["働く"], distractors: ["働きます", "働いて", "働くだ"], explanationRu: "Перед と言いました глагол ставится в простой форме: 働く.", variantGroup: "lesson-038:indirect", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-38-suki-da", type: "multiple-choice", prompt: "Какая косвенная цитата означает «сказал, что любит японский»?", targetItemIds: ["grammar-indirect-quote-to-iimasu", "grammar-suki-kirai-ga", "word-nihongo", "word-suki-na"], correctAnswers: ["日本語が好きだと言いました"], distractors: ["日本語が好きですと言いました", "日本語が好きなと言いました", "日本語を好きだと言いました"], explanationRu: "好き — な-прилагательное: перед と нужна だ, а объект предпочтения отмечается が.", variantGroup: "lesson-038:indirect", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-38-thought-or-speech", type: "multiple-choice", prompt: "Нужно сообщить произнесённые слова: «Танака сказал, что машина дорогая». Что выбрать?", targetItemIds: ["grammar-omoimasu-vs-iimasu", "word-tanaka-san", "word-kuruma", "word-takai"], correctAnswers: ["田中さんは車が高いと言いました"], distractors: ["田中さんは車が高いと思いました", "田中さんは車が高いですと言いました", "田中さんは車を高いと言いました"], explanationRu: "Произнесённые слова передаются через と言いました.", variantGroup: "lesson-038:contrast", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-38-builder", type: "sentence-builder", prompt: "Собери: Танака сказал, что работает каждый день.", targetItemIds: ["grammar-indirect-quote-to-iimasu", "grammar-iimasu-tense", "word-tanaka-san", "word-mainichi", "word-hatarakimasu", "word-iimasu-38"], correctAnswers: ["田中さん|は|毎日|働く|と|言いました"], distractors: ["働きます", "だ", "を"], explanationRu: "Содержание цитаты — 毎日働く; акт речи в прошлом — 言いました.", variantGroup: "lesson-038:indirect", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-38-input", type: "text-input", prompt: "Напиши по-японски: Я сказал, что мне нравится японский.", targetItemIds: ["grammar-indirect-quote-to-iimasu", "grammar-suki-kirai-ga", "word-watashi", "word-nihongo", "word-suki-na", "word-iimasu-38"], correctAnswers: ["私は日本語が好きだと言いました", "私は日本語が好きだと言いました。"], acceptableAnswers: ["わたしはにほんごがすきだといいました", "わたしはにほんごがすきだといいました。"], explanationRu: "好きだ — простая утвердительная форма な-прилагательного перед と.", variantGroup: "lesson-038:production", difficulty: 3, confusionItemIds: confusions },
  { id: "exercise-38-listening", type: "listening", prompt: "Прослушай и выбери точный смысл.", audioText: "先生は「宿題をしてください」と言いました。", targetItemIds: ["grammar-direct-quote-to-iimasu", "word-sensei", "word-shukudai-38", "word-iimasu-38"], correctAnswers: ["Преподаватель попросил сделать домашнее задание."], distractors: ["Преподаватель спросил разрешения не делать задание.", "Ученик подумал о домашнем задании.", "Преподаватель уже сделал домашнее задание."], explanationRu: "Цитата 宿題をしてください содержит просьбу, а 言いました сообщает, что преподаватель это сказал.", variantGroup: "lesson-038:listening", difficulty: 2, confusionItemIds: confusions },
];

export const lesson038: Lesson = { id: "lesson-038", unitId: "unit-011", order: 38, title: "Он сказал, что...", description: "Прямая и косвенная речь через ～と言います, время глагола речи и различие между мыслью и произнесёнными словами.", theory: lesson038Grammar.map((item) => item.explanationRu), itemIds: [...lesson038Vocabulary, ...lesson038Grammar, ...lesson038Sentences].map((item) => item.id), exerciseIds: lesson038Exercises.map((item) => item.id), estimatedMinutes: 20 };
export const lesson038Bundle: LessonBundle = { lesson: lesson038, vocabulary: lesson038Vocabulary, grammar: lesson038Grammar, sentences: lesson038Sentences, exercises: lesson038Exercises, outcomes: ["оформлять прямую цитату через 「…」と言います", "передавать косвенную речь простой формой", "выбирать время 言います／言いました", "различать ～と思います и ～と言います"] };
