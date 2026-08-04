import assert from "node:assert/strict";
import test from "node:test";

import { lesson033Bundle } from "./lesson033.ts";
import { lesson034Bundle } from "./lesson034.ts";
import { lesson035Bundle } from "./lesson035.ts";
import { lesson036Bundle } from "./lesson036.ts";

const bundles = [lesson033Bundle, lesson034Bundle, lesson035Bundle, lesson036Bundle];

const answersFor = (lessonId: string): string[] => {
  const bundle = bundles.find((candidate) => candidate.lesson.id === lessonId);
  assert.ok(bundle, lessonId);
  return bundle.exercises.flatMap((exercise) => [
    ...exercise.correctAnswers,
    ...(exercise.acceptableAnswers ?? []),
  ]);
};

test("lessons 33 through 36 form one ordered unit", () => {
  assert.deepEqual(
    bundles.map((bundle) => ({
      id: bundle.lesson.id,
      unitId: bundle.lesson.unitId,
      order: bundle.lesson.order,
    })),
    [
      { id: "lesson-033", unitId: "unit-010", order: 33 },
      { id: "lesson-034", unitId: "unit-010", order: 34 },
      { id: "lesson-035", unitId: "unit-010", order: 35 },
      { id: "lesson-036", unitId: "unit-010", order: 36 },
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

test("invitation practice distinguishes mashou, masen ka and mashou ka", () => {
  const answers = answersFor("lesson-033");
  assert.ok(answers.includes("行きましょう"));
  assert.ok(answers.includes("荷物を持ちましょうか"));
  assert.ok(answers.includes("公園へ行きませんか"));
  assert.ok(!answers.includes("荷物を持ちませんか"));

  const invitation = lesson033Bundle.grammar.find(
    (grammar) => grammar.id === "grammar-masen-ka-invitation",
  );
  assert.match(invitation?.explanationRu ?? "", /приглашение/u);
});

test("already and not-yet practice keeps completion and continuation distinct", () => {
  const answers = answersFor("lesson-034");
  assert.ok(answers.includes("もう宿題をしました"));
  assert.ok(answers.includes("まだ宿題をしていません"));
  assert.ok(answers.includes("まだ雨が降っています"));
  assert.ok(!answers.includes("まだ宿題をしません"));

  const caution = lesson034Bundle.grammar.find(
    (grammar) => grammar.id === "grammar-mada-te-imasen",
  )?.cautions?.join("\n");
  assert.match(caution ?? "", /まだ食べません/u);
});

test("description linking respects adjective classes and irregular ii", () => {
  const answers = answersFor("lesson-035");
  assert.ok(answers.includes("大きくて"));
  assert.ok(answers.includes("きれいで"));
  assert.ok(answers.includes("よくて"));
  assert.ok(!answers.includes("きれくて"));
  assert.ok(!answers.includes("いくて"));
});

test("toki practice uses no, na and plain verb forms correctly", () => {
  const answers = answersFor("lesson-036");
  assert.ok(answers.includes("子供のとき"));
  assert.ok(answers.includes("暇なとき"));
  assert.ok(answers.includes("忙しいとき"));
  assert.ok(answers.includes("学校へ行くとき、傘を持ちます"));
  assert.ok(!answers.includes("学校へ行きますとき、傘を持ちます"));
});

test("new authored ids are unique inside unit 10", () => {
  const itemIds = bundles.flatMap((bundle) => [
    ...bundle.vocabulary.map((item) => item.id),
    ...bundle.grammar.map((item) => item.id),
    ...bundle.sentences.map((item) => item.id),
  ]);
  const exerciseIds = bundles.flatMap((bundle) =>
    bundle.exercises.map((exercise) => exercise.id),
  );
  assert.equal(new Set(itemIds).size, itemIds.length);
  assert.equal(new Set(exerciseIds).size, exerciseIds.length);
});
