import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson029Vocabulary: VocabularyItem[] = [];

export const lesson029Grammar: GrammarPoint[] = [
  {
    id: "grammar-ta-koto-ga-arimasu-experience", type: "grammar", title: "Опыт ～たことがあります",
    meaningRu: "сообщает, что действие хотя бы раз происходило в прошлом",
    explanationRu: "Поставь глагол в простую прошедшую форму ～た и добавь ことがあります: 漢字を書いたことがあります — «Мне доводилось писать кандзи». Конструкция говорит о жизненном опыте, а не о конкретном событии в названный момент.",
    formation: ["[глагол в ～た-форме] + ことがあります", "書いたことがあります", "食べたことがあります"],
    cautions: ["Для опыта нужна ～た-форма: 読むことがあります не является этой конструкцией и может означать «иногда читаю»."],
    relatedGrammarIds: ["grammar-ta-form-role", "grammar-koto-ga-dekimasu"], jlptLevel: "N5",
  },
  {
    id: "grammar-ta-koto-ga-arimasen", type: "grammar", title: "Отсутствие опыта ～たことがありません",
    meaningRu: "сообщает, что действие ни разу не происходило",
    explanationRu: "Отрицание ставится в あります: 日本料理を食べたことがありません — «Я никогда не ел японскую кухню». Глагол перед こと остаётся в ～た-форме.",
    formation: ["[глагол в ～た-форме] + ことがありません"],
    cautions: ["Не ставь отрицание в самом действии: 食べなかったことがあります означает «бывали случаи, когда я не ел», а не «никогда не ел»."],
    relatedGrammarIds: ["grammar-ta-koto-ga-arimasu-experience", "grammar-nakatta-role"], jlptLevel: "N5",
  },
  {
    id: "grammar-ta-koto-ga-arimasu-ka", type: "grammar", title: "Вопрос об опыте",
    meaningRu: "спрашивает, случалось ли собеседнику выполнять действие",
    explanationRu: "К вежливой конструкции добавляется か: 漢字を書いたことがありますか — «Вы когда-нибудь писали кандзи?». Краткий ответ: はい、あります или いいえ、ありません.",
    formation: ["[глагол в ～た-форме] + ことがありますか", "はい、あります", "いいえ、ありません"],
    cautions: ["В кратком ответе не нужно повторять всё действие, если оно понятно из вопроса."],
    relatedGrammarIds: ["grammar-ta-koto-ga-arimasu-experience", "grammar-ka-question"], jlptLevel: "N5",
  },
  {
    id: "grammar-experience-vs-specific-past", type: "grammar", title: "Опыт и конкретное прошлое",
    meaningRu: "различает «делал когда-то» и «сделал тогда»",
    explanationRu: "昨晩、宿題をしました сообщает о конкретном вчерашнем действии. 宿題をしたことがあります сообщает, что такой опыт вообще был. Точное время вроде 昨晩 обычно сочетается с обычным прошедшим, а не с конструкцией жизненного опыта.",
    formation: ["昨晩、宿題をしました — конкретное событие", "宿題をしたことがあります — опыт"],
    cautions: ["Не добавляй 昨晩 к ～たことがあります, когда хочешь рассказать об одном конкретном вчерашнем событии."],
    relatedGrammarIds: ["grammar-ta-koto-ga-arimasu-experience", "grammar-masu-past", "grammar-plain-past-sentence"], jlptLevel: "N5",
  },
];

export const lesson029Sentences: ExampleSentence[] = [
  { id: "sentence-29-kanji-kaita-experience", type: "sentence", japanese: "漢字を書いたことがあります。", reading: "かんじをかいたことがあります。", translationRu: "Мне доводилось писать кандзи.", grammarIds: ["grammar-ta-koto-ga-arimasu-experience", "grammar-ta-form-from-te", "grammar-o-object"], vocabularyIds: ["word-kanji-24", "word-kakimasu-17"] },
  { id: "sentence-29-shinbun-yonda-experience", type: "sentence", japanese: "日本語の新聞を読んだことがあります。", reading: "にほんごのしんぶんをよんだことがあります。", translationRu: "Мне доводилось читать газету на японском языке.", grammarIds: ["grammar-ta-koto-ga-arimasu-experience", "grammar-ta-form-from-te", "grammar-no-link", "grammar-o-object"], vocabularyIds: ["word-nihongo", "word-shinbun", "word-yomimasu"] },
  { id: "sentence-29-ryouri-tabeta-question", type: "sentence", japanese: "日本料理を食べたことがありますか。", reading: "にほんりょうりをたべたことがありますか。", translationRu: "Вы когда-нибудь ели японскую кухню?", grammarIds: ["grammar-ta-koto-ga-arimasu-ka", "grammar-ta-form-group2-irregular", "grammar-ka-question", "grammar-o-object"], vocabularyIds: ["word-ryouri", "word-tabemasu"] },
  { id: "sentence-29-ryouri-tabeta-negative", type: "sentence", japanese: "日本料理を食べたことがありません。", reading: "にほんりょうりをたべたことがありません。", translationRu: "Я никогда не ел японскую кухню.", grammarIds: ["grammar-ta-koto-ga-arimasen", "grammar-ta-form-group2-irregular", "grammar-o-object"], vocabularyIds: ["word-ryouri", "word-tabemasu"] },
  { id: "sentence-29-specific-past", type: "sentence", japanese: "昨晩、宿題をしました。", reading: "さくばん、しゅくだいをしました。", translationRu: "Вчера вечером я сделал домашнее задание.", grammarIds: ["grammar-experience-vs-specific-past", "grammar-masu-past", "grammar-time-without-ni", "grammar-o-object"], vocabularyIds: ["word-sakuban-25", "word-shukudai-25"] },
];

const confusions = ["grammar-ta-koto-ga-arimasu-experience", "grammar-ta-koto-ga-arimasen", "grammar-experience-vs-specific-past", "grammar-koto-ga-dekimasu", "grammar-masu-past"];
export const lesson029Exercises: Exercise[] = [
  { id: "exercise-29-experience-form", type: "multiple-choice", prompt: "Выбери: «Мне доводилось писать кандзи».", targetItemIds: ["grammar-ta-koto-ga-arimasu-experience", "word-kanji-24", "word-kakimasu-17"], correctAnswers: ["漢字を書いたことがあります"], distractors: ["漢字を書くことがあります", "漢字を書いてことがあります", "漢字を書きますことがあります"], explanationRu: "Для опыта используется ～た-форма: 書いたことがあります.", variantGroup: "lesson-029:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-29-negative-experience", type: "multiple-choice", prompt: "Как сказать «Я никогда не ел японскую кухню»?", targetItemIds: ["grammar-ta-koto-ga-arimasen", "word-ryouri", "word-tabemasu"], correctAnswers: ["日本料理を食べたことがありません"], distractors: ["日本料理を食べなかったことがあります", "日本料理を食べることがありません", "日本料理を食べたことができません"], explanationRu: "Отсутствие опыта выражает ことがありません; действие остаётся 食べた.", variantGroup: "lesson-029:negative", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-29-question-builder", type: "sentence-builder", prompt: "Собери: Вы когда-нибудь ели японскую кухню?", targetItemIds: ["grammar-ta-koto-ga-arimasu-ka", "word-ryouri", "word-tabemasu"], correctAnswers: ["日本料理|を|食べた|こと|が|あります|か"], distractors: ["食べる", "できます", "でした"], explanationRu: "食べる → 食べた + ことがありますか.", variantGroup: "lesson-029:question", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-29-past-contrast", type: "multiple-choice", prompt: "Ты рассказываешь об одном конкретном действии вчера вечером. Какой вариант точнее?", targetItemIds: ["grammar-experience-vs-specific-past", "word-sakuban-25", "word-shukudai-25"], correctAnswers: ["昨晩、宿題をしました"], distractors: ["昨晩、宿題をしたことがあります", "宿題をすることがあります", "宿題をすることができます"], explanationRu: "Конкретное действие вчера вечером выражается обычным прошедшим しました; ～たことがあります сообщает об опыте вообще.", variantGroup: "lesson-029:contrast", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-29-input", type: "text-input", prompt: "Напиши по-японски: Мне доводилось читать газету на японском языке.", targetItemIds: ["grammar-ta-koto-ga-arimasu-experience", "word-nihongo", "word-shinbun", "word-yomimasu"], correctAnswers: ["日本語の新聞を読んだことがあります", "日本語の新聞を読んだことがあります。"], acceptableAnswers: ["にほんごのしんぶんをよんだことがあります", "にほんごのしんぶんをよんだことがあります。"], explanationRu: "読んだ + ことがあります сообщает об опыте.", variantGroup: "lesson-029:experience", difficulty: 3, confusionItemIds: confusions },
  { id: "exercise-29-listening", type: "listening", prompt: "Прослушай и выбери точное значение.", audioText: "漢字を書いたことがあります。", targetItemIds: ["grammar-ta-koto-ga-arimasu-experience", "word-kanji-24", "word-kakimasu-17"], correctAnswers: ["Мне доводилось писать кандзи."], distractors: ["Я могу писать кандзи.", "Я написал кандзи вчера.", "Я никогда не писал кандзи."], explanationRu: "～たことがあります описывает накопленный опыт.", variantGroup: "lesson-029:experience", difficulty: 2, confusionItemIds: confusions },
];

export const lesson029: Lesson = { id: "lesson-029", unitId: "unit-009", order: 29, title: "Мне доводилось", description: "Жизненный опыт через ～たことがあります, отрицание, вопрос и отличие от конкретного прошлого.", theory: lesson029Grammar.map((item) => item.explanationRu), itemIds: [...lesson029Vocabulary, ...lesson029Grammar, ...lesson029Sentences].map((item) => item.id), exerciseIds: lesson029Exercises.map((item) => item.id), estimatedMinutes: 20 };
export const lesson029Bundle: LessonBundle = { lesson: lesson029, vocabulary: lesson029Vocabulary, grammar: lesson029Grammar, sentences: lesson029Sentences, exercises: lesson029Exercises, outcomes: ["сообщать о прошлом опыте", "говорить об отсутствии опыта", "задавать вопрос ～たことがありますか", "различать жизненный опыт и конкретное прошлое"] };
