import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson027Vocabulary: VocabularyItem[] = [];

export const lesson027Grammar: GrammarPoint[] = [
  {
    id: "grammar-verb-mae-ni", type: "grammar", title: "До действия: словарная форма + 前に",
    meaningRu: "сообщает, что главное действие происходит до другого действия",
    explanationRu: "Перед 前に глагол ставится в словарную форму: 寝る前に、本を読みます — «Перед сном читаю книгу». Эта форма показывает действие-ориентир, которое ещё не произошло к моменту главного действия.",
    formation: ["[словарная форма] + 前に、[главное действие]", "寝る前に、本を読みます"],
    cautions: ["Даже если всё предложение относится к прошлому, перед 前に остаётся словарная форма: 昨日、寝る前に本を読んだ."],
    relatedGrammarIds: ["grammar-dictionary-form-role"], jlptLevel: "N5",
  },
  {
    id: "grammar-verb-ato-de", type: "grammar", title: "После действия: ～た + 後で",
    meaningRu: "сообщает, что главное действие происходит после завершения другого",
    explanationRu: "Перед 後で используется ～た-форма: 朝ご飯を食べた後で、学校へ行きます — «После того как позавтракаю, иду в школу». ～た здесь отмечает завершённость первого действия, а время всего сообщения задаёт главное сказуемое.",
    formation: ["[～た-форма] + 後で、[главное действие]", "食べた後で、行きます"],
    cautions: ["Форма 食べた перед 後で не означает, что всё предложение обязательно в прошлом: 行きます может описывать привычку или будущее."],
    relatedGrammarIds: ["grammar-ta-form-role", "grammar-masu-polite"], jlptLevel: "N5",
  },
  {
    id: "grammar-mae-ato-form-contrast", type: "grammar", title: "Почему 前に — словарная, а 後で — прошедшая",
    meaningRu: "выбирает форму по завершённости действия-ориентира",
    explanationRu: "Перед 前に ориентир ещё впереди, поэтому используется непрошедшая словарная форма: 行く前に. Перед 後で ориентир уже завершён, поэтому используется ～た: 行った後で. Это не согласование времени с русским переводом, а взгляд из точки главного действия.",
    formation: ["行く前に — до того как пойти", "行った後で — после того как сходил"],
    cautions: ["Не ставь 行った前に или 行く後で в базовой модели."],
    relatedGrammarIds: ["grammar-verb-mae-ni", "grammar-verb-ato-de"], jlptLevel: "N5",
  },
  {
    id: "grammar-ato-de-vs-te-kara", type: "grammar", title: "～た後で и ～てから",
    meaningRu: "различает нейтральное «после» и подчёркнутую последовательность",
    explanationRu: "Обе конструкции ставят второе действие после первого. ～てから сильнее выстраивает последовательность и делает завершение первого действия отправной точкой для второго. ～た後で нейтрально помещает второе действие позже. Ни одна конструкция сама по себе не требует, чтобы второе действие началось немедленно.",
    formation: ["食べてから、行きます", "食べた後で、行きます"],
    cautions: ["Не смешивай половины конструкций: 食べて後で и 食べたから в значении «после еды» неверны.", "Не добавляй значение «сразу» без дополнительного контекста."],
    relatedGrammarIds: ["grammar-verb-ato-de", "grammar-te-kara"], jlptLevel: "N5",
  },
];

export const lesson027Sentences: ExampleSentence[] = [
  { id: "sentence-27-neru-mae-hon", type: "sentence", japanese: "寝る前に、本を読みます。", reading: "ねるまえに、ほんをよみます。", translationRu: "Перед сном я читаю книгу.", grammarIds: ["grammar-verb-mae-ni", "grammar-dictionary-form-group2-irregular", "grammar-o-object"], vocabularyIds: ["word-nemasu", "word-hon", "word-yomimasu"] },
  { id: "sentence-27-gakkou-mae-asagohan", type: "sentence", japanese: "学校へ行く前に、朝ご飯を食べます。", reading: "がっこうへいくまえに、あさごはんをたべます。", translationRu: "Перед тем как идти в школу, я завтракаю.", grammarIds: ["grammar-verb-mae-ni", "grammar-dictionary-form-group1", "grammar-ni-e-destination", "grammar-o-object"], vocabularyIds: ["word-gakkou", "word-ikimasu", "word-asagohan-19", "word-tabemasu"] },
  { id: "sentence-27-asagohan-ato-gakkou", type: "sentence", japanese: "朝ご飯を食べた後で、学校へ行きます。", reading: "あさごはんをたべたあとで、がっこうへいきます。", translationRu: "После завтрака я иду в школу.", grammarIds: ["grammar-verb-ato-de", "grammar-ta-form-group2-irregular", "grammar-o-object", "grammar-ni-e-destination"], vocabularyIds: ["word-asagohan-19", "word-tabemasu", "word-gakkou", "word-ikimasu"] },
  { id: "sentence-27-kaetta-ato-terebi", type: "sentence", japanese: "家に帰った後で、テレビを見ます。", reading: "いえにかえったあとで、テレビをみます。", translationRu: "После возвращения домой я смотрю телевизор.", grammarIds: ["grammar-verb-ato-de", "grammar-ta-form-from-te", "grammar-ni-e-destination", "grammar-o-object"], vocabularyIds: ["word-ie", "word-kaerimasu", "word-terebi", "word-mimasu"] },
  { id: "sentence-27-kinou-neru-mae-yonda", type: "sentence", japanese: "昨日、寝る前に本を読んだ。", reading: "きのう、ねるまえにほんをよんだ。", translationRu: "Вчера перед сном я прочитал книгу.", grammarIds: ["grammar-verb-mae-ni", "grammar-ta-form-from-te", "grammar-time-without-ni", "grammar-o-object"], vocabularyIds: ["word-kinou", "word-nemasu", "word-hon", "word-yomimasu"] },
];

const confusions = ["grammar-verb-mae-ni", "grammar-verb-ato-de", "grammar-ato-de-vs-te-kara", "grammar-te-kara"];
export const lesson027Exercises: Exercise[] = [
  { id: "exercise-27-mae-form", type: "multiple-choice", prompt: "Выбери: __ 前に、本を読みます。", targetItemIds: ["grammar-verb-mae-ni", "word-nemasu", "word-hon", "word-yomimasu"], correctAnswers: ["寝る"], distractors: ["寝た", "寝て", "寝ます"], explanationRu: "Перед 前に используется словарная форма 寝る.", variantGroup: "lesson-027:before", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-27-ato-form", type: "multiple-choice", prompt: "Выбери: 朝ご飯を __ 後で、学校へ行きます。", targetItemIds: ["grammar-verb-ato-de", "word-asagohan-19", "word-tabemasu", "word-gakkou"], correctAnswers: ["食べた"], distractors: ["食べる", "食べて", "食べます"], explanationRu: "Перед 後で используется ～た-форма 食べた.", variantGroup: "lesson-027:after", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-27-past-mae", type: "multiple-choice", prompt: "Как правильно сказать «Вчера перед сном я прочитал книгу»?", targetItemIds: ["grammar-verb-mae-ni", "grammar-ta-form-from-te", "word-kinou", "word-nemasu", "word-hon", "word-yomimasu"], correctAnswers: ["昨日、寝る前に本を読んだ"], distractors: ["昨日、寝た前に本を読んだ", "昨日、寝て前に本を読む", "昨日、寝ます前に本を読んだ"], explanationRu: "Перед 前に остаётся 寝る, а главное действие принимает прошедшее 読んだ.", variantGroup: "lesson-027:contrast", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-27-builder", type: "sentence-builder", prompt: "Собери: После возвращения домой я смотрю телевизор.", targetItemIds: ["grammar-verb-ato-de", "word-ie", "word-kaerimasu", "word-terebi", "word-mimasu"], correctAnswers: ["家|に|帰った|後で|テレビ|を|見ます"], distractors: ["帰る", "前に", "見た"], explanationRu: "帰る → 帰った + 後で; главное действие остаётся 見ます.", variantGroup: "lesson-027:after", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-27-tekara-contrast", type: "multiple-choice", prompt: "Какая конструкция особенно подчёркивает переход к следующему действию после завершения первого?", targetItemIds: ["grammar-ato-de-vs-te-kara", "grammar-te-kara"], correctAnswers: ["～てから"], distractors: ["～る前に", "～ない", "～たい"], explanationRu: "～てから обычно сильнее подчёркивает последовательность; ～た後で нейтрально означает «после».", variantGroup: "lesson-027:contrast", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-27-input", type: "text-input", prompt: "Напиши по-японски: Перед тем как идти в школу, я завтракаю.", targetItemIds: ["grammar-verb-mae-ni", "word-gakkou", "word-ikimasu", "word-asagohan-19", "word-tabemasu"], correctAnswers: ["学校へ行く前に朝ご飯を食べます", "学校へ行く前に、朝ご飯を食べます", "学校に行く前に朝ご飯を食べます", "学校に行く前に、朝ご飯を食べます"], acceptableAnswers: ["がっこうへいくまえにあさごはんをたべます", "がっこうへいくまえに、あさごはんをたべます"], explanationRu: "行く — словарная форма перед 前に; 朝ご飯 — объект с を.", variantGroup: "lesson-027:before", difficulty: 3, confusionItemIds: ["grammar-verb-mae-ni", "grammar-verb-ato-de"] },
];

export const lesson027: Lesson = { id: "lesson-027", unitId: "unit-008", order: 27, title: "До и после действия", description: "Словарная форма + 前に, ～た + 後で и отличие от ～てから.", theory: lesson027Grammar.map((item) => item.explanationRu), itemIds: [...lesson027Vocabulary, ...lesson027Grammar, ...lesson027Sentences].map((item) => item.id), exerciseIds: lesson027Exercises.map((item) => item.id), estimatedMinutes: 20 };
export const lesson027Bundle: LessonBundle = { lesson: lesson027, vocabulary: lesson027Vocabulary, grammar: lesson027Grammar, sentences: lesson027Sentences, exercises: lesson027Exercises, outcomes: ["строить Vる前に", "строить Vた後で", "выбирать форму по завершённости", "различать ～た後で и ～てから"] };
