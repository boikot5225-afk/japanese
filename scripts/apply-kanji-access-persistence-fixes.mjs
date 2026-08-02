import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const write = (path, content) => fs.writeFileSync(path, content);

const replaceOnce = (path, before, after) => {
  const source = read(path);
  if (source.includes(after)) return;
  if (!source.includes(before)) {
    throw new Error(`Anchor not found in ${path}: ${before.slice(0, 160)}`);
  }
  write(path, source.replace(before, after));
};

replaceOnce(
  "AppRoot.tsx",
  "        const completedLessonIdSet = new Set(validCompletedLessonIds);\n",
  "",
);
replaceOnce(
  "AppRoot.tsx",
  [
    "            (item) =>",
    "              completedLessonIdSet.has(item.lessonId) &&",
    "              knownExerciseIds.has(item.exerciseId) &&",
    "              knownItemIds.has(item.itemId),",
  ].join("\n"),
  [
    "            (item) =>",
    "              knownLessonIds.has(item.lessonId) &&",
    "              knownExerciseIds.has(item.exerciseId) &&",
    "              knownItemIds.has(item.itemId),",
  ].join("\n"),
);

const currentStudyPanel = [
  "            <KanjiStudyPanel",
  "              key={\"study-\" + selectedEntry.item.id}",
  "              item={selectedEntry.item}",
  "              catalog={n5KanjiCatalog}",
  "              exercises={selectedStudyExercises}",
  "              progress={selectedEntry.progress}",
  "              strokeCount={",
  "                kanjiStrokeDataByLiteral[selectedEntry.item.literal]?.strokes.length ?? null",
  "              }",
  "              onRecord={(study: KanjiStudyResult) =>",
  "                onRecordStudy(selectedEntry.item, study)",
  "              }",
  "            />",
].join("\n");

const guardedStudyPanel = [
  "            {selectedEntry.available ? (",
  "              <KanjiStudyPanel",
  "                key={\"study-\" + selectedEntry.item.id}",
  "                item={selectedEntry.item}",
  "                catalog={n5KanjiCatalog}",
  "                exercises={selectedStudyExercises}",
  "                progress={selectedEntry.progress}",
  "                strokeCount={",
  "                  kanjiStrokeDataByLiteral[selectedEntry.item.literal]?.strokes.length ?? null",
  "                }",
  "                onRecord={(study: KanjiStudyResult) =>",
  "                  onRecordStudy(selectedEntry.item, study)",
  "                }",
  "              />",
  "            ) : (",
  "              <Text style={styles.lockedWriting}>",
  "                Изучение откроется вместе с уроком {selectedEntry.lessonOrder}. Пример можно",
  "                посмотреть заранее, но значение, чтение и письмо не записываются в прогресс.",
  "              </Text>",
  "            )}",
].join("\n");

replaceOnce(
  "src/screens/KanjiScreen.tsx",
  currentStudyPanel,
  guardedStudyPanel,
);

console.log("Applied final kanji access and persistence fixes.");
