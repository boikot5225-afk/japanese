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

replaceOnce(
  "AppRoot.tsx",
  'import type { SkritterWritingResult } from "./src/components/SkritterWritingPad";\n',
  'import type { SkritterWritingResult } from "./src/components/SkritterWritingPad";\nimport type { KanjiStudyResult } from "./src/engine/kanjiStudySession";\n',
);
replaceOnce(
  "AppRoot.tsx",
  '  lessonBundles.map((bundle) => [bundle.lesson.id, bundle.exercises]),\n',
  [
    '  lessonBundles.map((bundle) => [',
    '    bundle.lesson.id,',
    '    bundle.reviewExercises ?? bundle.exercises,',
    '  ]),',
    '',
  ].join("\n"),
);
replaceOnce(
  "AppRoot.tsx",
  '          lessonBundles.flatMap((bundle) => bundle.exercises.map((exercise) => exercise.id)),\n',
  [
    '          lessonBundles.flatMap((bundle) =>',
    '            (bundle.reviewExercises ?? bundle.exercises).map((exercise) => exercise.id),',
    '          ),',
    '',
  ].join("\n"),
);

const recordKanjiStudy = [
  '  const recordKanjiStudy = (item: KanjiItem, study: KanjiStudyResult) => {',
  '    const now = new Date();',
  '    const skill = inferExerciseSkill(study.exercise);',
  '',
  '    setReviewItems((previous) => {',
  '      const key = reviewItemKey({ itemId: item.id, skill });',
  '      const existing = previous.find((entry) => reviewItemKey(entry) === key);',
  '      return upsertReviewItem(',
  '        previous,',
  '        scheduleItemReview(',
  '          existing,',
  '          item.id,',
  '          skill,',
  '          study.exercise,',
  '          item.introducedInLessonId,',
  '          study.status,',
  '          now,',
  '        ),',
  '      );',
  '    });',
  '    setAttemptHistory((previous) => [',
  '      createAttemptLogEntry(',
  '        study.exercise,',
  '        item.introducedInLessonId,',
  '        study.status,',
  '        "practice",',
  '        now,',
  '      ),',
  '      ...previous,',
  '    ].slice(0, 200));',
  '  };',
  '',
].join("\n");
replaceOnce(
  "AppRoot.tsx",
  '  const sentenceBuilderTokens = useMemo(() => {\n',
  `${recordKanjiStudy}  const sentenceBuilderTokens = useMemo(() => {\n`,
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
  [
    '  const selectedLessonBundle = selectedEntry',
    '    ? lessonBundles.find(',
    '        (bundle) => bundle.lesson.id === selectedEntry.item.introducedInLessonId,',
    '      )',
    '    : undefined;',
    '  const selectedStudyExercises =',
    '    selectedLessonBundle?.reviewExercises ?? selectedLessonBundle?.exercises ?? [];',
    '  const selectedWritingReviewItem = selectedEntry',
    '',
  ].join("\n"),
);
replaceOnce(
  "src/screens/KanjiScreen.tsx",
  '          103 знака идут вместе с курсом. Чтения учатся в словах, а письмо теперь\n          использует обучение, прилипание штрихов, письмо по памяти и четыре оценки SRS.\n',
  '          103 знака идут вместе с курсом: сначала знакомое слово и значение, затем\n          чтение с опорой и без вариантов, после этого письмо и раздельное повторение.\n',
);

const studyPanel = [
  '            <KanjiStudyPanel',
  '              key={"study-" + selectedEntry.item.id}',
  '              item={selectedEntry.item}',
  '              catalog={n5KanjiCatalog}',
  '              exercises={selectedStudyExercises}',
  '              progress={selectedEntry.progress}',
  '              strokeCount={',
  '                kanjiStrokeDataByLiteral[selectedEntry.item.literal]?.strokes.length ?? null',
  '              }',
  '              onRecord={(study: KanjiStudyResult) =>',
  '                onRecordStudy(selectedEntry.item, study)',
  '              }',
  '            />',
  '',
].join("\n");
replaceOnce(
  "src/screens/KanjiScreen.tsx",
  '            <SkillCard\n              title="Значение"\n',
  `${studyPanel}            <SkillCard\n              title="Значение"\n`,
);

const packageJson = JSON.parse(read("package.json"));
packageJson.version = "0.22.0";
packageJson.scripts["test:kanji-study"] = "tsx --test src/engine/kanjiStudySession.test.ts";
if (!packageJson.scripts.test.includes("test:kanji-study")) {
  packageJson.scripts.test = packageJson.scripts.test.replace(
    "npm run test:kanji-progress &&",
    "npm run test:kanji-progress && npm run test:kanji-study &&",
  );
}
write("package.json", `${JSON.stringify(packageJson, null, 2)}\n`);

const appJson = JSON.parse(read("app.json"));
appJson.expo.version = "0.22.0";
appJson.expo.android.versionCode = 43;
write("app.json", `${JSON.stringify(appJson, null, 2)}\n`);

console.log("Kanji study cycle 0.22.0 integrated.");
