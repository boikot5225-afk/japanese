import assert from "node:assert/strict";
import test from "node:test";

import { inferExerciseSkill } from "../engine/reviewEngine";
import { lessonBundles } from "./courseCatalog.ts";
import { n5KanjiCatalog } from "./kanjiCatalog.ts";
import {
  extractKanjiLiterals,
  getKanjiDefinitionPresentation,
  getRequiredLessonKanjiLiterals,
} from "./kanjiCurriculum.ts";

const expectedN5 =
  "安一飲右雨駅円火花下何会外学間気九休魚金空月見言古五後午語校口行高国今左三山四子耳時七車社手週十出書女小少上食新人水生西川千先前足多大男中長天店電土東道読南二日入年買白八半百父分聞母北木本毎万名目友来立六話";

test("standalone N5 catalog remains the complete 103-character benchmark", () => {
  assert.equal(n5KanjiCatalog.length, 103);
  assert.equal(new Set(n5KanjiCatalog.map((item) => item.literal)).size, 103);
  assert.deepEqual(
    [...n5KanjiCatalog.map((item) => item.literal)].sort(),
    [...expectedN5].sort(),
  );
});

test("lesson kanji are introduced on first actual use and never assigned arbitrarily", () => {
  const introduced = new Set<string>();
  const owners = new Map<string, string>();

  lessonBundles.forEach((bundle) => {
    const required = getRequiredLessonKanjiLiterals(bundle);
    const expectedNew = required.filter((literal) => !introduced.has(literal));
    const actual = (bundle.kanji ?? []).map((item) => item.literal);

    assert.deepEqual(actual, expectedNew, bundle.lesson.id + " has unrelated or missing kanji");
    assert.equal(new Set(actual).size, actual.length, bundle.lesson.id + " repeats a glyph");

    (bundle.kanji ?? []).forEach((item) => {
      assert.equal(item.introducedInLessonId, bundle.lesson.id);
      assert.equal(item.id, "kanji-" + item.literal);
      assert.ok(item.examples[0]?.written.includes(item.literal));
      assert.equal(owners.has(item.literal), false, item.literal + " introduced twice");
      owners.set(item.literal, bundle.lesson.id);
      introduced.add(item.literal);
    });

    bundle.exercises.forEach((exercise) => {
      const visible = [
        exercise.prompt,
        ...exercise.correctAnswers,
        ...(exercise.acceptableAnswers ?? []),
        ...(exercise.distractors ?? []),
      ].flatMap(extractKanjiLiterals);
      visible.forEach((literal) => {
        assert.ok(
          introduced.has(literal),
          bundle.lesson.id + "/" + exercise.id + " tests " + literal + " before writing introduction",
        );
      });
    });
  });

});

test("lesson 13 words are covered by cumulative writing introduction", () => {
  const lesson13Index = lessonBundles.findIndex((bundle) => bundle.lesson.id === "lesson-013");
  assert.ok(lesson13Index >= 0);
  const cumulative = new Set(
    lessonBundles
      .slice(0, lesson13Index + 1)
      .flatMap((bundle) => (bundle.kanji ?? []).map((item) => item.literal)),
  );
  const lesson13 = lessonBundles[lesson13Index];
  assert.ok(lesson13);
  const visibleWordKanji = lesson13.vocabulary.flatMap((item) =>
    extractKanjiLiterals(item.writtenForm),
  );
  visibleWordKanji.forEach((literal) => {
    assert.ok(cumulative.has(literal), "lesson 13 did not introduce " + literal);
  });
  "静元気有名便利町公園図書館".split("").forEach((literal) => {
    assert.ok(cumulative.has(literal), "expected lesson context glyph missing: " + literal);
  });
});

test("context-only kanji cards show the complete compound instead of lying about one glyph", () => {
  const lesson13 = lessonBundles.find((bundle) => bundle.lesson.id === "lesson-013");
  assert.ok(lesson13);
  const yu = lesson13.kanji?.find((item) => item.literal === "有");
  assert.ok(yu);
  assert.equal(yu.contextualOnly, true);

  const presentation = getKanjiDefinitionPresentation(yu);
  assert.equal(presentation.contextual, true);
  assert.equal(presentation.written, "有名");
  assert.equal(presentation.answer, yu.examples[0]?.meaningRu);
  assert.match(presentation.detail, /относится ко всему слову/u);
  assert.doesNotMatch(presentation.prompt, /этот кандзи/u);
});

test("language practice stays compact while every new lesson kanji gets three review skills", () => {
  lessonBundles.forEach((bundle) => {
    assert.equal(bundle.exercises.length, 12, bundle.lesson.id + " no longer has compact practice");
    assert.equal(
      bundle.exercises.filter((exercise) => exercise.contentKey?.startsWith("kanji:")).length,
      0,
      bundle.lesson.id + " contains obsolete inline kanji quizzes",
    );

    const reviewExercises = bundle.reviewExercises ?? [];
    assert.equal(
      reviewExercises.length,
      12 + 3 * (bundle.kanji?.length ?? 0),
      bundle.lesson.id + " review pool has incomplete kanji skills",
    );

    (bundle.kanji ?? []).forEach((item) => {
      const skills = new Set(
        reviewExercises
          .filter((exercise) =>
            exercise.targetItemIds.includes(item.id) &&
            exercise.contentKey?.startsWith("kanji:" + item.literal + ":"),
          )
          .map(inferExerciseSkill),
      );
      assert.deepEqual(skills, new Set(["recognition", "reading", "writing"]));
    });
  });
});

test("kanji recall prompts never print the missing glyph or parenthesized answer", () => {
  const reviewExercises = lessonBundles.flatMap(
    (bundle) => bundle.reviewExercises ?? bundle.exercises,
  );
  reviewExercises
    .filter((exercise) => exercise.skill === "reading" && exercise.contentKey?.startsWith("kanji:"))
    .forEach((exercise) => assert.doesNotMatch(exercise.prompt, /（[^）]+）/u));
  reviewExercises
    .filter((exercise) => exercise.skill === "writing" && exercise.contentKey?.startsWith("kanji:"))
    .forEach((exercise) => {
      const literal = exercise.correctAnswers[0];
      assert.ok(literal);
      assert.equal(exercise.prompt.includes(literal), false, exercise.id + " reveals " + literal);
    });
});

test("explicit reading skill overrides generic text input interaction", () => {
  const reading = lessonBundles
    .flatMap((bundle) => bundle.reviewExercises ?? bundle.exercises)
    .find((exercise) => exercise.skill === "reading" && exercise.type === "text-input");
  assert.ok(reading);
  assert.equal(inferExerciseSkill(reading), "reading");
});
