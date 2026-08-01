import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson020Vocabulary: VocabularyItem[] = [
  { id: "word-tokyo-20", type: "vocabulary", writtenForm: "東京", reading: "とうきょう", meaningsRu: ["Токио"], partOfSpeech: ["имя собственное"], jlptLevel: "N5" },
  { id: "word-sumimasu-20", type: "vocabulary", writtenForm: "住みます", reading: "すみます", meaningsRu: ["жить", "проживать"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
  { id: "word-kaisha-20", type: "vocabulary", writtenForm: "会社", reading: "かいしゃ", meaningsRu: ["компания", "фирма"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-denwa-20", type: "vocabulary", writtenForm: "電話", reading: "でんわ", meaningsRu: ["телефон", "телефонный звонок"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-denwa-shimasu-20", type: "vocabulary", writtenForm: "電話します", reading: "でんわします", meaningsRu: ["звонить по телефону"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
];

export const lesson020Grammar: GrammarPoint[] = [
  {
    id: "grammar-te-imasu-ongoing", type: "grammar", title: "Действие сейчас: ～ています",
    meaningRu: "показывает действие, которое идёт в момент речи",
    explanationRu: "て-форма + います описывает процесс: 今、新聞を読んでいます — «Сейчас читаю газету». Простое 読みます обычно означает привычное или будущее действие, а не обязательно процесс прямо сейчас.",
    formation: ["[て-форма] + います", "読んでいます"], cautions: ["Перед います нужна て-форма: 読んでいます, а не 読みています."], relatedGrammarIds: ["grammar-te-form-role", "grammar-masu-polite"], jlptLevel: "N5",
  },
  {
    id: "grammar-te-imasu-habit", type: "grammar", title: "Регулярная деятельность и работа",
    meaningRu: "описывает устойчивую деятельность или занятие",
    explanationRu: "～ています может обозначать не только действие в эту секунду, но и постоянную деятельность: 会社で働いています — «Работаю в компании». Контекст отличает профессию от текущего процесса.",
    formation: ["会社で働いています", "毎日勉強しています"], cautions: ["Наличие ～ています не гарантирует перевод «прямо сейчас». Смотри на контекст и значение глагола."], relatedGrammarIds: ["grammar-te-imasu-ongoing"], jlptLevel: "N5",
  },
  {
    id: "grammar-te-imasu-state", type: "grammar", title: "Состояние после изменения",
    meaningRu: "описывает продолжающееся состояние, возникшее после действия",
    explanationRu: "С некоторыми глаголами ～ています означает состояние: 東京に住んでいます — «Живу в Токио». Здесь речь не о действии «поселяюсь прямо сейчас», а о текущем месте проживания.",
    formation: ["東京に住んでいます"], cautions: ["Значение зависит от глагола: 読んでいます — процесс, 住んでいます — состояние."], relatedGrammarIds: ["grammar-te-imasu-ongoing", "grammar-ni-location"], jlptLevel: "N5",
  },
];

export const lesson020Sentences: ExampleSentence[] = [
  { id: "sentence-20-ima-shinbun", type: "sentence", japanese: "今、新聞を読んでいます。", reading: "いま、しんぶんをよんでいます。", translationRu: "Сейчас я читаю газету.", grammarIds: ["grammar-te-imasu-ongoing", "grammar-te-form-group1", "grammar-o-object"], vocabularyIds: ["word-ima", "word-shinbun", "word-yomimasu"] },
  { id: "sentence-20-nihongo-hanashi", type: "sentence", japanese: "今、日本語を話しています。", reading: "いま、にほんごをはなしています。", translationRu: "Сейчас я говорю по-японски.", grammarIds: ["grammar-te-imasu-ongoing", "grammar-te-form-group1", "grammar-o-object"], vocabularyIds: ["word-ima", "word-nihongo", "word-hanashimasu-17"] },
  { id: "sentence-20-kaisha-work", type: "sentence", japanese: "会社で働いています。", reading: "かいしゃではたらいています。", translationRu: "Я работаю в компании.", grammarIds: ["grammar-te-imasu-habit", "grammar-te-form-group1", "grammar-de-action-place"], vocabularyIds: ["word-kaisha-20", "word-hatarakimasu"] },
  { id: "sentence-20-tokyo-live", type: "sentence", japanese: "東京に住んでいます。", reading: "とうきょうにすんでいます。", translationRu: "Я живу в Токио.", grammarIds: ["grammar-te-imasu-state", "grammar-te-form-group1", "grammar-ni-location"], vocabularyIds: ["word-tokyo-20", "word-sumimasu-20"] },
  { id: "sentence-20-phone-question", type: "sentence", japanese: "今、電話していますか。", reading: "いま、でんわしていますか。", translationRu: "Вы сейчас разговариваете по телефону?", grammarIds: ["grammar-te-imasu-ongoing", "grammar-te-form-group2-irregular", "grammar-ka-question"], vocabularyIds: ["word-ima", "word-denwa-20", "word-denwa-shimasu-20"] },
];

const confusions = ["grammar-te-imasu-ongoing", "grammar-te-imasu-habit", "grammar-te-imasu-state"];
export const lesson020Exercises: Exercise[] = [
  { id: "exercise-20-reading-now", type: "multiple-choice", prompt: "Как сказать «Сейчас читаю газету»?", targetItemIds: ["grammar-te-imasu-ongoing", "word-ima", "word-shinbun", "word-yomimasu"], correctAnswers: ["今、新聞を読んでいます"], distractors: ["今、新聞を読みます", "今、新聞を読んでください", "今、新聞を読んではいけません"], explanationRu: "Текущий процесс: 読んでいます.", variantGroup: "lesson-020:meaning", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-20-form-choice", type: "multiple-choice", prompt: "Выбери правильную форму ～ています для 話します.", targetItemIds: ["grammar-te-imasu-ongoing", "grammar-te-form-group1", "word-hanashimasu-17"], correctAnswers: ["話しています"], distractors: ["話してますます", "話していますて", "話しっています"], explanationRu: "話します → 話して → 話しています.", variantGroup: "lesson-020:formation", difficulty: 1, confusionItemIds: ["grammar-te-form-group1", "grammar-te-imasu-ongoing"] },
  { id: "exercise-20-habit-meaning", type: "multiple-choice", prompt: "В каком значении употреблено 会社で働いています?", targetItemIds: ["grammar-te-imasu-habit", "word-kaisha-20", "word-hatarakimasu"], correctAnswers: ["Постоянная работа или занятие"], distractors: ["Однократная просьба поработать", "Запрет работать", "Только действие ровно в эту секунду"], explanationRu: "С профессией ～ています описывает устойчивую деятельность.", variantGroup: "lesson-020:meaning", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-20-state-choice", type: "multiple-choice", prompt: "Что означает 東京に住んでいます?", targetItemIds: ["grammar-te-imasu-state", "word-tokyo-20", "word-sumimasu-20"], correctAnswers: ["Я живу в Токио"], distractors: ["Я сейчас еду в Токио", "Я хочу жить в Токио", "Мне нельзя жить в Токио"], explanationRu: "住んでいます описывает текущее место проживания.", variantGroup: "lesson-020:meaning", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-20-builder", type: "sentence-builder", prompt: "Собери: Сейчас я говорю по-японски.", targetItemIds: ["grammar-te-imasu-ongoing", "grammar-o-object", "word-ima", "word-nihongo", "word-hanashimasu-17"], correctAnswers: ["今|日本語|を|話して|います"], distractors: ["話します", "と", "ください"], explanationRu: "話します → 話して + います; язык отмечается を.", variantGroup: "lesson-020:formation", difficulty: 2, confusionItemIds: ["grammar-te-imasu-ongoing", "grammar-masu-polite"] },
  { id: "exercise-20-input", type: "text-input", prompt: "Напиши по-японски: Я живу в Токио.", targetItemIds: ["grammar-te-imasu-state", "word-tokyo-20", "word-sumimasu-20"], correctAnswers: ["東京に住んでいます", "東京に住んでいます。"], acceptableAnswers: ["とうきょうにすんでいます", "とうきょうにすんでいます。"], explanationRu: "住みます → 住んでいます.", variantGroup: "lesson-020:state", difficulty: 3, confusionItemIds: confusions },
];

export const lesson020: Lesson = { id: "lesson-020", unitId: "unit-006", order: 20, title: "Что вы сейчас делаете?", description: "Процесс, регулярная деятельность и состояние с ～ています.", theory: lesson020Grammar.map((item) => item.explanationRu), itemIds: [...lesson020Vocabulary, ...lesson020Grammar, ...lesson020Sentences].map((item) => item.id), exerciseIds: lesson020Exercises.map((item) => item.id), estimatedMinutes: 18 };
export const lesson020Bundle: LessonBundle = { lesson: lesson020, vocabulary: lesson020Vocabulary, grammar: lesson020Grammar, sentences: lesson020Sentences, exercises: lesson020Exercises, outcomes: ["описывать действие в процессе", "отличать ～ています от простого ～ます", "говорить о постоянной деятельности", "понимать состояние с 住んでいます"] };
