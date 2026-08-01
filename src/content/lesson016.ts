import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";
import type { LessonBundle } from "./lessonBundle";

export const lesson016Vocabulary: VocabularyItem[] = [
  {
    id: "word-inu",
    type: "vocabulary",
    writtenForm: "犬",
    reading: "いぬ",
    meaningsRu: ["собака"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-haru",
    type: "vocabulary",
    writtenForm: "春",
    reading: "はる",
    meaningsRu: ["весна"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-natsu",
    type: "vocabulary",
    writtenForm: "夏",
    reading: "なつ",
    meaningsRu: ["лето"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-fuyu",
    type: "vocabulary",
    writtenForm: "冬",
    reading: "ふゆ",
    meaningsRu: ["зима"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-kisetsu",
    type: "vocabulary",
    writtenForm: "季節",
    reading: "きせつ",
    meaningsRu: ["время года", "сезон"],
    partOfSpeech: ["существительное"],
    jlptLevel: "N5",
  },
  {
    id: "word-dochira",
    type: "vocabulary",
    writtenForm: "どちら",
    reading: "どちら",
    meaningsRu: ["который из двух", "какая сторона"],
    partOfSpeech: ["вопросительное слово"],
    jlptLevel: "N5",
  },
  {
    id: "word-ichiban",
    type: "vocabulary",
    writtenForm: "一番",
    reading: "いちばん",
    meaningsRu: ["самый", "больше всего", "номер один"],
    partOfSpeech: ["наречие", "существительное"],
    jlptLevel: "N5",
  },
];

export const lesson016Grammar: GrammarPoint[] = [
  {
    id: "grammar-yori-houga",
    type: "grammar",
    title: "Сравнение AよりBのほうが",
    meaningRu: "сообщает, что B обладает признаком сильнее, чем A",
    explanationRu:
      "В модели AよりBのほうが～です объект после より служит точкой сравнения, а Bのほうが — выбранной стороной: 猫より犬のほうが大きいです — «Собаки крупнее кошек».",
    formation: ["A より B のほうが [прилагательное] です"],
    cautions: [
      "Не перепутай направление: AよりBのほうが означает, что именно B сильнее проявляет признак.",
      "В разговоре のほう иногда опускают, но полная модель яснее для начала."
    ],
    relatedGrammarIds: ["grammar-i-adjective-predicate", "grammar-na-adjective-predicate"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-dochira-comparison",
    type: "grammar",
    title: "Вопрос AとBとどちらが",
    meaningRu: "спрашивает, какой из двух вариантов больше подходит",
    explanationRu:
      "Чтобы сравнить два варианта вопросом, используют AとBとどちらが～ですか. Также естественна модель AとBではどちらが～ですか. Ответ часто строится как Aのほうが～です: 夏と冬とどちらが好きですか。冬のほうが好きです.",
    formation: [
      "A と B と どちらが [прилагательное] ですか",
      "A と B では どちらが [прилагательное] ですか",
      "A のほうが [прилагательное] です"
    ],
    cautions: ["どちら используется для выбора из двух. Для трёх и более вариантов нужна другая модель."],
    relatedGrammarIds: ["grammar-ka-question", "grammar-yori-houga"],
    jlptLevel: "N5",
  },
  {
    id: "grammar-ichiban-superlative",
    type: "grammar",
    title: "Лучший вариант внутри группы: ～では一番",
    meaningRu: "выделяет самый сильный вариант внутри названной группы",
    explanationRu:
      "Группу удобно задать через では, выбранный элемент отметить が, а перед признаком поставить 一番: 季節では春が一番好きです — «Из времён года больше всего люблю весну». Более развёрнутый вариант — 季節の中では春が一番好きです.",
    formation: ["[группа] では [элемент] が 一番 [прилагательное] です"],
    cautions: [
      "一番 само по себе не заменяет прилагательное: после него нужно 好き, 大きい, きれい и т. п.",
      "Вопрос о лучшем варианте обычно использует 何／どれ／どこ в зависимости от группы."
    ],
    relatedGrammarIds: ["grammar-suki-kirai-ga"],
    jlptLevel: "N5",
  },
];

export const lesson016Sentences: ExampleSentence[] = [
  {
    id: "sentence-neko-yori-inu-ookii",
    type: "sentence",
    japanese: "猫より犬のほうが大きいです。",
    reading: "ねこよりいぬのほうがおおきいです。",
    translationRu: "Собаки крупнее кошек.",
    grammarIds: ["grammar-yori-houga", "grammar-i-adjective-predicate"],
    vocabularyIds: ["word-neko", "word-inu", "word-ookii"],
  },
  {
    id: "sentence-haru-yori-natsu-atsui",
    type: "sentence",
    japanese: "春より夏のほうが暑いです。",
    reading: "はるよりなつのほうがあついです。",
    translationRu: "Летом жарче, чем весной.",
    grammarIds: ["grammar-yori-houga", "grammar-i-adjective-predicate"],
    vocabularyIds: ["word-haru", "word-natsu", "word-atsui"],
  },
  {
    id: "sentence-natsu-fuyu-dochira-suki",
    type: "sentence",
    japanese: "夏と冬とどちらが好きですか。",
    reading: "なつとふゆとどちらがすきですか。",
    translationRu: "Что вам нравится больше: лето или зима?",
    grammarIds: ["grammar-dochira-comparison", "grammar-ka-question", "grammar-suki-kirai-ga"],
    vocabularyIds: ["word-natsu", "word-fuyu", "word-dochira", "word-suki-na"],
  },
  {
    id: "sentence-fuyu-houga-suki",
    type: "sentence",
    japanese: "冬のほうが好きです。",
    reading: "ふゆのほうがすきです。",
    translationRu: "Мне больше нравится зима.",
    grammarIds: ["grammar-dochira-comparison", "grammar-suki-kirai-ga"],
    vocabularyIds: ["word-fuyu", "word-suki-na"],
  },
  {
    id: "sentence-kisetsu-haru-ichiban-suki",
    type: "sentence",
    japanese: "季節では春が一番好きです。",
    reading: "きせつでははるがいちばんすきです。",
    translationRu: "Из времён года больше всего мне нравится весна.",
    grammarIds: ["grammar-ichiban-superlative", "grammar-suki-kirai-ga"],
    vocabularyIds: ["word-kisetsu", "word-haru", "word-ichiban", "word-suki-na"],
  },
];

export const lesson016Exercises: Exercise[] = [
  {
    id: "exercise-yori-direction-choice",
    type: "multiple-choice",
    prompt: "Что означает 猫より犬のほうが大きいです?",
    targetItemIds: ["grammar-yori-houga", "word-neko", "word-inu", "word-ookii"],
    correctAnswers: ["Собаки крупнее кошек"],
    distractors: ["Кошки крупнее собак", "Кошки и собаки одинакового размера", "Собаки не крупные"],
    explanationRu: "После より стоит точка сравнения 猫, а 犬のほうが — более крупная сторона.",
  },
  {
    id: "exercise-dochira-question-choice",
    type: "multiple-choice",
    prompt: "Выбери правильный вопрос «Что нравится больше: лето или зима?»",
    targetItemIds: ["grammar-dochira-comparison", "word-natsu", "word-fuyu", "word-dochira", "word-suki-na"],
    correctAnswers: ["夏と冬とどちらが好きですか"],
    acceptableAnswers: ["夏と冬ではどちらが好きですか"],
    distractors: ["夏より冬と好きですか", "夏と冬がどちらを好きですか", "夏のほうが冬ですか"],
    explanationRu: "Выбор из двух строится как AとBとどちらが～ですか; вариант AとBではどちらが～ですか тоже естественен.",
  },
  {
    id: "exercise-ichiban-choice",
    type: "multiple-choice",
    prompt: "Как сказать «Из времён года больше всего люблю весну»?",
    targetItemIds: ["grammar-ichiban-superlative", "word-kisetsu", "word-haru", "word-ichiban", "word-suki-na"],
    correctAnswers: ["季節では春が一番好きです"],
    acceptableAnswers: ["季節の中では春が一番好きです"],
    distractors: ["季節に春を一番好きです", "春より季節が好きです", "季節は春のほうです"],
    explanationRu: "Группа задаётся через 季節では, выбранный элемент — 春が, степень — 一番.",
  },
  {
    id: "exercise-neko-inu-builder",
    type: "sentence-builder",
    prompt: "Собери: Собаки крупнее кошек.",
    targetItemIds: ["grammar-yori-houga", "word-neko", "word-inu", "word-ookii"],
    correctAnswers: ["猫|より|犬|のほうが|大きい|です"],
    distractors: ["を", "小さい", "と"],
    explanationRu: "猫 — точка сравнения с より, 犬のほうが — более крупная сторона.",
  },
  {
    id: "exercise-haru-natsu-input",
    type: "text-input",
    prompt: "Напиши по-японски: Летом жарче, чем весной.",
    targetItemIds: ["grammar-yori-houga", "word-haru", "word-natsu", "word-atsui"],
    correctAnswers: ["春より夏のほうが暑いです", "春より夏のほうが暑いです。"],
    acceptableAnswers: [
      "はるよりなつのほうがあついです",
      "はるよりなつのほうがあついです。",
      "夏は春より暑いです",
      "夏は春より暑いです。",
      "なつははるよりあついです",
      "なつははるよりあついです。"
    ],
    explanationRu: "Основная учебная модель — 春より夏のほうが暑いです. Естественная более короткая модель 夏は春より暑いです тоже принимается.",
  },
  {
    id: "exercise-natsu-fuyu-question-input",
    type: "text-input",
    prompt: "Напиши по-японски: Что вам нравится больше — лето или зима?",
    targetItemIds: ["grammar-dochira-comparison", "word-natsu", "word-fuyu", "word-dochira", "word-suki-na"],
    correctAnswers: ["夏と冬とどちらが好きですか", "夏と冬とどちらが好きですか。"],
    acceptableAnswers: [
      "なつとふゆとどちらがすきですか",
      "なつとふゆとどちらがすきですか。",
      "夏と冬ではどちらが好きですか",
      "夏と冬ではどちらが好きですか。",
      "なつとふゆではどちらがすきですか",
      "なつとふゆではどちらがすきですか。"
    ],
    explanationRu: "Основная схема — AとBとどちらが. Вариант AとBではどちらが тоже принимается.",
  },
  {
    id: "exercise-fuyu-houga-input",
    type: "text-input",
    prompt: "Ответь по-японски: Мне больше нравится зима.",
    targetItemIds: ["grammar-dochira-comparison", "word-fuyu", "word-suki-na"],
    correctAnswers: ["冬のほうが好きです", "冬のほうが好きです。"],
    acceptableAnswers: ["ふゆのほうがすきです", "ふゆのほうがすきです。"],
    explanationRu: "Выбранный вариант оформляется как 冬のほうが好きです.",
  },
  {
    id: "exercise-kisetsu-ichiban-input",
    type: "text-input",
    prompt: "Напиши по-японски: Из времён года больше всего мне нравится весна.",
    targetItemIds: ["grammar-ichiban-superlative", "word-kisetsu", "word-haru", "word-ichiban", "word-suki-na"],
    correctAnswers: ["季節では春が一番好きです", "季節では春が一番好きです。"],
    acceptableAnswers: [
      "きせつでははるがいちばんすきです",
      "きせつでははるがいちばんすきです。",
      "季節の中では春が一番好きです",
      "季節の中では春が一番好きです。"
    ],
    explanationRu: "Основной вариант: 季節では + 春が + 一番好きです. Развёрнуто можно сказать 季節の中では春が一番好きです.",
  },
];

export const lesson016: Lesson = {
  id: "lesson-016",
  unitId: "unit-005",
  order: 16,
  title: "Что нравится больше?",
  description: "Сравнение двух вариантов и выбор самого предпочтительного через より／ほうが／一番.",
  theory: lesson016Grammar.map((grammar) => grammar.explanationRu),
  itemIds: [
    ...lesson016Vocabulary.map((item) => item.id),
    ...lesson016Grammar.map((item) => item.id),
    ...lesson016Sentences.map((item) => item.id),
  ],
  exerciseIds: lesson016Exercises.map((exercise) => exercise.id),
  estimatedMinutes: 24,
};

export const lesson016Bundle: LessonBundle = {
  lesson: lesson016,
  vocabulary: lesson016Vocabulary,
  grammar: lesson016Grammar,
  sentences: lesson016Sentences,
  exercises: lesson016Exercises,
  outcomes: [
    "сравнивать два объекта через AよりBのほうが",
    "задавать вопрос выбора из двух через どちらが",
    "отвечать моделью ～のほうが",
    "выделять лучший вариант внутри группы через ～では一番",
  ],
};
