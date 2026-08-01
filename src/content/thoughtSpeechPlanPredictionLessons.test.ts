import assert from "node:assert/strict";
import test from "node:test";

import { lesson037Bundle } from "./lesson037.ts";
import { lesson038Bundle } from "./lesson038.ts";
import { lesson039Bundle } from "./lesson039.ts";
import { lesson040Bundle } from "./lesson040.ts";

const bundles = [lesson037Bundle, lesson038Bundle, lesson039Bundle, lesson040Bundle];

test("lessons 37 through 40 form one ordered N4 unit", () => {
  assert.deepEqual(
    bundles.map((bundle) => [bundle.lesson.id, bundle.lesson.unitId, bundle.lesson.order]),
    [
      ["lesson-037", "unit-011", 37],
      ["lesson-038", "unit-011", 38],
      ["lesson-039", "unit-011", 39],
      ["lesson-040", "unit-011", 40],
    ],
  );

  bundles.forEach((bundle) => {
    assert.ok(bundle.grammar.every((item) => item.jlptLevel === "N4"));
  });
});

test("every new lesson contains substantial authored theory examples and mixed practice", () => {
  bundles.forEach((bundle) => {
    assert.ok(bundle.grammar.length >= 4, bundle.lesson.id);
    assert.ok(bundle.sentences.length >= 5, bundle.lesson.id);
    assert.ok(bundle.exercises.length >= 7, bundle.lesson.id);
    assert.ok(new Set(bundle.exercises.map((exercise) => exercise.type)).size >= 4, bundle.lesson.id);
    assert.ok(bundle.outcomes.length >= 4, bundle.lesson.id);
  });
});

test("opinion practice requires plain forms and da for nouns and na adjectives", () => {
  const answers = lesson037Bundle.exercises.flatMap((exercise) => exercise.correctAnswers);
  assert.ok(answers.includes("田中さんは日本語を勉強すると思います"));
  assert.ok(answers.includes("田中さんは先生だと思います"));
  assert.ok(answers.includes("町は静かだと思います"));
  assert.ok(!answers.some((answer) => /(?:です|ます)と思います/.test(answer)));
  assert.ok(!answers.some((answer) => /静かなと思います/.test(answer)));
});

test("speech practice keeps direct quotation and indirect plain speech distinct", () => {
  const direct = lesson038Bundle.exercises.find((exercise) => exercise.id === "exercise-38-direct-order");
  const indirect = lesson038Bundle.exercises.find((exercise) => exercise.id === "exercise-38-plain-verb");
  assert.ok(direct?.correctAnswers.includes("先生は「宿題をしてください」と言いました"));
  assert.ok(indirect?.correctAnswers.includes("働く"));
  assert.ok(
    lesson038Bundle.sentences.some(
      (sentence) => sentence.japanese === "私は日本語が好きだと言いました。",
    ),
  );
});

test("intention practice separates positive negative and past intentions from wishes", () => {
  const answers = lesson039Bundle.exercises.flatMap((exercise) => exercise.correctAnswers);
  assert.ok(answers.includes("日本語を勉強するつもりです"));
  assert.ok(answers.includes("車を買わないつもりです"));
  assert.ok(
    lesson039Bundle.grammar.some(
      (grammar) => grammar.id === "grammar-tsumori-deshita" && grammar.explanationRu.includes("не говорит, был ли план выполнен"),
    ),
  );
  assert.ok(
    lesson039Bundle.grammar.some(
      (grammar) =>
        grammar.id === "grammar-tai-vs-tsumori" &&
        grammar.explanationRu.includes("Желание") &&
        grammar.explanationRu.includes("つもり сообщает"),
    ),
  );
});

test("schedule and prediction practice drops da before deshou", () => {
  const answers = lesson040Bundle.exercises.flatMap((exercise) => exercise.correctAnswers);
  assert.ok(answers.includes("今日は日本語を勉強する予定です"));
  assert.ok(answers.includes("今日は雨でしょう"));
  assert.ok(answers.includes("この|町|は|静か|でしょう"));
  assert.ok(!answers.some((answer) => /(?:雨|静か)だでしょう/.test(answer)));
  assert.ok(
    lesson040Bundle.grammar.some(
      (grammar) => grammar.id === "grammar-tsumori-vs-yotei" && grammar.explanationRu.includes("фокус различается"),
    ),
  );
});

test("new authored ids are unique inside unit 11", () => {
  const ids = bundles.flatMap((bundle) => [
    bundle.lesson.id,
    ...bundle.vocabulary.map((item) => item.id),
    ...bundle.grammar.map((item) => item.id),
    ...bundle.sentences.map((item) => item.id),
    ...bundle.exercises.map((item) => item.id),
  ]);
  assert.equal(new Set(ids).size, ids.length);
});
