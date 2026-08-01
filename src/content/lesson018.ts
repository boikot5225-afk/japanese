import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson018Vocabulary: VocabularyItem[] = [
  { id: "word-doa-18", type: "vocabulary", writtenForm: "ドア", reading: "ドア", meaningsRu: ["дверь"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-mado-18", type: "vocabulary", writtenForm: "窓", reading: "まど", meaningsRu: ["окно"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-akemasu-18", type: "vocabulary", writtenForm: "開けます", reading: "あけます", meaningsRu: ["открывать"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
  { id: "word-shashin-18", type: "vocabulary", writtenForm: "写真", reading: "しゃしん", meaningsRu: ["фотография"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-torimasu-18", type: "vocabulary", writtenForm: "撮ります", reading: "とります", meaningsRu: ["фотографировать", "снимать"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
];

export const lesson018Grammar: GrammarPoint[] = [
  {
    id: "grammar-te-kudasai", type: "grammar", title: "Просьба ～てください",
    meaningRu: "вежливо просит выполнить действие",
    explanationRu: "После て-формы ставится ください: ドアを開けてください — «Откройте дверь, пожалуйста». Это обычная вежливая просьба; в зависимости от ситуации она всё равно может звучать достаточно прямо.",
    formation: ["[て-форма] + ください"], cautions: ["Не ставь ～ます перед ください: правильно 開けてください."], relatedGrammarIds: ["grammar-te-form-role"], jlptLevel: "N5",
  },
  {
    id: "grammar-te-mo-ii", type: "grammar", title: "Разрешение ～てもいいです",
    meaningRu: "сообщает, что действие разрешено",
    explanationRu: "て-форма + もいいです означает «можно сделать»: ここで写真を撮ってもいいです — «Здесь можно фотографировать».",
    formation: ["[て-форма] + もいいです"], cautions: ["Это разрешение, а не обязанность и не совет."], relatedGrammarIds: ["grammar-te-form-role"], jlptLevel: "N5",
  },
  {
    id: "grammar-te-mo-ii-ka", type: "grammar", title: "Вопрос о разрешении ～てもいいですか",
    meaningRu: "спрашивает, можно ли выполнить действие",
    explanationRu: "Чтобы попросить разрешение, к ～てもいいです добавляют か: 窓を開けてもいいですか — «Можно открыть окно?».",
    formation: ["[て-форма] + もいいですか"], cautions: ["Не путай с просьбой: 開けてください просит другого открыть, 開けてもいいですか спрашивает о своём действии."], relatedGrammarIds: ["grammar-te-mo-ii", "grammar-ka-question"], jlptLevel: "N5",
  },
  {
    id: "grammar-te-wa-ikemasen", type: "grammar", title: "Запрет ～てはいけません",
    meaningRu: "сообщает, что действие запрещено",
    explanationRu: "После て-формы ставится はいけません: 学校で写真を撮ってはいけません — «В школе нельзя фотографировать».",
    formation: ["[て-форма] + はいけません"], cautions: ["Это довольно прямой запрет. В живой речи возможны более мягкие формулировки."], relatedGrammarIds: ["grammar-te-mo-ii"], jlptLevel: "N5",
  },
];

export const lesson018Sentences: ExampleSentence[] = [
  { id: "sentence-18-doa-kudasai", type: "sentence", japanese: "ドアを開けてください。", reading: "ドアをあけてください。", translationRu: "Откройте дверь, пожалуйста.", grammarIds: ["grammar-te-kudasai", "grammar-te-form-group2-irregular", "grammar-o-object"], vocabularyIds: ["word-doa-18", "word-akemasu-18"] },
  { id: "sentence-18-photo-ii", type: "sentence", japanese: "ここで写真を撮ってもいいです。", reading: "ここでしゃしんをとってもいいです。", translationRu: "Здесь можно фотографировать.", grammarIds: ["grammar-te-mo-ii", "grammar-te-form-group1", "grammar-de-action-place", "grammar-o-object"], vocabularyIds: ["word-koko", "word-shashin-18", "word-torimasu-18"] },
  { id: "sentence-18-mado-question", type: "sentence", japanese: "窓を開けてもいいですか。", reading: "まどをあけてもいいですか。", translationRu: "Можно открыть окно?", grammarIds: ["grammar-te-mo-ii-ka", "grammar-te-form-group2-irregular", "grammar-o-object"], vocabularyIds: ["word-mado-18", "word-akemasu-18"] },
  { id: "sentence-18-school-photo", type: "sentence", japanese: "学校で写真を撮ってはいけません。", reading: "がっこうでしゃしんをとってはいけません。", translationRu: "В школе нельзя фотографировать.", grammarIds: ["grammar-te-wa-ikemasen", "grammar-te-form-group1", "grammar-de-action-place", "grammar-o-object"], vocabularyIds: ["word-gakkou", "word-shashin-18", "word-torimasu-18"] },
];

const confusions = ["grammar-te-kudasai", "grammar-te-mo-ii", "grammar-te-mo-ii-ka", "grammar-te-wa-ikemasen"];
export const lesson018Exercises: Exercise[] = [
  { id: "exercise-18-request-choice", type: "multiple-choice", prompt: "Как попросить: «Откройте дверь, пожалуйста»?", targetItemIds: ["grammar-te-kudasai", "word-doa-18", "word-akemasu-18"], correctAnswers: ["ドアを開けてください"], distractors: ["ドアを開けてもいいですか", "ドアを開けてはいけません", "ドアを開けますください"], explanationRu: "Просьба строится как 開けてください.", variantGroup: "lesson-018:functions", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-18-permission-choice", type: "multiple-choice", prompt: "Что означает 窓を開けてもいいですか?", targetItemIds: ["grammar-te-mo-ii-ka", "word-mado-18", "word-akemasu-18"], correctAnswers: ["Можно открыть окно?"], distractors: ["Откройте окно, пожалуйста.", "Окно нельзя открывать.", "Я уже открыл окно."], explanationRu: "～てもいいですか спрашивает разрешение.", variantGroup: "lesson-018:functions", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-18-prohibition-gap", type: "particle-gap", prompt: "Заполни пропуск: 写真を撮って __ いけません。", targetItemIds: ["grammar-te-wa-ikemasen", "word-shashin-18", "word-torimasu-18"], correctAnswers: ["は"], distractors: ["も", "を", "に"], explanationRu: "Запрет: ～てはいけません.", variantGroup: "lesson-018:functions", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-18-builder", type: "sentence-builder", prompt: "Собери: В школе нельзя фотографировать.", targetItemIds: ["grammar-te-wa-ikemasen", "grammar-de-action-place", "word-gakkou", "word-shashin-18", "word-torimasu-18"], correctAnswers: ["学校|で|写真|を|撮って|は|いけません"], distractors: ["も", "ください", "に"], explanationRu: "Место действия — で, запрет — 撮ってはいけません.", variantGroup: "lesson-018:prohibition", difficulty: 2, confusionItemIds: ["grammar-te-wa-ikemasen", "grammar-te-mo-ii"] },
  { id: "exercise-18-input", type: "text-input", prompt: "Напиши по-японски: Можно открыть окно?", targetItemIds: ["grammar-te-mo-ii-ka", "word-mado-18", "word-akemasu-18"], correctAnswers: ["窓を開けてもいいですか", "窓を開けてもいいですか。"], acceptableAnswers: ["まどをあけてもいいですか", "まどをあけてもいいですか。"], explanationRu: "開けます → 開けて + もいいですか.", variantGroup: "lesson-018:permission", difficulty: 3, confusionItemIds: ["grammar-te-mo-ii", "grammar-te-mo-ii-ka"] },
  { id: "exercise-18-listening", type: "listening", prompt: "Прослушай и выбери функцию фразы.", audioText: "ドアを開けてください。", targetItemIds: ["grammar-te-kudasai", "word-doa-18", "word-akemasu-18"], correctAnswers: ["Вежливая просьба открыть дверь"], distractors: ["Вопрос о разрешении открыть дверь", "Запрет открывать дверь", "Сообщение, что дверь открыта"], explanationRu: "～てください выражает просьбу.", variantGroup: "lesson-018:request", difficulty: 2, confusionItemIds: confusions },
];

export const lesson018: Lesson = { id: "lesson-018", unitId: "unit-006", order: 18, title: "Откройте, пожалуйста", description: "Просьбы, разрешение, вопрос о разрешении и прямой запрет.", theory: lesson018Grammar.map((item) => item.explanationRu), itemIds: [...lesson018Vocabulary, ...lesson018Grammar, ...lesson018Sentences].map((item) => item.id), exerciseIds: lesson018Exercises.map((item) => item.id), estimatedMinutes: 18 };
export const lesson018Bundle: LessonBundle = { lesson: lesson018, vocabulary: lesson018Vocabulary, grammar: lesson018Grammar, sentences: lesson018Sentences, exercises: lesson018Exercises, outcomes: ["просить через ～てください", "давать разрешение через ～てもいいです", "спрашивать разрешение", "понимать прямой запрет ～てはいけません"] };
