import type {
  KanjiStrokePoint,
  KanjiStrokeVector,
} from "../domain/kanjiStroke";

export type KanjiStrokeIssue =
  | "too-short"
  | "wrong-start"
  | "wrong-direction"
  | "wrong-end"
  | "wrong-shape";

export interface KanjiStrokeAssessment {
  accepted: boolean;
  score: number;
  issue: KanjiStrokeIssue | null;
  startDistance: number;
  endDistance: number;
  averageDistance: number;
  lengthRatio: number;
  directionSimilarity: number;
}

const SAMPLE_COUNT = 28;

const distance = (left: KanjiStrokePoint, right: KanjiStrokePoint): number =>
  Math.hypot(right.x - left.x, right.y - left.y);

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const polylineLength = (points: readonly KanjiStrokePoint[]): number =>
  points.slice(1).reduce(
    (sum, current, index) => sum + distance(points[index] as KanjiStrokePoint, current),
    0,
  );

export const resampleStroke = (
  points: readonly KanjiStrokePoint[],
  count = SAMPLE_COUNT,
): KanjiStrokePoint[] => {
  const first = points[0];
  if (!first || count <= 0) return [];
  if (points.length === 1) {
    return Array.from({ length: count }, () => ({ x: first.x, y: first.y }));
  }

  const cumulative = [0];
  for (let index = 1; index < points.length; index += 1) {
    cumulative.push(
      (cumulative[index - 1] ?? 0) +
        distance(points[index - 1] as KanjiStrokePoint, points[index] as KanjiStrokePoint),
    );
  }
  const total = cumulative[cumulative.length - 1] ?? 0;
  if (total <= 0.001) {
    return Array.from({ length: count }, () => ({ x: first.x, y: first.y }));
  }

  const sampled: KanjiStrokePoint[] = [];
  let segment = 1;
  for (let sampleIndex = 0; sampleIndex < count; sampleIndex += 1) {
    const target = (total * sampleIndex) / Math.max(1, count - 1);
    while (
      segment < cumulative.length - 1 &&
      (cumulative[segment] ?? total) < target
    ) {
      segment += 1;
    }
    const before = points[segment - 1] as KanjiStrokePoint;
    const after = points[segment] as KanjiStrokePoint;
    const startDistance = cumulative[segment - 1] ?? 0;
    const segmentLength = (cumulative[segment] ?? startDistance) - startDistance;
    const ratio = segmentLength <= 0.001 ? 0 : (target - startDistance) / segmentLength;
    sampled.push({
      x: before.x + (after.x - before.x) * ratio,
      y: before.y + (after.y - before.y) * ratio,
    });
  }
  return sampled;
};

export const normalizePadStroke = (
  points: readonly KanjiStrokePoint[],
  width: number,
  height: number,
  viewBoxWidth = 109,
  viewBoxHeight = 109,
): KanjiStrokePoint[] => {
  if (width <= 0 || height <= 0) return [];
  return points.map((item) => ({
    x: (item.x / width) * viewBoxWidth,
    y: (item.y / height) * viewBoxHeight,
  }));
};

const directionSimilarity = (
  actual: readonly KanjiStrokePoint[],
  expected: readonly KanjiStrokePoint[],
): number => {
  const actualStart = actual[0];
  const actualEnd = actual[actual.length - 1];
  const expectedStart = expected[0];
  const expectedEnd = expected[expected.length - 1];
  if (!actualStart || !actualEnd || !expectedStart || !expectedEnd) return -1;

  const actualX = actualEnd.x - actualStart.x;
  const actualY = actualEnd.y - actualStart.y;
  const expectedX = expectedEnd.x - expectedStart.x;
  const expectedY = expectedEnd.y - expectedStart.y;
  const actualLength = Math.hypot(actualX, actualY);
  const expectedLength = Math.hypot(expectedX, expectedY);
  if (actualLength <= 0.001 || expectedLength <= 0.001) return 0;
  return (actualX * expectedX + actualY * expectedY) /
    (actualLength * expectedLength);
};

const averagePointDistance = (
  actual: readonly KanjiStrokePoint[],
  expected: readonly KanjiStrokePoint[],
): number => {
  const count = Math.min(actual.length, expected.length);
  if (count === 0) return Number.POSITIVE_INFINITY;
  return actual.slice(0, count).reduce(
    (sum, item, index) => sum + distance(item, expected[index] as KanjiStrokePoint),
    0,
  ) / count;
};

export const assessKanjiStroke = (
  padPoints: readonly KanjiStrokePoint[],
  expected: KanjiStrokeVector,
  padWidth: number,
  padHeight: number,
): KanjiStrokeAssessment => {
  const normalized = normalizePadStroke(padPoints, padWidth, padHeight);
  const actual = resampleStroke(normalized, expected.samples.length || SAMPLE_COUNT);
  const expectedSamples = expected.samples;
  const actualStart = actual[0];
  const actualEnd = actual[actual.length - 1];
  const actualLength = polylineLength(normalized);
  const startDistance = actualStart
    ? distance(actualStart, expected.start)
    : Number.POSITIVE_INFINITY;
  const endDistance = actualEnd
    ? distance(actualEnd, expected.end)
    : Number.POSITIVE_INFINITY;
  const averageDistance = averagePointDistance(actual, expectedSamples);
  const lengthRatio = expected.length <= 0.001 ? 0 : actualLength / expected.length;
  const similarity = directionSimilarity(actual, expectedSamples);

  const startScore = clamp(1 - startDistance / 24, 0, 1);
  const endScore = clamp(1 - endDistance / 28, 0, 1);
  const shapeScore = clamp(1 - averageDistance / 22, 0, 1);
  const lengthScore = clamp(1 - Math.abs(1 - lengthRatio) / 1.2, 0, 1);
  const directionScore = clamp((similarity + 1) / 2, 0, 1);
  const score = Math.round(
    (startScore * 0.25 +
      endScore * 0.17 +
      shapeScore * 0.36 +
      lengthScore * 0.1 +
      directionScore * 0.12) *
      100,
  );

  let issue: KanjiStrokeIssue | null = null;
  if (padPoints.length < 3 || actualLength < 6) {
    issue = "too-short";
  } else if (startDistance > 22) {
    issue = "wrong-start";
  } else if (similarity < 0.05) {
    issue = "wrong-direction";
  } else if (endDistance > 29) {
    issue = "wrong-end";
  } else if (
    averageDistance > 19 ||
    lengthRatio < 0.38 ||
    lengthRatio > 2.35 ||
    score < 55
  ) {
    issue = "wrong-shape";
  }

  return {
    accepted: issue === null,
    score,
    issue,
    startDistance,
    endDistance,
    averageDistance,
    lengthRatio,
    directionSimilarity: similarity,
  };
};

export const kanjiStrokeIssueMessage = (issue: KanjiStrokeIssue | null): string => {
  switch (issue) {
    case "too-short":
      return "Штрих слишком короткий. Проведи его целиком.";
    case "wrong-start":
      return "Начни ближе к подсвеченной точке.";
    case "wrong-direction":
      return "Направление перепутано. Веди от номера к концу штриха.";
    case "wrong-end":
      return "Конец штриха ушёл слишком далеко от образца.";
    case "wrong-shape":
      return "Форма заметно отличается. Следуй серой траектории точнее.";
    default:
      return "Штрих принят.";
  }
};