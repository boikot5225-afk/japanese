import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson021Vocabulary: VocabularyItem[] = [];

export const lesson021Grammar: GrammarPoint[] = [
  {
    id: "grammar-dictionary-form-role", type: "grammar", title: "Словарная форма",
    meaningRu: "называет глагол и служит базой для простых форм и новых конструкций",
    explanationRu: "Словарная форма — форма, под которой глагол ищут в словаре: 読む, 食べる, する. Она также используется в нейтральной разговорной речи и перед конструкциями вроде ～ことができます. Как и ～ます, словарная форма сама по себе является непрошедшей: контекст решает, речь о настоящем, привычке или будущем.",
    formation: ["読みます → 読む", "食べます → 食べる", "勉強します → 勉強する"],
    cautions: ["Словарная форма не означает автоматически «сейчас»: 今、読んでいます — процесс, 読む — привычка или будущее по контексту."],
    relatedGrammarIds: ["grammar-masu-polite", "grammar-te-imasu-ongoing"], jlptLevel: "N5",
  },
  {
    id: "grammar-dictionary-form-group1", type: "grammar", title: "Первая группа: ряд い → ряд う",
    meaningRu: "меняет последний слог основы ～ます на соответствующий слог ряда う",
    explanationRu: "У первой группы убери ～ます и переведи последний слог из ряда い в ряд う: き→く, ぎ→ぐ, し→す, ち→つ, に→ぬ, び→ぶ, み→む, り→る. Поэтому 書きます→書く, 話します→話す, 待ちます→待つ, 読みます→読む, 帰ります→帰る.",
    formation: ["き→く", "ぎ→ぐ", "し→す", "ち→つ", "に→ぬ", "び→ぶ", "み→む", "り→る"],
    cautions: ["帰ります превращается в 帰る, но остаётся глаголом первой группы."],
    relatedGrammarIds: ["grammar-dictionary-form-role", "grammar-te-form-group1"], jlptLevel: "N5",
  },
  {
    id: "grammar-dictionary-form-group2-irregular", type: "grammar", title: "Вторая группа и неправильные глаголы",
    meaningRu: "добавляет る к основе второй группы и запоминает する／来る",
    explanationRu: "У изученных глаголов второй группы убери ～ます и добавь る: 食べます→食べる, 見ます→見る, 起きます→起きる. Неправильные формы: します→する, 来ます→来る（くる）.",
    formation: ["食べます → 食べる", "見ます → 見る", "します → する", "来ます → 来る（くる）"],
    cautions: ["Не делай вывод о группе только по окончанию る: 帰る относится к первой группе, 食べる — ко второй."],
    relatedGrammarIds: ["grammar-dictionary-form-group1", "grammar-te-form-group2-irregular"], jlptLevel: "N5",
  },
  {
    id: "grammar-plain-nonpast", type: "grammar", title: "Простое непрошедшее высказывание",
    meaningRu: "использует словарную форму как нейтральное или разговорное сказуемое",
    explanationRu: "В разговоре с близкими словарная форма может завершать предложение: 毎朝パンを食べる — «Каждое утро ем хлеб». Вежливое 食べます и простое 食べる передают то же базовое время, но различаются стилем.",
    formation: ["毎朝パンを食べる。", "新聞を読む。"],
    cautions: ["Не переключайся на простую форму в официальной или дистанционной речи без причины: стиль зависит от отношений между собеседниками."],
    relatedGrammarIds: ["grammar-dictionary-form-role", "grammar-masu-polite"], jlptLevel: "N5",
  },
];

export const lesson021Sentences: ExampleSentence[] = [
  { id: "sentence-21-mainichi-shinbun-yomu", type: "sentence", japanese: "毎日新聞を読む。", reading: "まいにちしんぶんをよむ。", translationRu: "Каждый день читаю газету.", grammarIds: ["grammar-plain-nonpast", "grammar-dictionary-form-group1", "grammar-time-without-ni", "grammar-o-object"], vocabularyIds: ["word-mainichi", "word-shinbun", "word-yomimasu"] },
  { id: "sentence-21-maiasa-pan-taberu", type: "sentence", japanese: "毎朝パンを食べる。", reading: "まいあさパンをたべる。", translationRu: "Каждое утро ем хлеб.", grammarIds: ["grammar-plain-nonpast", "grammar-dictionary-form-group2-irregular", "grammar-time-without-ni", "grammar-o-object"], vocabularyIds: ["word-maiasa", "word-pan", "word-tabemasu"] },
  { id: "sentence-21-ie-kaeru", type: "sentence", japanese: "家に帰る。", reading: "いえにかえる。", translationRu: "Возвращаюсь домой.", grammarIds: ["grammar-plain-nonpast", "grammar-dictionary-form-group1", "grammar-ni-e-destination"], vocabularyIds: ["word-ie", "word-kaerimasu"] },
  { id: "sentence-21-nihongo-benkyou-suru", type: "sentence", japanese: "日本語を勉強する。", reading: "にほんごをべんきょうする。", translationRu: "Занимаюсь японским.", grammarIds: ["grammar-plain-nonpast", "grammar-dictionary-form-group2-irregular", "grammar-o-object"], vocabularyIds: ["word-nihongo", "word-benkyoushimasu"] },
];

const confusions = ["grammar-dictionary-form-group1", "grammar-dictionary-form-group2-irregular", "grammar-masu-polite"];
export const lesson021Exercises: Exercise[] = [
  { id: "exercise-21-yomu", type: "conjugation", prompt: "Поставь 読みます в словарную форму.", targetItemIds: ["grammar-dictionary-form-group1", "word-yomimasu"], correctAnswers: ["読む"], acceptableAnswers: ["よむ"], distractors: ["読る", "読す", "読んで"], explanationRu: "み переходит в む: 読みます → 読む.", variantGroup: "lesson-021:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-21-hanasu", type: "multiple-choice", prompt: "Выбери словарную форму 話します.", targetItemIds: ["grammar-dictionary-form-group1", "word-hanashimasu-17"], correctAnswers: ["話す"], distractors: ["話しる", "話して", "話む"], explanationRu: "し переходит в す.", variantGroup: "lesson-021:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-21-taberu", type: "conjugation", prompt: "Поставь 食べます в словарную форму.", targetItemIds: ["grammar-dictionary-form-group2-irregular", "word-tabemasu"], correctAnswers: ["食べる"], acceptableAnswers: ["たべる"], distractors: ["食べす", "食ぶ", "食べて"], explanationRu: "У второй группы ～ます заменяется на る.", variantGroup: "lesson-021:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-21-suru", type: "multiple-choice", prompt: "Какая словарная форма у 勉強します?", targetItemIds: ["grammar-dictionary-form-group2-irregular", "word-benkyoushimasu"], correctAnswers: ["勉強する"], distractors: ["勉強しる", "勉強して", "勉強す"], explanationRu: "します → する.", variantGroup: "lesson-021:irregular", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-21-builder", type: "sentence-builder", prompt: "Собери простую фразу: Каждый день читаю газету.", targetItemIds: ["grammar-plain-nonpast", "grammar-dictionary-form-group1", "word-mainichi", "word-shinbun", "word-yomimasu"], correctAnswers: ["毎日|新聞|を|読む"], distractors: ["読みます", "読んで", "に"], explanationRu: "В простой форме предложение заканчивается 読む.", variantGroup: "lesson-021:plain-sentence", difficulty: 2, confusionItemIds: ["grammar-plain-nonpast", "grammar-masu-polite"] },
  { id: "exercise-21-input", type: "text-input", prompt: "Напиши по-японски простой формой: Занимаюсь японским.", targetItemIds: ["grammar-plain-nonpast", "grammar-dictionary-form-group2-irregular", "word-nihongo", "word-benkyoushimasu"], correctAnswers: ["日本語を勉強する", "日本語を勉強する。"], acceptableAnswers: ["にほんごをべんきょうする", "にほんごをべんきょうする。"], explanationRu: "勉強します → 勉強する.", variantGroup: "lesson-021:plain-sentence", difficulty: 3, confusionItemIds: ["grammar-plain-nonpast", "grammar-masu-polite"] },
];

export const lesson021: Lesson = { id: "lesson-021", unitId: "unit-007", order: 21, title: "Как глагол живёт в словаре", description: "Словарная форма первой и второй групп, する／来る и простое непрошедшее высказывание.", theory: lesson021Grammar.map((item) => item.explanationRu), itemIds: [...lesson021Vocabulary, ...lesson021Grammar, ...lesson021Sentences].map((item) => item.id), exerciseIds: lesson021Exercises.map((item) => item.id), estimatedMinutes: 18 };
export const lesson021Bundle: LessonBundle = { lesson: lesson021, vocabulary: lesson021Vocabulary, grammar: lesson021Grammar, sentences: lesson021Sentences, exercises: lesson021Exercises, outcomes: ["понимать роль словарной формы", "строить словарную форму первой группы", "строить формы второй группы и する／来る", "различать простой и вежливый стиль"] };
