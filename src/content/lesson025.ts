import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson025Vocabulary: VocabularyItem[] = [
  { id: "word-sakuban-25", type: "vocabulary", writtenForm: "昨晩", reading: "さくばん", meaningsRu: ["вчера вечером", "прошлой ночью"], partOfSpeech: ["существительное", "наречное употребление"], jlptLevel: "N5" },
  { id: "word-shukudai-25", type: "vocabulary", writtenForm: "宿題", reading: "しゅくだい", meaningsRu: ["домашнее задание"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
];

export const lesson025Grammar: GrammarPoint[] = [
  {
    id: "grammar-ta-form-role", type: "grammar", title: "Простое прошедшее ～た／～だ",
    meaningRu: "сообщает о завершившемся действии в простом стиле",
    explanationRu: "～た-форма — простое прошедшее время глагола и невежливая пара к ～ました: 読んだ ↔ 読みました. Она описывает завершённое действие и также понадобится внутри конструкций вроде ～た後で.",
    formation: ["読みました ↔ 読んだ", "食べました ↔ 食べた"],
    cautions: ["Форма ～た уже содержит прошедшее время: не добавляй でした после глагола."],
    relatedGrammarIds: ["grammar-masu-past", "grammar-dictionary-form-role"], jlptLevel: "N5",
  },
  {
    id: "grammar-ta-form-from-te", type: "grammar", title: "Из て-формы в ～た-форму",
    meaningRu: "строит прошедшую форму заменой последнего て／で",
    explanationRu: "Если て-форма уже известна, правило короткое: て меняется на た, а で — на だ. 読んで→読んだ, 待って→待った, 書いて→書いた, 泳いで→泳いだ, 話して→話した. Исключение 行って превращается в 行った.",
    formation: ["って → った", "んで → んだ", "いて → いた", "いで → いだ", "して → した"],
    cautions: ["Не меняй んで на んた: звонкое で даёт звонкое だ."],
    relatedGrammarIds: ["grammar-te-form-group1", "grammar-te-form-role"], jlptLevel: "N5",
  },
  {
    id: "grammar-ta-form-group2-irregular", type: "grammar", title: "Вторая группа и неправильные формы",
    meaningRu: "заменяет て на た и запоминает した／来た",
    explanationRu: "У второй группы знакомая て-форма получает た: 食べて→食べた, 見て→見た. Неправильные формы: する→した, 来る→来た（きた）. 行く остаётся особым: 行った.",
    formation: ["食べて → 食べた", "見て → 見た", "する → した", "来る → 来た（きた）", "行く → 行った"],
    cautions: ["来た читается きた; форма くるた неверна."],
    relatedGrammarIds: ["grammar-ta-form-from-te", "grammar-te-form-group2-irregular"], jlptLevel: "N5",
  },
  {
    id: "grammar-plain-past-sentence", type: "grammar", title: "Простое прошедшее предложение",
    meaningRu: "завершает разговорное или нейтральное сообщение формой ～た",
    explanationRu: "В простом стиле прошедший глагол ставится в конец: 昨日、新聞を読んだ. Остальные частицы не меняются. Маркер 昨日 помогает контексту, но прошедшее время выражает сама форма 読んだ.",
    formation: ["昨日、新聞を読んだ。", "学校へ行った。"],
    cautions: ["Не подменяй прошедшее словом 昨日: 昨日読む без специального контекста не означает обычное «вчера прочитал»."],
    relatedGrammarIds: ["grammar-ta-form-role", "grammar-time-without-ni"], jlptLevel: "N5",
  },
];

export const lesson025Sentences: ExampleSentence[] = [
  { id: "sentence-25-kinou-shinbun-yonda", type: "sentence", japanese: "昨日、新聞を読んだ。", reading: "きのう、しんぶんをよんだ。", translationRu: "Вчера я прочитал газету.", grammarIds: ["grammar-plain-past-sentence", "grammar-ta-form-from-te", "grammar-o-object", "grammar-time-without-ni"], vocabularyIds: ["word-kinou", "word-shinbun", "word-yomimasu"] },
  { id: "sentence-25-kinou-gakkou-itta", type: "sentence", japanese: "昨日、学校へ行った。", reading: "きのう、がっこうへいった。", translationRu: "Вчера я ходил в школу.", grammarIds: ["grammar-plain-past-sentence", "grammar-ta-form-group2-irregular", "grammar-ni-e-destination", "grammar-time-without-ni"], vocabularyIds: ["word-kinou", "word-gakkou", "word-ikimasu"] },
  { id: "sentence-25-asagohan-tabeta", type: "sentence", japanese: "朝ご飯を食べた。", reading: "あさごはんをたべた。", translationRu: "Я позавтракал.", grammarIds: ["grammar-plain-past-sentence", "grammar-ta-form-group2-irregular", "grammar-o-object"], vocabularyIds: ["word-asagohan-19", "word-tabemasu"] },
  { id: "sentence-25-sakuban-shukudai-shita", type: "sentence", japanese: "昨晩、宿題をした。", reading: "さくばん、しゅくだいをした。", translationRu: "Вчера вечером я сделал домашнее задание.", grammarIds: ["grammar-plain-past-sentence", "grammar-ta-form-group2-irregular", "grammar-o-object", "grammar-time-without-ni"], vocabularyIds: ["word-sakuban-25", "word-shukudai-25"] },
];

const confusions = ["grammar-ta-form-role", "grammar-ta-form-from-te", "grammar-te-form-role", "grammar-masu-past"];
export const lesson025Exercises: Exercise[] = [
  { id: "exercise-25-yomu", type: "conjugation", prompt: "Поставь 読む в простое прошедшее.", targetItemIds: ["grammar-ta-form-from-te", "word-yomimasu"], correctAnswers: ["読んだ"], acceptableAnswers: ["よんだ"], distractors: ["読んた", "読んで", "読みた"], explanationRu: "読んで → 読んだ: で меняется на だ.", variantGroup: "lesson-025:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-25-kaku", type: "conjugation", prompt: "Поставь 書く в простое прошедшее.", targetItemIds: ["grammar-ta-form-from-te", "word-kakimasu-17"], correctAnswers: ["書いた"], acceptableAnswers: ["かいた"], distractors: ["書きた", "書いて", "書った"], explanationRu: "書いて → 書いた.", variantGroup: "lesson-025:formation", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-25-iku", type: "multiple-choice", prompt: "Выбери простое прошедшее от 行く.", targetItemIds: ["grammar-ta-form-group2-irregular", "word-ikimasu"], correctAnswers: ["行った"], distractors: ["行いた", "行きた", "行って"], explanationRu: "Особая て-форма 行って даёт 行った.", variantGroup: "lesson-025:irregular", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-25-taberu", type: "conjugation", prompt: "Поставь 食べる в простое прошедшее.", targetItemIds: ["grammar-ta-form-group2-irregular", "word-tabemasu"], correctAnswers: ["食べた"], acceptableAnswers: ["たべた"], distractors: ["食べった", "食べて", "食べるた"], explanationRu: "食べて → 食べた.", variantGroup: "lesson-025:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-25-builder", type: "sentence-builder", prompt: "Собери простой формой: Вчера я прочитал газету.", targetItemIds: ["grammar-plain-past-sentence", "word-kinou", "word-shinbun", "word-yomimasu"], correctAnswers: ["昨日|新聞|を|読んだ"], distractors: ["読む", "読んで", "に"], explanationRu: "Прошедшее сказуемое — 読んだ.", variantGroup: "lesson-025:sentence", difficulty: 2, confusionItemIds: ["grammar-plain-past-sentence", "grammar-plain-nonpast"] },
  { id: "exercise-25-listening", type: "listening", prompt: "Прослушай и выбери точное значение.", audioText: "昨晩、宿題をした。", targetItemIds: ["grammar-ta-form-group2-irregular", "word-sakuban-25", "word-shukudai-25"], correctAnswers: ["Вчера вечером я сделал домашнее задание."], distractors: ["Сегодня вечером я буду делать домашнее задание.", "Вчера вечером я не делал домашнее задание.", "Я хочу сделать домашнее задание."], explanationRu: "した — простое прошедшее от する.", variantGroup: "lesson-025:meaning", difficulty: 2, confusionItemIds: confusions },
];

export const lesson025: Lesson = { id: "lesson-025", unitId: "unit-008", order: 25, title: "Вчера прочитал", description: "Простое прошедшее ～た／～だ через уже знакомую て-форму.", theory: lesson025Grammar.map((item) => item.explanationRu), itemIds: [...lesson025Vocabulary, ...lesson025Grammar, ...lesson025Sentences].map((item) => item.id), exerciseIds: lesson025Exercises.map((item) => item.id), estimatedMinutes: 19 };
export const lesson025Bundle: LessonBundle = { lesson: lesson025, vocabulary: lesson025Vocabulary, grammar: lesson025Grammar, sentences: lesson025Sentences, exercises: lesson025Exercises, outcomes: ["понимать роль ～た-формы", "строить ～た из て-формы", "образовывать вторую группу и исключения", "использовать простое прошедшее предложение"] };
