import type { ExampleSentence, Exercise, GrammarPoint, Lesson, VocabularyItem } from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson039Vocabulary: VocabularyItem[] = [
  { id: "word-rainen-39", type: "vocabulary", writtenForm: "来年", reading: "らいねん", meaningsRu: ["следующий год", "в следующем году"], partOfSpeech: ["существительное", "наречное употребление"], jlptLevel: "N5" },
];

export const lesson039Grammar: GrammarPoint[] = [
  {
    id: "grammar-dictionary-tsumori", type: "grammar", title: "Намерение: словарная форма + つもりです",
    meaningRu: "сообщает принятое говорящим решение или намерение",
    explanationRu: "Словарная форма глагола перед つもりです означает «намерен / собираюсь»: 来年日本へ行くつもりです — «В следующем году собираюсь поехать в Японию». Это сильнее простого желания: решение уже в некоторой степени принято.",
    formation: ["[словарная форма] + つもりです", "勉強するつもりです", "行くつもりです"],
    cautions: ["Не ставь ～ます перед つもり: 行きますつもりです неверно."],
    relatedGrammarIds: ["grammar-dictionary-form-role", "grammar-plain-nonpast"], jlptLevel: "N4",
  },
  {
    id: "grammar-nai-tsumori", type: "grammar", title: "Намерение не делать: ～ないつもりです",
    meaningRu: "сообщает решение отказаться от действия",
    explanationRu: "Отрицательная простая форма + つもりです означает «не намерен делать»: 車を買わないつもりです — «Я не собираюсь покупать машину».",
    formation: ["[форма ～ない] + つもりです", "買わないつもりです", "勉強しないつもりです"],
    cautions: ["Не используй ～ません перед つもり: 買いませんつもりです неверно."],
    relatedGrammarIds: ["grammar-nai-form-role", "grammar-nai-form-group1", "grammar-nai-form-group2-irregular"], jlptLevel: "N4",
  },
  {
    id: "grammar-tsumori-deshita", type: "grammar", title: "Прошлое намерение: ～つもりでした",
    meaningRu: "сообщает, что намерение существовало в прошлом",
    explanationRu: "Если решение или план относились к прошлому, です меняется на でした: 休むつもりでした — «Я собирался отдохнуть». Сама форма не говорит, был ли план выполнен; это уточняет контекст.",
    formation: ["[простая форма] + つもりでした"],
    cautions: ["Не переводи ～つもりでした автоматически как «сделал»: речь только о прошлом намерении."],
    relatedGrammarIds: ["grammar-dictionary-tsumori", "grammar-desu-past"], jlptLevel: "N4",
  },
  {
    id: "grammar-tai-vs-tsumori", type: "grammar", title: "～たいです и ～つもりです",
    meaningRu: "различает желание и принятое намерение",
    explanationRu: "日本へ行きたいです означает «хочу поехать в Японию». 日本へ行くつもりです означает «собираюсь / намерен поехать». Желание может остаться мечтой, а つもり сообщает о решении.",
    formation: ["行きたいです — хочу пойти", "行くつもりです — собираюсь пойти"],
    cautions: ["Не используй つもり для случайной сиюминутной хотелки, если решение ещё не принято."],
    relatedGrammarIds: ["grammar-tai-form", "grammar-dictionary-tsumori"], jlptLevel: "N4",
  },
];

export const lesson039Sentences: ExampleSentence[] = [
  { id: "sentence-39-next-year-japan", type: "sentence", japanese: "来年、日本へ行くつもりです。", reading: "らいねん、にほんへいくつもりです。", translationRu: "В следующем году я собираюсь поехать в Японию.", grammarIds: ["grammar-dictionary-tsumori", "grammar-ni-e-destination", "grammar-time-without-ni"], vocabularyIds: ["word-rainen-39", "word-nihon-36", "word-ikimasu"] },
  { id: "sentence-39-study-japanese", type: "sentence", japanese: "毎日日本語を勉強するつもりです。", reading: "まいにちにほんごをべんきょうするつもりです。", translationRu: "Я намерен каждый день заниматься японским.", grammarIds: ["grammar-dictionary-tsumori", "grammar-time-without-ni", "grammar-o-object"], vocabularyIds: ["word-mainichi", "word-nihongo", "word-benkyoushimasu"] },
  { id: "sentence-39-not-buy-car", type: "sentence", japanese: "車を買わないつもりです。", reading: "くるまをかわないつもりです。", translationRu: "Я не собираюсь покупать машину.", grammarIds: ["grammar-nai-tsumori", "grammar-nai-form-group1", "grammar-o-object"], vocabularyIds: ["word-kuruma", "word-kaimasu-22"] },
  { id: "sentence-39-planned-rest", type: "sentence", japanese: "今日は休むつもりでした。", reading: "きょうはやすむつもりでした。", translationRu: "Сегодня я собирался отдохнуть.", grammarIds: ["grammar-tsumori-deshita", "grammar-dictionary-form-group1", "grammar-time-without-ni"], vocabularyIds: ["word-kyou", "word-yasumimasu"] },
  { id: "sentence-39-want-vs-intend", type: "sentence", japanese: "日本へ行きたいですが、まだ行くつもりはありません。", reading: "にほんへいきたいですが、まだいくつもりはありません。", translationRu: "Я хочу поехать в Японию, но пока не собираюсь ехать.", grammarIds: ["grammar-tai-vs-tsumori", "grammar-tai-form", "grammar-dictionary-tsumori"], vocabularyIds: ["word-nihon-36", "word-ikimasu"] },
];

const confusions = ["grammar-dictionary-tsumori", "grammar-nai-tsumori", "grammar-tsumori-deshita", "grammar-tai-vs-tsumori"];
export const lesson039Exercises: Exercise[] = [
  { id: "exercise-39-dictionary", type: "multiple-choice", prompt: "Выбери правильную форму: «Собираюсь заниматься японским».", targetItemIds: ["grammar-dictionary-tsumori", "word-nihongo", "word-benkyoushimasu"], correctAnswers: ["日本語を勉強するつもりです"], distractors: ["日本語を勉強しますつもりです", "日本語を勉強してつもりです", "日本語を勉強するだつもりです"], explanationRu: "Перед つもりです используется словарная форма 勉強する.", variantGroup: "lesson-039:positive", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-39-negative", type: "multiple-choice", prompt: "Как сказать «не собираюсь покупать машину»?", targetItemIds: ["grammar-nai-tsumori", "word-kuruma", "word-kaimasu-22"], correctAnswers: ["車を買わないつもりです"], distractors: ["車を買いませんつもりです", "車を買わなくてつもりです", "車を買わないですつもりです"], explanationRu: "Отрицательное намерение: форма ～ない + つもりです.", variantGroup: "lesson-039:negative", difficulty: 1, confusionItemIds: confusions },
  { id: "exercise-39-past-intention", type: "multiple-choice", prompt: "Что точно сообщает 休むつもりでした?", targetItemIds: ["grammar-tsumori-deshita", "word-yasumimasu"], correctAnswers: ["В прошлом было намерение отдохнуть"], distractors: ["Отдых точно состоялся", "Сейчас запрещено отдыхать", "Говорящий никогда не хотел отдыхать"], explanationRu: "～つもりでした сообщает о прошлом намерении, но не подтверждает результат.", variantGroup: "lesson-039:past", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-39-wish-intention", type: "multiple-choice", prompt: "Решение уже принято: «В следующем году собираюсь поехать в Японию». Что выбрать?", targetItemIds: ["grammar-tai-vs-tsumori", "word-rainen-39", "word-nihon-36", "word-ikimasu"], correctAnswers: ["来年、日本へ行くつもりです"], distractors: ["来年、日本へ行きたいです", "来年、日本へ行きますつもりです", "来年、日本へ行ったつもりです"], explanationRu: "Принятое намерение выражается словарной формой + つもりです.", variantGroup: "lesson-039:contrast", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-39-builder", type: "sentence-builder", prompt: "Собери: Я намерен каждый день заниматься японским.", targetItemIds: ["grammar-dictionary-tsumori", "word-mainichi", "word-nihongo", "word-benkyoushimasu"], correctAnswers: ["毎日|日本語|を|勉強する|つもり|です"], distractors: ["勉強します", "たい", "だ"], explanationRu: "毎日 не требует に; намерение — 勉強するつもりです.", variantGroup: "lesson-039:positive", difficulty: 2, confusionItemIds: confusions },
  { id: "exercise-39-input", type: "text-input", prompt: "Напиши по-японски: Я не собираюсь покупать машину.", targetItemIds: ["grammar-nai-tsumori", "word-kuruma", "word-kaimasu-22"], correctAnswers: ["車を買わないつもりです", "車を買わないつもりです。"], acceptableAnswers: ["くるまをかわないつもりです", "くるまをかわないつもりです。"], explanationRu: "買う → 買わない; затем добавляется つもりです.", variantGroup: "lesson-039:production", difficulty: 3, confusionItemIds: confusions },
  { id: "exercise-39-listening", type: "listening", prompt: "Прослушай и выбери точный смысл.", audioText: "来年、日本へ行くつもりです。", targetItemIds: ["grammar-dictionary-tsumori", "word-rainen-39", "word-nihon-36", "word-ikimasu"], correctAnswers: ["Говорящий намерен поехать в Японию в следующем году."], distractors: ["Говорящий уже ездил в Японию в прошлом году.", "Говорящий лишь спрашивает, можно ли ехать.", "Говорящий решил не ехать в Японию."], explanationRu: "行くつもりです выражает принятое намерение.", variantGroup: "lesson-039:listening", difficulty: 2, confusionItemIds: confusions },
];

export const lesson039: Lesson = { id: "lesson-039", unitId: "unit-011", order: 39, title: "Я собираюсь", description: "Намерения через ～つもりです, отрицательный план, прошлое намерение и отличие от желания ～たい.", theory: lesson039Grammar.map((item) => item.explanationRu), itemIds: [...lesson039Vocabulary, ...lesson039Grammar, ...lesson039Sentences].map((item) => item.id), exerciseIds: lesson039Exercises.map((item) => item.id), estimatedMinutes: 20 };
export const lesson039Bundle: LessonBundle = { lesson: lesson039, vocabulary: lesson039Vocabulary, grammar: lesson039Grammar, sentences: lesson039Sentences, exercises: lesson039Exercises, outcomes: ["сообщать намерение через словарную форму + つもりです", "сообщать решение не делать через ～ないつもりです", "понимать прошлое намерение ～つもりでした", "различать желание ～たい и намерение ～つもり"] };
