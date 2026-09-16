import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson026Vocabulary: VocabularyItem[] = [
  { id: "word-kesa-26", type: "vocabulary", writtenForm: "今朝", reading: "けさ", meaningsRu: ["сегодня утром"], partOfSpeech: ["существительное", "наречное употребление"], jlptLevel: "N5" },
];

export const lesson026Grammar: GrammarPoint[] = [
  {
    id: "grammar-nakatta-role", type: "grammar", title: "Простое прошедшее отрицание ～なかった",
    meaningRu: "сообщает, что действие не произошло в прошлом",
    explanationRu: "～なかった — простая отрицательная прошедшая форма; в вежливом стиле ей соответствует ～ませんでした: 行かなかった ↔ 行きませんでした. Она означает «не сделал / не произошло».",
    formation: ["行きませんでした ↔ 行かなかった", "食べませんでした ↔ 食べなかった"],
    cautions: ["～なかった относится к прошлому. Для настоящего или будущего отрицания остаётся ～ない."],
    relatedGrammarIds: ["grammar-nai-form-role", "grammar-masu-past-negative", "grammar-ta-form-role"], jlptLevel: "N5",
  },
  {
    id: "grammar-nakatta-from-nai", type: "grammar", title: "Из ～ない в ～なかった",
    meaningRu: "строит прошедшее отрицание заменой окончания ない",
    explanationRu: "Сначала образуй знакомую ～ない-форму, затем замени ない на なかった: 読まない→読まなかった, 行かない→行かなかった, 食べない→食べなかった. Правила групп повторно применять не нужно.",
    formation: ["～ない → ～なかった", "読まない → 読まなかった", "食べない → 食べなかった"],
    cautions: ["Не добавляй かった к словарной форме: 読むかった неверно."],
    relatedGrammarIds: ["grammar-nai-form-group1", "grammar-nai-form-group2-irregular"], jlptLevel: "N5",
  },
  {
    id: "grammar-nakatta-irregular", type: "grammar", title: "Неправильные глаголы в прошлом отрицании",
    meaningRu: "строит しなかった и 来なかった от знакомых отрицательных форм",
    explanationRu: "Неправильность уже находится в ～ない-форме: しない→しなかった, 来ない（こない）→来なかった（こなかった）. Поэтому не нужно изобретать отдельное правило от する или 来る.",
    formation: ["しない → しなかった", "来ない → 来なかった（こなかった）"],
    cautions: ["来なかった читается こなかった, а не きなかった."],
    relatedGrammarIds: ["grammar-nakatta-from-nai", "grammar-nai-form-group2-irregular"], jlptLevel: "N5",
  },
  {
    id: "grammar-nakatta-vs-takunai", type: "grammar", title: "Не сделал — не значит не хотел",
    meaningRu: "различает отрицание действия и отрицание желания",
    explanationRu: "見なかった означает «не смотрел», то есть действие не произошло. 見たくない означает «не хочу смотреть» и говорит о желании в настоящем или будущем. Эти формы похожи внешне, но отвечают на разные вопросы.",
    formation: ["見なかった — не смотрел", "見たくない — не хочу смотреть"],
    cautions: ["Не переводи ～なかった как «не хотел»: для желания используется ～たい／～たくない."],
    relatedGrammarIds: ["grammar-nakatta-role", "grammar-takunai"], jlptLevel: "N5",
  },
];

export const lesson026Sentences: ExampleSentence[] = [
  { id: "sentence-26-kinou-gakkou-ikanakatta", type: "sentence", japanese: "昨日は学校へ行かなかった。", reading: "きのうはがっこうへいかなかった。", translationRu: "Вчера я не ходил в школу.", grammarIds: ["grammar-nakatta-role", "grammar-nakatta-from-nai", "grammar-wa-topic", "grammar-ni-e-destination", "grammar-time-without-ni"], vocabularyIds: ["word-kinou", "word-gakkou", "word-ikimasu"] },
  { id: "sentence-26-kesa-asagohan-tabenakatta", type: "sentence", japanese: "今朝、朝ご飯を食べなかった。", reading: "けさ、あさごはんをたべなかった。", translationRu: "Сегодня утром я не завтракал.", grammarIds: ["grammar-nakatta-role", "grammar-nakatta-from-nai", "grammar-o-object", "grammar-time-without-ni"], vocabularyIds: ["word-kesa-26", "word-asagohan-19", "word-tabemasu"] },
  { id: "sentence-26-kinou-terebi-minakatta", type: "sentence", japanese: "昨日はテレビを見なかった。", reading: "きのうはテレビをみなかった。", translationRu: "Вчера я не смотрел телевизор.", grammarIds: ["grammar-nakatta-role", "grammar-nakatta-vs-takunai", "grammar-wa-topic", "grammar-o-object", "grammar-time-without-ni"], vocabularyIds: ["word-kinou", "word-terebi", "word-mimasu"] },
  { id: "sentence-26-kinou-benkyou-shinakatta", type: "sentence", japanese: "昨日、日本語を勉強しなかった。", reading: "きのう、にほんごをべんきょうしなかった。", translationRu: "Вчера я не занимался японским.", grammarIds: ["grammar-nakatta-role", "grammar-nakatta-irregular", "grammar-o-object", "grammar-time-without-ni"], vocabularyIds: ["word-kinou", "word-nihongo", "word-benkyoushimasu"] },
  { id: "sentence-26-tomodachi-konakatta", type: "sentence", japanese: "友達は来なかった。", reading: "ともだちはこなかった。", translationRu: "Друг не пришёл.", grammarIds: ["grammar-nakatta-role", "grammar-nakatta-irregular", "grammar-wa-topic"], vocabularyIds: ["word-tomodachi-17"] },
];

const confusions = ["grammar-nakatta-role", "grammar-nakatta-from-nai", "grammar-nai-form-role", "grammar-takunai"];
export const lesson026Exercises: Exercise[] = [
  { id: "exercise-26-yomanakatta", type: "conjugation", prompt: "Поставь 読まない в прошедшее отрицание.", targetItemIds: ["grammar-nakatta-from-nai", "word-yomimasu"], correctAnswers: ["読まなかった"], acceptableAnswers: ["よまなかった"], distractors: ["読まないかった", "読まなかた", "読んだない"], explanationRu: "Замени ない на なかった.", variantGroup: "lesson-026:formation", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-26-ikanakatta", type: "multiple-choice", prompt: "Выбери простое «не ходил» от 行く.", targetItemIds: ["grammar-nakatta-from-nai", "word-ikimasu"], correctAnswers: ["行かなかった"], distractors: ["行きなかった", "行かなかた", "行ったない"], explanationRu: "行く → 行かない → 行かなかった.", variantGroup: "lesson-026:formation", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-26-shinakatta", type: "conjugation", prompt: "Поставь する в простое прошедшее отрицание.", targetItemIds: ["grammar-nakatta-irregular"], correctAnswers: ["しなかった"], distractors: ["するなかった", "しないかった", "したない"], explanationRu: "する → しない → しなかった.", variantGroup: "lesson-026:irregular", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-26-meaning", type: "multiple-choice", prompt: "Что точно означает テレビを見なかった?", targetItemIds: ["grammar-nakatta-vs-takunai", "word-terebi", "word-mimasu"], correctAnswers: ["Не смотрел телевизор"], distractors: ["Не хочу смотреть телевизор", "Не умею смотреть телевизор", "Смотрел телевизор"], explanationRu: "見なかった отрицает действие в прошлом; 見たくない отрицает желание.", variantGroup: "lesson-026:meaning", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-26-builder", type: "sentence-builder", prompt: "Собери простой формой: Сегодня утром я не завтракал.", targetItemIds: ["grammar-nakatta-role", "word-kesa-26", "word-asagohan-19", "word-tabemasu"], correctAnswers: ["今朝|朝ご飯|を|食べなかった"], distractors: ["食べない", "食べた", "に"], explanationRu: "Прошедшее отрицание 食べない — 食べなかった.", variantGroup: "lesson-026:sentence", difficulty: 2, confusionItemIds: ["grammar-nakatta-role", "grammar-nai-form-role"] },
  { id: "exercise-26-input", type: "text-input", prompt: "Напиши простой формой: Вчера я не занимался японским.", targetItemIds: ["grammar-nakatta-irregular", "word-kinou", "word-nihongo", "word-benkyoushimasu"], correctAnswers: ["昨日日本語を勉強しなかった", "昨日、日本語を勉強しなかった", "昨日日本語を勉強しなかった。", "昨日、日本語を勉強しなかった。"], acceptableAnswers: ["きのうにほんごをべんきょうしなかった", "きのう、にほんごをべんきょうしなかった"], explanationRu: "勉強する → 勉強しない → 勉強しなかった.", variantGroup: "lesson-026:sentence", difficulty: 3, confusionItemIds: ["grammar-nakatta-irregular", "grammar-masu-past-negative"] },
];

export const lesson026: Lesson = { id: "lesson-026", unitId: "unit-008", order: 26, title: "Вчера не смотрел", description: "Простое прошедшее отрицание ～なかった и отличие от ～たくない.", theory: lesson026Grammar.map((item) => item.explanationRu), itemIds: [...lesson026Vocabulary, ...lesson026Grammar, ...lesson026Sentences].map((item) => item.id), exerciseIds: lesson026Exercises.map((item) => item.id), estimatedMinutes: 19 };
export const lesson026Bundle: LessonBundle = { lesson: lesson026, vocabulary: lesson026Vocabulary, grammar: lesson026Grammar, sentences: lesson026Sentences, exercises: lesson026Exercises, outcomes: ["понимать роль ～なかった", "строить форму из ～ない", "образовывать неправильные формы", "различать «не сделал» и «не хочу делать»"] };
