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

test("lessons 11-16 retain unique sentence-building practice", () => {
  lessonBundles
    .filter(
      (bundle) =>
        bundle.lesson.order >= 11 && bundle.lesson.order <= 16,
    )
    .forEach((bundle) => {
      const builders = bundle.exercises.filter(
        (exercise) => exercise.type === "sentence-builder",
      );
      assert.ok(
        builders.length >= 1,
        `${bundle.lesson.id} lost sentence-building practice during diversification`,
      );
      assert.equal(
        new Set(builders.map(getExerciseContentKey)).size,
        builders.length,
        `${bundle.lesson.id} repeats sentence-building content`,
      );
    });
});
