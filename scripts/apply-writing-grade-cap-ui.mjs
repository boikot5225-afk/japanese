import fs from "node:fs";

const path = "src/components/SkritterWritingPad.tsx";
let source = fs.readFileSync(path, "utf8");
const before = `      setSuggestedGrade(grade);\n      setMaximumGrade(grade <= 2 ? grade : 4);\n      setFeedback(message);`;
const after = `      setSuggestedGrade(grade);\n      setMaximumGrade(\n        grade <= 2\n          ? grade\n          : getMaximumWritingGrade(metricsFor(nextCompleted)),\n      );\n      setFeedback(message);`;
if (!source.includes(before)) {
  if (source.includes("getMaximumWritingGrade(metricsFor(nextCompleted))")) {
    console.log("UI grade cap already applied.");
    process.exit(0);
  }
  throw new Error("UI grade cap fragment not found");
}
source = source.replace(before, after);
source = source.replace(
  `    [autoAdvance],\n  );`,
  `    [autoAdvance, metricsFor],\n  );`,
);
fs.writeFileSync(path, source);
console.log("UI grade cap now follows writing metrics.");
