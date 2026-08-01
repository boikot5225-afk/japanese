import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson024Vocabulary: VocabularyItem[] = [
  { id: "word-kanji-24", type: "vocabulary", writtenForm: "漢字", reading: "かんじ", meaningsRu: ["кандзи", "китайские иероглифы в японском"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-oyogimasu-24", type: "vocabulary", writtenForm: "泳ぎます", reading: "およぎます", meaningsRu: ["плавать"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
  { id: "word-gitaa-24", type: "vocabulary", writtenForm: "ギター", reading: "ギター", meaningsRu: ["гитара"], partOfSpeech: ["существительное"], jlptLevel: "N5" },
  { id: "word-hikimasu-24", type: "vocabulary", writtenForm: "弾きます", reading: "ひきます", meaningsRu: ["играть на струнном или клавишном инструменте"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
];

export const lesson024Grammar: GrammarPoint[] = [
  {
    id: "grammar-koto-ga-dekimasu", type: "grammar", title: "Умение и возможность ～ことができます",
    meaningRu: "сообщает, что человек может выполнить действие",
    explanationRu: "Поставь глагол в словарную форму, добавь ことができます: 漢字を読むことができます — «Могу читать кандзи». こと превращает действие в абстрактное «делание этого», а できます сообщает о возможности.",
    formation: ["[словарная форма] + ことができます", "読むことができます", "食べることができます"],
    cautions: ["Перед こと нужна словарная форма: 読むことができます, не 読みますことができます."],
    relatedGrammarIds: ["grammar-dictionary-form-role", "grammar-ga-existence"], jlptLevel: "N5",
  },
  {
    id: "grammar-koto-ga-dekimasen", type: "grammar", title: "Невозможность ～ことができません",
    meaningRu: "сообщает, что действие невозможно или человек не умеет его выполнять",
    explanationRu: "Отрицание находится в できます: 泳ぐことができません — «Не умею плавать / не могу плавать». Сам глагол перед こと остаётся в словарной форме.",
    formation: ["[словарная форма] + ことができません"],
    cautions: ["Не заменяй словарную форму на ～ない: 泳がないことができます означало бы уже другую идею — возможность не плавать."],
    relatedGrammarIds: ["grammar-koto-ga-dekimasu", "grammar-nai-form-role"], jlptLevel: "N5",
  },
  {
    id: "grammar-koto-ga-dekimasu-ka", type: "grammar", title: "Вопрос о возможности",
    meaningRu: "спрашивает, может ли собеседник выполнить действие",
    explanationRu: "Добавь か к вежливой конструкции: ギターを弾くことができますか — «Вы умеете играть на гитаре?». Ответ можно дать полной формой できます／できません.",
    formation: ["[словарная форма] + ことができますか"],
    cautions: ["В вопросе не меняется порядок слов; か ставится в конце."],
    relatedGrammarIds: ["grammar-koto-ga-dekimasu", "grammar-ka-question"], jlptLevel: "N5",
  },
  {
    id: "grammar-dekiru-vs-jouzu", type: "grammar", title: "Мочь — не значит делать хорошо",
    meaningRu: "различает наличие способности и уровень мастерства",
    explanationRu: "～ことができます сообщает, что действие в принципе возможно: 料理をすることができます — «Я умею готовить». 料理が上手です оценивает качество: «Я хорошо готовлю». Можно уметь что-то делать, но делать это не очень хорошо.",
    formation: ["料理をすることができます", "料理が上手です"],
    cautions: ["Не переводи 上手です просто как нейтральное «могу»: это положительная оценка навыка."],
    relatedGrammarIds: ["grammar-koto-ga-dekimasu", "grammar-jouzu-heta-ga"], jlptLevel: "N5",
  },
];

export const lesson024Sentences: ExampleSentence[] = [
  { id: "sentence-24-kanji-yomu-dekiru", type: "sentence", japanese: "漢字を読むことができます。", reading: "かんじをよむことができます。", translationRu: "Я могу читать кандзи.", grammarIds: ["grammar-koto-ga-dekimasu", "grammar-dictionary-form-group1", "grammar-o-object"], vocabularyIds: ["word-kanji-24", "word-yomimasu"] },
  { id: "sentence-24-nihongo-hanasu-dekiru", type: "sentence", japanese: "日本語を話すことができます。", reading: "にほんごをはなすことができます。", translationRu: "Я могу говорить по-японски.", grammarIds: ["grammar-koto-ga-dekimasu", "grammar-dictionary-form-group1", "grammar-o-object"], vocabularyIds: ["word-nihongo", "word-hanashimasu-17"] },
  { id: "sentence-24-oyogu-dekimasen", type: "sentence", japanese: "泳ぐことができません。", reading: "およぐことができません。", translationRu: "Я не умею плавать.", grammarIds: ["grammar-koto-ga-dekimasen", "grammar-dictionary-form-group1"], vocabularyIds: ["word-oyogimasu-24"] },
  { id: "sentence-24-gitaa-hiku-question", type: "sentence", japanese: "ギターを弾くことができますか。", reading: "ギターをひくことができますか。", translationRu: "Вы умеете играть на гитаре?", grammarIds: ["grammar-koto-ga-dekimasu-ka", "grammar-dictionary-form-group1", "grammar-ka-question", "grammar-o-object"], vocabularyIds: ["word-gitaa-24", "word-hikimasu-24"] },
  { id: "sentence-24-ryouri-suru-dekiru", type: "sentence", japanese: "料理をすることができます。", reading: "りょうりをすることができます。", translationRu: "Я умею готовить.", grammarIds: ["grammar-koto-ga-dekimasu", "grammar-dekiru-vs-jouzu", "grammar-dictionary-form-group2-irregular", "grammar-o-object"], vocabularyIds: ["word-ryouri"] },
];

const confusions = ["grammar-koto-ga-dekimasu", "grammar-koto-ga-dekimasen", "grammar-dekiru-vs-jouzu", "grammar-jouzu-heta-ga"];
export const lesson024Exercises: Exercise[] = [
  { id: "exercise-24-yomu-form", type: "multiple-choice", prompt: "Выбери правильную конструкцию «могу читать кандзи».", targetItemIds: ["grammar-koto-ga-dekimasu", "word-kanji-24", "word-yomimasu"], correctAnswers: ["漢字を読むことができます"], distractors: ["漢字を読みますことができます", "漢字を読んでことができます", "漢字を読まないことができます"], explanationRu: "Перед こと используется словарная форма 読む.", variantGroup: "lesson-024:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-24-oyogu-negative", type: "multiple-choice", prompt: "Как сказать «не умею плавать»?", targetItemIds: ["grammar-koto-ga-dekimasen", "word-oyogimasu-24"], correctAnswers: ["泳ぐことができません"], distractors: ["泳がないことができます", "泳ぎますことができません", "泳いでことができません"], explanationRu: "Глагол остаётся 泳ぐ, отрицание ставится в できません.", variantGroup: "lesson-024:negative", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-24-question", type: "sentence-builder", prompt: "Собери: Вы умеете играть на гитаре?", targetItemIds: ["grammar-koto-ga-dekimasu-ka", "word-gitaa-24", "word-hikimasu-24"], correctAnswers: ["ギター|を|弾く|こと|が|できます|か"], distractors: ["弾きます", "で", "たい"], explanationRu: "弾きます → 弾く + ことができますか.", variantGroup: "lesson-024:question", difficulty: 2, confusionItemIds: ["grammar-koto-ga-dekimasu-ka", "grammar-tai-question-person"] },
  { id: "exercise-24-dekiru-jouzu", type: "multiple-choice", prompt: "Какая фраза нейтрально сообщает, что человек умеет готовить, но не оценивает качество?", targetItemIds: ["grammar-dekiru-vs-jouzu", "word-ryouri"], correctAnswers: ["料理をすることができます"], distractors: ["料理が上手です", "料理が好きです", "料理をしたいです"], explanationRu: "～ことができます сообщает о способности; 上手です оценивает уровень.", variantGroup: "lesson-024:meaning", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-24-input", type: "text-input", prompt: "Напиши по-японски: Я могу говорить по-японски.", targetItemIds: ["grammar-koto-ga-dekimasu", "word-nihongo", "word-hanashimasu-17"], correctAnswers: ["日本語を話すことができます", "日本語を話すことができます。"], acceptableAnswers: ["にほんごをはなすことができます", "にほんごをはなすことができます。"], explanationRu: "話します → 話す + ことができます.", variantGroup: "lesson-024:ability", difficulty: 3, confusionItemIds: ["grammar-koto-ga-dekimasu", "grammar-jouzu-heta-ga"] },
  { id: "exercise-24-listening", type: "listening", prompt: "Прослушай и выбери точное значение.", audioText: "漢字を読むことができます。", targetItemIds: ["grammar-koto-ga-dekimasu", "word-kanji-24", "word-yomimasu"], correctAnswers: ["Я могу читать кандзи."], distractors: ["Я хочу читать кандзи.", "Я не читаю кандзи.", "Я хорошо пишу кандзи."], explanationRu: "読むことができます означает возможность читать.", variantGroup: "lesson-024:ability", difficulty: 2, confusionItemIds: confusions },
];

export const lesson024: Lesson = { id: "lesson-024", unitId: "unit-007", order: 24, title: "Я могу это сделать", description: "Возможность через словарную форму + ～ことができます, отрицание и вопрос.", theory: lesson024Grammar.map((item) => item.explanationRu), itemIds: [...lesson024Vocabulary, ...lesson024Grammar, ...lesson024Sentences].map((item) => item.id), exerciseIds: lesson024Exercises.map((item) => item.id), estimatedMinutes: 19 };
export const lesson024Bundle: LessonBundle = { lesson: lesson024, vocabulary: lesson024Vocabulary, grammar: lesson024Grammar, sentences: lesson024Sentences, exercises: lesson024Exercises, outcomes: ["строить ～ことができます", "отрицать возможность через できません", "спрашивать о способности", "различать возможность и оценку 上手／下手"] };
