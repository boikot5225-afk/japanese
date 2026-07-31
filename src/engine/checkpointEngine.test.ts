import assert from "node:assert/strict";
import test from "node:test";

import { courseCheckpoints } from "../content/courseCheckpoints";
import { lessonBundles } from "../content/courseCatalog";
import {
  buildCheckpointQueue,
  calculateCheckpointResult,
  isCheckpointAvailable,
  isLessonUnlocked,
  updateCheckpointProgress,
} from "./checkpointEngine";

const firstCheckpoint = courseCheckpoints[0];
if (!firstCheckpoint) throw new Error("Первый контрольный рубеж не определён");

test("checkpoint queue mixes exercises from the whole unit", () => {
  const queue = buildCheckpointQueue(firstCheckpoint, lessonBundles);
  assert.equal(queue.length, Math.min(firstCheckpoint.questionCount, queue.length));
  assert.ok(queue.length > 0);
  assert.ok(queue.every((question) => firstCheckpoint.lessonIds.includes(question.lessonId)));
  assert.ok(new Set(queue.map((question) => question.lessonId)).size > 1);
  assert.equal(new Set(queue.map((question) => question.exercise.id)).size, queue.length);
});

test("checkpoint uses an 80 percent pass boundary", () => {
  const passed = calculateCheckpointResult(
    [
      { exerciseId: "1", status: "correct" },
      { exerciseId: "2", status: "correct" },
      { exerciseId: "3", status: "acceptable" },
      { exerciseId: "4", status: "correct" },
      { exerciseId: "5", status: "incorrect" },
    ],
    80,
  );
  assert.equal(passed.percent, 80);
  assert.equal(passed.passed, true);

  const failed = calculateCheckpointResult(
    [
      { exerciseId: "1", status: "correct" },
      { exerciseId: "2", status: "correct" },
      { exerciseId: "3", status: "correct" },
      { exerciseId: "4", status: "incorrect" },
      { exerciseId: "5", status: "incorrect" },
    ],
    80,
  );
  assert.equal(failed.percent, 60);
  assert.equal(failed.passed, false);
});

test("next unit stays locked until the checkpoint is passed", () => {
  const completed = [...firstCheckpoint.lessonIds];
  assert.equal(isCheckpointAvailable(firstCheckpoint, completed), true);
  assert.equal(isLessonUnlocked("lesson-004", completed, []), false);

  const progress = updateCheckpointProgress(
    [],
    firstCheckpoint.id,
    calculateCheckpointResult([{ exerciseId: "1", status: "correct" }], 80),
    new Date("2026-07-31T12:00:00.000Z"),
  );
  assert.equal(isLessonUnlocked("lesson-004", completed, progress), true);
});

test("a passed checkpoint is not revoked by a weaker retry", () => {
  const passed = updateCheckpointProgress(
    [],
    firstCheckpoint.id,
    calculateCheckpointResult([{ exerciseId: "1", status: "correct" }], 80),
    new Date("2026-07-31T12:00:00.000Z"),
  );
  const retried = updateCheckpointProgress(
    passed,
    firstCheckpoint.id,
    calculateCheckpointResult([{ exerciseId: "1", status: "incorrect" }], 80),
    new Date("2026-07-31T13:00:00.000Z"),
  );
  assert.equal(retried[0]?.passed, true);
  assert.equal(retried[0]?.bestPercent, 100);
  assert.equal(retried[0]?.lastPercent, 0);
  assert.equal(retried[0]?.attemptCount, 2);
});
