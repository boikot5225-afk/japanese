import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson031Vocabulary: VocabularyItem[] = [];

export const lesson031Grammar: GrammarPoint[] = [
  {
    id: "grammar-ta-hou-ga-ii", type: "grammar", title: "Совет ～たほうがいいです",
    meaningRu: "советует выполнить действие",
    explanationRu: "Положительный совет строится из ～た-формы и ほうがいいです: 傘を持ったほうがいいです — «Лучше взять зонт». Говорящий считает этот вариант разумнее другого.",
    formation: ["[глагол в ～た-форме] + ほうがいいです", "持ったほうがいいです", "勉強したほうがいいです"],
    cautions: ["～た здесь является частью конструкции совета и не сообщает, что действие уже произошло."],
    relatedGrammarIds: ["grammar-ta-form-role", "grammar-hou-ga-comparison"], jlptLevel: "N5",
  },
  {
    id: "grammar-nai-hou-ga-ii", type: "grammar", title: "Совет не делать ～ないほうがいいです",
    meaningRu: "советует отказаться от действия",
    explanationRu: "Отрицательный совет использует простую отрицательную форму: 学校へ行かないほうがいいです — «Лучше не идти в школу». ～ない остаётся без изменений перед ほうがいいです.",
    formation: ["[глагол в ～ない-форме] + ほうがいいです", "行かないほうがいいです", "見ないほうがいいです"],
    cautions: ["Не используй ～なかった: 行かなかったほうがいい описывало бы оценку уже произошедшего выбора, а не обычный совет на будущее."],
    relatedGrammarIds: ["grammar-nai-form-role", "grammar-ta-hou-ga-ii"], jlptLevel: "N5",
  },
  {
    id: "grammar-hou-ga-ii-not-past", type: "grammar", title: "Почему положительный совет на ～た",
    meaningRu: "различает форму конструкции и реальное прошедшее время",
    explanationRu: "В 食べたほうがいいです форма 食べた не переводится как «съел». Вся конструкция означает «лучше поесть». Значение задаёт сочетание ～たほうがいい, поэтому его нужно узнавать целиком.",
    formation: ["食べた — съел", "食べたほうがいいです — лучше поесть"],
    cautions: ["Не переводи отдельные части механически: сначала распознай всю конструкцию ～たほうがいいです."],
    relatedGrammarIds: ["grammar-ta-hou-ga-ii", "grammar-plain-past-sentence"], jlptLevel: "N5",
  },
  {
    id: "grammar-hou-ga-ii-question", type: "grammar", title: "Вопрос о совете ～たほうがいいですか",
    meaningRu: "спрашивает, стоит ли выполнить действие",
    explanationRu: "Добавь か к положительному совету: 傘を持ったほうがいいですか — «Мне лучше взять зонт?». Вопрос просит оценить наиболее разумный вариант.",
    formation: ["[～た-форма] + ほうがいいですか"],
    cautions: ["Это вопрос о рекомендации, а не о способности: ～たほうがいいですか не заменяет ～ことができますか."],
    relatedGrammarIds: ["grammar-ta-hou-ga-ii", "grammar-ka-question", "grammar-koto-ga-dekimasu-ka"], jlptLevel: "N5",
  },
];

export const lesson031Sentences: ExampleSentence[] = [
  { id: "sentence-31-ame-kasa", type: "sentence", japanese: "雨ですから、傘を持ったほうがいいです。", reading: "あめですから、かさをもったほうがいいです。", translationRu: "Поскольку идёт дождь, лучше взять зонт.", grammarIds: ["grammar-ta-hou-ga-ii", "grammar-hou-ga-ii-not-past", "grammar-kara-reason-polite", "grammar-o-object"], vocabularyIds: ["word-ame-28", "word-kasa-28", "word-mochimasu-28"] },
  { id: "sentence-31-kanji-mainichi", type: "sentence", japanese: "漢字を毎日書いたほうがいいです。", reading: "かんじをまいにちかいたほうがいいです。", translationRu: "Лучше писать кандзи каждый день.", grammarIds: ["grammar-ta-hou-ga-ii", "grammar-hou-ga-ii-not-past", "grammar-time-without-ni", "grammar-o-object"], vocabularyIds: ["word-kanji-24", "word-mainichi", "word-kakimasu-17"] },
  { id: "sentence-31-kaze-gakkou", type: "sentence", japanese: "風邪だから、学校へ行かないほうがいいです。", reading: "かぜだから、がっこうへいかないほうがいいです。", translationRu: "Поскольку ты простужен, лучше не идти в школу.", grammarIds: ["grammar-nai-hou-ga-ii", "grammar-kara-reason-plain", "grammar-nai-form-role", "grammar-ni-e-destination"], vocabularyIds: ["word-kaze-28", "word-gakkou", "word-ikimasu"] },
  { id: "sentence-31-isogashii-terebi", type: "sentence", japanese: "今日は忙しいから、テレビを見ないほうがいいです。", reading: "きょうはいそがしいから、テレビをみないほうがいいです。", translationRu: "Сегодня ты занят, поэтому лучше не смотреть телевизор.", grammarIds: ["grammar-nai-hou-ga-ii", "grammar-kara-reason", "grammar-wa-topic", "grammar-o-object"], vocabularyIds: ["word-kyou", "word-isogashii", "word-terebi", "word-mimasu"] },
  { id: "sentence-31-question", type: "sentence", japanese: "傘を持ったほうがいいですか。", reading: "かさをもったほうがいいですか。", translationRu: "Мне лучше взять зонт?", grammarIds: ["grammar-hou-ga-ii-question", "grammar-ta-hou-ga-ii", "grammar-ka-question", "grammar-o-object"], vocabularyIds: ["word-kasa-28", "word-mochimasu-28"] },
];

const confusions = ["grammar-ta-hou-ga-ii", "grammar-nai-hou-ga-ii", "grammar-hou-ga-ii-not-past", "grammar-hou-ga-ii-question", "grammar-ta-form-role", "grammar-nai-form-role"];
export const lesson031Exercises: Exercise[] = [
  { id: "exercise-31-motsu-advice", type: "conjugation", prompt: "Закончи совет: 傘を持つ → 傘を...ほうがいいです.", targetItemIds: ["grammar-ta-hou-ga-ii", "word-kasa-28", "word-mochimasu-28"], correctAnswers: ["持った"], acceptableAnswers: ["もった"], distractors: ["持つ", "持って", "持ちます"], explanationRu: "Положительный совет использует ～た-форму: 持つ→持った.", variantGroup: "lesson-031:positive", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-31-iku-negative", type: "conjugation", prompt: "Закончи совет «лучше не идти»: 行く → ...ほうがいいです.", targetItemIds: ["grammar-nai-hou-ga-ii", "word-ikimasu"], correctAnswers: ["行かない"], acceptableAnswers: ["いかない"], distractors: ["行かなかった", "行って", "行きません"], explanationRu: "Отрицательный совет использует ～ない-форму: 行く→行かない.", variantGroup: "lesson-031:negative", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-31-not-past", type: "multiple-choice", prompt: "Что означает 食べたほうがいいです?", targetItemIds: ["grammar-hou-ga-ii-not-past", "word-tabemasu"], correctAnswers: ["Лучше поесть"], distractors: ["Лучше было не есть", "Я уже поел", "Я могу поесть"], explanationRu: "В конструкции ～たほうがいい форма ～た не выражает отдельное прошедшее действие.", variantGroup: "lesson-031:meaning", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-31-builder", type: "sentence-builder", prompt: "Собери: Поскольку идёт дождь, лучше взять зонт.", targetItemIds: ["grammar-ta-hou-ga-ii", "grammar-kara-reason-polite", "word-ame-28", "word-kasa-28", "word-mochimasu-28"], correctAnswers: ["雨|です|から|傘|を|持った|ほう|が|いい|です"], distractors: ["持って", "ない", "できます"], explanationRu: "Причина заканчивается на ですから, совет — 持ったほうがいいです.", variantGroup: "lesson-031:positive", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-31-question", type: "multiple-choice", prompt: "Как спросить «Мне лучше взять зонт?»", targetItemIds: ["grammar-hou-ga-ii-question", "word-kasa-28", "word-mochimasu-28"], correctAnswers: ["傘を持ったほうがいいですか"], distractors: ["傘を持つことができますか", "傘を持ちましたか", "傘を持ってもいいですか"], explanationRu: "Вопрос о рекомендации строится как ～たほうがいいですか.", variantGroup: "lesson-031:question", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-31-input", type: "text-input", prompt: "Напиши по-японски: Поскольку ты простужен, лучше не идти в школу.", targetItemIds: ["grammar-nai-hou-ga-ii", "grammar-kara-reason-plain", "word-kaze-28", "word-gakkou", "word-ikimasu"], correctAnswers: ["風邪だから学校へ行かないほうがいいです", "風邪だから、学校へ行かないほうがいいです", "風邪だから、学校へ行かないほうがいいです。"], acceptableAnswers: ["かぜだからがっこうへいかないほうがいいです", "かぜだから、がっこうへいかないほうがいいです"], explanationRu: "После существительного используется だから; совет не делать — 行かないほうがいいです.", variantGroup: "lesson-031:negative", difficulty: 3, confusionItemIds: confusions },
  { id: "exercise-31-listening", type: "listening", prompt: "Прослушай и выбери точное значение.", audioText: "漢字を毎日書いたほうがいいです。", targetItemIds: ["grammar-ta-hou-ga-ii", "grammar-hou-ga-ii-not-past", "word-kanji-24", "word-mainichi", "word-kakimasu-17"], correctAnswers: ["Лучше писать кандзи каждый день."], distractors: ["Я писал кандзи каждый день.", "Можно не писать кандзи каждый день.", "Я умею писать кандзи каждый день."], explanationRu: "～たほうがいいです выражает рекомендацию.", variantGroup: "lesson-031:positive", difficulty: 2, confusionItemIds: confusions },
];

export const lesson031: Lesson = { id: "lesson-031", unitId: "unit-009", order: 31, title: "Лучше сделать", description: "Советы через ～たほうがいい／～ないほうがいい и вопрос о рекомендации.", theory: lesson031Grammar.map((item) => item.explanationRu), itemIds: [...lesson031Vocabulary, ...lesson031Grammar, ...lesson031Sentences].map((item) => item.id), exerciseIds: lesson031Exercises.map((item) => item.id), estimatedMinutes: 20 };
export const lesson031Bundle: LessonBundle = { lesson: lesson031, vocabulary: lesson031Vocabulary, grammar: lesson031Grammar, sentences: lesson031Sentences, exercises: lesson031Exercises, outcomes: ["давать положительный совет", "советовать не выполнять действие", "не принимать ～た в совете за прошедшее", "спрашивать о рекомендации"] };
