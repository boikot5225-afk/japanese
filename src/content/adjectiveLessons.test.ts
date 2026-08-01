import assert from "node:assert/strict";
import test from "node:test";

import { lessonBundles } from "./courseCatalog.ts";

const byId = new Map(lessonBundles.map((bundle) => [bundle.lesson.id, bundle]));

const requireBundle = (lessonId: string) => {
  const bundle = byId.get(lessonId);
  assert.ok(bundle, `${lessonId} is missing from the course catalog`);
  return bundle;
};

test("lesson 11 keeps i-adjective predicate, noun and negative models separate", () => {
  const bundle = requireBundle("lesson-011");
  const grammarIds = bundle.grammar.map((item) => item.id);

  assert.ok(grammarIds.includes("grammar-i-adjective-predicate"));
  assert.ok(grammarIds.includes("grammar-i-adjective-noun"));
  assert.ok(grammarIds.includes("grammar-i-adjective-negative"));
  assert.ok(bundle.sentences.some((item) => item.japanese === "部屋は大きいです。"));
  assert.ok(bundle.sentences.some((item) => item.japanese === "古い車は安くないです。"));

  const answers = bundle.exercises.flatMap((exercise) => exercise.correctAnswers);
  assert.ok(answers.every((answer) => !answer.includes("高いでした")));
  assert.ok(answers.every((answer) => !answer.includes("高いではありません")));
});

test("lesson 12 teaches past i-adjectives and the irregular ii/yoi paradigm", () => {
  const bundle = requireBundle("lesson-012");
  const iiGrammar = bundle.grammar.find((item) => item.id === "grammar-ii-irregular");

  assert.ok(iiGrammar);
  assert.ok(iiGrammar.formation.includes("いいです → よかったです"));
  assert.ok(bundle.sentences.some((item) => item.japanese === "天気はよかったです。"));
  assert.ok(bundle.sentences.some((item) => item.japanese === "昨日は寒くなかったです。"));

  const answers = bundle.exercises.flatMap((exercise) => exercise.correctAnswers);
  assert.ok(answers.every((answer) => !answer.includes("いかった")));
  assert.ok(answers.every((answer) => !answer.includes("寒くないでした")));
});

test("lesson 13 treats kirei as a na-adjective and uses noun-style negation", () => {
  const bundle = requireBundle("lesson-013");
  const kirei = bundle.vocabulary.find((item) => item.id === "word-kirei-na");

  assert.ok(kirei);
  assert.ok(kirei.partOfSpeech.includes("な-прилагательное"));
  assert.ok(bundle.sentences.some((item) => item.japanese === "静かな町です。"));
  assert.ok(bundle.sentences.some((item) => item.japanese === "図書館は便利ではありません。"));

  const answers = bundle.exercises.flatMap((exercise) => exercise.correctAnswers);
  assert.ok(answers.every((answer) => !answer.includes("静かくない")));
  assert.ok(answers.every((answer) => !answer.includes("きれいい")));
});

test("all adjective lessons expose twelve mixed exercises after expansion", () => {
  ["lesson-011", "lesson-012", "lesson-013"].forEach((lessonId) => {
    const bundle = requireBundle(lessonId);
    assert.equal(bundle.exercises.length, 12);

    const types = new Set(bundle.exercises.map((exercise) => exercise.type));
    assert.ok(types.has("multiple-choice"), `${lessonId} lacks recognition practice`);
    assert.ok(types.has("text-input"), `${lessonId} lacks active recall`);
    assert.ok(types.has("listening"), `${lessonId} lacks listening practice`);
  });
});
