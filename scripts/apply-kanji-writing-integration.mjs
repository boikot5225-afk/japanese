import fs from "node:fs";
import path from "node:path";

const filePath = path.resolve(import.meta.dirname, "..", "AppRoot.tsx");
let source = fs.readFileSync(filePath, "utf8");

const replaceOnce = (before, after, label) => {
  if (source.includes(after)) return;
  if (!source.includes(before)) {
    throw new Error(`Cannot apply ${label}: expected source fragment was not found.`);
  }
  source = source.replace(before, after);
};

replaceOnce(
  'import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";\n',
  'import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";\n\nimport type { KanjiTracingResult } from "./src/components/KanjiTracingPad";\n',
  "KanjiTracingResult import",
);

replaceOnce(
  'import { findLessonBundle, lessonBundles } from "./src/content/courseCatalog";\n',
  'import { findLessonBundle, lessonBundles } from "./src/content/courseCatalog";\nimport { createKanjiWritingExercise } from "./src/content/kanjiCurriculum";\n',
  "writing exercise import",
);

replaceOnce(
  'import type { Exercise, Skill } from "./src/domain/course";\n',
  'import type { Exercise, KanjiItem, Skill } from "./src/domain/course";\n',
  "KanjiItem import",
);

const handlerAnchor = '  const sentenceBuilderTokens = useMemo(() => {\n';
const handler = `  const recordKanjiWriting = (\n    item: KanjiItem,\n    tracing: KanjiTracingResult,\n  ) => {\n    const exercise = createKanjiWritingExercise(\n      item.introducedInLessonId,\n      item,\n    );\n    const now = new Date();\n    const status: AnswerCheckResult["status"] =\n      tracing.mistakes === 0 ? "correct" : "acceptable";\n\n    setReviewItems((previous) => {\n      const key = reviewItemKey({ itemId: item.id, skill: "writing" });\n      const existing = previous.find((entry) => reviewItemKey(entry) === key);\n      return upsertReviewItem(\n        previous,\n        scheduleItemReview(\n          existing,\n          item.id,\n          "writing",\n          exercise,\n          item.introducedInLessonId,\n          status,\n          now,\n        ),\n      );\n    });\n    setAttemptHistory((previous) => [\n      createAttemptLogEntry(\n        exercise,\n        item.introducedInLessonId,\n        status,\n        "practice",\n        now,\n      ),\n      ...previous,\n    ].slice(0, 200));\n  };\n\n`;
if (!source.includes("const recordKanjiWriting =")) {
  if (!source.includes(handlerAnchor)) {
    throw new Error("Cannot insert writing handler: anchor was not found.");
  }
  source = source.replace(handlerAnchor, handler + handlerAnchor);
}

replaceOnce(
  '        checkpointProgress={checkpointProgress}\n        todayBundle={todayBundle}\n',
  '        checkpointProgress={checkpointProgress}\n        reviewItems={reviewItems}\n        todayBundle={todayBundle}\n',
  "CourseScreen review items prop",
);

replaceOnce(
  '        onStartReview={startReview}\n        onOpenKana={() => setScreen("kana")}\n',
  '        onStartReview={startReview}\n        onOpenKana={() => setScreen("kana")}\n        onRecordKanjiWriting={recordKanjiWriting}\n',
  "CourseScreen writing callback",
);

fs.writeFileSync(filePath, source, "utf8");
console.log("AppRoot kanji writing integration is present.");
