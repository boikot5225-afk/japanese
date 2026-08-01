import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson017Vocabulary: VocabularyItem[] = [
  { id: "word-kakimasu-17", type: "vocabulary", writtenForm: "書きます", reading: "かきます", meaningsRu: ["писать"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
  { id: "word-hanashimasu-17", type: "vocabulary", writtenForm: "話します", reading: "はなします", meaningsRu: ["говорить", "разговаривать"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
  { id: "word-machimasu-17", type: "vocabulary", writtenForm: "待ちます", reading: "まちます", meaningsRu: ["ждать"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
  { id: "word-tomodachi-17", type: "vocabulary", writtenForm: "友達", reading: "ともだち", meaningsRu: ["друг", "подруга"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
];

export const lesson017Grammar: GrammarPoint[] = [
  {
    id: "grammar-te-form-role", type: "grammar", title: "Роль て-формы",
    meaningRu: "соединяет глагол со следующей частью конструкции",
    explanationRu: "て-форма сама не задаёт время и вежливость. Она соединяет действия и служит основой для просьб, разрешений и ～ています. Вежливость обычно выражает последнее сказуемое: 読んで、寝ます.",
    formation: ["[глагол в て-форме] + следующая часть", "食べて、飲みます"],
    cautions: ["Не переводи て механически отдельным словом «и»: значение задаёт вся конструкция."],
    relatedGrammarIds: ["grammar-masu-polite"], jlptLevel: "N5",
  },
  {
    id: "grammar-te-form-group1", type: "grammar", title: "Первая группа из знакомой ～ます-формы",
    meaningRu: "меняет слог перед ～ます по устойчивым моделям",
    explanationRu: "Сначала убери ～ます и посмотри на последний слог основы: い／ち／り → って; み／び／に → んで; き → いて; ぎ → いで; し → して. Поэтому 待ちます → 待って, 読みます → 読んで, 書きます → 書いて, 話します → 話して.",
    formation: ["い・ち・り → って", "み・び・に → んで", "き → いて", "ぎ → いで", "し → して"],
    cautions: ["行きます — исключение: 行って, а не 行いて."], relatedGrammarIds: ["grammar-te-form-role", "grammar-masu-polite"], jlptLevel: "N5",
  },
  {
    id: "grammar-te-form-group2-irregular", type: "grammar", title: "Вторая группа и исключения",
    meaningRu: "образует ～て напрямую, а します／来ます имеют особые формы",
    explanationRu: "У уже изученных глаголов второй группы ～ます заменяется на ～て: 食べます → 食べて, 見ます → 見て. Неправильные формы: します → して, 来ます → 来て（きて）. Отдельно запомни 行きます → 行って.",
    formation: ["食べます → 食べて", "見ます → 見て", "します → して", "来ます → 来て", "行きます → 行って"],
    cautions: ["По внешнему виду ～ます-формы группу не всегда угадаешь: 帰ります относится к первой группе и образует 帰って."], relatedGrammarIds: ["grammar-te-form-group1"], jlptLevel: "N5",
  },
];

export const lesson017Sentences: ExampleSentence[] = [
  { id: "sentence-17-pan-mizu", type: "sentence", japanese: "毎朝、パンを食べて、水を飲みます。", reading: "まいあさ、パンをたべて、みずをのみます。", translationRu: "Каждое утро я ем хлеб и пью воду.", grammarIds: ["grammar-te-form-role", "grammar-te-form-group2-irregular", "grammar-o-object", "grammar-time-without-ni"], vocabularyIds: ["word-maiasa", "word-pan", "word-mizu", "word-tabemasu", "word-nomimasu"] },
  { id: "sentence-17-shinbun-gakkou", type: "sentence", japanese: "新聞を読んで、学校へ行きます。", reading: "しんぶんをよんで、がっこうへいきます。", translationRu: "Я читаю газету, а потом иду в школу.", grammarIds: ["grammar-te-form-role", "grammar-te-form-group1", "grammar-o-object", "grammar-ni-e-destination"], vocabularyIds: ["word-shinbun", "word-yomimasu", "word-gakkou", "word-ikimasu"] },
  { id: "sentence-17-kaette-terebi", type: "sentence", japanese: "家に帰って、テレビを見ます。", reading: "いえにかえって、テレビをみます。", translationRu: "Я возвращаюсь домой и смотрю телевизор.", grammarIds: ["grammar-te-form-role", "grammar-te-form-group1", "grammar-ni-e-destination", "grammar-o-object"], vocabularyIds: ["word-ie", "word-kaerimasu", "word-terebi", "word-mimasu"] },
  { id: "sentence-17-eki-tomodachi", type: "sentence", japanese: "駅へ行って、友達を待ちます。", reading: "えきへいって、ともだちをまちます。", translationRu: "Я иду на станцию и жду друга.", grammarIds: ["grammar-te-form-role", "grammar-te-form-group2-irregular", "grammar-ni-e-destination", "grammar-o-object"], vocabularyIds: ["word-eki", "word-ikimasu", "word-tomodachi-17", "word-machimasu-17"] },
];

const confusions = ["grammar-te-form-group1", "grammar-te-form-group2-irregular"];
export const lesson017Exercises: Exercise[] = [
  { id: "exercise-17-yomu", type: "multiple-choice", prompt: "Выбери て-форму 読みます.", targetItemIds: ["grammar-te-form-group1", "word-yomimasu"], correctAnswers: ["読んで"], distractors: ["読みて", "読って", "読いて"], explanationRu: "Основа заканчивается на み: み → んで.", variantGroup: "lesson-017:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-17-kaku", type: "conjugation", prompt: "Поставь 書きます в て-форму.", targetItemIds: ["grammar-te-form-group1", "word-kakimasu-17"], correctAnswers: ["書いて"], acceptableAnswers: ["かいて"], distractors: ["書って", "書んで", "書きて"], explanationRu: "Основа заканчивается на き: き → いて.", variantGroup: "lesson-017:formation", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-17-taberu", type: "conjugation", prompt: "Поставь 食べます в て-форму.", targetItemIds: ["grammar-te-form-group2-irregular", "word-tabemasu"], correctAnswers: ["食べて"], acceptableAnswers: ["たべて"], distractors: ["食べって", "食べんで", "食べして"], explanationRu: "У второй группы ～ます заменяется на ～て.", variantGroup: "lesson-017:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-17-iku", type: "multiple-choice", prompt: "Какая форма правильна для 行きます?", targetItemIds: ["grammar-te-form-group2-irregular", "word-ikimasu"], correctAnswers: ["行って"], distractors: ["行いて", "行きて", "行んで"], explanationRu: "行きます — исключение.", variantGroup: "lesson-017:formation", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-17-builder", type: "sentence-builder", prompt: "Собери: Я читаю газету, а потом иду в школу.", targetItemIds: ["grammar-te-form-role", "grammar-te-form-group1", "word-shinbun", "word-yomimasu", "word-gakkou", "word-ikimasu"], correctAnswers: ["新聞|を|読んで|学校|へ|行きます"], distractors: ["読みます", "行って", "で"], explanationRu: "Первое действие — 読んで, последнее — 行きます.", variantGroup: "lesson-017:sequence", difficulty: 2, confusionItemIds: ["grammar-te-form-role", "grammar-masu-polite"] },
  { id: "exercise-17-input", type: "text-input", prompt: "Напиши по-японски: Я возвращаюсь домой и смотрю телевизор.", targetItemIds: ["grammar-te-form-role", "grammar-te-form-group1", "word-ie", "word-kaerimasu", "word-terebi", "word-mimasu"], correctAnswers: ["家に帰ってテレビを見ます", "家に帰って、テレビを見ます"], acceptableAnswers: ["いえにかえってテレビをみます", "いえにかえって、テレビをみます"], explanationRu: "帰ります → 帰って.", variantGroup: "lesson-017:sequence", difficulty: 3, confusionItemIds: ["grammar-te-form-role", "grammar-te-form-group1"] },
];

export const lesson017: Lesson = { id: "lesson-017", unitId: "unit-006", order: 17, title: "Прочитал и пошёл", description: "Образование て-формы и соединение двух действий.", theory: lesson017Grammar.map((item) => item.explanationRu), itemIds: [...lesson017Vocabulary, ...lesson017Grammar, ...lesson017Sentences].map((item) => item.id), exerciseIds: lesson017Exercises.map((item) => item.id), estimatedMinutes: 17 };
export const lesson017Bundle: LessonBundle = { lesson: lesson017, vocabulary: lesson017Vocabulary, grammar: lesson017Grammar, sentences: lesson017Sentences, exercises: lesson017Exercises, outcomes: ["понимать роль て-формы", "образовывать модели первой группы из знакомой ～ます-формы", "образовывать вторую группу и исключения", "соединять два действия"] };
