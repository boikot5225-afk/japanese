import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson009Vocabulary: VocabularyItem[] = [
  {
    id: "word-kinou",
    type: "vocabulary",
    writtenForm: "昨日",
    reading: "きのう",
    meaningsRu: ["вчера"],
    partOfSpeech: ["существительное", "наречное употребление"],
    jlptLevel: "N5",
  },
  {
    id: "word-kyou",
    type: "vocabulary",
    writtenForm: "今日",
    reading: "きょう",
    meaningsRu: ["сегодня"],
    partOfSpeech: ["существительное", "наречное употребление"],
    jlptLevel: "N5",
  },
  {
    id: "word-yasumi-noun",
    type: "vocabulary",
    writtenForm: "休み",
    reading: "やすみ",
    meaningsRu: ["отдых", "выходной", "перерыв"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-getsuyoubi",
    type: "vocabulary",
    writtenForm: "月曜日",
    reading: "げつようび",
    meaningsRu: ["понедельник"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-nichiyoubi",
    type: "vocabulary",
    writtenForm: "日曜日",
    reading: "にちようび",
    meaningsRu: ["воскресенье"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
];

export const lesson009Grammar: GrammarPoint[] = [
  {
    id: "grammar-desu-negative",
    type: "grammar",
    title: "Отрицание ではありません",
    meaningRu: "вежливо отрицает именное предложение",
    explanationRu:
      "Для вежливого отрицания после существительного используется ではありません. В разговорной вежливой речи часто говорят じゃありません. Обе формы означают «не является / не есть».",
    formation: ["[существительное] ではありません", "[существительное] じゃありません"],
    cautions: [
      "Это форма именного сказуемого: 学生ではありません. Для отрицания глагола используется ～ません.",
      "では в этой конструкции произносится でわ, а は пишется как частица.",
    ],
    relatedGrammarIds: ["grammar-desu"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-desu-past",
    type: "grammar",
    title: "Прошедшее でした",
    meaningRu: "делает именное предложение прошедшим",
    explanationRu:
      "В прошедшем времени です меняется на でした: 休みでした — «был выходной». Эта форма относится к существительным и другим именным сказуемым, а не заменяет глагольное ～ました.",
    formation: ["[существительное] でした"],
    cautions: ["食べます превращается в 食べました, а не в 食べでした."],
    relatedGrammarIds: ["grammar-desu"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-desu-past-negative",
    type: "grammar",
    title: "Прошедшее отрицание ではありませんでした",
    meaningRu: "означает «не был / не являлся»",
    explanationRu:
      "Прошедшее отрицание строится как ではありませんでした. Разговорный вежливый вариант — じゃありませんでした.",
    formation: ["[существительное] ではありませんでした", "[существительное] じゃありませんでした"],
    cautions: ["Не переставляй части конструкции: でした ставится в самом конце."],
    relatedGrammarIds: ["grammar-desu-negative", "grammar-desu-past"],
    jlptLevel: "N5",
  },
];

export const lesson009Sentences: ExampleSentence[] = [
  {
    id: "sentence-kyou-getsuyoubi",
    type: "sentence",
    japanese: "今日は月曜日です。",
    reading: "きょうはげつようびです。",
    translationRu: "Сегодня понедельник.",
    grammarIds: ["grammar-wa-topic", "grammar-desu"],
    vocabularyIds: ["word-kyou", "word-getsuyoubi"],
  },
  {
    id: "sentence-kinou-yasumi-deshita",
    type: "sentence",
    japanese: "昨日は休みでした。",
    reading: "きのうはやすみでした。",
    translationRu: "Вчера был выходной.",
    grammarIds: ["grammar-wa-topic", "grammar-desu-past"],
    vocabularyIds: ["word-kinou", "word-yasumi-noun"],
  },
  {
    id: "sentence-kyou-yasumi-dewa-arimasen",
    type: "sentence",
    japanese: "今日は休みではありません。",
    reading: "きょうはやすみではありません。",
    translationRu: "Сегодня не выходной.",
    grammarIds: ["grammar-wa-topic", "grammar-desu-negative"],
    vocabularyIds: ["word-kyou", "word-yasumi-noun"],
  },
  {
    id: "sentence-kinou-getsuyoubi-dewa-arimasen-deshita",
    type: "sentence",
    japanese: "昨日は月曜日ではありませんでした。",
    reading: "きのうはげつようびではありませんでした。",
    translationRu: "Вчера был не понедельник.",
    grammarIds: ["grammar-wa-topic", "grammar-desu-past-negative"],
    vocabularyIds: ["word-kinou", "word-getsuyoubi"],
  },
];

export const lesson009Exercises: Exercise[] = [
  {
    id: "exercise-gakusei-negative",
    type: "text-input",
    prompt: "Сделай вежливое отрицание: 学生です。",
    targetItemIds: ["grammar-desu-negative", "word-gakusei"],
    correctAnswers: ["学生ではありません", "学生ではありません。"],
    acceptableAnswers: [
      "学生じゃありません",
      "学生じゃありません。",
      "がくせいではありません",
      "がくせいではありません。"
    ],
    explanationRu: "Именное предложение отрицается формой ではありません. じゃありません — более разговорный вежливый вариант.",
  },
  {
    id: "exercise-yasumi-past",
    type: "text-input",
    prompt: "Поставь в прошедшее время: 休みです。",
    targetItemIds: ["grammar-desu-past", "word-yasumi-noun"],
    correctAnswers: ["休みでした", "休みでした。"],
    acceptableAnswers: ["やすみでした", "やすみでした。"],
    explanationRu: "Прошедшая форма именного сказуемого — でした.",
  },
  {
    id: "exercise-kaishain-past-negative",
    type: "text-input",
    prompt: "Поставь в прошедшее отрицание: 会社員です。",
    targetItemIds: ["grammar-desu-past-negative", "word-kaishain"],
    correctAnswers: ["会社員ではありませんでした", "会社員ではありませんでした。"],
    acceptableAnswers: [
      "会社員じゃありませんでした",
      "会社員じゃありませんでした。",
      "かいしゃいんではありませんでした",
      "かいしゃいんではありませんでした。"
    ],
    explanationRu: "Прошедшее отрицание заканчивается полной формой ではありませんでした.",
  },
  {
    id: "exercise-desu-form-choice",
    type: "multiple-choice",
    prompt: "Какая форма означает «не был студентом»?",
    targetItemIds: ["grammar-desu-past-negative", "word-gakusei"],
    correctAnswers: ["学生ではありませんでした"],
    distractors: ["学生ではありません", "学生でした", "学生ませんでした"],
    explanationRu: "«Не был» требует одновременно отрицания и прошедшего времени: ではありませんでした.",
  },
  {
    id: "exercise-kinou-yasumi-builder",
    type: "sentence-builder",
    prompt: "Собери: Вчера был выходной.",
    targetItemIds: ["grammar-desu-past", "word-kinou", "word-yasumi-noun"],
    correctAnswers: ["昨日|は|休み|でした"],
    distractors: ["です", "ではありません", "今日"],
    explanationRu: "昨日 задаёт прошлый контекст, а именное сказуемое принимает форму でした.",
  },
  {
    id: "exercise-kyou-not-yasumi-input",
    type: "text-input",
    prompt: "Напиши по-японски: Сегодня не выходной.",
    targetItemIds: ["grammar-desu-negative", "word-kyou", "word-yasumi-noun"],
    correctAnswers: ["今日は休みではありません", "今日は休みではありません。"],
    acceptableAnswers: [
      "今日は休みじゃありません",
      "今日は休みじゃありません。",
      "きょうはやすみではありません",
      "きょうはやすみではありません。"
    ],
    explanationRu: "Тема 今日 отмечается は, существительное 休み отрицается через ではありません.",
  },
  {
    id: "exercise-kinou-not-monday-input",
    type: "text-input",
    prompt: "Напиши по-японски: Вчера был не понедельник.",
    targetItemIds: ["grammar-desu-past-negative", "word-kinou", "word-getsuyoubi"],
    correctAnswers: [
      "昨日は月曜日ではありませんでした",
      "昨日は月曜日ではありませんでした。"
    ],
    acceptableAnswers: [
      "昨日は月曜日じゃありませんでした",
      "昨日は月曜日じゃありませんでした。",
      "きのうはげつようびではありませんでした",
      "きのうはげつようびではありませんでした。"
    ],
    explanationRu: "Для значения «не был» используется ではありませんでした.",
  },
  {
    id: "exercise-yesterday-sunday-choice",
    type: "multiple-choice",
    prompt: "Выбери грамматически правильное предложение: «Вчера было воскресенье».",
    targetItemIds: ["grammar-desu-past", "word-kinou", "word-nichiyoubi"],
    correctAnswers: ["昨日は日曜日でした"],
    distractors: ["昨日は日曜日です", "昨日は日曜日ます", "昨日は日曜日ではありません"],
    explanationRu: "Прошлый контекст 昨日 требует формы でした у именного сказуемого.",
  },
];

export const lesson009: Lesson = {
  id: "lesson-009",
  unitId: "unit-003",
  order: 9,
  title: "Сегодня не выходной",
  description: "Отрицание и прошедшее время именных предложений с です.",
  theory: lesson009Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson009Vocabulary.map((item) => item.id),
    ...lesson009Grammar.map((item) => item.id),
    ...lesson009Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson009Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 23,
};

export const lesson009Bundle: LessonBundle = {
  lesson: lesson009,
  vocabulary: lesson009Vocabulary,
  grammar: lesson009Grammar,
  sentences: lesson009Sentences,
  exercises: lesson009Exercises,
  outcomes: [
    "отрицать именное предложение через ではありません",
    "говорить о прошлом с でした",
    "строить прошедшее отрицание ではありませんでした",
    "не смешивать формы です с глагольными формами ～ます",
  ],
};
