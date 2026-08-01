import assert from "node:assert/strict";
import test from "node:test";

import { courseUnits } from "./courseCatalog.ts";
import { courseCheckpoints } from "./courseCheckpoints.ts";

test("every published course unit has exactly one matching checkpoint", () => {
  assert.equal(courseCheckpoints.length, courseUnits.length);

  courseUnits.forEach((unit) => {
    const matches = courseCheckpoints.filter(
      (checkpoint) => checkpoint.unitId === unit.id,
    );
    assert.equal(matches.length, 1, unit.id);

    const checkpoint = matches[0];
    assert.ok(checkpoint);
    assert.deepEqual(
      checkpoint.lessonIds,
      unit.lessons.map((lesson) => lesson.id),
      `${unit.id} checkpoint covers a different lesson set`,
    );
    assert.ok(checkpoint.questionCount > 0, `${unit.id} has an empty checkpoint`);
    assert.equal(checkpoint.passPercent, 80, `${unit.id} uses another pass boundary`);
  });
});

test("every completed unit gates the first lesson of the following unit", () => {
  courseUnits.slice(0, -1).forEach((unit, index) => {
    const checkpoint = courseCheckpoints.find(
      (candidate) => candidate.unitId === unit.id,
    );
    const nextUnit = courseUnits[index + 1];
    assert.ok(checkpoint);
    assert.ok(nextUnit);
    assert.equal(
      checkpoint.unlockLessonId,
      nextUnit.lessons[0]?.id,
      `${unit.id} does not unlock the next unit at its first lesson`,
    );
  });
});

test("the current final checkpoint is ready to gate lesson 29", () => {
  const finalUnit = courseUnits[courseUnits.length - 1];
  assert.ok(finalUnit);
  const checkpoint = courseCheckpoints.find(
    (candidate) => candidate.unitId === finalUnit.id,
  );
  assert.ok(checkpoint);
  assert.equal(checkpoint.unlockLessonId, "lesson-029");
});
