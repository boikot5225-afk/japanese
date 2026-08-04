import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson034Vocabulary: VocabularyItem[] = [
  { id: "word-mou-34", type: "vocabulary", writtenForm: "もう", reading: "もう", meaningsRu: ["уже", "больше не"], partOfSpeech: ["наречие"], jlptLevel: "N5" },
  { id: "word-mada-34", type: "vocabulary", writtenForm: "まだ", reading: "まだ", meaningsRu: ["ещё", "пока ещё"], partOfSpeech: ["наречие"], jlptLevel: "N5" },
  { id: "word-furimasu-34", type: "vocabulary", writtenForm: "降ります", reading: "ふります", meaningsRu: ["идти", "выпадать"], partOfSpeech: ["глагол", "о дожде или снеге", "вежливая форма"], jlptLevel: "N5" },
];

export const lesson034Grammar: GrammarPoint[] = [
  {
    id: "grammar-mou-past", type: "grammar", title: "Уже сделал: もう～ました",
    meaningRu: "сообщает, что действие уже завершено",
    explanationRu: "もう ставится перед глаголом в прошедшей форме: もう宿題をしました — «Я уже сделал домашнее задание». Наречие もう показывает, что ожидаемое действие завершилось раньше текущего момента.",
    formation: ["もう + [глагол в ～ました]", "もう食べました", "もう勉強しました"],
    cautions: ["Само もう не делает глагол прошедшим: завершённость должна быть выражена формой ～ました или другой подходящей формой контекста."],
    relatedGrammarIds: ["grammar-masu-past"], jlptLevel: "N5",
  },
  {
    id: "grammar-mada-te-imasen", type: "grammar", title: "Ещё не сделал: まだ～ていません",
    meaningRu: "сообщает, что ожидаемое действие пока не завершено",
    explanationRu: "Для значения «ещё не» используется まだ + て-форма + いません: まだ宿題をしていません — «Я ещё не сделал домашнее задание». Форма описывает текущее состояние незавершённости.",
    formation: ["まだ + [て-форма] + いません", "まだ食べていません", "まだ読んでいません"],
    cautions: ["まだ食べません чаще означает «пока не буду есть», а не «ещё не ел». Для незавершённого действия нужна ～ていません."],
    relatedGrammarIds: ["grammar-te-imasu-ongoing", "grammar-masu-negative"], jlptLevel: "N5",
  },
  {
    id: "grammar-mada-continuing", type: "grammar", title: "Всё ещё: まだ～ています",
    meaningRu: "показывает, что действие или состояние продолжается",
    explanationRu: "まだ с утвердительной формой ～ています означает «всё ещё»: まだ雨が降っています — «Дождь всё ещё идёт». В отличие от まだ～ていません, действие здесь реально продолжается.",
    formation: ["まだ + [て-форма] + います", "まだ降っています", "まだ勉強しています"],
    cautions: ["Смотри на отрицание: まだしています — всё ещё делает; まだしていません — ещё не сделал."],
    relatedGrammarIds: ["grammar-te-imasu-ongoing", "grammar-mada-te-imasen"], jlptLevel: "N5",
  },
  {
    id: "grammar-mou-mashita-ka", type: "grammar", title: "Вопрос «уже?» и краткий ответ",
    meaningRu: "спрашивает, завершено ли действие к текущему моменту",
    explanationRu: "Вопрос строится как もう～ましたか: もう食べましたか — «Вы уже поели?». Согласие: はい、もう食べました. Если действие ещё не завершено, естественный краткий ответ — いいえ、まだです.",
    formation: ["もう～ましたか", "はい、もう～ました", "いいえ、まだです"],
    cautions: ["まだです — краткий ответ «ещё нет»; он опирается на действие из предыдущего вопроса."],
    relatedGrammarIds: ["grammar-mou-past", "grammar-ka-question"], jlptLevel: "N5",
  },
];

export const lesson034Sentences: ExampleSentence[] = [
  { id: "sentence-34-homework-already", type: "sentence", japanese: "もう宿題をしました。", reading: "もうしゅくだいをしました。", translationRu: "Я уже сделал домашнее задание.", grammarIds: ["grammar-mou-past", "grammar-masu-past", "grammar-o-object"], vocabularyIds: ["word-mou-34", "word-shukudai-25"] },
  { id: "sentence-34-food-question", type: "sentence", japanese: "もう日本料理を食べましたか。", reading: "もうにほんりょうりをたべましたか。", translationRu: "Вы уже ели японскую кухню?", grammarIds: ["grammar-mou-mashita-ka", "grammar-masu-past", "grammar-ka-question", "grammar-o-object"], vocabularyIds: ["word-mou-34", "word-ryouri", "word-tabemasu"] },
  { id: "sentence-34-not-yet-short", type: "sentence", japanese: "いいえ、まだです。", reading: "いいえ、まだです。", translationRu: "Нет, ещё нет.", grammarIds: ["grammar-mou-mashita-ka", "grammar-desu"], vocabularyIds: ["word-mada-34"] },
  { id: "sentence-34-homework-not-yet", type: "sentence", japanese: "まだ宿題をしていません。", reading: "まだしゅくだいをしていません。", translationRu: "Я ещё не сделал домашнее задание.", grammarIds: ["grammar-mada-te-imasen", "grammar-te-form-group2-irregular", "grammar-o-object"], vocabularyIds: ["word-mada-34", "word-shukudai-25"] },
  { id: "sentence-34-rain-still", type: "sentence", japanese: "まだ雨が降っています。", reading: "まだあめがふっています。", translationRu: "Дождь всё ещё идёт.", grammarIds: ["grammar-mada-continuing", "grammar-te-imasu-ongoing"], vocabularyIds: ["word-mada-34", "word-ame-28", "word-furimasu-34"] },
];

const confusions = ["grammar-mou-past", "grammar-mada-te-imasen", "grammar-mada-continuing", "grammar-mou-mashita-ka", "grammar-masu-past", "grammar-te-imasu-ongoing"];
export const lesson034Exercises: Exercise[] = [
  { id: "exercise-34-already-choice", type: "multiple-choice", prompt: "Как сказать «Я уже сделал домашнее задание»?", targetItemIds: ["grammar-mou-past", "word-mou-34", "word-shukudai-25"], correctAnswers: ["もう宿題をしました"], distractors: ["まだ宿題をしました", "もう宿題をします", "まだ宿題をしていません"], explanationRu: "Завершённое действие: もう + ～ました.", variantGroup: "lesson-034:already", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-34-not-yet-choice", type: "multiple-choice", prompt: "Как сказать «Я ещё не сделал домашнее задание»?", targetItemIds: ["grammar-mada-te-imasen", "word-mada-34", "word-shukudai-25"], correctAnswers: ["まだ宿題をしていません"], distractors: ["まだ宿題をしません", "もう宿題をしていません", "まだ宿題をしました"], explanationRu: "Незавершённость к текущему моменту выражается まだ～ていません.", variantGroup: "lesson-034:not-yet", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-34-still-contrast", type: "multiple-choice", prompt: "Что означает まだ雨が降っています?", targetItemIds: ["grammar-mada-continuing", "word-mada-34", "word-ame-28", "word-furimasu-34"], correctAnswers: ["Дождь всё ещё идёт"], distractors: ["Дождь ещё не начался", "Дождь уже закончился", "Дождя не будет"], explanationRu: "Утвердительное ～ています после まだ показывает продолжающееся действие.", variantGroup: "lesson-034:still", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-34-question-response", type: "multiple-choice", prompt: "Ответь на もう食べましたか, если ты ещё не ел.", targetItemIds: ["grammar-mou-mashita-ka", "word-mou-34", "word-mada-34", "word-tabemasu"], correctAnswers: ["いいえ、まだです"], distractors: ["はい、まだです", "いいえ、もう食べました", "はい、食べませんか"], explanationRu: "Краткий отрицательный ответ на вопрос «уже?» — いいえ、まだです.", variantGroup: "lesson-034:question", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-34-builder", type: "sentence-builder", prompt: "Собери: Я ещё не сделал домашнее задание.", targetItemIds: ["grammar-mada-te-imasen", "word-mada-34", "word-shukudai-25"], correctAnswers: ["まだ|宿題|を|して|いません"], distractors: ["しました", "もう", "います"], explanationRu: "する→して + いません; перед конструкцией ставится まだ.", variantGroup: "lesson-034:not-yet", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-34-input", type: "text-input", prompt: "Напиши по-японски: Дождь всё ещё идёт.", targetItemIds: ["grammar-mada-continuing", "word-mada-34", "word-ame-28", "word-furimasu-34"], correctAnswers: ["まだ雨が降っています", "まだ雨が降っています。"], acceptableAnswers: ["まだあめがふっています", "まだあめがふっています。"], explanationRu: "降ります→降って + います; まだ означает «всё ещё».", variantGroup: "lesson-034:still", difficulty: 3, confusionItemIds: confusions },
  { id: "exercise-34-listening", type: "listening", prompt: "Прослушай и выбери точное значение.", audioText: "まだ宿題をしていません。", targetItemIds: ["grammar-mada-te-imasen", "word-mada-34", "word-shukudai-25"], correctAnswers: ["Я ещё не сделал домашнее задание."], distractors: ["Я пока не буду делать домашнее задание.", "Я уже сделал домашнее задание.", "Я всё ещё делаю домашнее задание."], explanationRu: "～ていません после まだ означает, что действие ещё не завершено.", variantGroup: "lesson-034:not-yet", difficulty: 2, confusionItemIds: confusions },
];

export const lesson034: Lesson = { id: "lesson-034", unitId: "unit-010", order: 34, title: "Уже или ещё нет", description: "もう～ました, まだ～ていません, продолжающееся まだ～ています и краткие ответы на вопрос «уже?».", theory: lesson034Grammar.map((item) => item.explanationRu), itemIds: [...lesson034Vocabulary, ...lesson034Grammar, ...lesson034Sentences].map((item) => item.id), exerciseIds: lesson034Exercises.map((item) => item.id), estimatedMinutes: 20 };
export const lesson034Bundle: LessonBundle = { lesson: lesson034, vocabulary: lesson034Vocabulary, grammar: lesson034Grammar, sentences: lesson034Sentences, exercises: lesson034Exercises, outcomes: ["говорить о уже завершённом действии", "сообщать, что действие ещё не завершено", "описывать продолжающееся действие через まだ", "отвечать на вопрос もう～ましたか"] };
