import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise } from "../domain/course";
import type { ReviewItem } from "./reviewEngine";
import {
  calculateWritingReviewSchedule,
  previewWritingGradeIntervals,
  scheduleWritingReview,
} from "./writingReview";

const firstReviewAt = new Date("2026-08-02T00:00:00.000Z");
const laterReviewAt = new Date("2026-08-06T00:00:00.000Z");
const exercise: Exercise = {
  id: "lesson-001-kanji-日-writing",
  type: "handwriting",
  prompt: "Напиши 日",
  targetItemIds: ["kanji-日"],
  correctAnswers: ["日"],
  skill: "writing",
};

const existing: ReviewItem = {
  itemId: "kanji-日",
  skill: "writing",
  exerciseId: exercise.id,
  lessonId: "lesson-001",
  dueAt: "2026-08-05T00:00:00.000Z",
  intervalDays: 3,
  ease: 2.3,
  streak: 2,
  correctCount: 2,
  incorrectCount: 0,
  lapseCount: 0,
  lastStatus: "correct",
  lastAnsweredAt: "2026-08-02T00:00:00.000Z",
};

const centerRandom = () => 0.5;

test("Skritter Classic returns forgotten writing after 30 seconds", () => {
  const forgot = calculateWritingReviewSchedule(
    existing,
    1,
    laterReviewAt,
    centerRandom,
  );
  assert.equal(forgot.success, false);
  assert.equal(forgot.streak, 0);
  assert.equal(
    Math.round(
      (new Date(forgot.dueAt).getTime() - laterReviewAt.getTime()) / 1000,
    ),
    30,
  );
});

test("hard is successful and every successful review is spaced at least one day", () => {
  const hard = calculateWritingReviewSchedule(
    existing,
    2,
    laterReviewAt,
    centerRandom,
  );
  assert.equal(hard.success, true);
  assert.ok(hard.intervalDays >= 1);
});

test("got-it and easy use readiness-adjusted Skritter factors", () => {
  const good = calculateWritingReviewSchedule(
    existing,
    3,
    laterReviewAt,
    centerRandom,
  );
  const easy = calculateWritingReviewSchedule(
    existing,
    4,
    laterReviewAt,
    centerRandom,
  );
  assert.equal(good.success, true);
  assert.equal(easy.success, true);
  assert.ok(good.intervalDays > existing.intervalDays);
  assert.ok(easy.intervalDays > good.intervalDays);
});

test("only grade one counts as a writing lapse", () => {
  const hard = scheduleWritingReview(
    existing,
    "kanji-日",
    exercise,
    "lesson-001",
    2,
    laterReviewAt,
  );
  assert.equal(hard.lastStatus, "acceptable");
  assert.equal(hard.correctCount, 3);
  assert.equal(hard.incorrectCount, 0);
  assert.equal(hard.lapseCount, 0);

  const forgot = scheduleWritingReview(
    existing,
    "kanji-日",
    exercise,
    "lesson-001",
    1,
    laterReviewAt,
  );
  assert.equal(forgot.lastStatus, "incorrect");
  assert.equal(forgot.incorrectCount, 1);
  assert.equal(forgot.lapseCount, 1);
});

test("new-item previews match Skritter Classic defaults", () => {
  assert.deepEqual(previewWritingGradeIntervals(undefined, firstReviewAt), {
    1: "30 сек",
    2: "1 дн",
    3: "1 дн",
    4: "4 нед",
  });
});
