import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson030Vocabulary: VocabularyItem[] = [];

export const lesson030Grammar: GrammarPoint[] = [
  {
    id: "grammar-tari-tari-suru", type: "grammar", title: "Примеры действий ～たり～たりします",
    meaningRu: "перечисляет несколько характерных действий без полного списка",
    explanationRu: "К ～た-форме добавляется り, а после перечисления ставится します: 本を読んだり、テレビを見たりします — «Читаю книги, смотрю телевизор и занимаюсь подобными делами». Перечень показывает примеры, а не обязательно все действия.",
    formation: ["[～た-форма] + り、[～た-форма] + り + します", "読んだり、見たりします"],
    cautions: ["Форма перед り выглядит как прошедшая, но время всей конструкции задаёт последнее します／しました."],
    relatedGrammarIds: ["grammar-ta-form-role", "grammar-te-form-role"], jlptLevel: "N5",
  },
  {
    id: "grammar-tari-formation", type: "grammar", title: "Как образовать ～たり",
    meaningRu: "добавляет り к готовой ～た／～だ-форме",
    explanationRu: "Сначала образуй простое прошедшее, затем добавь り: 読む→読んだ→読んだり; 書く→書いた→書いたり; 食べる→食べた→食べたり; する→した→したり.",
    formation: ["読んだ + り", "書いた + り", "食べた + り", "した + り"],
    cautions: ["Не присоединяй り к て-форме или ～ます-основе: 読んでり и 読みたり неверны."],
    relatedGrammarIds: ["grammar-tari-tari-suru", "grammar-ta-form-from-te", "grammar-ta-form-group2-irregular"], jlptLevel: "N5",
  },
  {
    id: "grammar-tari-tense", type: "grammar", title: "Время в конце конструкции",
    meaningRu: "переносит настоящее или прошедшее время на последнее します",
    explanationRu: "Обычные или будущие действия заканчиваются на します: 日曜日は読んだりします. Прошедший набор действий заканчивается на しました: 昨日は読んだりしました. Формы на ～たり внутри не меняются.",
    formation: ["～たり～たりします — настоящее／будущее", "～たり～たりしました — прошедшее"],
    cautions: ["Не меняй каждую часть на вежливое прошедшее: 読みましたり неверно."],
    relatedGrammarIds: ["grammar-tari-tari-suru", "grammar-masu-past"], jlptLevel: "N5",
  },
  {
    id: "grammar-tari-vs-te-sequence", type: "grammar", title: "～たり и последовательность с て",
    meaningRu: "различает примеры занятий и порядок действий",
    explanationRu: "水を飲んで、日本語を勉強します описывает последовательность: выпил воды и затем начал заниматься японским. 水を飲んだり、日本語を勉強したりします перечисляет типичные примеры без строгого порядка.",
    formation: ["飲んで、勉強します — последовательность", "飲んだり、勉強したりします — примеры занятий"],
    cautions: ["Не используй ～たり, если нужно ясно сообщить, какое действие произошло первым."],
    relatedGrammarIds: ["grammar-tari-tari-suru", "grammar-te-form-role", "grammar-te-kara"], jlptLevel: "N5",
  },
];

export const lesson030Sentences: ExampleSentence[] = [
  { id: "sentence-30-hon-terebi", type: "sentence", japanese: "日曜日は本を読んだり、テレビを見たりします。", reading: "にちようびはほんをよんだり、テレビをみたりします。", translationRu: "По воскресеньям я, например, читаю книги и смотрю телевизор.", grammarIds: ["grammar-tari-tari-suru", "grammar-tari-formation", "grammar-wa-topic", "grammar-o-object"], vocabularyIds: ["word-hon", "word-yomimasu", "word-terebi", "word-mimasu"] },
  { id: "sentence-30-benkyou-kanji", type: "sentence", japanese: "日本語を勉強したり、漢字を書いたりします。", reading: "にほんごをべんきょうしたり、かんじをかいたりします。", translationRu: "Я, например, занимаюсь японским и пишу кандзи.", grammarIds: ["grammar-tari-tari-suru", "grammar-tari-formation", "grammar-o-object"], vocabularyIds: ["word-nihongo", "word-benkyoushimasu", "word-kanji-24", "word-kakimasu-17"] },
  { id: "sentence-30-yesterday", type: "sentence", japanese: "昨日は新聞を読んだり、テレビを見たりしました。", reading: "きのうはしんぶんをよんだり、テレビをみたりしました。", translationRu: "Вчера я, среди прочего, читал газету и смотрел телевизор.", grammarIds: ["grammar-tari-tari-suru", "grammar-tari-tense", "grammar-wa-topic", "grammar-o-object"], vocabularyIds: ["word-kinou", "word-shinbun", "word-yomimasu", "word-terebi", "word-mimasu"] },
  { id: "sentence-30-breakfast-water", type: "sentence", japanese: "朝はパンを食べたり、水を飲んだりします。", reading: "あさはパンをたべたり、みずをのんだりします。", translationRu: "По утрам я, например, ем хлеб и пью воду.", grammarIds: ["grammar-tari-tari-suru", "grammar-tari-formation", "grammar-wa-topic", "grammar-o-object"], vocabularyIds: ["word-pan", "word-tabemasu", "word-mizu", "word-nomimasu"] },
  { id: "sentence-30-sequence", type: "sentence", japanese: "水を飲んで、日本語を勉強します。", reading: "みずをのんで、にほんごをべんきょうします。", translationRu: "Я пью воду, а затем занимаюсь японским.", grammarIds: ["grammar-tari-vs-te-sequence", "grammar-te-form-role", "grammar-o-object"], vocabularyIds: ["word-mizu", "word-nomimasu", "word-nihongo", "word-benkyoushimasu"] },
];

const confusions = ["grammar-tari-tari-suru", "grammar-tari-formation", "grammar-tari-tense", "grammar-tari-vs-te-sequence", "grammar-te-form-role"];
export const lesson030Exercises: Exercise[] = [
  { id: "exercise-30-yomu-tari", type: "conjugation", prompt: "Поставь 読む в форму на ～たり.", targetItemIds: ["grammar-tari-formation", "word-yomimasu"], correctAnswers: ["読んだり"], acceptableAnswers: ["よんだり"], distractors: ["読んでり", "読みたり", "読んたり"], explanationRu: "読む → 読んだ → 読んだり.", variantGroup: "lesson-030:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-30-kaku-tari", type: "conjugation", prompt: "Поставь 書く в форму на ～たり.", targetItemIds: ["grammar-tari-formation", "word-kakimasu-17"], correctAnswers: ["書いたり"], acceptableAnswers: ["かいたり"], distractors: ["書いてり", "書きたり", "書ったり"], explanationRu: "書く → 書いた → 書いたり.", variantGroup: "lesson-030:formation", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-30-builder", type: "sentence-builder", prompt: "Собери: По воскресеньям я, например, читаю книги и смотрю телевизор.", targetItemIds: ["grammar-tari-tari-suru", "word-hon", "word-yomimasu", "word-terebi", "word-mimasu"], correctAnswers: ["日曜日|は|本|を|読んだり|テレビ|を|見たり|します"], distractors: ["読んで", "見て", "しました"], explanationRu: "Оба примера получают ～たり, а конструкция заканчивается на します.", variantGroup: "lesson-030:list", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-30-tense", type: "multiple-choice", prompt: "Как закончить перечисление действий, которые происходили вчера?", targetItemIds: ["grammar-tari-tense", "word-kinou"], correctAnswers: ["～たり～たりしました"], distractors: ["～たり～たりします", "～ましたり～ましたり", "～て～てでした"], explanationRu: "Прошедшее время выражает последнее しました.", variantGroup: "lesson-030:tense", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-30-contrast", type: "multiple-choice", prompt: "Какой вариант ясно описывает порядок «выпил воды, затем начал заниматься японским»?", targetItemIds: ["grammar-tari-vs-te-sequence", "word-mizu", "word-nomimasu", "word-nihongo", "word-benkyoushimasu"], correctAnswers: ["水を飲んで、日本語を勉強します"], distractors: ["水を飲んだり、日本語を勉強したりします", "水を飲むことがあります", "水を飲んだことがあります"], explanationRu: "Для последовательности используется て-форма; ～たり даёт только примеры занятий.", variantGroup: "lesson-030:contrast", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-30-input", type: "text-input", prompt: "Напиши по-японски: Я, например, занимаюсь японским и пишу кандзи.", targetItemIds: ["grammar-tari-tari-suru", "word-nihongo", "word-benkyoushimasu", "word-kanji-24", "word-kakimasu-17"], correctAnswers: ["日本語を勉強したり漢字を書いたりします", "日本語を勉強したり、漢字を書いたりします", "日本語を勉強したり、漢字を書いたりします。"], acceptableAnswers: ["にほんごをべんきょうしたりかんじをかいたりします", "にほんごをべんきょうしたり、かんじをかいたりします"], explanationRu: "勉強する→勉強したり, 書く→書いたり; в конце します.", variantGroup: "lesson-030:list", difficulty: 3, confusionItemIds: confusions },
  { id: "exercise-30-listening", type: "listening", prompt: "Прослушай и выбери точное значение.", audioText: "昨日は新聞を読んだり、テレビを見たりしました。", targetItemIds: ["grammar-tari-tari-suru", "grammar-tari-tense", "word-kinou", "word-shinbun", "word-terebi"], correctAnswers: ["Вчера я, среди прочего, читал газету и смотрел телевизор."], distractors: ["Вчера я сначала прочитал газету, а потом посмотрел телевизор.", "Я никогда не читал газету и не смотрел телевизор.", "По воскресеньям я читаю газету и смотрю телевизор."], explanationRu: "～たり～たりしました перечисляет примеры прошлых действий без строгого порядка.", variantGroup: "lesson-030:list", difficulty: 2, confusionItemIds: confusions },
];

export const lesson030: Lesson = { id: "lesson-030", unitId: "unit-009", order: 30, title: "То одно, то другое", description: "Перечисление характерных действий через ～たり～たりします и отличие от последовательности с て.", theory: lesson030Grammar.map((item) => item.explanationRu), itemIds: [...lesson030Vocabulary, ...lesson030Grammar, ...lesson030Sentences].map((item) => item.id), exerciseIds: lesson030Exercises.map((item) => item.id), estimatedMinutes: 20 };
export const lesson030Bundle: LessonBundle = { lesson: lesson030, vocabulary: lesson030Vocabulary, grammar: lesson030Grammar, sentences: lesson030Sentences, exercises: lesson030Exercises, outcomes: ["образовывать форму ～たり", "перечислять примеры действий", "задавать время последним します／しました", "различать ～たり и последовательность с て"] };
