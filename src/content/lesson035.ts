import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson035Vocabulary: VocabularyItem[] = [
  { id: "word-nihonjin-35", type: "vocabulary", writtenForm: "日本人", reading: "にほんじん", meaningsRu: ["японец", "японка"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-atatakai-35", type: "vocabulary", writtenForm: "暖かい", reading: "あたたかい", meaningsRu: ["тёплый", "тепло"], partOfSpeech: ["い-прилагательное"], jlptLevel: "N5", tags: ["о погоде, воздухе или предметах"] },
];

export const lesson035Grammar: GrammarPoint[] = [
  {
    id: "grammar-i-adjective-kute", type: "grammar", title: "Соединение い-прилагательных через ～くて",
    meaningRu: "соединяет несколько признаков или связанных состояний",
    explanationRu: "Убери конечное い и добавь くて: 大きい→大きくて. 部屋は大きくて、きれいです означает «Комната большая и красивая». Форма ～くて связывает описание с продолжением предложения.",
    formation: ["[い-прилагательное без い] + くて", "大きい → 大きくて", "暖かい → 暖かくて"],
    cautions: ["Не добавляй て прямо к полной форме: 大きいて неверно."],
    relatedGrammarIds: ["grammar-i-adjective-predicate", "grammar-te-form-role"], jlptLevel: "N5",
  },
  {
    id: "grammar-na-adjective-de", type: "grammar", title: "Соединение な-прилагательных через で",
    meaningRu: "соединяет признак な-прилагательного со следующим описанием",
    explanationRu: "После な-прилагательного используется で без な: 静かで、便利です — «тихий и удобный». きれい тоже относится к な-прилагательным, поэтому правильно きれいで, а не きれくて.",
    formation: ["[な-прилагательное] + で", "静か → 静かで", "きれい → きれいで"],
    cautions: ["Не сохраняй な перед で: 静かなで неверно.", "きれい оканчивается на い, но образует форму きれいで."],
    relatedGrammarIds: ["grammar-na-adjective-predicate", "grammar-na-adjective-noun"], jlptLevel: "N5",
  },
  {
    id: "grammar-noun-de-connection", type: "grammar", title: "Соединение существительных через で",
    meaningRu: "соединяет именное сказуемое со следующим сообщением",
    explanationRu: "Существительное принимает で: 田中さんは日本人で、先生です — «Танака — японец и преподаватель». Здесь で является соединительной формой связки です／だ, а не частицей места действия.",
    formation: ["[существительное] + で、[продолжение]", "日本人で、先生です"],
    cautions: ["Не путай соединительное で после сказуемого с частицей места: 学校で勉強します означает «занимаюсь в школе»."],
    relatedGrammarIds: ["grammar-desu", "grammar-de-action-place"], jlptLevel: "N5",
  },
  {
    id: "grammar-ii-yokute", type: "grammar", title: "Особая форма いい → よくて",
    meaningRu: "соединяет признак «хороший» со следующим описанием",
    explanationRu: "Как и в других изменяемых формах, いい использует основу よ-: いい→よくて. 天気がよくて、暖かいです — «Погода хорошая и тёплая». Форма いくて для значения «хороший и...» неверна.",
    formation: ["いい → よくて"],
    cautions: ["Не образуй いいくて или いくて; используется историческая основа よ-."],
    relatedGrammarIds: ["grammar-i-adjective-kute", "grammar-ii-irregular"], jlptLevel: "N5",
  },
];

export const lesson035Sentences: ExampleSentence[] = [
  { id: "sentence-35-room-large-clean", type: "sentence", japanese: "この部屋は大きくて、きれいです。", reading: "このへやはおおきくて、きれいです。", translationRu: "Эта комната большая и красивая.", grammarIds: ["grammar-i-adjective-kute", "grammar-na-adjective-predicate", "grammar-wa-topic"], vocabularyIds: ["word-heya", "word-ookii", "word-kirei-na"] },
  { id: "sentence-35-town-quiet-convenient", type: "sentence", japanese: "この町は静かで、便利です。", reading: "このまちはしずかで、べんりです。", translationRu: "Этот город тихий и удобный.", grammarIds: ["grammar-na-adjective-de", "grammar-na-adjective-predicate", "grammar-wa-topic"], vocabularyIds: ["word-machi", "word-shizuka-na", "word-benri-na"] },
  { id: "sentence-35-tanaka-japanese-teacher", type: "sentence", japanese: "田中さんは日本人で、先生です。", reading: "たなかさんはにほんじんで、せんせいです。", translationRu: "Танака — японец и преподаватель.", grammarIds: ["grammar-noun-de-connection", "grammar-wa-topic", "grammar-desu"], vocabularyIds: ["word-tanaka-san", "word-nihonjin-35", "word-sensei"] },
  { id: "sentence-35-weather-good-warm", type: "sentence", japanese: "今日は天気がよくて、暖かいです。", reading: "きょうはてんきがよくて、あたたかいです。", translationRu: "Сегодня погода хорошая и тёплая.", grammarIds: ["grammar-ii-yokute", "grammar-i-adjective-predicate", "grammar-wa-topic"], vocabularyIds: ["word-kyou", "word-tenki", "word-ii-yoi", "word-atatakai-35"] },
  { id: "sentence-35-car-new-large-expensive", type: "sentence", japanese: "この車は新しくて、大きくて、高いです。", reading: "このくるまはあたらしくて、おおきくて、たかいです。", translationRu: "Эта машина новая, большая и дорогая.", grammarIds: ["grammar-i-adjective-kute", "grammar-i-adjective-predicate", "grammar-wa-topic"], vocabularyIds: ["word-kuruma", "word-atarashii", "word-ookii", "word-takai"] },
];

const confusions = ["grammar-i-adjective-kute", "grammar-na-adjective-de", "grammar-noun-de-connection", "grammar-ii-yokute", "grammar-i-adjective-predicate", "grammar-na-adjective-predicate"];
export const lesson035Exercises: Exercise[] = [
  { id: "exercise-35-ookii-kute", type: "conjugation", prompt: "Поставь 大きい в соединительную форму.", targetItemIds: ["grammar-i-adjective-kute", "word-ookii"], correctAnswers: ["大きくて"], acceptableAnswers: ["おおきくて"], distractors: ["大きいて", "大きいで", "大きなて"], explanationRu: "大きい без конечного い + くて = 大きくて.", variantGroup: "lesson-035:i-adjective", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-35-kirei-form", type: "multiple-choice", prompt: "Выбери правильную соединительную форму きれい.", targetItemIds: ["grammar-na-adjective-de", "word-kirei-na"], correctAnswers: ["きれいで"], distractors: ["きれくて", "きれいくて", "きれいなで"], explanationRu: "きれい — な-прилагательное, поэтому используется で.", variantGroup: "lesson-035:na-adjective", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-35-ii-special", type: "conjugation", prompt: "Поставь いい в соединительную форму.", targetItemIds: ["grammar-ii-yokute", "word-ii-yoi"], correctAnswers: ["よくて"], distractors: ["いくて", "いいくて", "いいで"], explanationRu: "いい использует основу よ-: よくて.", variantGroup: "lesson-035:special", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-35-noun-de", type: "multiple-choice", prompt: "Что выражает で в 日本人で、先生です?", targetItemIds: ["grammar-noun-de-connection", "word-nihonjin-35", "word-sensei"], correctAnswers: ["Соединяет два именных описания одного человека"], distractors: ["Отмечает место работы", "Отмечает объект действия", "Выражает направление"], explanationRu: "После существительного で соединяет именное сказуемое с продолжением.", variantGroup: "lesson-035:noun", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-35-builder", type: "sentence-builder", prompt: "Собери: Этот город тихий и удобный.", targetItemIds: ["grammar-na-adjective-de", "word-machi", "word-shizuka-na", "word-benri-na"], correctAnswers: ["この|町|は|静か|で|便利|です"], distractors: ["な", "くて", "を"], explanationRu: "静か — な-прилагательное: 静かで、便利です.", variantGroup: "lesson-035:na-adjective", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-35-input", type: "text-input", prompt: "Напиши по-японски: Сегодня погода хорошая и тёплая.", targetItemIds: ["grammar-ii-yokute", "word-kyou", "word-tenki", "word-ii-yoi", "word-atatakai-35"], correctAnswers: ["今日は天気がよくて暖かいです", "今日は天気がよくて、暖かいです", "今日は天気がよくて、暖かいです。"], acceptableAnswers: ["きょうはてんきがよくてあたたかいです", "きょうはてんきがよくて、あたたかいです"], explanationRu: "いい→よくて; второе прилагательное завершает предложение как 暖かいです.", variantGroup: "lesson-035:special", difficulty: 3, confusionItemIds: confusions },
  { id: "exercise-35-listening", type: "listening", prompt: "Прослушай и выбери точное значение.", audioText: "この部屋は大きくて、きれいです。", targetItemIds: ["grammar-i-adjective-kute", "grammar-na-adjective-predicate", "word-heya", "word-ookii", "word-kirei-na"], correctAnswers: ["Эта комната большая и красивая."], distractors: ["Эта комната большая, поэтому её убрали.", "Эта комната не большая, но красивая.", "В этой комнате находится большая картина."], explanationRu: "大きくて связывает два признака комнаты.", variantGroup: "lesson-035:i-adjective", difficulty: 2, confusionItemIds: confusions },
];

export const lesson035: Lesson = { id: "lesson-035", unitId: "unit-010", order: 35, title: "Большой и красивый", description: "Соединение い-прилагательных через ～くて, な-прилагательных и существительных через で, особая форма よくて.", theory: lesson035Grammar.map((item) => item.explanationRu), itemIds: [...lesson035Vocabulary, ...lesson035Grammar, ...lesson035Sentences].map((item) => item.id), exerciseIds: lesson035Exercises.map((item) => item.id), estimatedMinutes: 20 };
export const lesson035Bundle: LessonBundle = { lesson: lesson035, vocabulary: lesson035Vocabulary, grammar: lesson035Grammar, sentences: lesson035Sentences, exercises: lesson035Exercises, outcomes: ["соединять い-прилагательные через ～くて", "соединять な-прилагательные через で", "использовать соединительную форму существительного", "образовывать особую форму いい→よくて"] };
