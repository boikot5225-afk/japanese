import assert from "node:assert/strict";
import test from "node:test";

import { lesson029Bundle } from "./lesson029.ts";
import { lesson030Bundle } from "./lesson030.ts";
import { lesson031Bundle } from "./lesson031.ts";
import { lesson032Bundle } from "./lesson032.ts";

const bundles = [lesson029Bundle, lesson030Bundle, lesson031Bundle, lesson032Bundle];

const answersFor = (lessonId: string): string[] => {
  const bundle = bundles.find((candidate) => candidate.lesson.id === lessonId);
  assert.ok(bundle, lessonId);
  return bundle.exercises.flatMap((exercise) => [
    ...exercise.correctAnswers,
    ...(exercise.acceptableAnswers ?? []),
  ]);
};

test("lessons 29 through 32 form one ordered unit", () => {
  assert.deepEqual(
    bundles.map((bundle) => ({
      id: bundle.lesson.id,
      unitId: bundle.lesson.unitId,
      order: bundle.lesson.order,
    })),
    [
      { id: "lesson-029", unitId: "unit-009", order: 29 },
      { id: "lesson-030", unitId: "unit-009", order: 30 },
      { id: "lesson-031", unitId: "unit-009", order: 31 },
      { id: "lesson-032", unitId: "unit-009", order: 32 },
    ],
  );
});

test("every new lesson contains theory, examples and varied authored practice", () => {
  bundles.forEach((bundle) => {
    assert.ok(bundle.grammar.length >= 4, `${bundle.lesson.id} has too little theory`);
    assert.ok(bundle.sentences.length >= 5, `${bundle.lesson.id} has too few examples`);
    assert.ok(bundle.exercises.length >= 6, `${bundle.lesson.id} has too little authored practice`);
    assert.ok(
      new Set(bundle.exercises.map((exercise) => exercise.type)).size >= 4,
      `${bundle.lesson.id} has too few exercise types`,
    );
  });
});

test("experience practice requires the ta form and keeps negative experience in arimasen", () => {
  const answers = answersFor("lesson-029");
  assert.ok(answers.includes("漢字を書いたことがあります"));
  assert.ok(answers.includes("日本料理を食べたことがありません"));
  assert.ok(!answers.includes("漢字を書くことがあります"));
  assert.ok(!answers.includes("日本料理を食べなかったことがあります"));
});

test("tari practice is derived from the ta form and does not pretend to be a sequence", () => {
  const answers = answersFor("lesson-030");
  assert.ok(answers.includes("読んだり"));
  assert.ok(answers.includes("書いたり"));
  assert.ok(answers.includes("新聞を読んで、学校へ行きます"));
  assert.ok(!answers.includes("読んでり"));
  assert.ok(!answers.includes("読みたり"));
});

test("advice practice separates positive ta advice from negative nai advice", () => {
  const answers = answersFor("lesson-031");
  assert.ok(answers.includes("持った"));
  assert.ok(answers.includes("行かない"));
  assert.ok(answers.includes("傘を持ったほうがいいですか"));
  assert.ok(!answers.includes("行かなかった"));

  const explanation = lesson031Bundle.grammar.find(
    (grammar) => grammar.id === "grammar-hou-ga-ii-not-past",
  )?.explanationRu;
  assert.match(explanation ?? "", /не переводится как «съел»/u);
});

test("duty and no-need practice remain distinct from prohibition", () => {
  const answers = answersFor("lesson-032");
  assert.ok(answers.includes("行かなければなりません"));
  assert.ok(answers.includes("持たなくてもいいです"));
  assert.ok(answers.includes("Телевизор можно не смотреть"));
  assert.ok(!answers.includes("行かないければなりません"));

  assert.ok(
    lesson032Bundle.sentences.some(
      (sentence) => sentence.japanese === "テレビを見なくてもいいです。",
    ),
  );
  assert.ok(
    lesson032Bundle.sentences.some(
      (sentence) => sentence.japanese === "テレビを見てはいけません。",
    ),
  );
});

test("new authored exercise ids are globally unique inside the unit", () => {
  const ids = bundles.flatMap((bundle) => bundle.exercises.map((exercise) => exercise.id));
  assert.equal(new Set(ids).size, ids.length);
});
