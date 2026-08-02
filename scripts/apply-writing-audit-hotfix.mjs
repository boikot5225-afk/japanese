import fs from "node:fs";

const path = "src/engine/writingSession.ts";
const source = fs.readFileSync(path, "utf8");
const before = `  if (\n    metrics.mode === "teach" ||\n    metrics.mode === "guided" ||\n    metrics.hints > 0 ||\n    metrics.mistakes > 0\n  ) {\n    return 2;\n  }\n  return 4;`;
const after = `  if (\n    metrics.mode === "teach" ||\n    metrics.hints > 0 ||\n    metrics.mistakes > 0\n  ) {\n    return 2;\n  }\n  if (metrics.mode === "guided") return 3;\n  return 4;`;
if (!source.includes(before)) throw new Error("Guided grade fragment not found");
fs.writeFileSync(path, source.replace(before, after));

const testPath = "src/engine/writingSession.test.ts";
const tests = fs.readFileSync(testPath, "utf8");
const testBefore = `test("guided and teaching modes never pass as unaided recall", () => {\n  assert.equal(deriveAutomaticWritingGrade({ ...baseMetrics, mode: "guided" }), 2);\n  assert.equal(deriveAutomaticWritingGrade({ ...baseMetrics, mode: "teach" }), 2);\n  assert.equal(getMaximumWritingGrade({ ...baseMetrics, mode: "guided" }), 2);\n});`;
const testAfter = `test("guidance fades without trapping progress", () => {\n  assert.equal(deriveAutomaticWritingGrade({ ...baseMetrics, mode: "teach" }), 2);\n  assert.equal(getMaximumWritingGrade({ ...baseMetrics, mode: "teach" }), 2);\n  assert.equal(deriveAutomaticWritingGrade({ ...baseMetrics, mode: "guided" }), 3);\n  assert.equal(getMaximumWritingGrade({ ...baseMetrics, mode: "guided" }), 3);\n});`;
if (!tests.includes(testBefore)) throw new Error("Guided grade test fragment not found");
fs.writeFileSync(testPath, tests.replace(testBefore, testAfter));
console.log("Guided progression correction applied.");
