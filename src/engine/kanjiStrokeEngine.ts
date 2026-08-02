import type {
  KanjiStrokePoint,
  KanjiStrokeVector,
} from "../domain/kanjiStroke";

export type KanjiStrokeIssue =
  | "too-short"
  | "too-long"
  | "wrong-start"
  | "wrong-position"
  | "wrong-direction"
  | "wrong-end"
  | "wrong-corners"
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
  angleDifference: number;
  centerDistance: number;
  cornerCount: number;
  expectedCornerCount: number;
}

const SAMPLE_COUNT = 28;
const DIAGONAL_INTERVAL = 40;
const STRAW_WINDOW = 3;
const MEDIAN_THRESHOLD = 0.95;
const LINE_THRESHOLD = 0.8;

const MAX_ANGLE_DIFFERENCE = 60;
const MAX_CENTER_DISTANCE = 0.3;
const MIN_CORNER_LENGTH_RATIO = 0.5;
const MAX_CORNER_LENGTH_RATIO = 2;
const LINE_MIN_CORNER_LENGTH_RATIO = MIN_CORNER_LENGTH_RATIO / 2;
const LINE_MAX_CORNER_LENGTH_RATIO = MAX_CORNER_LENGTH_RATIO * 2;

const SHALLOW_CORNER_DEGREES = 18;
const TECHNICAL_SEGMENT_RATIO = 0.06;
const TECHNICAL_CORNER_MAX_DEGREES = 105;

const distance = (left: KanjiStrokePoint, right: KanjiStrokePoint): number =>
  Math.hypot(right.x - left.x, right.y - left.y);

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const polylineLength = (points: readonly KanjiStrokePoint[]): number =>
  points.slice(1).reduce(
    (sum, current, index) =>
      sum + distance(points[index] as KanjiStrokePoint, current),
    0,
  );

const normalizedAngleDifference = (left: number, right: number): number => {
  const raw = Math.abs(left - right) % 360;
  return Math.min(raw, 360 - raw);
};

const turnAngle = (
  before: KanjiStrokePoint,
  corner: KanjiStrokePoint,
  after: KanjiStrokePoint,
): number => {
  const firstX = corner.x - before.x;
  const firstY = corner.y - before.y;
  const secondX = after.x - corner.x;
  const secondY = after.y - corner.y;
  const firstLength = Math.hypot(firstX, firstY);
  const secondLength = Math.hypot(secondX, secondY);
  if (firstLength <= 0.000001 || secondLength <= 0.000001) return 0;
  const cosine = clamp(
    (firstX * secondX + firstY * secondY) /
      (firstLength * secondLength),
    -1,
    1,
  );
  return Math.acos(cosine) * (180 / Math.PI);
};

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
        distance(
          points[index - 1] as KanjiStrokePoint,
          points[index] as KanjiStrokePoint,
        ),
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
    const ratio = segmentLength <= 0.001
      ? 0
      : (target - startDistance) / segmentLength;
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
  const actualEnd = actual.at(-1);
  const expectedStart = expected[0];
  const expectedEnd = expected.at(-1);
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
    (sum, item, index) =>
      sum + distance(item, expected[index] as KanjiStrokePoint),
    0,
  ) / count;
};

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  center: KanjiStrokePoint;
}

const pointBounds = (
  points: readonly KanjiStrokePoint[],
  radius = 0,
): Bounds => {
  if (points.length === 0) {
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      center: { x: 0, y: 0 },
    };
  }

  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  points.forEach((point) => {
    left = Math.min(left, point.x - radius);
    top = Math.min(top, point.y - radius);
    right = Math.max(right, point.x + radius);
    bottom = Math.max(bottom, point.y + radius);
  });
  const width = right - left;
  const height = bottom - top;
  return {
    left,
    top,
    right,
    bottom,
    width,
    height,
    center: { x: left + width / 2, y: top + height / 2 },
  };
};

const angle = (points: readonly KanjiStrokePoint[]): number => {
  const start = points[0];
  const end = points[1] ?? points.at(-1);
  if (!start || !end) return 0;
  return Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
};

const pathDistance = (
  points: readonly KanjiStrokePoint[],
  start: number,
  end: number,
): number => {
  let total = 0;
  for (let index = start; index < end; index += 1) {
    const left = points[index];
    const right = points[index + 1];
    if (left && right) total += distance(left, right);
  }
  return total;
};

const isLineSegment = (
  points: readonly KanjiStrokePoint[],
  start: number,
  end: number,
): boolean => {
  const first = points[start];
  const last = points[end];
  if (!first || !last) return true;
  const path = pathDistance(points, start, end);
  if (path <= 0.000001) return true;
  return distance(first, last) / path > LINE_THRESHOLD;
};

const median = (values: readonly number[]): number => {
  const sorted = values.filter(Number.isFinite).sort((left, right) => left - right);
  if (sorted.length === 0) return 0;
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
  }
  return sorted[middle] ?? 0;
};

const resampleForCorners = (
  source: readonly KanjiStrokePoint[],
  spacing: number,
): KanjiStrokePoint[] => {
  const points = source.map((point) => ({ ...point }));
  const first = points[0];
  if (!first) return [];
  if (spacing <= 0.000001) return [first, points.at(-1) ?? first];

  const result: KanjiStrokePoint[] = [first];
  let carried = 0;
  let previous = first;

  for (let index = 1; index < points.length; index += 1) {
    const current = points[index] as KanjiStrokePoint;
    let segmentLength = distance(previous, current);
    if (segmentLength <= 0.000001) continue;

    while (carried + segmentLength >= spacing) {
      const ratio = (spacing - carried) / segmentLength;
      const inserted = {
        x: previous.x + ratio * (current.x - previous.x),
        y: previous.y + ratio * (current.y - previous.y),
      };
      result.push(inserted);
      previous = inserted;
      segmentLength = distance(previous, current);
      carried = 0;
      if (segmentLength <= 0.000001) break;
    }

    carried += segmentLength;
    previous = current;
  }

  const last = points.at(-1) as KanjiStrokePoint;
  if (distance(result.at(-1) as KanjiStrokePoint, last) > 0.000001) {
    result.push(last);
  }
  return result;
};

const halfwayCorner = (
  straws: readonly number[],
  start: number,
  end: number,
): number => {
  const quarter = (end - start) / 4;
  let minimum = Number.POSITIVE_INFINITY;
  let minimumIndex = 0;
  for (
    let index = Math.ceil(start + quarter);
    index < Math.floor(end - quarter);
    index += 1
  ) {
    const value = straws[index];
    if (value !== undefined && value < minimum) {
      minimum = value;
      minimumIndex = index;
    }
  }
  return minimumIndex;
};

const postProcessCornerIndexes = (
  points: readonly KanjiStrokePoint[],
  initialCorners: readonly number[],
  straws: readonly number[],
): number[] => {
  const corners = [...initialCorners];
  let changed = true;
  while (changed) {
    changed = false;
    for (let index = 1; index < corners.length; index += 1) {
      const first = corners[index - 1] as number;
      const second = corners[index] as number;
      if (!isLineSegment(points, first, second)) {
        const corner = halfwayCorner(straws, first, second);
        if (corner > first && corner < second) {
          corners.splice(index, 0, corner);
          changed = true;
        }
      }
    }
  }

  for (let index = 1; index < corners.length - 1; index += 1) {
    const first = corners[index - 1] as number;
    const third = corners[index + 1] as number;
    if (isLineSegment(points, first, third)) {
      corners.splice(index, 1);
      index -= 1;
    }
  }
  return corners;
};

const removeTechnicalCorners = (
  corners: readonly KanjiStrokePoint[],
): KanjiStrokePoint[] => {
  const simplified = corners.map((point) => ({ ...point }));
  let changed = true;

  while (changed && simplified.length > 2) {
    changed = false;
    const totalLength = Math.max(polylineLength(simplified), 0.000001);
    for (let index = 1; index < simplified.length - 1; index += 1) {
      const before = simplified[index - 1] as KanjiStrokePoint;
      const corner = simplified[index] as KanjiStrokePoint;
      const after = simplified[index + 1] as KanjiStrokePoint;
      const leftLength = distance(before, corner);
      const rightLength = distance(corner, after);
      const shortRatio = Math.min(leftLength, rightLength) / totalLength;
      const degrees = turnAngle(before, corner, after);
      const shallow = degrees < SHALLOW_CORNER_DEGREES;
      const technical =
        shortRatio < TECHNICAL_SEGMENT_RATIO &&
        degrees < TECHNICAL_CORNER_MAX_DEGREES;
      if (shallow || technical) {
        simplified.splice(index, 1);
        changed = true;
        break;
      }
    }
  }

  return simplified;
};

export const findStrokeCorners = (
  source: readonly KanjiStrokePoint[],
): KanjiStrokePoint[] => {
  if (source.length <= 2) return source.map((point) => ({ ...point }));
  const bounds = pointBounds(source);
  const spacing = Math.hypot(bounds.width, bounds.height) / DIAGONAL_INTERVAL;
  const points = resampleForCorners(source, spacing);
  if (points.length <= STRAW_WINDOW * 2 + 1) {
    return [points[0] as KanjiStrokePoint, points.at(-1) as KanjiStrokePoint];
  }

  const straws: number[] = [];
  for (
    let index = STRAW_WINDOW;
    index < points.length - STRAW_WINDOW;
    index += 1
  ) {
    straws[index] = distance(
      points[index - STRAW_WINDOW] as KanjiStrokePoint,
      points[index + STRAW_WINDOW] as KanjiStrokePoint,
    );
  }
  const threshold = median(straws) * MEDIAN_THRESHOLD;
  const cornerIndexes = [0];

  for (
    let index = STRAW_WINDOW;
    index < points.length - STRAW_WINDOW;
    index += 1
  ) {
    const straw = straws[index];
    if (straw === undefined || straw >= threshold) continue;
    let localMinimum = Number.POSITIVE_INFINITY;
    let localMinimumIndex = index;
    while (index < straws.length) {
      const value = straws[index];
      if (value === undefined || value >= threshold) break;
      if (value < localMinimum) {
        localMinimum = value;
        localMinimumIndex = index;
      }
      index += 1;
    }
    cornerIndexes.push(localMinimumIndex);
  }
  cornerIndexes.push(points.length - 1);

  const extracted = postProcessCornerIndexes(points, cornerIndexes, straws).map(
    (index) => points[index] as KanjiStrokePoint,
  );
  return removeTechnicalCorners(extracted);
};

export const assessKanjiStroke = (
  padPoints: readonly KanjiStrokePoint[],
  expected: KanjiStrokeVector,
  padWidth: number,
  padHeight: number,
): KanjiStrokeAssessment => {
  const normalized = normalizePadStroke(padPoints, padWidth, padHeight);
  const actualUnit = normalized.map((point) => ({
    x: point.x / 109,
    y: point.y / 109,
  }));
  const expectedUnit = expected.samples.map((point) => ({
    x: point.x / 109,
    y: point.y / 109,
  }));
  const actualCorners = findStrokeCorners(actualUnit);
  const expectedCorners = findStrokeCorners(expectedUnit);
  const actualStart = normalized[0];
  const actualEnd = normalized.at(-1);
  const startDistance = actualStart
    ? distance(actualStart, expected.start)
    : Number.POSITIVE_INFINITY;
  const endDistance = actualEnd
    ? distance(actualEnd, expected.end)
    : Number.POSITIVE_INFINITY;
  const actualResampled = resampleStroke(
    normalized,
    expected.samples.length || SAMPLE_COUNT,
  );
  const averageDistance = averagePointDistance(actualResampled, expected.samples);
  const similarity = directionSimilarity(actualUnit, expectedUnit);
  const actualCornerLength = polylineLength(actualCorners);
  const expectedCornerLength = polylineLength(expectedCorners);
  const lengthRatio = expectedCornerLength <= 0.000001
    ? 0
    : actualCornerLength / expectedCornerLength;
  const angleDifference = normalizedAngleDifference(
    angle(actualCorners),
    angle(expectedCorners),
  );
  const centerDistance = distance(
    pointBounds(actualUnit, 0.01).center,
    pointBounds(expectedUnit).center,
  );
  const expectedIsLine = expectedCorners.length === 2;
  const minimumLength = expectedIsLine
    ? LINE_MIN_CORNER_LENGTH_RATIO
    : MIN_CORNER_LENGTH_RATIO;
  const maximumLength = expectedIsLine
    ? LINE_MAX_CORNER_LENGTH_RATIO
    : MAX_CORNER_LENGTH_RATIO;

  // Curved complex strokes can legitimately lose one ShortStraw corner under
  // natural finger smoothing. Skritter's curated minPoints permits this, but a
  // simple three-point hook must still keep its only turn.
  const oneSmoothedComplexCorner =
    expectedCorners.length >= 4 &&
    actualCorners.length === expectedCorners.length - 1 &&
    angleDifference <= 15 &&
    centerDistance <= 0.08 &&
    lengthRatio >= 0.75 &&
    lengthRatio <= 1.25;

  let issue: KanjiStrokeIssue | null = null;
  if (padPoints.length < 2 || actualCornerLength <= 0.01) {
    issue = "too-short";
  } else if (angleDifference > MAX_ANGLE_DIFFERENCE) {
    issue = "wrong-direction";
  } else if (centerDistance > MAX_CENTER_DISTANCE) {
    issue = "wrong-position";
  } else if (
    actualCorners.length < expectedCorners.length &&
    !oneSmoothedComplexCorner
  ) {
    issue = "wrong-corners";
  } else if (lengthRatio < minimumLength) {
    issue = "too-short";
  } else if (lengthRatio > maximumLength) {
    issue = "too-long";
  }

  const cornerDifference = Math.abs(
    actualCorners.length - expectedCorners.length,
  );
  const penalties =
    angleDifference + centerDistance * 400 + cornerDifference * 100;
  const score = Math.round(clamp(100 - penalties / 4, 0, 100));

  return {
    accepted: issue === null,
    score,
    issue,
    startDistance,
    endDistance,
    averageDistance,
    lengthRatio,
    directionSimilarity: similarity,
    angleDifference,
    centerDistance,
    cornerCount: actualCorners.length,
    expectedCornerCount: expectedCorners.length,
  };
};

export const kanjiStrokeIssueMessage = (
  issue: KanjiStrokeIssue | null,
): string => {
  switch (issue) {
    case "too-short":
      return "Штрих слишком короткий. Попробуй ещё раз.";
    case "too-long":
      return "Штрих получился слишком длинным. Попробуй ещё раз.";
    case "wrong-position":
    case "wrong-start":
    case "wrong-end":
      return "Штрих расположен не там. Попробуй ещё раз.";
    case "wrong-direction":
      return "Штрих проведён в обратном направлении.";
    case "wrong-corners":
    case "wrong-shape":
      return "Форма штриха не распознана. Попробуй ещё раз.";
    default:
      return "Штрих принят.";
  }
};
