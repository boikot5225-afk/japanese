import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson028Vocabulary: VocabularyItem[] = [
  { id: "word-ame-28", type: "vocabulary", writtenForm: "雨", reading: "あめ", meaningsRu: ["дождь"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-kasa-28", type: "vocabulary", writtenForm: "傘", reading: "かさ", meaningsRu: ["зонт"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-mochimasu-28", type: "vocabulary", writtenForm: "持ちます", reading: "もちます", meaningsRu: ["держать", "нести", "брать с собой"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
  { id: "word-kaze-28", type: "vocabulary", writtenForm: "風邪", reading: "かぜ", meaningsRu: ["простуда"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
];

export const lesson028Grammar: GrammarPoint[] = [
  {
    id: "grammar-kara-reason", type: "grammar", title: "Причина с から",
    meaningRu: "соединяет причину с её результатом",
    explanationRu: "После предложения-причины ставится から: 忙しいから、今日はテレビを見ません — «Поскольку я занят, сегодня не смотрю телевизор». Часть до から отвечает на вопрос «почему?», часть после неё сообщает решение или результат.",
    formation: ["[причина] から、[результат]", "忙しいから、行きません"],
    cautions: ["Причинное から присоединяется к целому сказуемому, а не просто заменяет русское слово «потому что» в любой позиции."],
    relatedGrammarIds: ["grammar-i-adjective-predicate", "grammar-masu-negative"], jlptLevel: "N5",
  },
  {
    id: "grammar-kara-reason-polite", type: "grammar", title: "Вежливая причина ～です／～ますから",
    meaningRu: "выражает причину в вежливом стиле",
    explanationRu: "В вежливой речи から ставится после готовой формы на です или ます: 雨ですから、傘を持ちます; 日本語が好きですから、毎日勉強します. Вежливость причины и результата может быть выражена отдельно.",
    formation: ["[существительное／な-прилагательное] ですから", "[глагол] ますから", "[い-прилагательное] ですから"],
    cautions: ["Не убирай です из вежливой именной причины: 雨から в обычном значении будет скорее «из-за дождя / от дождя» как словосочетание, а не полное вежливое предложение."],
    relatedGrammarIds: ["grammar-kara-reason", "grammar-desu", "grammar-masu-polite"], jlptLevel: "N5",
  },
  {
    id: "grammar-kara-reason-plain", type: "grammar", title: "Простая причина и だから",
    meaningRu: "присоединяет から к простым формам",
    explanationRu: "После глагола и い-прилагательного から ставится прямо: 行かないから, 寒いから. После существительного и な-прилагательного в простом стиле нужна связка だ: 風邪だから, 好きだから.",
    formation: ["行かない + から", "寒い + から", "風邪 + だ + から", "好き + だ + から"],
    cautions: ["Не говори 風邪から как полное простое «потому что простужен»: нужна форма 風邪だから."],
    relatedGrammarIds: ["grammar-kara-reason", "grammar-plain-negative-sentence", "grammar-na-adjective-predicate"], jlptLevel: "N5",
  },
  {
    id: "grammar-kara-three-meanings", type: "grammar", title: "Три знакомых から",
    meaningRu: "различает начало периода, последовательность и причину",
    explanationRu: "После времени から означает «с»: 九時から. После て-формы ～てから означает «после того как»: 食べてから. После законченного сказуемого から выражает причину: 忙しいから. Позиция и форма перед から определяют значение.",
    formation: ["九時から — с девяти", "食べてから — после того как поел", "忙しいから — потому что занят"],
    cautions: ["Не определяй значение только по самому から: всегда смотри, что стоит непосредственно перед ним."],
    relatedGrammarIds: ["grammar-kara-made-time", "grammar-te-kara", "grammar-kara-reason"], jlptLevel: "N5",
  },
];

export const lesson028Sentences: ExampleSentence[] = [
  { id: "sentence-28-ame-kasa", type: "sentence", japanese: "雨ですから、傘を持ちます。", reading: "あめですから、かさをもちます。", translationRu: "Поскольку идёт дождь, я беру зонт.", grammarIds: ["grammar-kara-reason-polite", "grammar-o-object"], vocabularyIds: ["word-ame-28", "word-kasa-28", "word-mochimasu-28"] },
  { id: "sentence-28-isogashii-terebi", type: "sentence", japanese: "忙しいから、今日はテレビを見ません。", reading: "いそがしいから、きょうはテレビをみません。", translationRu: "Поскольку я занят, сегодня не смотрю телевизор.", grammarIds: ["grammar-kara-reason", "grammar-kara-reason-plain", "grammar-wa-topic", "grammar-masu-negative", "grammar-o-object", "grammar-time-without-ni"], vocabularyIds: ["word-isogashii", "word-kyou", "word-terebi", "word-mimasu"] },
  { id: "sentence-28-kaze-gakkou", type: "sentence", japanese: "風邪だから、学校へ行きません。", reading: "かぜだから、がっこうへいきません。", translationRu: "Поскольку я простужен, я не иду в школу.", grammarIds: ["grammar-kara-reason", "grammar-kara-reason-plain", "grammar-masu-negative", "grammar-ni-e-destination"], vocabularyIds: ["word-kaze-28", "word-gakkou", "word-ikimasu"] },
  { id: "sentence-28-suki-benkyou", type: "sentence", japanese: "日本語が好きですから、毎日勉強します。", reading: "にほんごがすきですから、まいにちべんきょうします。", translationRu: "Поскольку мне нравится японский, я занимаюсь каждый день.", grammarIds: ["grammar-kara-reason-polite", "grammar-suki-kirai-ga", "grammar-time-without-ni", "grammar-masu-polite"], vocabularyIds: ["word-nihongo", "word-suki-na", "word-mainichi", "word-benkyoushimasu"] },
];

const confusions = ["grammar-kara-reason", "grammar-kara-reason-plain", "grammar-kara-three-meanings", "grammar-te-kara", "grammar-kara-made-time"];
export const lesson028Exercises: Exercise[] = [
  { id: "exercise-28-reason-meaning", type: "multiple-choice", prompt: "Что выражает から в 忙しいから、今日はテレビを見ません?", targetItemIds: ["grammar-kara-reason", "word-isogashii", "word-terebi"], correctAnswers: ["Причину: поскольку я занят"], distractors: ["Начало периода: с занятости", "Порядок: после того как занят", "Разрешение смотреть телевизор"], explanationRu: "Перед から стоит законченное сказуемое 忙しい, поэтому から выражает причину.", variantGroup: "lesson-028:meaning", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-28-dakara", type: "multiple-choice", prompt: "Выбери простую форму: «Поскольку я простужен...»", targetItemIds: ["grammar-kara-reason-plain", "word-kaze-28"], correctAnswers: ["風邪だから"], distractors: ["風邪から", "風邪でから", "風邪をから"], explanationRu: "После существительного в простом стиле используется だ + から.", variantGroup: "lesson-028:formation", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-28-polite", type: "multiple-choice", prompt: "Выбери вежливую причину: «Поскольку идёт дождь...»", targetItemIds: ["grammar-kara-reason-polite", "word-ame-28"], correctAnswers: ["雨ですから"], distractors: ["雨ますから", "雨てから", "雨をから"], explanationRu: "Существительное 雨 принимает вежливую связку です перед から.", variantGroup: "lesson-028:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-28-three-kara", type: "multiple-choice", prompt: "В каком варианте から означает «после того как»?", targetItemIds: ["grammar-kara-three-meanings", "grammar-te-kara"], correctAnswers: ["朝ご飯を食べてから、学校へ行きます"], distractors: ["九時から働きます", "忙しいから行きません", "雨ですから傘を持ちます"], explanationRu: "Только て-форма + から образует последовательность ～てから.", variantGroup: "lesson-028:contrast", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-28-builder", type: "sentence-builder", prompt: "Собери: Поскольку я занят, сегодня не смотрю телевизор.", targetItemIds: ["grammar-kara-reason-plain", "word-isogashii", "word-kyou", "word-terebi", "word-mimasu"], correctAnswers: ["忙しい|から|今日|は|テレビ|を|見ません"], distractors: ["て", "まで", "見ました"], explanationRu: "い-прилагательное 忙しい присоединяет から напрямую.", variantGroup: "lesson-028:reason", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-28-input", type: "text-input", prompt: "Напиши по-японски: Поскольку идёт дождь, я беру зонт.", targetItemIds: ["grammar-kara-reason-polite", "word-ame-28", "word-kasa-28", "word-mochimasu-28"], correctAnswers: ["雨ですから傘を持ちます", "雨ですから、傘を持ちます", "雨ですから傘を持ちます。", "雨ですから、傘を持ちます。"], acceptableAnswers: ["あめですからかさをもちます", "あめですから、かさをもちます"], explanationRu: "Вежливая причина: 雨ですから; объект 傘 отмечается を.", variantGroup: "lesson-028:reason", difficulty: 3, confusionItemIds: ["grammar-kara-reason-polite", "grammar-kara-three-meanings"] },
];

export const lesson028: Lesson = { id: "lesson-028", unitId: "unit-008", order: 28, title: "Потому что...", description: "Причина с から, формы ～ですから／だから и различие трёх значений から.", theory: lesson028Grammar.map((item) => item.explanationRu), itemIds: [...lesson028Vocabulary, ...lesson028Grammar, ...lesson028Sentences].map((item) => item.id), exerciseIds: lesson028Exercises.map((item) => item.id), estimatedMinutes: 20 };
export const lesson028Bundle: LessonBundle = { lesson: lesson028, vocabulary: lesson028Vocabulary, grammar: lesson028Grammar, sentences: lesson028Sentences, exercises: lesson028Exercises, outcomes: ["объяснять причину через から", "строить вежливую причину", "использовать だから после существительных и な-прилагательных", "различать три значения から"] };
