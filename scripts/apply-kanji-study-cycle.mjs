import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const write = (path, content) => fs.writeFileSync(path, content);

const replaceOnce = (path, before, after) => {
  const source = read(path);
  if (source.includes(after)) return;
  if (!source.includes(before)) {
    throw new Error(`Anchor not found in ${path}: ${before.slice(0, 120)}`);
  }
  write(path, source.replace(before, after));
};

const writeGenerated = (path, content) => {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  write(path, content.trimStart());
};

writeGenerated(
  "src/engine/kanjiStudySession.ts",
  String.raw`
import type { Exercise, KanjiItem } from "../domain/course";
import { checkAnswer, type AnswerStatus } from "./checkAnswer";

export type KanjiStudyQuestionKind =
  | "meaning"
  | "reading-guided"
  | "reading-recall";

export interface KanjiStudyQuestion {
  id: string;
  kind: KanjiStudyQuestionKind;
  title: string;
  prompt: string;
  exercise: Exercise;
  choices: string[];
  recordResult: boolean;
}

export interface KanjiStudyResult {
  questionId: string;
  exercise: Exercise;
  answer: string;
  status: AnswerStatus;
}

const unique = (values: readonly string[]): string[] => [
  ...new Set(values.filter((value) => value.trim().length > 0)),
];

const stableHash = (value: string): number => {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const rotate = <T>(values: readonly T[], offset: number): T[] => {
  if (values.length === 0) return [];
  const normalized = offset % values.length;
  return [...values.slice(normalized), ...values.slice(0, normalized)];
};

const orderedChoices = (
  correct: string,
  distractors: readonly string[],
  seed: string,
): string[] => {
  const values = unique([correct, ...distractors]).slice(0, 4);
  return rotate(values, stableHash(seed) % Math.max(values.length, 1));
};

const findExercise = (
  item: KanjiItem,
  exercises: readonly Exercise[],
  skill: "recognition" | "reading",
  preferredType?: Exercise["type"],
): Exercise | undefined => {
  const candidates = exercises.filter(
    (exercise) =>
      exercise.targetItemIds.includes(item.id) && exercise.skill === skill,
  );
  return (
    candidates.find((exercise) => exercise.type === preferredType) ?? candidates[0]
  );
};

const fallbackMeaningExercise = (
  item: KanjiItem,
  catalog: readonly KanjiItem[],
): Exercise => ({
  id: `${item.introducedInLessonId}-kanji-${item.literal}-recognition`,
  type: "multiple-choice",
  prompt: `Что означает кандзи ${item.literal}?`,
  targetItemIds: [item.id],
  correctAnswers: [item.meaningsRu[0] ?? item.literal],
  distractors: unique(
    catalog
      .filter((candidate) => candidate.id !== item.id)
      .map((candidate) => candidate.meaningsRu[0] ?? candidate.literal),
  ).slice(0, 3),
  explanationRu: `${item.literal} — ${item.meaningsRu.join(", ")}.`,
  contentKey: `kanji:${item.literal}:recognition`,
  skill: "recognition",
});

const fallbackReadingExercise = (
  item: KanjiItem,
  catalog: readonly KanjiItem[],
): Exercise => {
  const example = item.examples[0];
  const correct = example?.kanjiReading ?? example?.reading ?? item.literal;
  return {
    id: `${item.introducedInLessonId}-kanji-${item.literal}-reading`,
    type: "text-input",
    prompt: example
      ? `Как читается ${item.literal} в слове ${example.written}（${example.reading}）?`
      : `Введи чтение кандзи ${item.literal}.`,
    targetItemIds: [item.id],
    correctAnswers: [correct],
    distractors: unique(
      catalog
        .filter((candidate) => candidate.id !== item.id)
        .map((candidate) => candidate.examples[0]?.kanjiReading ?? ""),
    ).slice(0, 3),
    explanationRu: example
      ? `В слове ${example.written} знак ${item.literal} читается ${correct}.`
      : `${item.literal} читается ${correct}.`,
    contentKey: `kanji:${item.literal}:reading`,
    skill: "reading",
  };
};

export const buildKanjiStudyQuestions = (
  item: KanjiItem,
  exercises: readonly Exercise[],
  catalog: readonly KanjiItem[],
): KanjiStudyQuestion[] => {
  const meaningExercise =
    findExercise(item, exercises, "recognition", "multiple-choice") ??
    fallbackMeaningExercise(item, catalog);
  const readingExercise =
    findExercise(item, exercises, "reading", "text-input") ??
    fallbackReadingExercise(item, catalog);
  const meaningAnswer = meaningExercise.correctAnswers[0] ?? item.meaningsRu[0] ?? item.literal;
  const readingAnswer =
    readingExercise.correctAnswers[0] ??
    item.examples[0]?.kanjiReading ??
    item.literal;
  const readingDistractors = unique([
    ...(readingExercise.distractors ?? []),
    ...catalog
      .filter((candidate) => candidate.id !== item.id)
      .map((candidate) => candidate.examples[0]?.kanjiReading ?? ""),
  ]).filter((value) => value !== readingAnswer);

  return [
    {
      id: `${item.id}:meaning`,
      kind: "meaning",
      title: "1. Узнай значение",
      prompt: meaningExercise.prompt,
      exercise: meaningExercise,
      choices: orderedChoices(
        meaningAnswer,
        meaningExercise.distractors ?? [],
        `${item.id}:meaning`,
      ),
      recordResult: true,
    },
    {
      id: `${item.id}:reading-guided`,
      kind: "reading-guided",
      title: "2. Найди чтение в слове",
      prompt: readingExercise.prompt,
      exercise: {
        ...readingExercise,
        id: `${readingExercise.id}-guided`,
        type: "multiple-choice",
        distractors: readingDistractors.slice(0, 3),
      },
      choices: orderedChoices(
        readingAnswer,
        readingDistractors,
        `${item.id}:reading-guided`,
      ),
      recordResult: false,
    },
    {
      id: `${item.id}:reading-recall`,
      kind: "reading-recall",
      title: "3. Вспомни чтение сам",
      prompt: readingExercise.prompt,
      exercise: readingExercise,
      choices: [],
      recordResult: true,
    },
  ];
};

export const checkKanjiStudyAnswer = (
  question: KanjiStudyQuestion,
  answer: string,
): AnswerStatus =>
  checkAnswer(
    answer,
    question.exercise.correctAnswers,
    question.exercise.acceptableAnswers,
  ).status;
`,
);

writeGenerated(
  "src/engine/kanjiStudySession.test.ts",
  String.raw`
import assert from "node:assert/strict";
import test from "node:test";

import { n5KanjiCatalog } from "../content/kanjiCatalog";
import { buildKanjiReviewExercises } from "../content/kanjiCurriculum";
import {
  buildKanjiStudyQuestions,
  checkKanjiStudyAnswer,
} from "./kanjiStudySession";

const person = n5KanjiCatalog.find((item) => item.literal === "人");
if (!person) throw new Error("Test kanji 人 is missing");
const exercises = buildKanjiReviewExercises(person.introducedInLessonId, [person]);

test("builds a complete meaning-to-reading study sequence", () => {
  const questions = buildKanjiStudyQuestions(person, exercises, n5KanjiCatalog);
  assert.deepEqual(
    questions.map((question) => question.kind),
    ["meaning", "reading-guided", "reading-recall"],
  );
  assert.equal(questions[0]?.recordResult, true);
  assert.equal(questions[1]?.recordResult, false);
  assert.equal(questions[2]?.recordResult, true);
  assert.equal(questions[0]?.exercise.skill, "recognition");
  assert.equal(questions[2]?.exercise.skill, "reading");
});

test("keeps correct answers among unique choices without pinning every answer first", () => {
  const firstItems = n5KanjiCatalog.slice(0, 12);
  const answerIndexes = firstItems.map((item) => {
    const lessonExercises = buildKanjiReviewExercises(item.introducedInLessonId, [item]);
    const question = buildKanjiStudyQuestions(item, lessonExercises, n5KanjiCatalog)[0];
    const answer = question?.exercise.correctAnswers[0];
    assert.ok(question && answer);
    assert.equal(new Set(question.choices).size, question.choices.length);
    return question.choices.indexOf(answer);
  });
  assert.ok(answerIndexes.some((index) => index > 0));
  assert.ok(new Set(answerIndexes).size > 1);
});

test("checks meaning and contextual reading through the normal answer engine", () => {
  const questions = buildKanjiStudyQuestions(person, exercises, n5KanjiCatalog);
  assert.equal(checkKanjiStudyAnswer(questions[0]!, "человек"), "correct");
  assert.equal(checkKanjiStudyAnswer(questions[0]!, "страна"), "incorrect");
  assert.equal(checkKanjiStudyAnswer(questions[2]!, "じん"), "correct");
});
`,
);

writeGenerated(
  "src/components/KanjiStudyPanel.tsx",
  String.raw`
import { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { Exercise, KanjiItem } from "../domain/course";
import type { KanjiProgressSummary } from "../engine/kanjiProgress";
import {
  buildKanjiStudyQuestions,
  checkKanjiStudyAnswer,
  type KanjiStudyResult,
} from "../engine/kanjiStudySession";

interface KanjiStudyPanelProps {
  item: KanjiItem;
  catalog: readonly KanjiItem[];
  exercises: readonly Exercise[];
  progress: KanjiProgressSummary;
  strokeCount: number | null;
  onRecord: (result: KanjiStudyResult) => void;
}

const statusMessage = (correct: boolean): string =>
  correct
    ? "Верно. Связь записана в интервальное повторение."
    : "Пока нет. Посмотри объяснение: это знание вернётся в ближайшее повторение.";

export function KanjiStudyPanel({
  item,
  catalog,
  exercises,
  progress,
  strokeCount,
  onRecord,
}: KanjiStudyPanelProps) {
  const questions = useMemo(
    () => buildKanjiStudyQuestions(item, exercises, catalog),
    [catalog, exercises, item],
  );
  const [phase, setPhase] = useState(-1);
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"correct" | "acceptable" | "incorrect" | null>(null);
  const question = phase >= 0 ? questions[phase] : undefined;
  const complete = phase >= questions.length;
  const example = item.examples[0];

  const resetAnswer = () => {
    setAnswer("");
    setStatus(null);
  };

  const submit = (value: string) => {
    if (!question || status || value.trim().length === 0) return;
    const nextStatus = checkKanjiStudyAnswer(question, value);
    setAnswer(value);
    setStatus(nextStatus);
    if (question.recordResult) {
      onRecord({
        questionId: question.id,
        exercise: question.exercise,
        answer: value,
        status: nextStatus,
      });
    }
  };

  if (phase < 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.glyphBox}>
            <Text style={styles.glyph}>{item.literal}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Первое изучение</Text>
            <Text style={styles.title}>Свяжи знак со знакомым словом</Text>
            <Text style={styles.meta}>
              {strokeCount ? `${strokeCount} черт · ` : ""}значение {progress.meaning.mastery}% · чтение {progress.reading.mastery}%
            </Text>
          </View>
        </View>

        <View style={styles.memoryCard}>
          <Text style={styles.memoryLabel}>Образ</Text>
          <Text style={styles.memoryText}>
            {item.literal} — {item.meaningsRu.join(", ")}. Сначала запомни общий образ,
            затем закрепи конкретное чтение только внутри слова.
          </Text>
        </View>

        {example && (
          <View style={styles.wordCard}>
            <Text style={styles.word}>{example.written}</Text>
            <Text style={styles.reading}>{example.reading}</Text>
            <Text style={styles.meaning}>{example.meaningRu}</Text>
            <Text style={styles.focus}>
              В этом слове {item.literal} читается {example.kanjiReading}.
            </Text>
          </View>
        )}

        <Text style={styles.note}>
          Цикл короткий: узнавание значения → подсказанное чтение → чтение без вариантов.
          После него переходи к письму ниже.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setPhase(0)}>
          <Text style={styles.primaryButtonText}>
            {progress.meaning.attempts + progress.reading.attempts > 0
              ? "Повторить значение и чтение"
              : "Начать изучение"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (complete) {
    return (
      <View style={[styles.card, styles.completeCard]}>
        <Text style={styles.eyebrow}>Этап завершён</Text>
        <Text style={styles.title}>Значение и чтение записаны</Text>
        <Text style={styles.note}>
          Теперь напиши {item.literal} в тренажёре ниже. Все три навыка хранятся раздельно,
          поэтому знакомое значение не маскирует слабое письмо или чтение.
        </Text>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            setPhase(-1);
            resetAnswer();
          }}
        >
          <Text style={styles.secondaryButtonText}>Пройти цикл ещё раз</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!question) return null;
  const successful = status === "correct" || status === "acceptable";

  return (
    <View style={styles.card}>
      <View style={styles.stepHeader}>
        <Text style={styles.eyebrow}>{question.title}</Text>
        <Text style={styles.stepCounter}>{phase + 1}/{questions.length}</Text>
      </View>
      <Text style={styles.question}>{question.prompt}</Text>

      {question.choices.length > 0 ? (
        <View style={styles.choices}>
          {question.choices.map((choice) => {
            const selected = answer === choice;
            return (
              <TouchableOpacity
                key={choice}
                disabled={Boolean(status)}
                style={[
                  styles.choice,
                  selected && (successful ? styles.choiceCorrect : styles.choiceIncorrect),
                ]}
                onPress={() => submit(choice)}
              >
                <Text style={styles.choiceText}>{choice}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.inputGroup}>
          <TextInput
            value={answer}
            editable={!status}
            onChangeText={setAnswer}
            onSubmitEditing={() => submit(answer)}
            placeholder="Введи чтение хираганой"
            placeholderTextColor="#7b8794"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          {!status && (
            <TouchableOpacity
              style={[styles.primaryButton, answer.trim().length === 0 && styles.disabled]}
              disabled={answer.trim().length === 0}
              onPress={() => submit(answer)}
            >
              <Text style={styles.primaryButtonText}>Проверить</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {status && (
        <View style={[styles.feedback, successful ? styles.feedbackCorrect : styles.feedbackIncorrect]}>
          <Text style={styles.feedbackTitle}>{statusMessage(successful)}</Text>
          <Text style={styles.feedbackBody}>{question.exercise.explanationRu}</Text>
          {!question.recordResult && (
            <Text style={styles.guidedNote}>
              Это была подсказанная ступень: в SRS попадёт следующий ответ без вариантов.
            </Text>
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setPhase((current) => current + 1);
              resetAnswer();
            }}
          >
            <Text style={styles.primaryButtonText}>
              {phase + 1 >= questions.length ? "Перейти к письму" : "Дальше"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#cbd9e3",
    borderRadius: 20,
    backgroundColor: "#f8fbfd",
  },
  completeCard: { borderColor: "#9bc9ae", backgroundColor: "#f0faf4" },
  header: { flexDirection: "row", alignItems: "center", gap: 14 },
  glyphBox: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#e7eef5",
  },
  glyph: { color: "#15202b", fontSize: 48, fontWeight: "500" },
  headerText: { flex: 1, gap: 4 },
  eyebrow: { color: "#31546f", fontSize: 12, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  title: { color: "#15202b", fontSize: 20, lineHeight: 26, fontWeight: "900" },
  meta: { color: "#66788a", fontSize: 13, lineHeight: 18 },
  memoryCard: { gap: 4, padding: 13, borderRadius: 15, backgroundColor: "#fff4d8" },
  memoryLabel: { color: "#7a4f00", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  memoryText: { color: "#59420f", fontSize: 14, lineHeight: 21 },
  wordCard: { gap: 2, padding: 14, borderRadius: 16, backgroundColor: "#ffffff" },
  word: { color: "#15202b", fontSize: 25, fontWeight: "900" },
  reading: { color: "#31546f", fontSize: 16 },
  meaning: { color: "#66788a", fontSize: 14 },
  focus: { marginTop: 5, color: "#183153", fontSize: 14, lineHeight: 20, fontWeight: "800" },
  note: { color: "#52606d", fontSize: 14, lineHeight: 21 },
  primaryButton: { alignItems: "center", paddingVertical: 13, paddingHorizontal: 16, borderRadius: 14, backgroundColor: "#183153" },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  secondaryButton: { alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: "#9eb0bf", borderRadius: 14, backgroundColor: "#ffffff" },
  secondaryButtonText: { color: "#183153", fontSize: 14, fontWeight: "800" },
  stepHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  stepCounter: { color: "#66788a", fontSize: 13, fontWeight: "800" },
  question: { color: "#15202b", fontSize: 18, lineHeight: 25, fontWeight: "800" },
  choices: { gap: 9 },
  choice: { paddingVertical: 13, paddingHorizontal: 14, borderWidth: 1, borderColor: "#c7d3dd", borderRadius: 14, backgroundColor: "#ffffff" },
  choiceCorrect: { borderColor: "#3e9b6a", backgroundColor: "#e7f7ee" },
  choiceIncorrect: { borderColor: "#c85454", backgroundColor: "#fdecec" },
  choiceText: { color: "#15202b", fontSize: 16, fontWeight: "700" },
  inputGroup: { gap: 10 },
  input: { paddingVertical: 13, paddingHorizontal: 14, borderWidth: 1, borderColor: "#c7d3dd", borderRadius: 14, backgroundColor: "#ffffff", color: "#15202b", fontSize: 17 },
  disabled: { opacity: 0.45 },
  feedback: { gap: 9, padding: 13, borderRadius: 15 },
  feedbackCorrect: { backgroundColor: "#e7f7ee" },
  feedbackIncorrect: { backgroundColor: "#fdecec" },
  feedbackTitle: { color: "#15202b", fontSize: 14, lineHeight: 20, fontWeight: "900" },
  feedbackBody: { color: "#52606d", fontSize: 14, lineHeight: 21 },
  guidedNote: { color: "#31546f", fontSize: 13, lineHeight: 19, fontWeight: "700" },
});
`,
);

replaceOnce(
  "AppRoot.tsx",
  'import type { SkritterWritingResult } from "./src/components/SkritterWritingPad";\n',
  'import type { SkritterWritingResult } from "./src/components/SkritterWritingPad";\nimport type { KanjiStudyResult } from "./src/engine/kanjiStudySession";\n',
);
replaceOnce(
  "AppRoot.tsx",
  '  lessonBundles.map((bundle) => [bundle.lesson.id, bundle.exercises]),\n',
  '  lessonBundles.map((bundle) => [\n    bundle.lesson.id,\n    bundle.reviewExercises ?? bundle.exercises,\n  ]),\n',
);
replaceOnce(
  "AppRoot.tsx",
  '          lessonBundles.flatMap((bundle) => bundle.exercises.map((exercise) => exercise.id)),\n',
  '          lessonBundles.flatMap((bundle) =>\n            (bundle.reviewExercises ?? bundle.exercises).map((exercise) => exercise.id),\n          ),\n',
);
replaceOnce(
  "AppRoot.tsx",
  '  const sentenceBuilderTokens = useMemo(() => {\n',
  `  const recordKanjiStudy = (item: KanjiItem, study: KanjiStudyResult) => {\n    const now = new Date();\n    const skill = inferExerciseSkill(study.exercise);\n\n    setReviewItems((previous) => {\n      const key = reviewItemKey({ itemId: item.id, skill });\n      const existing = previous.find((entry) => reviewItemKey(entry) === key);\n      return upsertReviewItem(\n        previous,\n        scheduleItemReview(\n          existing,\n          item.id,\n          skill,\n          study.exercise,\n          item.introducedInLessonId,\n          study.status,\n          now,\n        ),\n      );\n    });\n    setAttemptHistory((previous) => [\n      createAttemptLogEntry(\n        study.exercise,\n        item.introducedInLessonId,\n        study.status,\n        "practice",\n        now,\n      ),\n      ...previous,\n    ].slice(0, 200));\n  };\n\n  const sentenceBuilderTokens = useMemo(() => {\n`,
);
replaceOnce(
  "AppRoot.tsx",
  '        onRecordKanjiWriting={recordKanjiWriting}\n',
  '        onRecordKanjiWriting={recordKanjiWriting}\n        onRecordKanjiStudy={recordKanjiStudy}\n',
);

replaceOnce(
  "src/screens/CourseScreen.tsx",
  'import type { KanjiItem } from "../domain/course";\n',
  'import type { KanjiItem } from "../domain/course";\nimport type { KanjiStudyResult } from "../engine/kanjiStudySession";\n',
);
replaceOnce(
  "src/screens/CourseScreen.tsx",
  '  onRecordKanjiWriting: (item: KanjiItem, result: SkritterWritingResult) => void;\n',
  '  onRecordKanjiWriting: (item: KanjiItem, result: SkritterWritingResult) => void;\n  onRecordKanjiStudy: (item: KanjiItem, result: KanjiStudyResult) => void;\n',
);
replaceOnce(
  "src/screens/CourseScreen.tsx",
  '  onRecordKanjiWriting,\n}: CourseScreenProps) {\n',
  '  onRecordKanjiWriting,\n  onRecordKanjiStudy,\n}: CourseScreenProps) {\n',
);
replaceOnce(
  "src/screens/CourseScreen.tsx",
  '        onRecordWriting={onRecordKanjiWriting}\n',
  '        onRecordWriting={onRecordKanjiWriting}\n        onRecordStudy={onRecordKanjiStudy}\n',
);
replaceOnce(
  "src/screens/CourseScreen.tsx",
  '            103 знака: значение, чтение в слове, порядок черт, автоматическая\n            проверка письма и отдельная SRS-очередь навыка.\n',
  '            103 знака: первое знакомство через знакомое слово, значение, чтение\n            без вариантов, порядок черт и раздельная SRS каждого навыка.\n',
);

replaceOnce(
  "src/screens/KanjiScreen.tsx",
  'import { KanjiWritingPanel } from "../components/KanjiWritingPanel";\n',
  'import { KanjiStudyPanel } from "../components/KanjiStudyPanel";\nimport { KanjiWritingPanel } from "../components/KanjiWritingPanel";\n',
);
replaceOnce(
  "src/screens/KanjiScreen.tsx",
  'import { n5KanjiCatalog } from "../content/kanjiCatalog";\n',
  'import { n5KanjiCatalog } from "../content/kanjiCatalog";\nimport { kanjiStrokeDataByLiteral } from "../content/kanjiStrokeData";\n',
);
replaceOnce(
  "src/screens/KanjiScreen.tsx",
  'import type { ReviewItem } from "../engine/reviewEngine";\n',
  'import type { KanjiStudyResult } from "../engine/kanjiStudySession";\nimport type { ReviewItem } from "../engine/reviewEngine";\n',
);
replaceOnce(
  "src/screens/KanjiScreen.tsx",
  '  onRecordWriting: (item: KanjiItem, result: SkritterWritingResult) => void;\n',
  '  onRecordWriting: (item: KanjiItem, result: SkritterWritingResult) => void;\n  onRecordStudy: (item: KanjiItem, result: KanjiStudyResult) => void;\n',
);
replaceOnce(
  "src/screens/KanjiScreen.tsx",
  '  onRecordWriting,\n}: KanjiScreenProps) {\n',
  '  onRecordWriting,\n  onRecordStudy,\n}: KanjiScreenProps) {\n',
);
replaceOnce(
  "src/screens/KanjiScreen.tsx",
  '  const selectedWritingReviewItem = selectedEntry\n',
  '  const selectedLessonBundle = selectedEntry\n    ? lessonBundles.find(\n        (bundle) => bundle.lesson.id === selectedEntry.item.introducedInLessonId,\n      )\n    : undefined;\n  const selectedStudyExercises =\n    selectedLessonBundle?.reviewExercises ?? selectedLessonBundle?.exercises ?? [];\n  const selectedWritingReviewItem = selectedEntry\n',
);
replaceOnce(
  "src/screens/KanjiScreen.tsx",
  '          103 знака идут вместе с курсом. Чтения учатся в словах, а письмо теперь\n          использует обучение, прилипание штрихов, письмо по памяти и четыре оценки SRS.\n',
  '          103 знака идут вместе с курсом: сначала знакомое слово и значение, затем\n          чтение с опорой и без вариантов, после этого письмо и раздельное повторение.\n',
);
replaceOnce(
  "src/screens/KanjiScreen.tsx",
  '            <SkillCard\n              title="Значение"\n',
  '            <KanjiStudyPanel\n              key={`study-${selectedEntry.item.id}`}\n              item={selectedEntry.item}\n              catalog={n5KanjiCatalog}\n              exercises={selectedStudyExercises}\n              progress={selectedEntry.progress}\n              strokeCount={\n                kanjiStrokeDataByLiteral[selectedEntry.item.literal]?.strokes.length ?? null\n              }\n              onRecord={(study: KanjiStudyResult) =>\n                onRecordStudy(selectedEntry.item, study)\n              }\n            />\n\n            <SkillCard\n              title="Значение"\n',
);

const packageJson = JSON.parse(read("package.json"));
packageJson.version = "0.22.0";
packageJson.scripts["test:kanji-study"] = "tsx --test src/engine/kanjiStudySession.test.ts";
packageJson.scripts.test = packageJson.scripts.test.replace(
  "npm run test:kanji-progress &&",
  "npm run test:kanji-progress && npm run test:kanji-study &&",
);
write("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);

const appJson = JSON.parse(read("app.json"));
appJson.expo.version = "0.22.0";
appJson.expo.android.versionCode = 43;
write("app.json", `${JSON.stringify(appJson, null, 2)}\n`);

console.log("Kanji study cycle 0.22.0 applied.");
