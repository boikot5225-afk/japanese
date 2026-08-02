import assert from "node:assert/strict";
import test from "node:test";

import type { Exercise } from "../domain/course";
import type { ReviewItem } from "./reviewEngine";
import {
  calculateWritingReviewSchedule,
  previewWritingGradeIntervals,
  scheduleWritingReview,
} from "./writingReview";

const now = new Date("2026-08-02T00:00:00.000Z");
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
  dueAt: now.toISOString(),
  intervalDays: 3,
  ease: 2.3,
  streak: 2,
  correctCount: 2,
  incorrectCount: 0,
  lapseCount: 0,
  lastStatus: "correct",
  lastAnsweredAt: now.toISOString(),
};

test("forgotten and hard writing return quickly and break the streak", () => {
  const forgot = calculateWritingReviewSchedule(existing, 1, now);
  const hard = calculateWritingReviewSchedule(existing, 2, now);
  assert.equal(forgot.success, false);
  assert.equal(forgot.streak, 0);
  assert.equal(Math.round((new Date(forgot.dueAt).getTime() - now.getTime()) / 60000), 10);
  assert.equal(hard.success, false);
  assert.equal(hard.streak, 0);
  assert.equal(Math.round((new Date(hard.dueAt).getTime() - now.getTime()) / 3600000), 8);
});

test("got-it and easy increase the interval, with easy clearly longer", () => {
  const good = calculateWritingReviewSchedule(existing, 3, now);
  const easy = calculateWritingReviewSchedule(existing, 4, now);
  assert.equal(good.success, true);
  assert.equal(easy.success, true);
  assert.ok(good.intervalDays >= 7);
  assert.ok(easy.intervalDays > good.intervalDays);
});

test("writing review counts grades one and two as lapses", () => {
  const hard = scheduleWritingReview(
    existing,
    "kanji-日",
    exercise,
    "lesson-001",
    2,
    now,
  );
  assert.equal(hard.lastStatus, "incorrect");
  assert.equal(hard.correctCount, 2);
  assert.equal(hard.incorrectCount, 1);
  assert.equal(hard.lapseCount, 1);
});

test("interval previews expose all four buttons", () => {
  assert.deepEqual(previewWritingGradeIntervals(undefined, now), {
    1: "10 мин",
    2: "8 ч",
    3: "1 дн",
    4: "4 дн",
  });
});
