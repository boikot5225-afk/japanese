import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const inputDirectory = path.resolve(
  repositoryRoot,
  process.argv[2] ?? ".cache/kanjivg/kanji",
);
const outputFile = path.resolve(
  repositoryRoot,
  process.argv[3] ?? "src/content/kanjiStrokeData.ts",
);
const catalogFile = path.join(repositoryRoot, "src/content/kanjiCatalog.ts");
const SAMPLE_COUNT = 28;

const round = (value) => Math.round(value * 100) / 100;
const point = (x, y) => ({ x, y });
const distance = (left, right) => Math.hypot(right.x - left.x, right.y - left.y);

const extractLiterals = () => {
  const contentDirectory = path.join(repositoryRoot, "src/content");
  const sourceFiles = fs.readdirSync(contentDirectory)
    .filter((name) => name.endsWith(".ts"))
    .filter((name) => !name.endsWith(".test.ts"))
    .filter((name) => name !== "kanjiStrokeData.ts");
  const source = sourceFiles
    .map((name) => fs.readFileSync(path.join(contentDirectory, name), "utf8"))
    .join("\n");
  return [...new Set(source.match(/\p{Script=Han}/gu) ?? [])];
};

const tokenizePath = (value) =>
  value.match(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/gu) ?? [];

const cubicPoint = (start, control1, control2, end, t) => {
  const inverse = 1 - t;
  return point(
    inverse ** 3 * start.x +
      3 * inverse ** 2 * t * control1.x +
      3 * inverse * t ** 2 * control2.x +
      t ** 3 * end.x,
    inverse ** 3 * start.y +
      3 * inverse ** 2 * t * control1.y +
      3 * inverse * t ** 2 * control2.y +
      t ** 3 * end.y,
  );
};

const quadraticPoint = (start, control, end, t) => {
  const inverse = 1 - t;
  return point(
    inverse ** 2 * start.x + 2 * inverse * t * control.x + t ** 2 * end.x,
    inverse ** 2 * start.y + 2 * inverse * t * control.y + t ** 2 * end.y,
  );
};

const reflect = (control, around) =>
  point(around.x * 2 - control.x, around.y * 2 - control.y);

const parseSvgPath = (value) => {
  const tokens = tokenizePath(value);
  const points = [];
  let index = 0;
  let command = "";
  let current = point(0, 0);
  let subpathStart = point(0, 0);
  let previousCubicControl = null;
  let previousQuadraticControl = null;

  const addPoint = (next) => {
    const last = points[points.length - 1];
    if (!last || distance(last, next) > 0.001) points.push(next);
    current = next;
  };

  const readNumbers = (count) => {
    if (index + count > tokens.length) {
      throw new Error(`Invalid SVG path near ${tokens.slice(index).join(" ")}`);
    }
    return Array.from({ length: count }, () => Number(tokens[index++]));
  };

  const absolutePoint = (x, y, relative) =>
    relative ? point(current.x + x, current.y + y) : point(x, y);

  while (index < tokens.length) {
    if (/^[a-zA-Z]$/u.test(tokens[index])) command = tokens[index++];
    if (!command) throw new Error(`SVG path starts without a command: ${value}`);

    const relative = command === command.toLowerCase();
    const upper = command.toUpperCase();

    if (upper === "Z") {
      addPoint(subpathStart);
      previousCubicControl = null;
      previousQuadraticControl = null;
      command = "";
      continue;
    }

    if (upper === "M") {
      const [x, y] = readNumbers(2);
      const next = absolutePoint(x, y, relative);
      addPoint(next);
      subpathStart = next;
      previousCubicControl = null;
      previousQuadraticControl = null;
      command = relative ? "l" : "L";
      continue;
    }

    if (upper === "L") {
      const [x, y] = readNumbers(2);
      addPoint(absolutePoint(x, y, relative));
      previousCubicControl = null;
      previousQuadraticControl = null;
      continue;
    }

    if (upper === "H") {
      const [x] = readNumbers(1);
      addPoint(point(relative ? current.x + x : x, current.y));
      previousCubicControl = null;
      previousQuadraticControl = null;
      continue;
    }

    if (upper === "V") {
      const [y] = readNumbers(1);
      addPoint(point(current.x, relative ? current.y + y : y));
      previousCubicControl = null;
      previousQuadraticControl = null;
      continue;
    }

    if (upper === "C") {
      const [x1, y1, x2, y2, x, y] = readNumbers(6);
      const start = current;
      const control1 = absolutePoint(x1, y1, relative);
      const control2 = absolutePoint(x2, y2, relative);
      const end = absolutePoint(x, y, relative);
      for (let step = 1; step <= 10; step += 1) {
        addPoint(cubicPoint(start, control1, control2, end, step / 10));
      }
      previousCubicControl = control2;
      previousQuadraticControl = null;
      continue;
    }

    if (upper === "S") {
      const [x2, y2, x, y] = readNumbers(4);
      const start = current;
      const control1 = previousCubicControl
        ? reflect(previousCubicControl, current)
        : current;
      const control2 = absolutePoint(x2, y2, relative);
      const end = absolutePoint(x, y, relative);
      for (let step = 1; step <= 10; step += 1) {
        addPoint(cubicPoint(start, control1, control2, end, step / 10));
      }
      previousCubicControl = control2;
      previousQuadraticControl = null;
      continue;
    }

    if (upper === "Q") {
      const [x1, y1, x, y] = readNumbers(4);
      const start = current;
      const control = absolutePoint(x1, y1, relative);
      const end = absolutePoint(x, y, relative);
      for (let step = 1; step <= 8; step += 1) {
        addPoint(quadraticPoint(start, control, end, step / 8));
      }
      previousQuadraticControl = control;
      previousCubicControl = null;
      continue;
    }

    if (upper === "T") {
      const [x, y] = readNumbers(2);
      const start = current;
      const control = previousQuadraticControl
        ? reflect(previousQuadraticControl, current)
        : current;
      const end = absolutePoint(x, y, relative);
      for (let step = 1; step <= 8; step += 1) {
        addPoint(quadraticPoint(start, control, end, step / 8));
      }
      previousQuadraticControl = control;
      previousCubicControl = null;
      continue;
    }

    if (upper === "A") {
      const [, , , , , x, y] = readNumbers(7);
      addPoint(absolutePoint(x, y, relative));
      previousCubicControl = null;
      previousQuadraticControl = null;
      continue;
    }

    throw new Error(`Unsupported SVG command ${command} in ${value}`);
  }

  return points;
};

const resample = (points, count) => {
  if (points.length === 0) return [];
  if (points.length === 1) return Array.from({ length: count }, () => points[0]);

  const cumulative = [0];
  for (let index = 1; index < points.length; index += 1) {
    cumulative.push(cumulative[index - 1] + distance(points[index - 1], points[index]));
  }
  const total = cumulative[cumulative.length - 1];
  if (total <= 0.001) return Array.from({ length: count }, () => points[0]);

  const sampled = [];
  let segment = 1;
  for (let sampleIndex = 0; sampleIndex < count; sampleIndex += 1) {
    const target = (total * sampleIndex) / (count - 1);
    while (segment < cumulative.length - 1 && cumulative[segment] < target) {
      segment += 1;
    }
    const before = points[segment - 1];
    const after = points[segment];
    const startDistance = cumulative[segment - 1];
    const segmentLength = cumulative[segment] - startDistance;
    const ratio = segmentLength <= 0.001 ? 0 : (target - startDistance) / segmentLength;
    sampled.push(
      point(
        before.x + (after.x - before.x) * ratio,
        before.y + (after.y - before.y) * ratio,
      ),
    );
  }
  return sampled;
};

const extractAttributes = (tag) => {
  const attributes = {};
  for (const match of tag.matchAll(/([:\w-]+)="([^"]*)"/gu)) {
    attributes[match[1]] = match[2];
  }
  return attributes;
};

const extractStrokeData = (literal) => {
  const codePoint = literal.codePointAt(0);
  if (codePoint === undefined) throw new Error(`Invalid literal ${literal}`);
  const fileName = `${codePoint.toString(16).padStart(5, "0")}.svg`;
  const filePath = path.join(inputDirectory, fileName);
  if (!fs.existsSync(filePath)) throw new Error(`Missing KanjiVG file ${filePath}`);
  const source = fs.readFileSync(filePath, "utf8");
  const strokeTags = [...source.matchAll(/<path\b[^>]*\/>/gu)]
    .map((match) => extractAttributes(match[0]))
    .filter((attributes) => /-s\d+$/u.test(attributes.id ?? ""))
    .sort((left, right) => {
      const leftNumber = Number(left.id.match(/-s(\d+)$/u)?.[1] ?? 0);
      const rightNumber = Number(right.id.match(/-s(\d+)$/u)?.[1] ?? 0);
      return leftNumber - rightNumber;
    });

  if (strokeTags.length === 0) throw new Error(`No strokes found for ${literal}`);

  const strokes = strokeTags.map((attributes) => {
    const pathValue = attributes.d;
    if (!pathValue) throw new Error(`Stroke without path data for ${literal}`);
    const densePoints = parseSvgPath(pathValue);
    const samples = resample(densePoints, SAMPLE_COUNT);
    const length = densePoints.slice(1).reduce(
      (sum, current, index) => sum + distance(densePoints[index], current),
      0,
    );
    return {
      path: pathValue,
      start: { x: round(samples[0].x), y: round(samples[0].y) },
      end: {
        x: round(samples[samples.length - 1].x),
        y: round(samples[samples.length - 1].y),
      },
      samples: samples.map((sample) => ({ x: round(sample.x), y: round(sample.y) })),
      length: round(length),
    };
  });

  return {
    literal,
    viewBox: [0, 0, 109, 109],
    strokes,
    source: "KanjiVG",
  };
};

const literals = extractLiterals();
const data = Object.fromEntries(literals.map((literal) => [literal, extractStrokeData(literal)]));
const generated = `import type { KanjiStrokeData } from "../domain/kanjiStroke";\n\n` +
  `// Generated from KanjiVG (https://kanjivg.tagaini.net/).\n` +
  `// Copyright Ulrich Apel and contributors, CC BY-SA 3.0.\n` +
  `// Do not edit manually; run npm run generate:kanji-strokes.\n` +
  `export const kanjiStrokeDataByLiteral: Readonly<Record<string, KanjiStrokeData>> = ${JSON.stringify(data)};\n\n` +
  `export const getKanjiStrokeData = (literal: string): KanjiStrokeData | undefined =>\n` +
  `  kanjiStrokeDataByLiteral[literal];\n`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, generated, "utf8");
console.log(`Generated ${literals.length} kanji with ${Object.values(data).reduce((sum, item) => sum + item.strokes.length, 0)} strokes.`);
