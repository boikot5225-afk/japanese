import assert from "node:assert/strict";
import test from "node:test";

import type { VocabularyItem } from "../domain/course.ts";
import { lessonBundles } from "./courseCatalog.ts";

type AuditedVocabularyItem = VocabularyItem & {
  alternativeReadings?: string[];
};

const compact = (value: string): string =>
  value.trim().normalize("NFKC").replace(/\s+/gu, "");

const allVocabulary = lessonBundles.flatMap((bundle) =>
  bundle.vocabulary.map((word) => ({
    lessonId: bundle.lesson.id,
    word: word as AuditedVocabularyItem,
  })),
);

const allTeachingText = lessonBundles.flatMap((bundle) => [
  bundle.lesson.title,
  bundle.lesson.description,
  ...bundle.grammar.flatMap((grammar) => [
    grammar.title,
    grammar.meaningRu,
    grammar.explanationRu,
    ...grammar.formation,
    ...(grammar.cautions ?? []),
  ]),
  ...bundle.sentences.map((sentence) => sentence.translationRu),
  ...bundle.exercises.flatMap((exercise) => [
    exercise.prompt,
    exercise.explanationRu ?? "",
  ]),
]);

test("the course has one canonical vocabulary card per written form and primary reading", () => {
  const owners = new Map<string, string[]>();

  allVocabulary.forEach(({ lessonId, word }) => {
    const key = `${compact(word.writtenForm)}::${compact(word.reading)}`;
    owners.set(key, [...(owners.get(key) ?? []), `${lessonId}/${word.id}`]);
  });

  const duplicates = [...owners.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([key, entries]) => `${key} => ${entries.join(", ")}`);

  assert.deepEqual(duplicates, [], `duplicate vocabulary cards:\n${duplicates.join("\n")}`);
});

test("primary readings are single speakable readings", () => {
  const malformed = allVocabulary
    .filter(({ word }) => /[／/|]/u.test(word.reading))
    .map(({ lessonId, word }) => `${lessonId}/${word.id}: ${word.reading}`);

  assert.deepEqual(malformed, [], `compound primary readings:\n${malformed.join("\n")}`);
});

test("alternative readings are unique and separate from the primary reading", () => {
  const malformed = allVocabulary.flatMap(({ lessonId, word }) => {
    const alternatives = word.alternativeReadings ?? [];
    const normalized = alternatives.map(compact);
    const issues: string[] = [];
    if (new Set(normalized).size !== normalized.length) {
      issues.push(`${lessonId}/${word.id}: duplicate alternatives`);
    }
    if (normalized.includes(compact(word.reading))) {
      issues.push(`${lessonId}/${word.id}: primary repeated as alternative`);
    }
    return issues;
  });

  assert.deepEqual(malformed, [], malformed.join("\n"));
});

test("example translations contain translations, not editorial stage directions", () => {
  const forbidden = [
    /Предмет находится/u,
    /в зависимости от контекста/iu,
    /\s\/\s/u,
  ];
  const polluted = lessonBundles.flatMap((bundle) =>
    bundle.sentences
      .filter((sentence) => forbidden.some((pattern) => pattern.test(sentence.translationRu)))
      .map((sentence) => `${bundle.lesson.id}/${sentence.id}: ${sentence.translationRu}`),
  );

  assert.deepEqual(polluted, [], `polluted translations:\n${polluted.join("\n")}`);
});

test("the course uses neutral terminology for plain forms", () => {
  const deprecated = allTeachingText.filter((text) => /невежлив/iu.test(text));
  assert.deepEqual(deprecated, [], `deprecated terminology:\n${deprecated.join("\n")}`);
});

test("generated reading prompts do not demand hiragana for every script", () => {
  const misleading = lessonBundles.flatMap((bundle) =>
    bundle.exercises
      .filter((exercise) => /Напиши хираганой чтение/u.test(exercise.prompt))
      .map((exercise) => `${bundle.lesson.id}/${exercise.id}: ${exercise.prompt}`),
  );

  assert.deepEqual(misleading, [], `misleading reading prompts:\n${misleading.join("\n")}`);
});

test("vocabulary audio never contains a printed alternative-reading separator", () => {
  const malformed = lessonBundles.flatMap((bundle) =>
    bundle.exercises
      .filter((exercise) => exercise.audioText && /[／/|]/u.test(exercise.audioText))
      .map((exercise) => `${bundle.lesson.id}/${exercise.id}: ${exercise.audioText}`),
  );

  assert.deepEqual(malformed, [], `unspeakable audio text:\n${malformed.join("\n")}`);
});
