import assert from "node:assert/strict";
import test from "node:test";

import { n5KanjiCatalog } from "../content/kanjiCatalog";
import { buildKanjiProgressCatalog } from "./kanjiProgress";
import {
  buildKanjiLearnQueue,
  buildKanjiReviewQueue,
  buildKanjiStudyResult,
  findNextNewKanjiId,
  gradeKanjiStudyAnswer,
  requeueForgottenKanjiCard,
} from "./kanjiStudySession";
import type { ReviewItem } from "./reviewEngine";

const person = n5KanjiCatalog.find((item) => item.literal === "人");
const day = n5KanjiCatalog.find((item) => item.literal === "日");
if (!person || !day) throw new Error("Test kanji are missing");

const emptyProgress = buildKanjiProgressCatalog(n5KanjiCatalog, []);

const dueReviewItem = (overrides: Partial<ReviewItem> = {}): ReviewItem => ({
  itemId: person.id,
  skill: "reading",
  exerciseId: `${person.introducedInLessonId}-kanji-${person.literal}-reading`,
  lessonId: person.introducedInLessonId,
  dueAt: "2026-08-01T00:00:00.000Z",
  intervalDays: 1,
  ease: 2.3,
  streak: 1,
  correctCount: 1,
  incorrectCount: 0,
  lapseCount: 0,
  lastStatus: "correct",
  lastAnsweredAt: "2026-07-31T00:00:00.000Z",
  ...overrides,
});

test("learn introduces one new N5 kanji through the exact six Skritter stages", () => {
  const queue = buildKanjiLearnQueue(n5KanjiCatalog, emptyProgress);
  assert.deepEqual(
    queue.map((card) => card.part),
    [
      "preview",
      "definition",
      "reading",
      "writing-teach",
      "writing-snap",
      "writing-recall",
    ],
  );
  assert.equal(new Set(queue.map((card) => card.itemId)).size, 1);
  assert.ok(queue.every((card) => card.mode === "learn" && card.isNew));
});

test("learn stages use the implicit got-it score instead of showing grading", () => {
  const queue = buildKanjiLearnQueue(n5KanjiCatalog, emptyProgress);
  const definition = queue.find((card) => card.part === "definition");
  const reading = queue.find((card) => card.part === "reading");
  assert.ok(definition && reading);
  assert.equal(buildKanjiStudyResult(definition, person, 3).status, "correct");
  assert.equal(buildKanjiStudyResult(reading, person, 3).status, "correct");
});

test("auto-learn never selects the just-finished item from stale progress", () => {
  assert.notEqual(
    findNextNewKanjiId(n5KanjiCatalog, emptyProgress, person.id),
    person.id,
  );
});

test("review contains due skill cards only and never mixes new material", () => {
  const reviewItems = [dueReviewItem()];
  const queue = buildKanjiReviewQueue(
    n5KanjiCatalog,
    reviewItems,
    new Date("2026-08-02T00:00:00.000Z"),
  );
  assert.equal(queue.length, 1);
  assert.equal(queue[0]?.itemId, person.id);
  assert.equal(queue[0]?.part, "reading");
  assert.equal(queue[0]?.mode, "review");
  assert.equal(queue[0]?.isNew, false);
  assert.ok(queue.every((card) => card.part !== "preview"));
});

test("review excludes future cards", () => {
  const queue = buildKanjiReviewQueue(
    n5KanjiCatalog,
    [dueReviewItem({ dueAt: "2026-08-03T00:00:00.000Z" })],
    new Date("2026-08-02T00:00:00.000Z"),
  );
  assert.deepEqual(queue, []);
});

test("deduplicates recognition and recall into one definition card", () => {
  const reviewItems = [
    dueReviewItem({ skill: "recognition" }),
    dueReviewItem({ skill: "recall", exerciseId: "recall-copy" }),
  ];
  const queue = buildKanjiReviewQueue(
    n5KanjiCatalog,
    reviewItems,
    new Date("2026-08-02T00:00:00.000Z"),
  );
  assert.equal(
    queue.filter(
      (card) => card.itemId === person.id && card.part === "definition",
    ).length,
    1,
  );
});

test("review avoids adjacent parts of the same kanji when another item is ready", () => {
  const queue = buildKanjiReviewQueue(
    n5KanjiCatalog,
    [
      dueReviewItem({ skill: "reading" }),
      dueReviewItem({ skill: "writing", exerciseId: "person-writing" }),
      dueReviewItem({
        itemId: day.id,
        skill: "reading",
        exerciseId: "day-reading",
        lessonId: day.introducedInLessonId,
      }),
    ],
    new Date("2026-08-02T00:00:00.000Z"),
  );
  assert.notEqual(queue[0]?.itemId, queue[1]?.itemId);
});

test("only forgotten review cards return at the end of the queue", () => {
  const current = {
    id: `${person.id}:definition:review:0`,
    itemId: person.id,
    mode: "review" as const,
    part: "definition" as const,
    isNew: false,
    remediation: false,
    repetition: 0,
  };
  const remaining = [
    {
      id: `${day.id}:reading:review:0`,
      itemId: day.id,
      mode: "review" as const,
      part: "reading" as const,
      isNew: false,
      remediation: false,
      repetition: 0,
    },
  ];

  const forgotQueue = requeueForgottenKanjiCard(remaining, current, 1);
  assert.equal(forgotQueue.at(-1)?.itemId, person.id);
  assert.equal(forgotQueue.at(-1)?.remediation, true);

  assert.deepEqual(requeueForgottenKanjiCard(remaining, current, 2), remaining);
  assert.deepEqual(requeueForgottenKanjiCard(remaining, current, 3), remaining);
  assert.deepEqual(requeueForgottenKanjiCard(remaining, current, 4), remaining);
});

test("maps Skritter grades above one to successful SRS results", () => {
  assert.equal(gradeKanjiStudyAnswer(1), "incorrect");
  assert.equal(gradeKanjiStudyAnswer(2), "acceptable");
  assert.equal(gradeKanjiStudyAnswer(3), "correct");
  assert.equal(gradeKanjiStudyAnswer(4), "correct");

  const card = {
    id: `${person.id}:reading:review:0`,
    itemId: person.id,
    mode: "review" as const,
    part: "reading" as const,
    isNew: false,
    remediation: false,
    repetition: 0,
  };
  const result = buildKanjiStudyResult(card, person, 3);
  assert.equal(result.grade, 3);
  assert.equal(result.exercise.skill, "reading");
  assert.equal(
    result.exercise.id,
    `${person.introducedInLessonId}-kanji-${person.literal}-reading`,
  );
  assert.equal(result.status, "correct");
});
