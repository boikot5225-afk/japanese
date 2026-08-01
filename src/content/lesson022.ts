import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson022Vocabulary: VocabularyItem[] = [
  { id: "word-kyou-22", type: "vocabulary", writtenForm: "今日", reading: "きょう", meaningsRu: ["сегодня"], partOfSpeech: ["существительное", "наречное употребление"], jlptLevel: "N5" },
  { id: "word-kaimasu-22", type: "vocabulary", writtenForm: "買います", reading: "かいます", meaningsRu: ["покупать"], partOfSpeech: ["глагол", "вежливая форма"], jlptLevel: "N5" },
];

export const lesson022Grammar: GrammarPoint[] = [
  {
    id: "grammar-nai-form-role", type: "grammar", title: "Простая отрицательная форма ～ない",
    meaningRu: "отрицает действие в настоящем, привычке или будущем",
    explanationRu: "～ない — простая отрицательная форма глагола: 読まない — «не читаю / не буду читать». Она соответствует вежливому 読みません, но относится к простому стилю и также служит базой для дальнейших конструкций.",
    formation: ["読みません ↔ 読まない", "食べません ↔ 食べない"],
    cautions: ["～ない не является прошедшим временем. «Не читал» потребует другой формы, которая будет позже."],
    relatedGrammarIds: ["grammar-dictionary-form-role", "grammar-masu-past-negative"], jlptLevel: "N5",
  },
  {
    id: "grammar-nai-form-group1", type: "grammar", title: "Первая группа: ряд う → ряд あ + ない",
    meaningRu: "меняет последний слог словарной формы на ряд あ и добавляет ない",
    explanationRu: "У первой группы последний слог словарной формы переходит в ряд あ: 書く→書かない, 話す→話さない, 待つ→待たない, 読む→読まない, 帰る→帰らない, 行く→行かない. Особый случай: глаголы на う получают わない, поэтому 買う→買わない.",
    formation: ["く→かない", "す→さない", "つ→たない", "む→まない", "る→らない", "う→わない"],
    cautions: ["Для конечного う используй わ, а не あ: 買わない, не 買あない.", "行く было исключением в て-форме, но форма 行かない строится по обычному правилу первой группы."],
    relatedGrammarIds: ["grammar-nai-form-role", "grammar-dictionary-form-group1"], jlptLevel: "N5",
  },
  {
    id: "grammar-nai-form-group2-irregular", type: "grammar", title: "Вторая группа и неправильные формы",
    meaningRu: "заменяет る на ない и запоминает しない／来ない",
    explanationRu: "У второй группы убери る и добавь ない: 食べる→食べない, 見る→見ない, 起きる→起きない. Неправильные формы: する→しない, 来る→来ない（こない）.",
    formation: ["食べる → 食べない", "見る → 見ない", "する → しない", "来る → 来ない（こない）"],
    cautions: ["Не образуй しるない или 来るない: する и 来る меняются целиком."],
    relatedGrammarIds: ["grammar-nai-form-group1", "grammar-dictionary-form-group2-irregular"], jlptLevel: "N5",
  },
  {
    id: "grammar-plain-negative-sentence", type: "grammar", title: "Простое отрицательное высказывание",
    meaningRu: "завершает нейтральное или разговорное предложение формой ～ない",
    explanationRu: "В простой речи отрицательная форма ставится в конец: 今日は学校へ行かない — «Сегодня не иду в школу». Слова 今日, 毎日 и 明日 обычно не требуют частицы に.",
    formation: ["今日は学校へ行かない。", "テレビを見ない。"],
    cautions: ["Не смешивай уровни вежливости внутри одного сказуемого: 行かないです встречается в речи, но базовая учебная пара — 行かない／行きません."],
    relatedGrammarIds: ["grammar-nai-form-role", "grammar-time-without-ni"], jlptLevel: "N5",
  },
];

export const lesson022Sentences: ExampleSentence[] = [
  { id: "sentence-22-kyou-gakkou-ikanai", type: "sentence", japanese: "今日は学校へ行かない。", reading: "きょうはがっこうへいかない。", translationRu: "Сегодня я не иду в школу.", grammarIds: ["grammar-plain-negative-sentence", "grammar-nai-form-group1", "grammar-wa-topic", "grammar-ni-e-destination", "grammar-time-without-ni"], vocabularyIds: ["word-kyou-22", "word-gakkou", "word-ikimasu"] },
  { id: "sentence-22-shinbun-yomanai", type: "sentence", japanese: "新聞を読まない。", reading: "しんぶんをよまない。", translationRu: "Я не читаю газету.", grammarIds: ["grammar-plain-negative-sentence", "grammar-nai-form-group1", "grammar-o-object"], vocabularyIds: ["word-shinbun", "word-yomimasu"] },
  { id: "sentence-22-pan-kawanai", type: "sentence", japanese: "今日はパンを買わない。", reading: "きょうはパンをかわない。", translationRu: "Сегодня я не покупаю хлеб.", grammarIds: ["grammar-plain-negative-sentence", "grammar-nai-form-group1", "grammar-wa-topic", "grammar-time-without-ni", "grammar-o-object"], vocabularyIds: ["word-kyou-22", "word-pan", "word-kaimasu-22"] },
  { id: "sentence-22-terebi-minai", type: "sentence", japanese: "テレビを見ない。", reading: "テレビをみない。", translationRu: "Я не смотрю телевизор.", grammarIds: ["grammar-plain-negative-sentence", "grammar-nai-form-group2-irregular", "grammar-o-object"], vocabularyIds: ["word-terebi", "word-mimasu"] },
  { id: "sentence-22-benkyou-shinai", type: "sentence", japanese: "今日は日本語を勉強しない。", reading: "きょうはにほんごをべんきょうしない。", translationRu: "Сегодня я не занимаюсь японским.", grammarIds: ["grammar-plain-negative-sentence", "grammar-nai-form-group2-irregular", "grammar-wa-topic", "grammar-time-without-ni", "grammar-o-object"], vocabularyIds: ["word-kyou-22", "word-nihongo", "word-benkyoushimasu"] },
];

const confusions = ["grammar-nai-form-group1", "grammar-nai-form-group2-irregular", "grammar-dictionary-form-role"];
export const lesson022Exercises: Exercise[] = [
  { id: "exercise-22-yomanai", type: "conjugation", prompt: "Поставь 読む в форму ～ない.", targetItemIds: ["grammar-nai-form-group1", "word-yomimasu"], correctAnswers: ["読まない"], acceptableAnswers: ["よまない"], distractors: ["読みない", "読むない", "読んない"], explanationRu: "む → まない.", variantGroup: "lesson-022:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-22-kawanai", type: "multiple-choice", prompt: "Выбери отрицательную форму 買う.", targetItemIds: ["grammar-nai-form-group1", "word-kaimasu-22"], correctAnswers: ["買わない"], distractors: ["買あない", "買いない", "買うない"], explanationRu: "Конечное う переходит в わ: 買わない.", variantGroup: "lesson-022:formation", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-22-minai", type: "conjugation", prompt: "Поставь 見る в форму ～ない.", targetItemIds: ["grammar-nai-form-group2-irregular", "word-mimasu"], correctAnswers: ["見ない"], acceptableAnswers: ["みない"], distractors: ["見らない", "見るない", "見まない"], explanationRu: "У второй группы る заменяется на ない.", variantGroup: "lesson-022:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-22-shinai", type: "multiple-choice", prompt: "Какая отрицательная форма у する?", targetItemIds: ["grammar-nai-form-group2-irregular", "word-benkyoushimasu"], correctAnswers: ["しない"], distractors: ["すらない", "するない", "しませんない"], explanationRu: "する → しない.", variantGroup: "lesson-022:irregular", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-22-builder", type: "sentence-builder", prompt: "Собери простой фразой: Сегодня я не иду в школу.", targetItemIds: ["grammar-plain-negative-sentence", "grammar-nai-form-group1", "word-kyou-22", "word-gakkou", "word-ikimasu"], correctAnswers: ["今日|は|学校|へ|行かない"], distractors: ["行きません", "行く", "で"], explanationRu: "行く относится к первой группе: く → かない.", variantGroup: "lesson-022:plain-negative", difficulty: 2, confusionItemIds: ["grammar-plain-negative-sentence", "grammar-plain-nonpast"] },
  { id: "exercise-22-input", type: "text-input", prompt: "Напиши по-японски простой формой: Сегодня я не занимаюсь японским.", targetItemIds: ["grammar-plain-negative-sentence", "grammar-nai-form-group2-irregular", "word-kyou-22", "word-nihongo", "word-benkyoushimasu"], correctAnswers: ["今日は日本語を勉強しない", "今日は日本語を勉強しない。"], acceptableAnswers: ["きょうはにほんごをべんきょうしない", "きょうはにほんごをべんきょうしない。"], explanationRu: "勉強する → 勉強しない.", variantGroup: "lesson-022:plain-negative", difficulty: 3, confusionItemIds: ["grammar-plain-negative-sentence", "grammar-nai-form-role"] },
];

export const lesson022: Lesson = { id: "lesson-022", unitId: "unit-007", order: 22, title: "Сегодня не иду", description: "Простая отрицательная форма ～ない для двух групп и неправильных глаголов.", theory: lesson022Grammar.map((item) => item.explanationRu), itemIds: [...lesson022Vocabulary, ...lesson022Grammar, ...lesson022Sentences].map((item) => item.id), exerciseIds: lesson022Exercises.map((item) => item.id), estimatedMinutes: 19 };
export const lesson022Bundle: LessonBundle = { lesson: lesson022, vocabulary: lesson022Vocabulary, grammar: lesson022Grammar, sentences: lesson022Sentences, exercises: lesson022Exercises, outcomes: ["понимать роль формы ～ない", "строить отрицание первой группы", "строить отрицание второй группы и неправильных глаголов", "использовать простое отрицательное предложение"] };
