import fs from "node:fs";

const path = "scripts/apply-writing-audit.mjs";
let source = fs.readFileSync(path, "utf8");
const replacements = [
  ["${definition.label}", "\\${definition.label}"],
  ["${maximumGrade}", "\\${maximumGrade}"],
  ["${kanji.literal}", "\\${kanji.literal}"],
  ["${kanji.meaningsRu[0] ?? \"кандзи\"}", "\\${kanji.meaningsRu[0] ?? \"кандзи\"}"],
];
for (const [before, after] of replacements) {
  source = source.split(before).join(after);
}
fs.writeFileSync(path, source);
console.log("Audit migration template literals escaped.");
