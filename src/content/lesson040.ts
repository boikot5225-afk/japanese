import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson040Vocabulary: VocabularyItem[] = [
  { id: "word-yotei-40", type: "vocabulary", writtenForm: "予定", reading: "よてい", meaningsRu: ["план", "расписание", "намеченное событие"], partOfSpeech: ["существительное"], jlptLevel: "N4" },
  { id: "word-ame-40", type: "vocabulary", writtenForm: "雨", reading: "あめ", meaningsRu: ["дождь"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
];

export const lesson040Grammar: GrammarPoint[] = [
  {
    id: "grammar-yotei-desu", type: "grammar", title: "Намеченный план: ～予定です",
    meaningRu: "сообщает о конкретном плане, договорённости или расписании",
    explanationRu: "После глагола используется словарная форма: 来年日本へ行く予定です — «По плану в следующем году еду в Японию». После существительного нужна の: 今日は休みの予定です — «На сегодня запланирован выходной».",
    formation: ["[словарная форма] + 予定です", "[существительное] + の + 予定です"],
    cautions: ["Не ставь ～ます перед 予定: 行きます予定です неверно.", "После существительного не пропускай の."],
    relatedGrammarIds: ["grammar-dictionary-form-role", "grammar-no-link"], jlptLevel: "N4",
  },
  {
    id: "grammar-tsumori-vs-yotei", type: "grammar", title: "つもり и 予定",
    meaningRu: "различает личное намерение и более конкретный запланированный порядок",
    explanationRu: "行くつもりです подчёркивает решение говорящего: «намерен пойти». 行く予定です подчёркивает план или расписание: «запланировано пойти». В реальной речи они могут описывать одно событие, но фокус различается.",
    formation: ["行くつもりです — намерен пойти", "行く予定です — запланировано пойти"],
    cautions: ["予定 не гарантирует выполнение; это план, а не уже случившийся факт."],
    relatedGrammarIds: ["grammar-dictionary-tsumori", "grammar-yotei-desu"], jlptLevel: "N4",
  },
  {
    id: "grammar-deshou-probability", type: "grammar", title: "Вероятность: ～でしょう",
    meaningRu: "выражает предположение «вероятно / скорее всего»",
    explanationRu: "После глаголов и い-прилагательных ставится простая форма: 行くでしょう, 高いでしょう. После существительных и な-прилагательных だ не используется: 雨でしょう, 静かでしょう. Вежливость содержится в самой форме でしょう.",
    formation: ["[простая форма глагола／い-прилагательного] + でしょう", "[существительное／な-прилагательное] + でしょう"],
    cautions: ["Не говори 雨だでしょう или 静かだでしょう; перед でしょう связка だ опускается."],
    relatedGrammarIds: ["grammar-plain-nonpast", "grammar-i-adjective-predicate", "grammar-na-adjective-predicate"], jlptLevel: "N4",
  },
  {
    id: "grammar-deshou-ka", type: "grammar", title: "Осторожный вопрос ～でしょうか",
    meaningRu: "делает вопрос более мягким или предположительным",
    explanationRu: "Добавление か превращает でしょう в вежливый осторожный вопрос: テストは簡単でしょうか — «Интересно, тест будет лёгким? / Как вы думаете, тест будет лёгким?».",
    formation: ["[высказывание] + でしょうか"],
    cautions: ["Это не обычное подтверждение факта. Интонация и контекст определяют оттенок сомнения или вежливого запроса мнения."],
    relatedGrammarIds: ["grammar-deshou-probability", "grammar-ka-question"], jlptLevel: "N4",
  },
];

export const lesson040Sentences: ExampleSentence[] = [
  { id: "sentence-40-japan-schedule", type: "sentence", japanese: "来年、日本へ行く予定です。", reading: "らいねん、にほんへいくよていです。", translationRu: "На следующий год запланирована поездка в Японию.", grammarIds: ["grammar-yotei-desu", "grammar-ni-e-destination", "grammar-time-without-ni"], vocabularyIds: ["word-rainen-39", "word-nihon-36", "word-ikimasu", "word-yotei-40"] },
  { id: "sentence-40-study-schedule", type: "sentence", japanese: "今日は日本語を勉強する予定です。", reading: "きょうはにほんごをべんきょうするよていです。", translationRu: "Сегодня я планирую заниматься японским.", grammarIds: ["grammar-yotei-desu", "grammar-time-without-ni", "grammar-o-object"], vocabularyIds: ["word-kyou", "word-nihongo", "word-benkyoushimasu", "word-yotei-40"] },
  { id: "sentence-40-rain-probability", type: "sentence", japanese: "今日は雨でしょう。", reading: "きょうはあめでしょう。", translationRu: "Сегодня, вероятно, будет дождь.", grammarIds: ["grammar-deshou-probability", "grammar-wa-topic", "grammar-time-without-ni"], vocabularyIds: ["word-kyou", "word-ame-40"] },
  { id: "sentence-40-town-quiet-probability", type: "sentence", japanese: "この町は静かでしょう。", reading: "このまちはしずかでしょう。", translationRu: "Этот город, вероятно, тихий.", grammarIds: ["grammar-deshou-probability", "grammar-wa-topic", "grammar-na-adjective-predicate"], vocabularyIds: ["word-machi", "word-shizuka-na"] },
  { id: "sentence-40-test-question", type: "sentence", japanese: "テストは簡単でしょうか。", reading: "テストはかんたんでしょうか。", translationRu: "Как вы думаете, тест будет лёгким?", grammarIds: ["grammar-deshou-ka", "grammar-na-adjective-predicate", "grammar-wa-topic"], vocabularyIds: ["word-tesuto", "word-kantan-na"] },
];

const confusions = ["grammar-yotei-desu", "grammar-tsumori-vs-yotei", "grammar-deshou-probability", "grammar-deshou-ka"];
export const lesson040Exercises: Exercise[] = [
  { id: "exercise-40-verb-yotei", type: "multiple-choice", prompt: "Выбери правильную форму: «На сегодня запланировано заниматься японским».", targetItemIds: ["grammar-yotei-desu", "word-kyou", "word-nihongo", "word-benkyoushimasu", "word-yotei-40"], correctAnswers: ["今日は日本語を勉強する予定です"], distractors: ["今日は日本語を勉強します予定です", "今日は日本語を勉強して予定です", "今日は日本語を勉強するの予定です"], explanationRu: "После глагола перед 予定です используется словарная форма.", variantGroup: "lesson-040:schedule", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-40-noun-no", type: "multiple-choice", prompt: "После существительного перед 予定です нужна частица...", targetItemIds: ["grammar-yotei-desu", "word-yotei-40"], correctAnswers: ["の"], distractors: ["だ", "を", "で"], explanationRu: "Существительное соединяется с 予定 через の: 休みの予定です.", variantGroup: "lesson-040:schedule", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-40-tsumori-yotei", type: "multiple-choice", prompt: "Главный акцент на личном решении говорящего, а не расписании. Что выбрать?", targetItemIds: ["grammar-tsumori-vs-yotei", "word-nihon-36", "word-ikimasu"], correctAnswers: ["日本へ行くつもりです"], distractors: ["日本へ行く予定です", "日本へ行きたいです", "日本へ行ったことがあります"], explanationRu: "つもり подчёркивает намерение, 予定 — конкретный план или расписание.", variantGroup: "lesson-040:contrast", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-40-noun-deshou", type: "multiple-choice", prompt: "Выбери правильное предположение: «Сегодня, вероятно, дождь».", targetItemIds: ["grammar-deshou-probability", "word-kyou", "word-ame-40"], correctAnswers: ["今日は雨でしょう"], distractors: ["今日は雨だでしょう", "今日は雨ですでしょう", "今日は雨なでしょう"], explanationRu: "После существительного перед でしょう связка だ не ставится.", variantGroup: "lesson-040:prediction", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-40-builder", type: "sentence-builder", prompt: "Собери: Этот город, вероятно, тихий.", targetItemIds: ["grammar-deshou-probability", "word-machi", "word-shizuka-na"], correctAnswers: ["この|町|は|静か|でしょう"], distractors: ["だ", "な", "です"], explanationRu: "な-прилагательное перед でしょう используется без だ: 静かでしょう.", variantGroup: "lesson-040:prediction", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-40-input", type: "text-input", prompt: "Напиши по-японски: На следующий год запланирована поездка в Японию.", targetItemIds: ["grammar-yotei-desu", "word-rainen-39", "word-nihon-36", "word-ikimasu", "word-yotei-40"], correctAnswers: ["来年日本へ行く予定です", "来年、日本へ行く予定です", "来年、日本へ行く予定です。"], acceptableAnswers: ["らいねんにほんへいくよていです", "らいねん、にほんへいくよていです"], explanationRu: "行く — словарная форма перед 予定です; 来年 обычно без に.", variantGroup: "lesson-040:production", difficulty: 3, confusionItemIds: confusions },
  { id: "exercise-40-listening", type: "listening", prompt: "Прослушай и выбери точный оттенок.", audioText: "テストは簡単でしょうか。", targetItemIds: ["grammar-deshou-ka", "word-tesuto", "word-kantan-na"], correctAnswers: ["Говорящий вежливо спрашивает, будет ли тест лёгким."], distractors: ["Говорящий уверенно объявляет тест лёгким.", "Говорящий запрещает лёгкий тест.", "Говорящий сообщает, что тест уже был лёгким."], explanationRu: "～でしょうか оформляет мягкий предположительный вопрос.", variantGroup: "lesson-040:listening", difficulty: 2, confusionItemIds: confusions },
];

export const lesson040: Lesson = { id: "lesson-040", unitId: "unit-011", order: 40, title: "По плану и, вероятно...", description: "Конкретный план через ～予定です, отличие от つもり, предположение ～でしょう и мягкий вопрос ～でしょうか.", theory: lesson040Grammar.map((item) => item.explanationRu), itemIds: [...lesson040Vocabulary, ...lesson040Grammar, ...lesson040Sentences].map((item) => item.id), exerciseIds: lesson040Exercises.map((item) => item.id), estimatedMinutes: 21 };
export const lesson040Bundle: LessonBundle = { lesson: lesson040, vocabulary: lesson040Vocabulary, grammar: lesson040Grammar, sentences: lesson040Sentences, exercises: lesson040Exercises, outcomes: ["сообщать конкретный план через ～予定です", "различать личное намерение и расписание", "выражать вероятность через ～でしょう", "задавать осторожный вопрос через ～でしょうか"] };
