import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson037Vocabulary: VocabularyItem[] = [
  { id: "word-omoimasu-37", type: "vocabulary", writtenForm: "思います", reading: "おもいます", meaningsRu: ["думать", "считать", "полагать"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N4" },
];

export const lesson037Grammar: GrammarPoint[] = [
  {
    id: "grammar-to-omoimasu", type: "grammar", title: "Мнение через ～と思います",
    meaningRu: "передаёт мысль, оценку или предположение говорящего",
    explanationRu: "Часть предложения перед と оформляется как содержание мысли, а 思います означает «думаю / считаю»: この車は高いと思います — «Думаю, эта машина дорогая». Частица と здесь отмечает цитируемое содержание мысли.",
    formation: ["[простое высказывание] + と + 思います"],
    cautions: ["Перед と обычно не ставят вежливые окончания です／ます; вежливость выражает финальное 思います."],
    relatedGrammarIds: ["grammar-plain-nonpast", "grammar-dictionary-form-role"], jlptLevel: "N4",
  },
  {
    id: "grammar-plain-before-omoimasu", type: "grammar", title: "Глагол и い-прилагательное перед と思います",
    meaningRu: "использует простую форму внутри содержания мысли",
    explanationRu: "Глагол ставится в словарную, простую отрицательную или прошедшую форму: 勉強すると思います, 勉強しないと思います. い-прилагательное ставится прямо: 高いと思います, 高くないと思います.",
    formation: ["勉強する + と思います", "勉強しない + と思います", "高い + と思います"],
    cautions: ["Формы 勉強しますと思います и 高いですと思います в нейтральной модели неверны."],
    relatedGrammarIds: ["grammar-to-omoimasu", "grammar-plain-nonpast", "grammar-i-adjective-predicate"], jlptLevel: "N4",
  },
  {
    id: "grammar-da-before-omoimasu", type: "grammar", title: "Существительное и な-прилагательное + だと思います",
    meaningRu: "добавляет простую связку だ перед と",
    explanationRu: "У существительного и な-прилагательного в непрошедшем утвердительном высказывании нужна простая связка だ: 先生だと思います, 静かだと思います. な перед と не используется.",
    formation: ["先生です → 先生だと思います", "静かです → 静かだと思います"],
    cautions: ["Не говори 先生ですと思います, 静かですと思います или 静かなと思います."],
    relatedGrammarIds: ["grammar-to-omoimasu", "grammar-desu", "grammar-na-adjective-predicate"], jlptLevel: "N4",
  },
  {
    id: "grammar-omoimasu-negation-scope", type: "grammar", title: "～ないと思います и ～と思いません",
    meaningRu: "различает отрицательное содержание мысли и отрицание самого «думаю»",
    explanationRu: "高くないと思います означает «думаю, что недорого». 高いと思いません означает «не думаю, что дорого». В обычной речи первый вариант часто прямо утверждает отрицательную оценку, а второй осторожнее отвергает положительное утверждение.",
    formation: ["[отрицательная простая форма] + と思います", "[утвердительная простая форма] + と思いません"],
    cautions: ["Не считай эти формы полностью взаимозаменяемыми: отрицание стоит в разных частях предложения."],
    relatedGrammarIds: ["grammar-to-omoimasu", "grammar-masu-negative"], jlptLevel: "N4",
  },
];

export const lesson037Sentences: ExampleSentence[] = [
  { id: "sentence-37-car-expensive", type: "sentence", japanese: "この車は高いと思います。", reading: "このくるまはたかいとおもいます。", translationRu: "Думаю, эта машина дорогая.", grammarIds: ["grammar-to-omoimasu", "grammar-plain-before-omoimasu", "grammar-wa-topic"], vocabularyIds: ["word-kuruma", "word-takai", "word-omoimasu-37"] },
  { id: "sentence-37-teacher-busy", type: "sentence", japanese: "先生は忙しいと思います。", reading: "せんせいはいそがしいとおもいます。", translationRu: "Думаю, преподаватель занят.", grammarIds: ["grammar-to-omoimasu", "grammar-plain-before-omoimasu", "grammar-wa-topic"], vocabularyIds: ["word-sensei", "word-isogashii", "word-omoimasu-37"] },
  { id: "sentence-37-tanaka-teacher", type: "sentence", japanese: "田中さんは先生だと思います。", reading: "たなかさんはせんせいだとおもいます。", translationRu: "Думаю, Танака — преподаватель.", grammarIds: ["grammar-to-omoimasu", "grammar-da-before-omoimasu", "grammar-wa-topic"], vocabularyIds: ["word-tanaka-san", "word-sensei", "word-omoimasu-37"] },
  { id: "sentence-37-town-quiet", type: "sentence", japanese: "この町は静かだと思います。", reading: "このまちはしずかだとおもいます。", translationRu: "Думаю, этот город тихий.", grammarIds: ["grammar-to-omoimasu", "grammar-da-before-omoimasu", "grammar-wa-topic"], vocabularyIds: ["word-machi", "word-shizuka-na", "word-omoimasu-37"] },
  { id: "sentence-37-tanaka-not-study", type: "sentence", japanese: "田中さんは日本語を勉強しないと思います。", reading: "たなかさんはにほんごをべんきょうしないとおもいます。", translationRu: "Думаю, Танака не занимается японским.", grammarIds: ["grammar-omoimasu-negation-scope", "grammar-nai-irregular", "grammar-o-object"], vocabularyIds: ["word-tanaka-san", "word-nihongo", "word-benkyoushimasu", "word-omoimasu-37"] },
];

const confusions = ["grammar-to-omoimasu", "grammar-plain-before-omoimasu", "grammar-da-before-omoimasu", "grammar-omoimasu-negation-scope"];
export const lesson037Exercises: Exercise[] = [
  { id: "exercise-37-verb-plain", type: "multiple-choice", prompt: "Выбери правильную форму: «Думаю, Танака занимается японским».", targetItemIds: ["grammar-plain-before-omoimasu", "word-tanaka-san", "word-nihongo", "word-benkyoushimasu", "word-omoimasu-37"], correctAnswers: ["田中さんは日本語を勉強すると思います"], distractors: ["田中さんは日本語を勉強しますと思います", "田中さんは日本語を勉強してと思います", "田中さんは日本語を勉強するだと思います"], explanationRu: "Перед と思います глагол ставится в простой форме: 勉強する.", variantGroup: "lesson-037:plain", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-37-noun-da", type: "multiple-choice", prompt: "Заполни: 田中さんは先生 __ と思います。", targetItemIds: ["grammar-da-before-omoimasu", "word-tanaka-san", "word-sensei"], correctAnswers: ["だ"], distractors: ["です", "な", "で"], explanationRu: "Существительное в утвердительной непрошедшей форме требует だ перед と.", variantGroup: "lesson-037:da", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-37-na-da", type: "multiple-choice", prompt: "Какая форма правильная: «Думаю, город тихий»?", targetItemIds: ["grammar-da-before-omoimasu", "word-machi", "word-shizuka-na"], correctAnswers: ["町は静かだと思います"], distractors: ["町は静かですと思います", "町は静かなと思います", "町は静かでと思います"], explanationRu: "な-прилагательное использует простую связку だ: 静かだと思います.", variantGroup: "lesson-037:da", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-37-negation-scope", type: "multiple-choice", prompt: "Какая фраза прямо означает «Думаю, машина недорогая»?", targetItemIds: ["grammar-omoimasu-negation-scope", "word-kuruma", "word-takai"], correctAnswers: ["車は高くないと思います"], distractors: ["車は高いと思いません", "車は高くないと思いません", "車は高くありませんと思います"], explanationRu: "Отрицательное содержание ставится перед と: 高くないと思います.", variantGroup: "lesson-037:scope", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-37-builder", type: "sentence-builder", prompt: "Собери: Думаю, преподаватель занят.", targetItemIds: ["grammar-to-omoimasu", "grammar-plain-before-omoimasu", "word-sensei", "word-isogashii", "word-omoimasu-37"], correctAnswers: ["先生|は|忙しい|と|思います"], distractors: ["です", "だ", "を"], explanationRu: "い-прилагательное ставится перед と напрямую: 忙しいと思います.", variantGroup: "lesson-037:plain", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-37-input", type: "text-input", prompt: "Напиши по-японски: Думаю, Танака — преподаватель.", targetItemIds: ["grammar-da-before-omoimasu", "word-tanaka-san", "word-sensei", "word-omoimasu-37"], correctAnswers: ["田中さんは先生だと思います", "田中さんは先生だと思います。"], acceptableAnswers: ["たなかさんはせんせいだとおもいます", "たなかさんはせんせいだとおもいます。"], explanationRu: "先生 — существительное, поэтому перед と нужна связка だ.", variantGroup: "lesson-037:production", difficulty: 3, confusionItemIds: confusions },
  { id: "exercise-37-listening", type: "listening", prompt: "Прослушай и выбери точное значение.", audioText: "この町は静かだと思います。", targetItemIds: ["grammar-da-before-omoimasu", "word-machi", "word-shizuka-na", "word-omoimasu-37"], correctAnswers: ["Думаю, этот город тихий."], distractors: ["Этот город точно был тихим.", "Я не думаю об этом городе.", "Этот город станет тихим."], explanationRu: "静かだと思います выражает мнение о состоянии города.", variantGroup: "lesson-037:listening", difficulty: 2, confusionItemIds: confusions },
];

export const lesson037: Lesson = { id: "lesson-037", unitId: "unit-011", order: 37, title: "Я думаю, что...", description: "Мнение через ～と思います, простые формы перед と и обязательная связка だ у существительных и な-прилагательных.", theory: lesson037Grammar.map((item) => item.explanationRu), itemIds: [...lesson037Vocabulary, ...lesson037Grammar, ...lesson037Sentences].map((item) => item.id), exerciseIds: lesson037Exercises.map((item) => item.id), estimatedMinutes: 20 };
export const lesson037Bundle: LessonBundle = { lesson: lesson037, vocabulary: lesson037Vocabulary, grammar: lesson037Grammar, sentences: lesson037Sentences, exercises: lesson037Exercises, outcomes: ["выражать мнение через ～と思います", "ставить глаголы и い-прилагательные в простую форму перед と", "использовать だ после существительных и な-прилагательных", "различать отрицание содержания и отрицание 思います"] };
