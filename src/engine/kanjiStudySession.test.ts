import assert from "node:assert/strict";
import test from "node:test";

import { n5KanjiCatalog } from "../content/kanjiCatalog";
import { buildKanjiProgressCatalog } from "./kanjiProgress";
import {
  buildKanjiStudyQueue,
  buildKanjiStudyResult,
  gradeKanjiStudyAnswer,
  requeueKanjiStudyCard,
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

test("introduces each new N5 kanji as preview, meaning, reading, then writing", () => {
  const queue = buildKanjiStudyQueue(
    n5KanjiCatalog,
    emptyProgress,
    [],
    new Date("2026-08-02T00:00:00.000Z"),
    { newItemLimit: 1 },
  );
  assert.deepEqual(
    queue.slice(0, 4).map((card) => card.part),
    ["preview", "meaning", "reading", "writing"],
  );
  assert.equal(new Set(queue.slice(0, 4).map((card) => card.itemId)).size, 1);
  assert.ok(queue.slice(0, 4).every((card) => card.isNew));
});

test("puts due skill cards before new N5 material", () => {
  const reviewItems = [dueReviewItem()];
  const progress = buildKanjiProgressCatalog(n5KanjiCatalog, reviewItems);
  const queue = buildKanjiStudyQueue(
    n5KanjiCatalog,
    progress,
    reviewItems,
    new Date("2026-08-02T00:00:00.000Z"),
    { newItemLimit: 1 },
  );
  assert.equal(queue[0]?.itemId, person.id);
  assert.equal(queue[0]?.part, "reading");
  assert.equal(queue[0]?.isNew, false);
  assert.equal(queue[1]?.part, "preview");
});

test("deduplicates recognition and recall into one meaning card", () => {
  const reviewItems = [
    dueReviewItem({ skill: "recognition" }),
    dueReviewItem({ skill: "recall", exerciseId: "recall-copy" }),
  ];
  const progress = buildKanjiProgressCatalog(n5KanjiCatalog, reviewItems);
  const queue = buildKanjiStudyQueue(
    n5KanjiCatalog,
    progress,
    reviewItems,
    new Date("2026-08-02T00:00:00.000Z"),
    { newItemLimit: 0 },
  );
  assert.equal(
    queue.filter((card) => card.itemId === person.id && card.part === "meaning").length,
    1,
  );
});

test("returns forgotten and hard cards later instead of repeating immediately", () => {
  const current = {
    id: `${person.id}:meaning:new:0`,
    itemId: person.id,
    part: "meaning" as const,
    isNew: true,
    remediation: false,
    repetition: 0,
  };
  const remaining = ["preview", "meaning", "reading", "writing", "preview", "meaning", "reading"].map(
    (part, index) => ({
      id: `${day.id}:${part}:${index}`,
      itemId: day.id,
      part: part as "preview" | "meaning" | "reading" | "writing",
      isNew: true,
      remediation: false,
      repetition: 0,
    }),
  );

  const forgotQueue = requeueKanjiStudyCard(remaining, current, 1);
  assert.equal(forgotQueue[3]?.itemId, person.id);
  assert.equal(forgotQueue[3]?.remediation, true);

  const hardQueue = requeueKanjiStudyCard(remaining, current, 2);
  assert.equal(hardQueue[6]?.itemId, person.id);

  assert.deepEqual(requeueKanjiStudyCard(remaining, current, 3), remaining);
  assert.deepEqual(requeueKanjiStudyCard(remaining, current, 4), remaining);
});

test("maps four self-grades to review statuses and canonical exercises", () => {
  assert.equal(gradeKanjiStudyAnswer(1), "incorrect");
  assert.equal(gradeKanjiStudyAnswer(2), "incorrect");
  assert.equal(gradeKanjiStudyAnswer(3), "acceptable");
  assert.equal(gradeKanjiStudyAnswer(4), "correct");

  const card = {
    id: `${person.id}:reading:review:0`,
    itemId: person.id,
    part: "reading" as const,
    isNew: false,
    remediation: false,
    repetition: 0,
  };
  const result = buildKanjiStudyResult(card, person, 4);
  assert.equal(result.grade, 4);
  assert.equal(result.exercise.skill, "reading");
  assert.equal(result.exercise.id, `${person.introducedInLessonId}-kanji-${person.literal}-reading`);
  assert.equal(result.status, "correct");
});
