import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const write = (path, content) => fs.writeFileSync(path, content);

const replaceOnce = (path, before, after) => {
  const source = read(path);
  if (!source.includes(before)) {
    throw new Error(`Expected fragment not found in ${path}: ${before.slice(0, 100)}`);
  }
  write(path, source.replace(before, after));
};

const replaceRegex = (path, pattern, replacement) => {
  const source = read(path);
  if (!pattern.test(source)) {
    throw new Error(`Expected pattern not found in ${path}: ${pattern}`);
  }
  write(path, source.replace(pattern, replacement));
};

replaceOnce("package.json", '"version": "0.21.0"', '"version": "0.21.1"');
replaceOnce("app.json", '"version": "0.21.0"', '"version": "0.21.1"');
replaceOnce("app.json", '"versionCode": 41', '"versionCode": 42');

replaceOnce(
  "src/engine/writingSession.ts",
  `export const deriveAutomaticWritingGrade = (\n  metrics: WritingSessionMetrics,\n): WritingGrade => {\n  if (!metrics.completed || metrics.revealAll || metrics.hints >= 2) return 1;\n  if (failedEnoughForForgotten(metrics.strokeCount, metrics.mistakes)) return 1;\n  if (metrics.hints > 0 || metrics.mistakes > 0) return 2;\n  return 3;\n};`,
  `export const getMaximumWritingGrade = (\n  metrics: WritingSessionMetrics,\n): WritingGrade => {\n  if (!metrics.completed || metrics.revealAll || metrics.hints >= 2) return 1;\n  if (failedEnoughForForgotten(metrics.strokeCount, metrics.mistakes)) return 1;\n  if (\n    metrics.mode === "teach" ||\n    metrics.mode === "guided" ||\n    metrics.hints > 0 ||\n    metrics.mistakes > 0\n  ) {\n    return 2;\n  }\n  return 4;\n};\n\nexport const deriveAutomaticWritingGrade = (\n  metrics: WritingSessionMetrics,\n): WritingGrade => {\n  const maximum = getMaximumWritingGrade(metrics);\n  return maximum <= 2 ? maximum : 3;\n};`,
);

replaceOnce(
  "src/engine/writingSession.test.ts",
  `  deriveAutomaticWritingGrade,\n  getInitialWritingMode,`,
  `  deriveAutomaticWritingGrade,\n  getInitialWritingMode,\n  getMaximumWritingGrade,`,
);
replaceOnce(
  "src/engine/writingSession.test.ts",
  `test("a correction or single hint defaults to hard", () => {`,
  `test("guided and teaching modes never pass as unaided recall", () => {\n  assert.equal(deriveAutomaticWritingGrade({ ...baseMetrics, mode: "guided" }), 2);\n  assert.equal(deriveAutomaticWritingGrade({ ...baseMetrics, mode: "teach" }), 2);\n  assert.equal(getMaximumWritingGrade({ ...baseMetrics, mode: "guided" }), 2);\n});\n\ntest("manual grades are capped by revealed evidence", () => {\n  assert.equal(getMaximumWritingGrade(baseMetrics), 4);\n  assert.equal(getMaximumWritingGrade({ ...baseMetrics, mistakes: 1 }), 2);\n  assert.equal(getMaximumWritingGrade({ ...baseMetrics, hints: 1 }), 2);\n  assert.equal(getMaximumWritingGrade({ ...baseMetrics, revealAll: true }), 1);\n  assert.equal(getMaximumWritingGrade({ ...baseMetrics, hints: 2 }), 1);\n});\n\ntest("a correction or single hint defaults to hard", () => {`,
);

replaceOnce(
  "src/components/SkritterWritingPad.tsx",
  `  deriveAutomaticWritingGrade,\n  getWritingGradeDefinition,`,
  `  deriveAutomaticWritingGrade,\n  getMaximumWritingGrade,\n  getWritingGradeDefinition,`,
);
replaceOnce(
  "src/components/SkritterWritingPad.tsx",
  `  const [suggestedGrade, setSuggestedGrade] = useState<WritingGrade>(3);\n  const [submittedGrade, setSubmittedGrade] = useState<WritingGrade | null>(null);`,
  `  const [suggestedGrade, setSuggestedGrade] = useState<WritingGrade>(3);\n  const [maximumGrade, setMaximumGrade] = useState<WritingGrade>(4);\n  const [submittedGrade, setSubmittedGrade] = useState<WritingGrade | null>(null);`,
);
replaceOnce(
  "src/components/SkritterWritingPad.tsx",
  `      currentStrokeRef.current = [];\n      gradeSubmittedRef.current = false;`,
  `      currentStrokeRef.current = [];\n      gestureStartedAtRef.current = 0;\n      lastTapAtRef.current = 0;\n      gradeSubmittedRef.current = false;`,
);
replaceOnce(
  "src/components/SkritterWritingPad.tsx",
  `      setSuggestedGrade(3);\n      setSubmittedGrade(null);`,
  `      setSuggestedGrade(3);\n      setMaximumGrade(4);\n      setSubmittedGrade(null);`,
);
replaceOnce(
  "src/components/SkritterWritingPad.tsx",
  `      setSuggestedGrade(grade);\n      setFeedback(message);`,
  `      setSuggestedGrade(grade);\n      setMaximumGrade(grade <= 2 ? grade : 4);\n      setFeedback(message);`,
);
replaceOnce(
  "src/components/SkritterWritingPad.tsx",
  `      gradeSubmittedRef.current = true;\n      setSubmittedGrade(grade);\n      setAutoRemaining(null);\n      const definition = getWritingGradeDefinition(grade);\n      setFeedback(\`${definition.label}. Результат записан в повторение.\`);\n      onComplete({\n        grade,`,
  `      const safeGrade = Math.min(grade, maximumGrade) as WritingGrade;\n      gradeSubmittedRef.current = true;\n      setSubmittedGrade(safeGrade);\n      setAutoRemaining(null);\n      const definition = getWritingGradeDefinition(safeGrade);\n      setFeedback(\`${definition.label}. Результат записан в повторение.\`);\n      onComplete({\n        grade: safeGrade,`,
);
replaceOnce(
  "src/components/SkritterWritingPad.tsx",
  `    [attempts, disabled, hints, mistakes, mode, onComplete, revealedAll],`,
  `    [attempts, disabled, hints, maximumGrade, mistakes, mode, onComplete, revealedAll],`,
);
replaceOnce(
  "src/components/SkritterWritingPad.tsx",
  `        onPanResponderRelease: finishInput,\n        onPanResponderTerminate: finishInput,`,
  `        onPanResponderRelease: finishInput,\n        onPanResponderTerminate: () => {\n          currentStrokeRef.current = [];\n          setCurrentStroke([]);\n        },`,
);
replaceOnce(
  "src/components/SkritterWritingPad.tsx",
  `              onPress={() => setTeachingEnabled((previous) => !previous)}`,
  `              onPress={() =>\n                setTeachingEnabled((previous) => {\n                  const next = !previous;\n                  if (next && mode !== "teach") {\n                    setHints((current) => current + 1);\n                  }\n                  return next;\n                })\n              }`,
);
replaceOnce(
  "src/components/SkritterWritingPad.tsx",
  `                  disabled={disabled || submittedGrade !== null}\n                  style={[`,
  `                  disabled={\n                    disabled ||\n                    submittedGrade !== null ||\n                    definition.grade > maximumGrade\n                  }\n                  style={[`,
);
replaceOnce(
  "src/components/SkritterWritingPad.tsx",
  `                    (disabled || submittedGrade !== null) && styles.disabled,`,
  `                    (disabled ||\n                      submittedGrade !== null ||\n                      definition.grade > maximumGrade) &&\n                      styles.disabled,`,
);
replaceOnce(
  "src/components/SkritterWritingPad.tsx",
  `          {submittedGrade === null && (\n            <Text style={styles.gradingHelp}>\n              1–2 считаются ошибкой и возвращаются быстро; 3–4 продвигают интервал.\n            </Text>\n          )}`,
  `          {submittedGrade === null && (\n            <Text style={styles.gradingHelp}>\n              {maximumGrade < 4\n                ? \`Подсказки и ошибки ограничили оценку: максимум ${maximumGrade}/4.\`\n                : "1–2 считаются ошибкой и возвращаются быстро; 3–4 продвигают интервал."}\n            </Text>\n          )}`,
);

replaceOnce(
  "src/engine/lessonSession.ts",
  `import type { AnswerStatus } from "./checkAnswer";`,
  `import type { AnswerStatus } from "./checkAnswer";\nimport type { WritingGrade } from "./writingSession";`,
);
replaceOnce(
  "src/engine/lessonSession.ts",
  `export interface ExerciseAttempt {\n  exerciseId: string;\n  status: AnswerStatus;\n}`,
  `export interface ExerciseAttempt {\n  exerciseId: string;\n  status: AnswerStatus;\n  writingGrade?: WritingGrade;\n}`,
);

replaceOnce(
  "src/engine/lessonReview.ts",
  `import type { AnswerStatus } from "./checkAnswer";`,
  `import type { AnswerStatus } from "./checkAnswer";\nimport { scheduleWritingReview } from "./writingReview";\nimport type { WritingGrade } from "./writingSession";`,
);
replaceOnce(
  "src/engine/lessonReview.ts",
  `interface LessonReviewAttempt {\n  exerciseId: string;\n  status: AnswerStatus;\n}`,
  `interface LessonReviewAttempt {\n  exerciseId: string;\n  status: AnswerStatus;\n  writingGrade?: WritingGrade;\n}`,
);
replaceOnce(
  "src/engine/lessonReview.ts",
  `  status: AnswerStatus;\n}`,
  `  status: AnswerStatus;\n  writingGrade?: WritingGrade;\n}`,
);
replaceOnce(
  "src/engine/lessonReview.ts",
  `const worseStatus = (left: AnswerStatus, right: AnswerStatus): AnswerStatus =>\n  statusPriority[right] > statusPriority[left] ? right : left;`,
  `const worseStatus = (left: AnswerStatus, right: AnswerStatus): AnswerStatus =>\n  statusPriority[right] > statusPriority[left] ? right : left;\n\nconst worseWritingGrade = (\n  left: WritingGrade | undefined,\n  right: WritingGrade | undefined,\n): WritingGrade | undefined => {\n  if (left === undefined) return right;\n  if (right === undefined) return left;\n  return Math.min(left, right) as WritingGrade;\n};`,
);
replaceOnce(
  "src/engine/lessonReview.ts",
  `        sessionResults.set(key, { itemId, skill, exercise, status: attempt.status });`,
  `        sessionResults.set(key, {\n          itemId,\n          skill,\n          exercise,\n          status: attempt.status,\n          writingGrade: attempt.writingGrade,\n        });`,
);
replaceOnce(
  "src/engine/lessonReview.ts",
  `      const status = worseStatus(previous.status, attempt.status);\n      sessionResults.set(key, {\n        itemId,\n        skill,\n        exercise: status === attempt.status ? exercise : previous.exercise,\n        status,\n      });`,
  `      const status = worseStatus(previous.status, attempt.status);\n      const writingGrade = worseWritingGrade(\n        previous.writingGrade,\n        attempt.writingGrade,\n      );\n      const useCurrentExercise =\n        statusPriority[attempt.status] > statusPriority[previous.status] ||\n        (status === previous.status &&\n          attempt.writingGrade !== undefined &&\n          writingGrade === attempt.writingGrade);\n      sessionResults.set(key, {\n        itemId,\n        skill,\n        exercise: useCurrentExercise ? exercise : previous.exercise,\n        status,\n        writingGrade,\n      });`,
);
replaceOnce(
  "src/engine/lessonReview.ts",
  `    return upsertReviewItem(\n      currentItems,\n      scheduleItemReview(\n        existing,\n        target.itemId,\n        target.skill,\n        target.exercise,\n        lessonId,\n        target.status,\n        now,\n      ),\n    );`,
  `    const scheduled =\n      target.skill === "writing" && target.writingGrade !== undefined\n        ? scheduleWritingReview(\n            existing,\n            target.itemId,\n            target.exercise,\n            lessonId,\n            target.writingGrade,\n            now,\n          )\n        : scheduleItemReview(\n            existing,\n            target.itemId,\n            target.skill,\n            target.exercise,\n            lessonId,\n            target.status,\n            now,\n          );\n    return upsertReviewItem(currentItems, scheduled);`,
);

replaceOnce(
  "src/engine/lessonReview.test.ts",
  `test("кандзи получает очереди значения, чтения и письма после одного вида задания", () => {`,
  `test("оценка письма из первого прохождения сохраняет собственный интервал", () => {\n  const writingExercise: Exercise = {\n    id: "lesson-test-kanji-writing",\n    type: "handwriting",\n    prompt: "Напиши 日",\n    targetItemIds: ["kanji-日"],\n    correctAnswers: ["日"],\n    skill: "writing",\n  };\n\n  const items = commitLessonReviewItems({\n    items: [],\n    exercises: [writingExercise],\n    attempts: [\n      {\n        exerciseId: writingExercise.id,\n        status: "correct",\n        writingGrade: 4,\n      },\n    ],\n    lessonId: "lesson-test",\n    mode: "learning",\n    passed: true,\n    now,\n  });\n\n  const writing = items.find((item) => item.skill === "writing");\n  assert.ok(writing);\n  assert.equal(writing.intervalDays, 4);\n  assert.equal(writing.streak, 1);\n  assert.equal(writing.correctCount, 1);\n});\n\ntest("кандзи получает очереди значения, чтения и письма после одного вида задания", () => {`,
);

replaceOnce(
  "AppRoot.tsx",
  `  const sentence = bundle.sentences.find((item) => item.id === itemId);\n  if (sentence) return sentence.japanese;`,
  `  const sentence = bundle.sentences.find((item) => item.id === itemId);\n  if (sentence) return sentence.japanese;\n  const kanji = bundle.kanji?.find((item) => item.id === itemId);\n  if (kanji) return \`${kanji.literal} — ${kanji.meaningsRu[0] ?? "кандзи"}\`;`,
);
replaceOnce(
  "AppRoot.tsx",
  `    const attempt = { exerciseId: currentExercise.id, status: checkResult.status };`,
  `    const attempt: ExerciseAttempt = {\n      exerciseId: currentExercise.id,\n      status: checkResult.status,\n      writingGrade,\n    };`,
);

replaceOnce(
  "src/components/KanjiWritingPanel.tsx",
  `  onComplete: (result: SkritterWritingResult) => void;\n}`,
  `  onComplete: (result: SkritterWritingResult) => void;\n  onAutoAdvance?: () => void;\n}`,
);
replaceOnce(
  "src/components/KanjiWritingPanel.tsx",
  `  reviewItem,\n  onComplete,\n}: KanjiWritingPanelProps) {`,
  `  reviewItem,\n  onComplete,\n  onAutoAdvance,\n}: KanjiWritingPanelProps) {`,
);
replaceOnce(
  "src/components/KanjiWritingPanel.tsx",
  `        gradeIntervalLabels={intervals}\n        onComplete={onComplete}`,
  `        gradeIntervalLabels={intervals}\n        onComplete={(result) => {\n          onComplete(result);\n          if (autoAdvance) onAutoAdvance?.();\n        }}`,
);

replaceOnce(
  "src/screens/KanjiScreen.tsx",
  `  const selectedWritingReviewItem = selectedEntry\n    ? reviewItems.find(`,
  `  const advanceToNextAvailableEntry = () => {\n    if (!selectedEntry || filteredEntries.length < 2) return;\n    const currentIndex = filteredEntries.findIndex(\n      (entry) => entry.item.id === selectedEntry.item.id,\n    );\n    const ordered = [\n      ...filteredEntries.slice(currentIndex + 1),\n      ...filteredEntries.slice(0, currentIndex),\n    ];\n    const next = ordered.find((entry) => entry.available);\n    if (next) setSelectedId(next.item.id);\n  };\n\n  const selectedWritingReviewItem = selectedEntry\n    ? reviewItems.find(`,
);
replaceOnce(
  "src/screens/KanjiScreen.tsx",
  `                onComplete={(result: SkritterWritingResult) =>\n                  onRecordWriting(selectedEntry.item, result)\n                }`,
  `                onComplete={(result: SkritterWritingResult) =>\n                  onRecordWriting(selectedEntry.item, result)\n                }\n                onAutoAdvance={advanceToNextAvailableEntry}`,
);

console.log("Writing audit fixes applied.");
