import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson023Vocabulary: VocabularyItem[] = [
  { id: "word-eiga-23", type: "vocabulary", writtenForm: "映画", reading: "えいが", meaningsRu: ["фильм", "кино"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-raamen-23", type: "vocabulary", writtenForm: "ラーメン", reading: "ラーメン", meaningsRu: ["рамэн"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-ryokou-shimasu-23", type: "vocabulary", writtenForm: "旅行します", reading: "りょこうします", meaningsRu: ["путешествовать"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
  { id: "word-nani-23", type: "vocabulary", writtenForm: "何", reading: "なに／なん", meaningsRu: ["что"], partOfSpeech: ["вопросительное слово"], jlptLevel: "N5" },
];

export const lesson023Grammar: GrammarPoint[] = [
  {
    id: "grammar-tai-desire", type: "grammar", title: "Желание ～たいです",
    meaningRu: "сообщает, что говорящий хочет выполнить действие",
    explanationRu: "Убери ～ます и добавь ～たいです: 食べます→食べたいです, 行きます→行きたいです, 勉強します→勉強したいです. Конструкция описывает желание совершить действие, а не просто симпатию к предмету.",
    formation: ["[основа ～ます] + たいです", "食べます → 食べたいです", "します → したいです"],
    cautions: ["Не добавляй たい к словарной форме: правильно 食べたい, не 食べるたい."],
    relatedGrammarIds: ["grammar-masu-polite", "grammar-suki-kirai-ga"], jlptLevel: "N5",
  },
  {
    id: "grammar-tai-object", type: "grammar", title: "Объект желания с を",
    meaningRu: "отмечает предмет действия перед глаголом на ～たい",
    explanationRu: "На начальном уровне сохраняй знакомую частицу を: ラーメンを食べたいです, 映画を見たいです. В живом японском с ～たい иногда встречается が, но базовая модель с を прозрачнее и совпадает с исходным глаголом.",
    formation: ["[объект] を [основа]たいです"],
    cautions: ["Не путай 映画が好きです «мне нравятся фильмы» и 映画を見たいです «хочу посмотреть фильм»."],
    relatedGrammarIds: ["grammar-tai-desire", "grammar-o-object", "grammar-suki-kirai-ga"], jlptLevel: "N5",
  },
  {
    id: "grammar-takunai", type: "grammar", title: "Не хочу: ～たくないです",
    meaningRu: "отрицает желание выполнить действие",
    explanationRu: "～たい ведёт себя как い-прилагательное: замени い на くないです. 見たいです→見たくないです, 行きたいです→行きたくないです.",
    formation: ["～たいです → ～たくないです", "見たいです → 見たくないです"],
    cautions: ["～たくないです означает «не хочу делать», а ～ない — «не делаю / не буду делать»."],
    relatedGrammarIds: ["grammar-tai-desire", "grammar-i-adjective-negative", "grammar-nai-form-role"], jlptLevel: "N5",
  },
  {
    id: "grammar-tai-question-person", type: "grammar", title: "Вопрос о желании",
    meaningRu: "спрашивает собеседника, что он хочет сделать",
    explanationRu: "Вопрос строится обычной частицей か: 何をしたいですか — «Что хотите сделать?». ～たい естественно описывает своё желание или используется в прямом вопросе к собеседнику. О желании третьего лица без контекста так утверждать не стоит.",
    formation: ["何をしたいですか", "どこへ行きたいですか"],
    cautions: ["Фраза 田中さんは行きたいです как уверенное утверждение о чужом внутреннем желании требует контекста или передачи слов Танаки."],
    relatedGrammarIds: ["grammar-tai-desire", "grammar-ka-question"], jlptLevel: "N5",
  },
];

export const lesson023Sentences: ExampleSentence[] = [
  { id: "sentence-23-raamen-tabetai", type: "sentence", japanese: "ラーメンを食べたいです。", reading: "ラーメンをたべたいです。", translationRu: "Я хочу съесть рамэн.", grammarIds: ["grammar-tai-desire", "grammar-tai-object", "grammar-o-object"], vocabularyIds: ["word-raamen-23", "word-tabemasu"] },
  { id: "sentence-23-tokyo-ikitai", type: "sentence", japanese: "東京へ行きたいです。", reading: "とうきょうへいきたいです。", translationRu: "Я хочу поехать в Токио.", grammarIds: ["grammar-tai-desire", "grammar-ni-e-destination"], vocabularyIds: ["word-tokyo-20", "word-ikimasu"] },
  { id: "sentence-23-eiga-mitakunai", type: "sentence", japanese: "今日は映画を見たくないです。", reading: "きょうはえいがをみたくないです。", translationRu: "Сегодня я не хочу смотреть фильм.", grammarIds: ["grammar-takunai", "grammar-tai-object", "grammar-wa-topic", "grammar-time-without-ni", "grammar-o-object"], vocabularyIds: ["word-kyou-22", "word-eiga-23", "word-mimasu"] },
  { id: "sentence-23-nani-shitai", type: "sentence", japanese: "何をしたいですか。", reading: "なにをしたいですか。", translationRu: "Что вы хотите сделать?", grammarIds: ["grammar-tai-question-person", "grammar-ka-question", "grammar-o-object"], vocabularyIds: ["word-nani-23"] },
  { id: "sentence-23-nihongo-benkyou-shitai", type: "sentence", japanese: "日本語を勉強したいです。", reading: "にほんごをべんきょうしたいです。", translationRu: "Я хочу заниматься японским.", grammarIds: ["grammar-tai-desire", "grammar-tai-object", "grammar-o-object"], vocabularyIds: ["word-nihongo", "word-benkyoushimasu"] },
  { id: "sentence-23-ryokou-shitai", type: "sentence", japanese: "旅行したいです。", reading: "りょこうしたいです。", translationRu: "Я хочу путешествовать.", grammarIds: ["grammar-tai-desire"], vocabularyIds: ["word-ryokou-shimasu-23"] },
];

const confusions = ["grammar-tai-desire", "grammar-takunai", "grammar-nai-form-role", "grammar-suki-kirai-ga"];
export const lesson023Exercises: Exercise[] = [
  { id: "exercise-23-tabetai", type: "conjugation", prompt: "Поставь 食べます в форму ～たいです.", targetItemIds: ["grammar-tai-desire", "word-tabemasu"], correctAnswers: ["食べたいです"], acceptableAnswers: ["たべたいです", "食べたい", "たべたい"], distractors: ["食べるたいです", "食べてたいです", "食べたです"], explanationRu: "Убери ～ます и добавь ～たいです.", variantGroup: "lesson-023:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-23-shitai", type: "multiple-choice", prompt: "Выбери форму «хочу заниматься» от 勉強します.", targetItemIds: ["grammar-tai-desire", "word-benkyoushimasu"], correctAnswers: ["勉強したいです"], distractors: ["勉強するたいです", "勉強してたいです", "勉強しないです"], explanationRu: "します → したいです.", variantGroup: "lesson-023:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-23-takunai-meaning", type: "multiple-choice", prompt: "Что означает 映画を見たくないです?", targetItemIds: ["grammar-takunai", "grammar-tai-object", "word-eiga-23", "word-mimasu"], correctAnswers: ["Не хочу смотреть фильм"], distractors: ["Не смотрю фильмы", "Не умею смотреть фильмы", "Мне не нравятся все фильмы"], explanationRu: "～たくないです отрицает желание, а не само действие.", variantGroup: "lesson-023:meaning", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-23-particle", type: "particle-gap", prompt: "Заполни пропуск: ラーメン __ 食べたいです。", targetItemIds: ["grammar-tai-object", "word-raamen-23", "word-tabemasu"], correctAnswers: ["を"], acceptableAnswers: ["が"], distractors: ["に", "で", "へ"], explanationRu: "Базовая модель сохраняет を; が также встречается с ～たい в живом японском.", variantGroup: "lesson-023:object", difficulty: 2, confusionItemIds: ["grammar-tai-object", "grammar-suki-kirai-ga"] },
  { id: "exercise-23-builder", type: "sentence-builder", prompt: "Собери: Сегодня я не хочу смотреть фильм.", targetItemIds: ["grammar-takunai", "grammar-tai-object", "word-kyou-22", "word-eiga-23", "word-mimasu"], correctAnswers: ["今日|は|映画|を|見たくない|です"], distractors: ["見ない", "見たい", "が"], explanationRu: "見たい → 見たくないです.", variantGroup: "lesson-023:negative-desire", difficulty: 2, confusionItemIds: ["grammar-takunai", "grammar-nai-form-role"] },
  { id: "exercise-23-input", type: "text-input", prompt: "Напиши по-японски: Что вы хотите сделать?", targetItemIds: ["grammar-tai-question-person", "word-nani-23"], correctAnswers: ["何をしたいですか", "何をしたいですか。"], acceptableAnswers: ["なにをしたいですか", "なにをしたいですか。"], explanationRu: "何を + したいですか.", variantGroup: "lesson-023:question", difficulty: 3, confusionItemIds: ["grammar-tai-question-person", "grammar-ka-question"] },
];

export const lesson023: Lesson = { id: "lesson-023", unitId: "unit-007", order: 23, title: "Что ты хочешь сделать?", description: "Желание с ～たいです, отрицание ～たくないです и вопросы о желании.", theory: lesson023Grammar.map((item) => item.explanationRu), itemIds: [...lesson023Vocabulary, ...lesson023Grammar, ...lesson023Sentences].map((item) => item.id), exerciseIds: lesson023Exercises.map((item) => item.id), estimatedMinutes: 19 };
export const lesson023Bundle: LessonBundle = { lesson: lesson023, vocabulary: lesson023Vocabulary, grammar: lesson023Grammar, sentences: lesson023Sentences, exercises: lesson023Exercises, outcomes: ["строить ～たいです от основы ～ます", "различать желание и симпатию", "говорить «не хочу» через ～たくないです", "задавать вопросы о желании"] };
