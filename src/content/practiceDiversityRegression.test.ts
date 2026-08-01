import assert from "node:assert/strict";
import test from "node:test";

import { getExerciseContentKey } from "../engine/exerciseIdentity.ts";
import { lessonBundles } from "./courseCatalog.ts";

test("manual vocabulary reading practice suppresses its generated duplicate", () => {
  const lesson12 = lessonBundles.find(
    (bundle) => bundle.lesson.id === "lesson-012",
  );
  assert.ok(lesson12);

  const atsuiReadingTasks = lesson12.exercises.filter(
    (exercise) =>
      getExerciseContentKey(exercise) === "vocabulary:word-atsui:reading",
  );

  assert.equal(
    atsuiReadingTasks.length,
    1,
    "lesson 12 repeats the 暑い → あつい reading task",
  );
  assert.equal(
    atsuiReadingTasks[0]?.id,
    "exercise-atsui-reading-input",
    "the authored 暑い reading task should survive instead of its generated clone",
  );
  assert.ok(
    !lesson12.exercises.some(
      (exercise) =>
        exercise.id === "lesson-012-diverse-word-atsui-reading-input",
    ),
    "the generated 暑い reading clone leaked into the final session",
  );
});
