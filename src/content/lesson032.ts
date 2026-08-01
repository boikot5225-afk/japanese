import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson032Vocabulary: VocabularyItem[] = [];

export const lesson032Grammar: GrammarPoint[] = [
  {
    id: "grammar-nakereba-narimasen", type: "grammar", title: "Обязанность ～なければなりません",
    meaningRu: "сообщает, что действие необходимо выполнить",
    explanationRu: "Возьми ～ない-форму, убери конечное い и добавь ければなりません: 行かない→行かなければなりません — «Нужно идти / должен пойти». Конструкция выражает необходимость, а не простое будущее.",
    formation: ["[～ない без い] + ければなりません", "行かない → 行かなければなりません", "しない → しなければなりません"],
    cautions: ["Не сохраняй い: 行かないければなりません неверно."],
    relatedGrammarIds: ["grammar-nai-form-role", "grammar-masu-negative"], jlptLevel: "N5",
  },
  {
    id: "grammar-nakereba-formation", type: "grammar", title: "Формы перед ～なければなりません",
    meaningRu: "строит обязанность от глаголов разных групп",
    explanationRu: "Правило применяется к готовой ～ない-форме: 読まない→読まなければなりません; 食べない→食べなければなりません; しない→しなければなりません; 来ない（こない）→来なければなりません（こなければなりません）.",
    formation: ["読まない → 読まなければなりません", "食べない → 食べなければなりません", "しない → しなければなりません", "来ない → 来なければなりません"],
    cautions: ["Сначала проверь правильность ～ない-формы; ошибка в ней переходит во всю конструкцию."],
    relatedGrammarIds: ["grammar-nakereba-narimasen", "grammar-nai-form-group1", "grammar-nai-form-group2-irregular"], jlptLevel: "N5",
  },
  {
    id: "grammar-nakute-mo-ii", type: "grammar", title: "Можно не делать ～なくてもいいです",
    meaningRu: "сообщает, что действие не обязательно",
    explanationRu: "Возьми ～ない-форму, замени ない на なくて и добавь もいいです: 行かない→行かなくてもいいです — «Можно не идти / не обязательно идти». Это разрешение отказаться от действия.",
    formation: ["[～ない без い] + くてもいいです", "行かない → 行かなくてもいいです", "しない → しなくてもいいです"],
    cautions: ["～なくてもいいです не означает запрет. Оно говорит, что действие можно не выполнять."],
    relatedGrammarIds: ["grammar-nai-form-role", "grammar-te-mo-ii", "grammar-nakereba-narimasen"], jlptLevel: "N5",
  },
  {
    id: "grammar-no-need-vs-prohibition", type: "grammar", title: "«Не обязательно» и «нельзя»",
    meaningRu: "различает отсутствие обязанности и запрет",
    explanationRu: "テレビを見なくてもいいです означает «телевизор можно не смотреть». テレビを見てはいけません означает «телевизор смотреть нельзя». В первом случае действие разрешено, но не требуется; во втором оно запрещено.",
    formation: ["～なくてもいいです — можно не делать", "～てはいけません — нельзя делать"],
    cautions: ["Русское «не надо» двусмысленно; в японском выбери между отсутствием необходимости и запретом."],
    relatedGrammarIds: ["grammar-nakute-mo-ii", "grammar-te-wa-ikemasen"], jlptLevel: "N5",
  },
];

export const lesson032Sentences: ExampleSentence[] = [
  { id: "sentence-32-shukudai", type: "sentence", japanese: "宿題をしなければなりません。", reading: "しゅくだいをしなければなりません。", translationRu: "Нужно сделать домашнее задание.", grammarIds: ["grammar-nakereba-narimasen", "grammar-nakereba-formation", "grammar-o-object"], vocabularyIds: ["word-shukudai-25"] },
  { id: "sentence-32-benkyou", type: "sentence", japanese: "毎日、日本語を勉強しなければなりません。", reading: "まいにち、にほんごをべんきょうしなければなりません。", translationRu: "Нужно заниматься японским каждый день.", grammarIds: ["grammar-nakereba-narimasen", "grammar-nakereba-formation", "grammar-time-without-ni", "grammar-o-object"], vocabularyIds: ["word-mainichi", "word-nihongo", "word-benkyoushimasu"] },
  { id: "sentence-32-gakkou-no-need", type: "sentence", japanese: "今日は学校へ行かなくてもいいです。", reading: "きょうはがっこうへいかなくてもいいです。", translationRu: "Сегодня можно не идти в школу.", grammarIds: ["grammar-nakute-mo-ii", "grammar-wa-topic", "grammar-ni-e-destination"], vocabularyIds: ["word-kyou", "word-gakkou", "word-ikimasu"] },
  { id: "sentence-32-kasa-no-need", type: "sentence", japanese: "傘を持たなくてもいいです。", reading: "かさをもたなくてもいいです。", translationRu: "Зонт можно не брать.", grammarIds: ["grammar-nakute-mo-ii", "grammar-o-object"], vocabularyIds: ["word-kasa-28", "word-mochimasu-28"] },
  { id: "sentence-32-contrast-no-need", type: "sentence", japanese: "テレビを見なくてもいいです。", reading: "テレビをみなくてもいいです。", translationRu: "Телевизор можно не смотреть.", grammarIds: ["grammar-no-need-vs-prohibition", "grammar-nakute-mo-ii", "grammar-o-object"], vocabularyIds: ["word-terebi", "word-mimasu"] },
  { id: "sentence-32-contrast-prohibition", type: "sentence", japanese: "テレビを見てはいけません。", reading: "テレビをみてはいけません。", translationRu: "Телевизор смотреть нельзя.", grammarIds: ["grammar-no-need-vs-prohibition", "grammar-te-wa-ikemasen", "grammar-o-object"], vocabularyIds: ["word-terebi", "word-mimasu"] },
];

const confusions = ["grammar-nakereba-narimasen", "grammar-nakereba-formation", "grammar-nakute-mo-ii", "grammar-no-need-vs-prohibition", "grammar-te-wa-ikemasen"];
export const lesson032Exercises: Exercise[] = [
  { id: "exercise-32-suru-duty", type: "conjugation", prompt: "Поставь する в форму ～なければなりません.", targetItemIds: ["grammar-nakereba-formation"], correctAnswers: ["しなければなりません"], distractors: ["しないければなりません", "してなりません", "しなくてもいいです"], explanationRu: "する→しない→しなければなりません.", variantGroup: "lesson-032:duty", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-32-iku-duty", type: "conjugation", prompt: "Поставь 行く в форму ～なければなりません.", targetItemIds: ["grammar-nakereba-narimasen", "word-ikimasu"], correctAnswers: ["行かなければなりません"], acceptableAnswers: ["いかなければなりません"], distractors: ["行かないければなりません", "行ってなりません", "行かなくてもいいです"], explanationRu: "行く→行かない→行かなければなりません.", variantGroup: "lesson-032:duty", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-32-motsu-no-need", type: "conjugation", prompt: "Поставь 持つ в форму «можно не брать».", targetItemIds: ["grammar-nakute-mo-ii", "word-mochimasu-28"], correctAnswers: ["持たなくてもいいです"], acceptableAnswers: ["もたなくてもいいです"], distractors: ["持たないてもいいです", "持ってはいけません", "持たなければなりません"], explanationRu: "持つ→持たない→持たなくてもいいです.", variantGroup: "lesson-032:no-need", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-32-meaning-contrast", type: "multiple-choice", prompt: "Что означает テレビを見なくてもいいです?", targetItemIds: ["grammar-no-need-vs-prohibition", "word-terebi", "word-mimasu"], correctAnswers: ["Телевизор можно не смотреть"], distractors: ["Телевизор смотреть нельзя", "Телевизор нужно посмотреть", "Я не умею смотреть телевизор"], explanationRu: "～なくてもいいです снимает обязанность, но не запрещает действие.", variantGroup: "lesson-032:contrast", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-32-builder", type: "sentence-builder", prompt: "Собери: Нужно сделать домашнее задание.", targetItemIds: ["grammar-nakereba-narimasen", "grammar-nakereba-formation", "word-shukudai-25"], correctAnswers: ["宿題|を|しなければ|なりません"], distractors: ["しなくても", "しては", "あります"], explanationRu: "する→しない→しなければなりません.", variantGroup: "lesson-032:duty", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-32-input", type: "text-input", prompt: "Напиши по-японски: Сегодня можно не идти в школу.", targetItemIds: ["grammar-nakute-mo-ii", "word-kyou", "word-gakkou", "word-ikimasu"], correctAnswers: ["今日は学校へ行かなくてもいいです", "今日は学校へ行かなくてもいいです。"], acceptableAnswers: ["きょうはがっこうへいかなくてもいいです", "きょうはがっこうへいかなくてもいいです。"], explanationRu: "行く→行かない→行かなくてもいいです.", variantGroup: "lesson-032:no-need", difficulty: 3, confusionItemIds: confusions },
  { id: "exercise-32-listening", type: "listening", prompt: "Прослушай и выбери точное значение.", audioText: "宿題をしなければなりません。", targetItemIds: ["grammar-nakereba-narimasen", "word-shukudai-25"], correctAnswers: ["Нужно сделать домашнее задание."], distractors: ["Можно не делать домашнее задание.", "Нельзя делать домашнее задание.", "Я уже сделал домашнее задание."], explanationRu: "～なければなりません выражает обязанность.", variantGroup: "lesson-032:duty", difficulty: 2, confusionItemIds: confusions },
];

export const lesson032: Lesson = { id: "lesson-032", unitId: "unit-009", order: 32, title: "Нужно — можно не", description: "Обязанность через ～なければなりません, отсутствие необходимости через ～なくてもいい и отличие от запрета.", theory: lesson032Grammar.map((item) => item.explanationRu), itemIds: [...lesson032Vocabulary, ...lesson032Grammar, ...lesson032Sentences].map((item) => item.id), exerciseIds: lesson032Exercises.map((item) => item.id), estimatedMinutes: 21 };
export const lesson032Bundle: LessonBundle = { lesson: lesson032, vocabulary: lesson032Vocabulary, grammar: lesson032Grammar, sentences: lesson032Sentences, exercises: lesson032Exercises, outcomes: ["выражать обязанность", "строить ～なければなりません от ～ない-формы", "говорить, что действие не обязательно", "различать отсутствие необходимости и запрет"] };
