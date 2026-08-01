import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson036Vocabulary: VocabularyItem[] = [
  { id: "word-kodomo-36", type: "vocabulary", writtenForm: "子供", reading: "こども", meaningsRu: ["ребёнок", "дети"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-nihon-36", type: "vocabulary", writtenForm: "日本", reading: "にほん", meaningsRu: ["Япония"], partOfSpeech: ["имя собственное"], jlptLevel: "N5" },
  { id: "word-hima-na-36", type: "vocabulary", writtenForm: "暇", reading: "ひま", meaningsRu: ["свободный", "незанятый", "свободное время"], partOfSpeech: ["な-прилагательное", "существительное"], jlptLevel: "N5" },
  { id: "word-aimasu-36", type: "vocabulary", writtenForm: "会います", reading: "あいます", meaningsRu: ["встречаться", "видеться"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
];

export const lesson036Grammar: GrammarPoint[] = [
  {
    id: "grammar-toki-clause", type: "grammar", title: "Когда...: ～とき",
    meaningRu: "обозначает время или ситуацию, в которой происходит главное действие",
    explanationRu: "とき ставится после определения времени: 忙しいとき、テレビを見ません — «Когда я занят, я не смотрю телевизор». Перед とき используются простые формы, даже если главное предложение вежливое.",
    formation: ["[простая форма／описание] + とき、[главное предложение]"],
    cautions: ["Не ставь перед とき вежливую форму ～ます: 行きますとき неверно; нужно 行くとき."],
    relatedGrammarIds: ["grammar-dictionary-form-role", "grammar-plain-nonpast"], jlptLevel: "N5",
  },
  {
    id: "grammar-noun-no-toki", type: "grammar", title: "Существительное + のとき",
    meaningRu: "означает «когда был / в период...»",
    explanationRu: "Существительное соединяется с とき частицей の: 子供のとき — «когда был ребёнком / в детстве». Модель такая же, как обычная связь существительных через の.",
    formation: ["[существительное] + の + とき", "子供のとき", "学生のとき"],
    cautions: ["Не говори 子供なとき: после существительного нужна の, а не な."],
    relatedGrammarIds: ["grammar-toki-clause", "grammar-no-link"], jlptLevel: "N5",
  },
  {
    id: "grammar-adjective-toki", type: "grammar", title: "Прилагательное + とき",
    meaningRu: "обозначает ситуацию через признак или состояние",
    explanationRu: "い-прилагательное ставится прямо: 忙しいとき. な-прилагательное получает な: 暇なとき. Формы повторяют обычное определение существительного, потому что とき грамматически является существительным «время / случай».",
    formation: ["[い-прилагательное] + とき", "[な-прилагательное] + な + とき", "忙しいとき", "暇なとき"],
    cautions: ["Не ставь です перед とき: 暇ですとき неверно."],
    relatedGrammarIds: ["grammar-i-adjective-noun", "grammar-na-adjective-noun", "grammar-toki-clause"], jlptLevel: "N5",
  },
  {
    id: "grammar-verb-toki-timing", type: "grammar", title: "行くとき и 行ったとき",
    meaningRu: "показывает, завершено ли действие перед событием главного предложения",
    explanationRu: "Словарная форма перед とき часто описывает действие, которое ещё не завершилось: 学校へ行くとき、傘を持ちます — зонт берут перед уходом или по пути. ～た-форма показывает, что действие уже произошло к моменту главного события: 学校へ行ったとき、先生に会いました — встретил учителя, когда пришёл в школу.",
    formation: ["行くとき — когда иду / перед тем как пойти", "行ったとき — когда сходил / после прибытия"],
    cautions: ["Форма перед とき определяется отношением двух действий, а не просто временем всего предложения."],
    relatedGrammarIds: ["grammar-toki-clause", "grammar-ta-form-role", "grammar-dictionary-form-role"], jlptLevel: "N5",
  },
];

export const lesson036Sentences: ExampleSentence[] = [
  { id: "sentence-36-childhood-japan", type: "sentence", japanese: "子供のとき、日本にいました。", reading: "こどものとき、にほんにいました。", translationRu: "В детстве я был в Японии.", grammarIds: ["grammar-noun-no-toki", "grammar-toki-clause", "grammar-masu-past"], vocabularyIds: ["word-kodomo-36", "word-nihon-36"] },
  { id: "sentence-36-free-read", type: "sentence", japanese: "暇なとき、本を読みます。", reading: "ひまなとき、ほんをよみます。", translationRu: "Когда у меня есть свободное время, я читаю книги.", grammarIds: ["grammar-adjective-toki", "grammar-na-adjective-noun", "grammar-o-object"], vocabularyIds: ["word-hima-na-36", "word-hon", "word-yomimasu"] },
  { id: "sentence-36-busy-no-tv", type: "sentence", japanese: "忙しいとき、テレビを見ません。", reading: "いそがしいとき、テレビをみません。", translationRu: "Когда я занят, я не смотрю телевизор.", grammarIds: ["grammar-adjective-toki", "grammar-i-adjective-noun", "grammar-masu-negative", "grammar-o-object"], vocabularyIds: ["word-isogashii", "word-terebi", "word-mimasu"] },
  { id: "sentence-36-going-school-umbrella", type: "sentence", japanese: "学校へ行くとき、傘を持ちます。", reading: "がっこうへいくとき、かさをもちます。", translationRu: "Когда я иду в школу, я беру зонт.", grammarIds: ["grammar-verb-toki-timing", "grammar-dictionary-form-group1", "grammar-ni-e-destination", "grammar-o-object"], vocabularyIds: ["word-gakkou", "word-ikimasu", "word-kasa-28", "word-mochimasu-28"] },
  { id: "sentence-36-went-school-met", type: "sentence", japanese: "学校へ行ったとき、先生に会いました。", reading: "がっこうへいったとき、せんせいにあいました。", translationRu: "Когда я пришёл в школу, я встретил преподавателя.", grammarIds: ["grammar-verb-toki-timing", "grammar-ta-form-from-te", "grammar-masu-past", "grammar-ni-e-destination"], vocabularyIds: ["word-gakkou", "word-ikimasu", "word-sensei", "word-aimasu-36"] },
];

const confusions = ["grammar-toki-clause", "grammar-noun-no-toki", "grammar-adjective-toki", "grammar-verb-toki-timing", "grammar-dictionary-form-role", "grammar-ta-form-role"];
export const lesson036Exercises: Exercise[] = [
  { id: "exercise-36-noun-toki", type: "multiple-choice", prompt: "Как сказать «в детстве / когда был ребёнком»?", targetItemIds: ["grammar-noun-no-toki", "word-kodomo-36"], correctAnswers: ["子供のとき"], distractors: ["子供なとき", "子供でとき", "子供をとき"], explanationRu: "Существительное соединяется с とき частицей の.", variantGroup: "lesson-036:noun", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-36-na-adjective-toki", type: "multiple-choice", prompt: "Выбери правильную форму: «когда свободен».", targetItemIds: ["grammar-adjective-toki", "word-hima-na-36"], correctAnswers: ["暇なとき"], distractors: ["暇のとき", "暇ですとき", "暇でとき"], explanationRu: "暇 — な-прилагательное, поэтому перед とき нужна な.", variantGroup: "lesson-036:adjective", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-36-i-adjective-toki", type: "multiple-choice", prompt: "Выбери правильную форму: «когда занят».", targetItemIds: ["grammar-adjective-toki", "word-isogashii"], correctAnswers: ["忙しいとき"], distractors: ["忙しいなとき", "忙しくてとき", "忙しいですとき"], explanationRu: "い-прилагательное ставится перед とき без дополнительных связок.", variantGroup: "lesson-036:adjective", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-36-verb-contrast", type: "multiple-choice", prompt: "Ты берёшь зонт перед уходом в школу. Какая форма точнее?", targetItemIds: ["grammar-verb-toki-timing", "word-gakkou", "word-ikimasu", "word-kasa-28", "word-mochimasu-28"], correctAnswers: ["学校へ行くとき、傘を持ちます"], distractors: ["学校へ行ったとき、傘を持ちます", "学校へ行きますとき、傘を持ちます", "学校へ行ってとき、傘を持ちます"], explanationRu: "Зонт берётся до завершения действия 行く, поэтому используется словарная форма.", variantGroup: "lesson-036:verb", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-36-builder", type: "sentence-builder", prompt: "Собери: Когда у меня есть свободное время, я читаю книги.", targetItemIds: ["grammar-adjective-toki", "word-hima-na-36", "word-hon", "word-yomimasu"], correctAnswers: ["暇|な|とき|本|を|読みます"], distractors: ["の", "です", "読んだ"], explanationRu: "暇 — な-прилагательное: 暇なとき.", variantGroup: "lesson-036:adjective", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-36-input", type: "text-input", prompt: "Напиши по-японски: В детстве я был в Японии.", targetItemIds: ["grammar-noun-no-toki", "word-kodomo-36", "word-nihon-36"], correctAnswers: ["子供のとき日本にいました", "子供のとき、日本にいました", "子供のとき、日本にいました。"], acceptableAnswers: ["こどものときにほんにいました", "こどものとき、にほんにいました"], explanationRu: "子供 + のとき; место существования отмечается に.", variantGroup: "lesson-036:noun", difficulty: 3, confusionItemIds: confusions },
  { id: "exercise-36-listening", type: "listening", prompt: "Прослушай и выбери точное значение.", audioText: "学校へ行ったとき、先生に会いました。", targetItemIds: ["grammar-verb-toki-timing", "word-gakkou", "word-ikimasu", "word-sensei", "word-aimasu-36"], correctAnswers: ["Когда я пришёл в школу, я встретил преподавателя."], distractors: ["Перед школой я должен встретить преподавателя.", "Когда я иду в школу, я беру преподавателя с собой.", "Я ещё не встречал преподавателя в школе."], explanationRu: "行ったとき показывает, что приход в школу уже произошёл к моменту встречи.", variantGroup: "lesson-036:verb", difficulty: 2, confusionItemIds: confusions },
];

export const lesson036: Lesson = { id: "lesson-036", unitId: "unit-010", order: 36, title: "Когда это происходит", description: "～とき после существительных, прилагательных и глаголов; различие 行くとき и 行ったとき.", theory: lesson036Grammar.map((item) => item.explanationRu), itemIds: [...lesson036Vocabulary, ...lesson036Grammar, ...lesson036Sentences].map((item) => item.id), exerciseIds: lesson036Exercises.map((item) => item.id), estimatedMinutes: 21 };
export const lesson036Bundle: LessonBundle = { lesson: lesson036, vocabulary: lesson036Vocabulary, grammar: lesson036Grammar, sentences: lesson036Sentences, exercises: lesson036Exercises, outcomes: ["использовать ～とき как временную конструкцию", "строить существительное + のとき", "строить формы прилагательных перед とき", "различать действие до и после момента через 行くとき／行ったとき"] };
