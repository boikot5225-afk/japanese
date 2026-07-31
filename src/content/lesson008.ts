import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson008Vocabulary: VocabularyItem[] = [
  {
    id: "word-okimasu",
    type: "vocabulary",
    writtenForm: "起きます",
    reading: "おきます",
    meaningsRu: ["вставать", "просыпаться"],
    partOfSpeech: ["глагол", "вежливая форма"],
    jlptLevel: "N5",
  },
  {
    id: "word-nemasu",
    type: "vocabulary",
    writtenForm: "寝ます",
    reading: "ねます",
    meaningsRu: ["ложиться спать", "спать"],
    partOfSpeech: ["глагол", "вежливая форма"],
    jlptLevel: "N5",
  },
  {
    id: "word-hatarakimasu",
    type: "vocabulary",
    writtenForm: "働きます",
    reading: "はたらきます",
    meaningsRu: ["работать"],
    partOfSpeech: ["глагол", "вежливая форма"],
    jlptLevel: "N5",
  },
  {
    id: "word-yasumimasu",
    type: "vocabulary",
    writtenForm: "休みます",
    reading: "やすみます",
    meaningsRu: ["отдыхать", "не работать", "брать выходной"],
    partOfSpeech: ["глагол", "вежливая форма"],
    jlptLevel: "N5",
  },
  {
    id: "word-mainichi",
    type: "vocabulary",
    writtenForm: "毎日",
    reading: "まいにち",
    meaningsRu: ["каждый день"],
    partOfSpeech: ["существительное", "наречное употребление"],
    jlptLevel: "N5",
  },
  {
    id: "word-maiasa",
    type: "vocabulary",
    writtenForm: "毎朝",
    reading: "まいあさ",
    meaningsRu: ["каждое утро"],
    partOfSpeech: ["существительное", "наречное употребление"],
    jlptLevel: "N5",
  },
  {
    id: "word-yoru",
    type: "vocabulary",
    writtenForm: "夜",
    reading: "よる",
    meaningsRu: ["вечер", "ночь"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
];

export const lesson008Grammar: GrammarPoint[] = [
  {
    id: "grammar-time-ni",
    type: "grammar",
    title: "Точное время с に",
    meaningRu: "отмечает момент, когда происходит действие",
    explanationRu:
      "После точного времени ставится に: 七時に起きます — «встаю в семь». Это ещё одна функция に: здесь частица отмечает момент времени, а не место или направление.",
    formation: ["[точное время] に [действие]", "七時に起きます"],
    cautions: [
      "После 何時 в вопросе тоже ставится に: 何時に起きますか.",
      "После 毎日, 今日, 明日 и 昨日 частица に обычно не нужна.",
    ],
    relatedGrammarIds: ["grammar-ni-e-destination"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-kara-made-time",
    type: "grammar",
    title: "Интервал с から и まで",
    meaningRu: "показывает начало и конец периода",
    explanationRu:
      "から ставится после начальной точки и означает «с», а まで — после конечной точки и означает «до». Их можно использовать вместе или по отдельности.",
    formation: ["[начало] から [конец] まで", "九時から五時まで"],
    cautions: ["まで обозначает предел, но само по себе не означает «к этому времени уже закончить»."],
    jlptLevel: "N5",
  },
  {
    id: "grammar-time-without-ni",
    type: "grammar",
    title: "Когда に не ставится",
    meaningRu: "частотные и относительные слова времени часто употребляются без частицы",
    explanationRu:
      "Слова 毎日, 毎朝, 今日, 明日 и 昨日 обычно сразу ставятся перед предложением без に: 毎日勉強します.",
    formation: ["毎日 勉強します", "毎朝 七時に起きます"],
    cautions: ["Не переноси правило механически на точные часы: 七時 требует に."],
    jlptLevel: "N5",
  },
];

export const lesson008Sentences: ExampleSentence[] = [
  {
    id: "sentence-maiasa-shichiji-okimasu",
    type: "sentence",
    japanese: "毎朝七時に起きます。",
    reading: "まいあさしちじにおきます。",
    translationRu: "Каждое утро я встаю в семь.",
    grammarIds: ["grammar-time-ni", "grammar-time-without-ni", "grammar-masu-polite"],
    vocabularyIds: ["word-maiasa", "word-nana-number", "word-okimasu"],
  },
  {
    id: "sentence-gozen-kuji-kara-gogo-goji-made",
    type: "sentence",
    japanese: "午前九時から午後五時まで働きます。",
    reading: "ごぜんくじからごごごじまではたらきます。",
    translationRu: "Я работаю с девяти утра до пяти вечера.",
    grammarIds: ["grammar-kara-made-time", "grammar-masu-polite"],
    vocabularyIds: ["word-gozen", "word-gogo", "word-kyuu-number", "word-go-number", "word-hatarakimasu"],
  },
  {
    id: "sentence-yoru-juuji-nemasu",
    type: "sentence",
    japanese: "夜十時に寝ます。",
    reading: "よるじゅうじにねます。",
    translationRu: "Я ложусь спать в десять вечера.",
    grammarIds: ["grammar-time-ni", "grammar-masu-polite"],
    vocabularyIds: ["word-yoru", "word-juu-number", "word-nemasu"],
  },
  {
    id: "sentence-mainichi-nihongo-benkyou",
    type: "sentence",
    japanese: "毎日日本語を勉強します。",
    reading: "まいにちにほんごをべんきょうします。",
    translationRu: "Я каждый день занимаюсь японским.",
    grammarIds: ["grammar-time-without-ni", "grammar-o-object", "grammar-masu-polite"],
    vocabularyIds: ["word-mainichi", "word-nihongo", "word-benkyoushimasu"],
  },
];

export const lesson008Exercises: Exercise[] = [
  {
    id: "exercise-time-ni-choice",
    type: "multiple-choice",
    prompt: "Выбери частицу: 七時 __ 起きます。",
    targetItemIds: ["grammar-time-ni", "word-okimasu", "word-nana-number"],
    correctAnswers: ["に"],
    distractors: ["で", "を", "から"],
    explanationRu: "Семь часов — точный момент действия, поэтому ставится に.",
  },
  {
    id: "exercise-kara-made-pair",
    type: "multiple-choice",
    prompt: "Выбери правильную пару: 九時 __ 五時 __ 働きます。",
    targetItemIds: ["grammar-kara-made-time", "word-hatarakimasu"],
    correctAnswers: ["から／まで"],
    distractors: ["まで／から", "に／で", "を／に"],
    explanationRu: "Начало периода отмечается から, конец — まで.",
  },
  {
    id: "exercise-mainichi-no-ni-choice",
    type: "multiple-choice",
    prompt: "Какое предложение естественно означает «Каждый день занимаюсь японским»?",
    targetItemIds: ["grammar-time-without-ni", "word-mainichi", "word-benkyoushimasu"],
    correctAnswers: ["毎日日本語を勉強します"],
    distractors: ["毎日に日本語を勉強します", "毎日で日本語を勉強します", "毎日を日本語に勉強します"],
    explanationRu: "После 毎日 частица времени に обычно не ставится.",
  },
  {
    id: "exercise-maiasa-okimasu-builder",
    type: "sentence-builder",
    prompt: "Собери: Каждое утро я встаю в семь.",
    targetItemIds: ["grammar-time-ni", "grammar-time-without-ni", "word-maiasa", "word-okimasu"],
    correctAnswers: ["毎朝|七時|に|起きます"],
    distractors: ["で", "寝ます", "毎日に"],
    explanationRu: "毎朝 употребляется без частицы, а после точного времени 七時 ставится に.",
  },
  {
    id: "exercise-hatarakimasu-input",
    type: "text-input",
    prompt: "Напиши по-японски: Я работаю с девяти утра до пяти вечера.",
    targetItemIds: ["grammar-kara-made-time", "word-gozen", "word-gogo", "word-hatarakimasu"],
    correctAnswers: [
      "午前九時から午後五時まで働きます",
      "午前九時から午後五時まで働きます。"
    ],
    acceptableAnswers: [
      "ごぜんくじからごごごじまではたらきます",
      "ごぜんくじからごごごじまではたらきます。",
      "九時から五時まで働きます",
      "九時から五時まで働きます。"
    ],
    explanationRu: "Начало оформляется как 午前九時から, конец — 午後五時まで.",
  },
  {
    id: "exercise-yoru-nemasu-input",
    type: "text-input",
    prompt: "Напиши по-японски: Я ложусь спать в десять вечера.",
    targetItemIds: ["grammar-time-ni", "word-yoru", "word-nemasu"],
    correctAnswers: ["夜十時に寝ます", "夜十時に寝ます。"],
    acceptableAnswers: [
      "午後十時に寝ます",
      "午後十時に寝ます。",
      "よるじゅうじにねます",
      "よるじゅうじにねます。"
    ],
    explanationRu: "Точный час 十時 отмечается частицей に.",
  },
  {
    id: "exercise-nanji-ni-question",
    type: "text-input",
    prompt: "Напиши по-японски: Во сколько вы встаёте?",
    targetItemIds: ["grammar-time-ni", "grammar-ka-question", "word-nanji", "word-okimasu"],
    correctAnswers: ["何時に起きますか", "何時に起きますか。"],
    acceptableAnswers: ["なんじにおきますか", "なんじにおきますか。"],
    explanationRu: "何時 спрашивает время, に отмечает момент, か завершает вопрос. Местоимение «вы» не требуется.",
  },
  {
    id: "exercise-yasumimasu-time-choice",
    type: "multiple-choice",
    prompt: "Что означает 七時まで休みます?",
    targetItemIds: ["grammar-kara-made-time", "word-yasumimasu"],
    correctAnswers: ["Отдыхаю до семи"],
    distractors: ["Отдыхаю с семи", "Встаю в семь", "Работаю семь часов"],
    explanationRu: "まで отмечает конечную границу: действие продолжается до семи.",
  },
];

export const lesson008: Lesson = {
  id: "lesson-008",
  unitId: "unit-003",
  order: 8,
  title: "Во сколько вы встаёте?",
  description: "Точное время с に, распорядок дня и интервалы с から／まで.",
  theory: lesson008Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson008Vocabulary.map((item) => item.id),
    ...lesson008Grammar.map((item) => item.id),
    ...lesson008Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson008Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 22,
};

export const lesson008Bundle: LessonBundle = {
  lesson: lesson008,
  vocabulary: lesson008Vocabulary,
  grammar: lesson008Grammar,
  sentences: lesson008Sentences,
  exercises: lesson008Exercises,
  outcomes: [
    "отмечать точный момент частицей に",
    "не добавлять に после 毎日 и 毎朝",
    "задавать вопрос 何時に…ますか",
    "говорить о промежутке времени с から／まで",
  ],
};
