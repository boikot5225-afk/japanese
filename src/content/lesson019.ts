import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson019Vocabulary: VocabularyItem[] = [
  { id: "word-kao-19", type: "vocabulary", writtenForm: "顔", reading: "かお", meaningsRu: ["лицо"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-araimasu-19", type: "vocabulary", writtenForm: "洗います", reading: "あらいます", meaningsRu: ["мыть"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
  { id: "word-asagohan-19", type: "vocabulary", writtenForm: "朝ご飯", reading: "あさごはん", meaningsRu: ["завтрак"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-sorekara-19", type: "vocabulary", writtenForm: "それから", reading: "それから", meaningsRu: ["после этого", "затем"], partOfSpeech: ["союз", "наречие"], jlptLevel: "N5" },
];

export const lesson019Grammar: GrammarPoint[] = [
  {
    id: "grammar-te-action-chain", type: "grammar", title: "Цепочка действий ～て、～て",
    meaningRu: "перечисляет действия в естественном порядке",
    explanationRu: "Все действия, кроме последнего, ставятся в て-форму: 起きて、顔を洗って、朝ご飯を食べます. Последний глагол задаёт время и вежливость всей цепочки.",
    formation: ["V1て、V2て、V3ます"], cautions: ["Цепочка обычно описывает один связный эпизод, а не случайный список несвязанных фактов."], relatedGrammarIds: ["grammar-te-form-role"], jlptLevel: "N5",
  },
  {
    id: "grammar-te-kara", type: "grammar", title: "После действия: ～てから",
    meaningRu: "подчёркивает, что второе действие начинается после завершения первого",
    explanationRu: "К て-форме добавляется から: 朝ご飯を食べてから、学校へ行きます — «Позавтракав, иду в школу». В отличие от простой цепочки, ～てから явно подчёркивает порядок.",
    formation: ["V1てから、V2ます"], cautions: ["Перед から нужна именно て-форма: 食べてから, а не 食べますから в значении последовательности."], relatedGrammarIds: ["grammar-te-action-chain", "grammar-kara-made-time"], jlptLevel: "N5",
  },
  {
    id: "grammar-sorekara-sequence", type: "grammar", title: "Отдельное «затем»: それから",
    meaningRu: "связывает два самостоятельных предложения по порядку",
    explanationRu: "それから можно поставить между законченными предложениями: 新聞を読みます。それから、テレビを見ます. Это удобнее, когда действия оформлены как отдельные сообщения.",
    formation: ["Предложение。 それから、предложение。"], cautions: ["それから не требует て-формы у предыдущего глагола."], relatedGrammarIds: ["grammar-te-action-chain", "grammar-te-kara"], jlptLevel: "N5",
  },
];

export const lesson019Sentences: ExampleSentence[] = [
  { id: "sentence-19-morning-chain", type: "sentence", japanese: "毎朝、起きて、顔を洗って、朝ご飯を食べます。", reading: "まいあさ、おきて、かおをあらって、あさごはんをたべます。", translationRu: "Каждое утро я встаю, умываюсь и завтракаю.", grammarIds: ["grammar-te-action-chain", "grammar-te-form-group1", "grammar-te-form-group2-irregular", "grammar-o-object"], vocabularyIds: ["word-maiasa", "word-okimasu", "word-kao-19", "word-araimasu-19", "word-asagohan-19", "word-tabemasu"] },
  { id: "sentence-19-breakfast-school", type: "sentence", japanese: "朝ご飯を食べてから、学校へ行きます。", reading: "あさごはんをたべてから、がっこうへいきます。", translationRu: "После завтрака я иду в школу.", grammarIds: ["grammar-te-kara", "grammar-te-form-group2-irregular", "grammar-o-object", "grammar-ni-e-destination"], vocabularyIds: ["word-asagohan-19", "word-tabemasu", "word-gakkou", "word-ikimasu"] },
  { id: "sentence-19-home-study", type: "sentence", japanese: "家に帰ってから、日本語を勉強します。", reading: "いえにかえってから、にほんごをべんきょうします。", translationRu: "После возвращения домой я занимаюсь японским.", grammarIds: ["grammar-te-kara", "grammar-te-form-group1", "grammar-ni-e-destination", "grammar-o-object"], vocabularyIds: ["word-ie", "word-kaerimasu", "word-nihongo", "word-benkyoushimasu"] },
  { id: "sentence-19-sorekara-tv", type: "sentence", japanese: "新聞を読みます。それから、テレビを見ます。", reading: "しんぶんをよみます。それから、テレビをみます。", translationRu: "Я читаю газету. Затем смотрю телевизор.", grammarIds: ["grammar-sorekara-sequence", "grammar-o-object", "grammar-masu-polite"], vocabularyIds: ["word-shinbun", "word-yomimasu", "word-sorekara-19", "word-terebi", "word-mimasu"] },
];

const confusions = ["grammar-te-action-chain", "grammar-te-kara", "grammar-sorekara-sequence"];
export const lesson019Exercises: Exercise[] = [
  { id: "exercise-19-chain-choice", type: "multiple-choice", prompt: "Как правильно соединить «встать, умыться, позавтракать»?", targetItemIds: ["grammar-te-action-chain", "word-okimasu", "word-araimasu-19", "word-tabemasu"], correctAnswers: ["起きて、顔を洗って、朝ご飯を食べます"], distractors: ["起きます、顔を洗います、朝ご飯を食べて", "起きてから、顔を洗いますから、食べます", "起きて、顔を洗います、朝ご飯を食べて"], explanationRu: "Все промежуточные действия стоят в て-форме, последнее — в ～ます.", variantGroup: "lesson-019:order", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-19-tekara-meaning", type: "multiple-choice", prompt: "Что подчёркивает ～てから?", targetItemIds: ["grammar-te-kara"], correctAnswers: ["Второе действие начинается после завершения первого"], distractors: ["Два действия происходят одновременно", "Первое действие запрещено", "Второе действие является просьбой"], explanationRu: "～てから явно задаёт последовательность.", variantGroup: "lesson-019:order", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-19-breakfast-builder", type: "sentence-builder", prompt: "Собери: После завтрака я иду в школу.", targetItemIds: ["grammar-te-kara", "word-asagohan-19", "word-tabemasu", "word-gakkou", "word-ikimasu"], correctAnswers: ["朝ご飯|を|食べて|から|学校|へ|行きます"], distractors: ["食べます", "まで", "で"], explanationRu: "食べます → 食べてから.", variantGroup: "lesson-019:tekara", difficulty: 2, confusionItemIds: ["grammar-te-kara", "grammar-kara-made-time"] },
  { id: "exercise-19-home-input", type: "text-input", prompt: "Напиши по-японски: После возвращения домой я занимаюсь японским.", targetItemIds: ["grammar-te-kara", "word-ie", "word-kaerimasu", "word-nihongo", "word-benkyoushimasu"], correctAnswers: ["家に帰ってから日本語を勉強します", "家に帰ってから、日本語を勉強します"], acceptableAnswers: ["いえにかえってからにほんごをべんきょうします", "いえにかえってから、にほんごをべんきょうします"], explanationRu: "帰ります → 帰ってから.", variantGroup: "lesson-019:tekara", difficulty: 3, confusionItemIds: ["grammar-te-kara", "grammar-te-action-chain"] },
  { id: "exercise-19-sorekara-choice", type: "multiple-choice", prompt: "Выбери вариант с двумя самостоятельными предложениями и «затем».", targetItemIds: ["grammar-sorekara-sequence", "word-sorekara-19"], correctAnswers: ["新聞を読みます。それから、テレビを見ます"], distractors: ["新聞を読んでからそれからテレビを見て", "新聞をそれから読みますテレビを見ます", "新聞を読みますからテレビを見ます"], explanationRu: "それから связывает законченные предложения.", variantGroup: "lesson-019:discourse", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-19-listening", type: "listening", prompt: "Прослушай и выбери правильный порядок.", audioText: "毎朝、起きて、顔を洗って、朝ご飯を食べます。", targetItemIds: ["grammar-te-action-chain", "word-okimasu", "word-kao-19", "word-araimasu-19", "word-asagohan-19", "word-tabemasu"], correctAnswers: ["Сначала встать, затем умыться и позавтракать"], distractors: ["Сначала позавтракать, затем лечь спать", "Умываться во время завтрака", "После школы читать газету"], explanationRu: "Порядок совпадает с порядком глаголов в цепочке.", variantGroup: "lesson-019:order", difficulty: 2, confusionItemIds: confusions },
];

export const lesson019: Lesson = { id: "lesson-019", unitId: "unit-006", order: 19, title: "Сначала сделал — потом пошёл", description: "Цепочка действий, явный порядок с ～てから и отдельное それから.", theory: lesson019Grammar.map((item) => item.explanationRu), itemIds: [...lesson019Vocabulary, ...lesson019Grammar, ...lesson019Sentences].map((item) => item.id), exerciseIds: lesson019Exercises.map((item) => item.id), estimatedMinutes: 17 };
export const lesson019Bundle: LessonBundle = { lesson: lesson019, vocabulary: lesson019Vocabulary, grammar: lesson019Grammar, sentences: lesson019Sentences, exercises: lesson019Exercises, outcomes: ["строить цепочку действий", "подчёркивать порядок через ～てから", "использовать それから между предложениями", "сохранять вежливость в последнем сказуемом"] };
