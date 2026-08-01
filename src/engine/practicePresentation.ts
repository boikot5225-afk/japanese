import type { Exercise } from "../domain/course";

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededShuffle = <T>(values: readonly T[], seedText: string): T[] => {
  const shuffled = [...values];
  let seed = hashString(seedText);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    const temporary = shuffled[index];
    shuffled[index] = shuffled[swapIndex] as T;
    shuffled[swapIndex] = temporary as T;
  }
  return shuffled;
};

const rotate = <T>(values: readonly T[], shift: number): T[] => {
  if (values.length < 2) return [...values];
  const normalizedShift = ((shift % values.length) + values.length) % values.length;
  return [...values.slice(normalizedShift), ...values.slice(0, normalizedShift)];
};

export const createChoiceOptionOrder = (
  exercise: Exercise,
  presentationKey: string,
): string[] => {
  const uniqueOptions = Array.from(
    new Set([...exercise.correctAnswers, ...(exercise.distractors ?? [])]),
  );
  if (uniqueOptions.length < 2) return uniqueOptions;

  const baseOrder = seededShuffle(uniqueOptions, `${exercise.id}:choice-base`);
  const shift = hashString(`${presentationKey}:choice-position`) % baseOrder.length;
  return rotate(baseOrder, shift);
};

const startsWithCorrectSequence = (
  pool: readonly string[],
  correctSequence: readonly string[],
): boolean =>
  correctSequence.length > 1 &&
  pool.slice(0, correctSequence.length).every((token, index) => token === correctSequence[index]);

export const createBuilderTokenOrder = (
  tokens: readonly string[],
  correctSequence: readonly string[],
  presentationKey: string,
): string[] => {
  let ordered = seededShuffle(tokens, `${presentationKey}:builder`);
  let rotations = 0;

  while (
    startsWithCorrectSequence(ordered, correctSequence) &&
    rotations < ordered.length
  ) {
    ordered = rotate(ordered, 1);
    rotations += 1;
  }

  return ordered;
};

export const retainAvailableTokenOrder = (
  orderedTokens: readonly string[],
  availableTokens: readonly string[],
): string[] => {
  const availableCounts = new Map<string, number>();
  availableTokens.forEach((token) => {
    availableCounts.set(token, (availableCounts.get(token) ?? 0) + 1);
  });

  const retained = orderedTokens.filter((token) => {
    const count = availableCounts.get(token) ?? 0;
    if (count <= 0) return false;
    availableCounts.set(token, count - 1);
    return true;
  });

  availableCounts.forEach((count, token) => {
    for (let index = 0; index < count; index += 1) retained.push(token);
  });

  return retained;
};
