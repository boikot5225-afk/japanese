import assert from "node:assert/strict";
import test from "node:test";

import type { LessonBundle } from "./lessonBundle";
import { lesson017Bundle } from "./lesson017.ts";
import { lesson018Bundle } from "./lesson018.ts";
import { lesson019Bundle } from "./lesson019.ts";
import { lesson020Bundle } from "./lesson020.ts";

const bundles: LessonBundle[] = [
  lesson017Bundle,
  lesson018Bundle,
  lesson019Bundle,
  lesson020Bundle,
];
const byId = new Map(bundles.map((bundle) => [bundle.lesson.id, bundle]));
const answersFor = (lessonId: string): string[] =>
  (byId.get(lessonId)?.exercises ?? []).flatMap((exercise) => [
    ...exercise.correctAnswers,
    ...(exercise.acceptableAnswers ?? []),
  ]);

test("the te-form unit contains four contiguous lessons", () => {
  assert.deepEqual(
    bundles.map((bundle) => bundle.lesson.order),
    [17, 18, 19, 20],
  );
  assert.ok(bundles.every((bundle) => bundle.lesson.unitId === "unit-006"));
});

test("lesson 17 keeps the essential te-form transformations correct", () => {
  const answers = answersFor("lesson-017");
  ["読んで", "書いて", "食べて", "行って"].forEach((form) =>
    assert.ok(answers.includes(form), `missing ${form}`),
  );
  ["読みて", "行いて", "食べって"].forEach((form) =>
    assert.ok(!answers.includes(form), `accepted invalid form ${form}`),
  );
});

test("lesson 18 separates request permission question and prohibition", () => {
  const lesson = byId.get("lesson-018");
  assert.ok(lesson);
  const grammarIds = new Set(lesson.grammar.map((item) => item.id));
  ["grammar-te-kudasai", "grammar-te-mo-ii", "grammar-te-mo-ii-ka", "grammar-te-wa-ikemasen"].forEach((id) =>
    assert.ok(grammarIds.has(id), `missing ${id}`),
  );
  const answers = answersFor("lesson-018");
  assert.ok(answers.some((answer) => answer.includes("開けてください")));
  assert.ok(answers.some((answer) => answer.includes("開けてもいいですか")));
  assert.ok(answers.some((answer) => answer.includes("撮って|は|いけません")));
});

test("lesson 19 distinguishes a chain from explicit te kara order", () => {
  const lesson = byId.get("lesson-019");
  assert.ok(lesson);
  const grammarIds = new Set(lesson.grammar.map((item) => item.id));
  assert.ok(grammarIds.has("grammar-te-action-chain"));
  assert.ok(grammarIds.has("grammar-te-kara"));
  assert.ok(grammarIds.has("grammar-sorekara-sequence"));
  assert.ok(
    lesson.sentences.some((sentence) => sentence.japanese.includes("食べてから")),
  );
});

test("lesson 20 covers process habitual activity and continuing state", () => {
  const lesson = byId.get("lesson-020");
  assert.ok(lesson);
  const grammarIds = new Set(lesson.grammar.map((item) => item.id));
  ["grammar-te-imasu-ongoing", "grammar-te-imasu-habit", "grammar-te-imasu-state"].forEach((id) =>
    assert.ok(grammarIds.has(id), `missing ${id}`),
  );
  assert.ok(lesson.sentences.some((sentence) => sentence.japanese === "東京に住んでいます。"));
  assert.ok(!answersFor("lesson-020").includes("読みています"));
});
