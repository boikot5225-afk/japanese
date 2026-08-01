import assert from "node:assert/strict";
import test from "node:test";

import {
  courseCheckpoints,
  type CourseCheckpoint,
} from "../content/courseCheckpoints";
import { lessonBundles } from "../content/courseCatalog";
import type { LessonBundle } from "../content/lessonBundle";
import {
  buildCheckpointQueue,
  calculateCheckpointResult,
  isCheckpointAvailable,
  isLessonUnlocked,
  reconcileCheckpointProgress,
  updateCheckpointProgress,
} from "./checkpointEngine";
import { getExerciseContentKey } from "./exerciseIdentity";

const firstCheckpoint = courseCheckpoints[0];
const secondCheckpoint = courseCheckpoints[1];
const thirdCheckpoint = courseCheckpoints[2];
const fourthCheckpoint = courseCheckpoints[3];
const fifthCheckpoint = courseCheckpoints[4];
if (
  !firstCheckpoint ||
  !secondCheckpoint ||
  !thirdCheckpoint ||
  !fourthCheckpoint ||
  !fifthCheckpoint
) {
  throw new Error("Контрольные рубежи курса не определены");
}

const passCheckpoint = (
  progress: ReturnType<typeof updateCheckpointProgress>,
  checkpointId: string,
  hour: number,
) =>
  updateCheckpointProgress(
    progress,
    checkpointId,
    calculateCheckpointResult([{ exerciseId: checkpointId, status: "correct" }], 80),
    new Date(`2026-07-31T${String(hour).padStart(2, "0")}:00:00.000Z`),
  );

test("checkpoint queue mixes exercises from the whole unit without semantic duplicates", () => {
  const queue = buildCheckpointQueue(firstCheckpoint, lessonBundles);
  assert.equal(queue.length, firstCheckpoint.questionCount);
  assert.ok(queue.every((question) => firstCheckpoint.lessonIds.includes(question.lessonId)));
  assert.ok(new Set(queue.map((question) => question.lessonId)).size > 1);
  assert.equal(new Set(queue.map((question) => question.exercise.id)).size, queue.length);
  assert.equal(
    new Set(queue.map((question) => getExerciseContentKey(question.exercise))).size,
    queue.length,
  );
});

test("every checkpoint can fill its requested size with unique content", () => {
  courseCheckpoints.forEach((checkpoint) => {
    const queue = buildCheckpointQueue(checkpoint, lessonBundles);
    assert.equal(queue.length, checkpoint.questionCount, checkpoint.id);
    assert.equal(
      new Set(queue.map((question) => getExerciseContentKey(question.exercise))).size,
      queue.length,
      checkpoint.id,
    );
  });
});

test("manual handwriting self-assessment is excluded from graded checkpoints", () => {
  const checkpoint: CourseCheckpoint = {
    id: "checkpoint-handwriting-safety",
    unitId: "unit-test",
    title: "Проверка объективной оценки",
    description: "Ручная самооценка не должна влиять на проходной балл.",
    lessonIds: ["lesson-handwriting-safety"],
    questionCount: 2,
    passPercent: 80,
  };
  const bundle: LessonBundle = {
    lesson: {
      id: "lesson-handwriting-safety",
      unitId: "unit-test",
      order: 999,
      title: "Тест",
      description: "Тест",
      theory: [],
      itemIds: ["word-test"],
      exerciseIds: ["objective-question", "manual-writing-question"],
      estimatedMinutes: 1,
    },
    vocabulary: [],
    grammar: [],
    sentences: [],
    exercises: [
      {
        id: "objective-question",
        type: "multiple-choice",
        prompt: "Выбери ответ",
        targetItemIds: ["word-test"],
        correctAnswers: ["正"],
        distractors: ["誤"],
      },
      {
        id: "manual-writing-question",
        type: "handwriting",
        prompt: "Напиши знак",
        targetItemIds: ["word-test"],
        correctAnswers: ["字"],
        difficulty: 4,
      },
    ],
    outcomes: [],
  };

  const queue = buildCheckpointQueue(checkpoint, [bundle], ["word-test"]);
  assert.deepEqual(queue.map((question) => question.exercise.id), ["objective-question"]);
  assert.ok(queue.every((question) => question.exercise.type !== "handwriting"));
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

test("the whole next unit stays locked until its checkpoint is passed", () => {
  const completed = [...firstCheckpoint.lessonIds];
  assert.equal(isCheckpointAvailable(firstCheckpoint, completed), true);
  assert.equal(isLessonUnlocked("lesson-004", completed, []), false);
  assert.equal(isLessonUnlocked("lesson-005", completed, []), false);
  assert.equal(isLessonUnlocked("lesson-006", completed, []), false);

  const progress = passCheckpoint([], firstCheckpoint.id, 12);
  assert.equal(isLessonUnlocked("lesson-004", completed, progress), true);
  assert.equal(isLessonUnlocked("lesson-005", completed, progress), true);
  assert.equal(isLessonUnlocked("lesson-006", completed, progress), true);
  assert.equal(isLessonUnlocked("lesson-007", completed, progress), false);
});

test("lessons 11 through 16 require every earlier checkpoint", () => {
  const firstProgress = passCheckpoint([], firstCheckpoint.id, 12);
  assert.equal(isLessonUnlocked("lesson-008", [], firstProgress), false);

  const twoProgress = passCheckpoint(firstProgress, secondCheckpoint.id, 13);
  assert.equal(isLessonUnlocked("lesson-008", [], twoProgress), true);
  assert.equal(isLessonUnlocked("lesson-010", [], twoProgress), true);
  assert.equal(isLessonUnlocked("lesson-011", [], twoProgress), false);

  const threeProgress = passCheckpoint(twoProgress, thirdCheckpoint.id, 14);
  assert.equal(isLessonUnlocked("lesson-011", [], threeProgress), true);
  assert.equal(isLessonUnlocked("lesson-013", [], threeProgress), true);
  assert.equal(isLessonUnlocked("lesson-014", [], threeProgress), false);

  const fourProgress = passCheckpoint(threeProgress, fourthCheckpoint.id, 15);
  assert.equal(isLessonUnlocked("lesson-014", [], fourProgress), true);
  assert.equal(isLessonUnlocked("lesson-016", [], fourProgress), true);
});

test("the final adjective checkpoint becomes available after lessons 14 through 16", () => {
  assert.equal(isCheckpointAvailable(fifthCheckpoint, fifthCheckpoint.lessonIds), true);
  assert.equal(
    isCheckpointAvailable(fifthCheckpoint, fifthCheckpoint.lessonIds.slice(0, 2)),
    false,
  );
});

test("saved progress infers checkpoints already crossed in an older build", () => {
  const reconciled = reconcileCheckpointProgress([], ["lesson-015"]);
  const passedIds = new Set(
    reconciled.filter((item) => item.passed).map((item) => item.checkpointId),
  );

  assert.equal(passedIds.has(firstCheckpoint.id), true);
  assert.equal(passedIds.has(secondCheckpoint.id), true);
  assert.equal(passedIds.has(thirdCheckpoint.id), true);
  assert.equal(passedIds.has(fourthCheckpoint.id), true);
  assert.equal(passedIds.has(fifthCheckpoint.id), false);
});

test("reconciliation preserves a real failed attempt while restoring access", () => {
  const failed = updateCheckpointProgress(
    [],
    fourthCheckpoint.id,
    calculateCheckpointResult(
      [
        { exerciseId: "1", status: "correct" },
        { exerciseId: "2", status: "incorrect" },
      ],
      80,
    ),
    new Date("2026-07-31T15:00:00.000Z"),
  );
  const reconciled = reconcileCheckpointProgress(failed, ["lesson-015"]);
  const restored = reconciled.find((item) => item.checkpointId === fourthCheckpoint.id);

  assert.equal(restored?.passed, true);
  assert.equal(restored?.bestPercent, 100);
  assert.equal(restored?.lastPercent, 50);
  assert.equal(restored?.attemptCount, 1);
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
