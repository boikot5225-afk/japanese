import assert from "node:assert/strict";
import test from "node:test";

import { checkAnswer } from "../engine/checkAnswer.ts";
import { lessonBundles } from "./courseCatalog.ts";
import { lesson015Exercises } from "./lesson015.ts";
import { lesson016Exercises } from "./lesson016.ts";

const byId = new Map(lessonBundles.map((bundle) => [bundle.lesson.id, bundle]));

const requireBundle = (lessonId: string) => {
  const bundle = byId.get(lessonId);
  assert.ok(bundle, `${lessonId} is missing from the course catalog`);
  return bundle;
};

test("lesson 14 applies noun-style past forms to na-adjectives", () => {
  const bundle = requireBundle("lesson-014");
  const grammarIds = bundle.grammar.map((item) => item.id);

  assert.ok(grammarIds.includes("grammar-na-adjective-past"));
  assert.ok(grammarIds.includes("grammar-na-adjective-past-negative"));
  assert.ok(bundle.sentences.some((item) => item.japanese === "昨日、町は静かでした。"));
  assert.ok(
    bundle.sentences.some(
      (item) => item.japanese === "テストは簡単ではありませんでした。",
    ),
  );

  const sourceText = bundle.grammar
    .flatMap((item) => [item.explanationRu, ...item.formation])
    .join(" ");
  assert.ok(!sourceText.includes("静かったです"));
  assert.ok(!sourceText.includes("便利くなかったです"));
});

test("lesson 15 distinguishes preference and skill patterns with ga", () => {
  const bundle = requireBundle("lesson-015");

  assert.ok(bundle.grammar.some((item) => item.id === "grammar-suki-kirai-ga"));
  assert.ok(bundle.grammar.some((item) => item.id === "grammar-jouzu-heta-ga"));
  assert.ok(bundle.sentences.some((item) => item.japanese === "私は音楽が好きです。"));
  assert.ok(bundle.sentences.some((item) => item.japanese === "田中さんは料理が上手です。"));

  bundle.sentences.forEach((sentence) => {
    if (
      sentence.grammarIds.includes("grammar-suki-kirai-ga") ||
      sentence.grammarIds.includes("grammar-jouzu-heta-ga")
    ) {
      assert.ok(sentence.japanese.includes("が"), `${sentence.id} loses the ga-marked target`);
    }
  });
});

test("lesson 15 accepts equivalent dislike wording and an omitted understood topic", () => {
  const exercise = lesson015Exercises.find(
    (item) => item.id === "exercise-supootsu-not-suki-input",
  );
  assert.ok(exercise);

  [
    "私はスポーツが好きではありません",
    "スポーツが好きじゃありません",
    "私はスポーツが嫌いです",
    "スポーツが嫌いです",
  ].forEach((answer) => {
    assert.notEqual(
      checkAnswer(answer, exercise.correctAnswers, exercise.acceptableAnswers).status,
      "incorrect",
      `${exercise.id} rejects natural answer ${answer}`,
    );
  });
});

test("lesson 16 keeps comparison direction, binary choice and superlative distinct", () => {
  const bundle = requireBundle("lesson-016");

  assert.ok(bundle.grammar.some((item) => item.id === "grammar-yori-houga"));
  assert.ok(bundle.grammar.some((item) => item.id === "grammar-dochira-comparison"));
  assert.ok(bundle.grammar.some((item) => item.id === "grammar-ichiban-superlative"));
  assert.ok(bundle.sentences.some((item) => item.japanese === "猫より犬のほうが大きいです。"));
  assert.ok(bundle.sentences.some((item) => item.japanese === "夏と冬とどちらが好きですか。"));
  assert.ok(bundle.sentences.some((item) => item.japanese === "季節では春が一番好きです。"));
});

test("lesson 16 accepts natural comparison alternatives without replacing the taught model", () => {
  const hotter = lesson016Exercises.find(
    (exercise) => exercise.id === "exercise-haru-natsu-input",
  );
  const binaryQuestion = lesson016Exercises.find(
    (exercise) => exercise.id === "exercise-natsu-fuyu-question-input",
  );
  const favorite = lesson016Exercises.find(
    (exercise) => exercise.id === "exercise-kisetsu-ichiban-input",
  );
  assert.ok(hotter);
  assert.ok(binaryQuestion);
  assert.ok(favorite);

  assert.notEqual(
    checkAnswer("夏は春より暑いです", hotter.correctAnswers, hotter.acceptableAnswers).status,
    "incorrect",
  );
  assert.notEqual(
    checkAnswer(
      "夏と冬ではどちらが好きですか",
      binaryQuestion.correctAnswers,
      binaryQuestion.acceptableAnswers,
    ).status,
    "incorrect",
  );
  assert.notEqual(
    checkAnswer(
      "季節の中では春が一番好きです",
      favorite.correctAnswers,
      favorite.acceptableAnswers,
    ).status,
    "incorrect",
  );
});

test("lessons 14-16 expose twelve mixed exercises after expansion", () => {
  ["lesson-014", "lesson-015", "lesson-016"].forEach((lessonId) => {
    const bundle = requireBundle(lessonId);
    assert.equal(bundle.exercises.length, 12);

    const types = new Set(bundle.exercises.map((exercise) => exercise.type));
    assert.ok(types.has("multiple-choice"), `${lessonId} lacks recognition practice`);
    assert.ok(types.has("text-input"), `${lessonId} lacks active recall`);
    assert.ok(types.has("listening"), `${lessonId} lacks listening practice`);
  });
});
