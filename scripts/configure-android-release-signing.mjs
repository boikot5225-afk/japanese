import fs from "node:fs";
import path from "node:path";

const buildGradle = path.resolve("android/app/build.gradle");
const required = [
  "ANDROID_KEYSTORE_FILE",
  "ANDROID_KEYSTORE_PASSWORD",
  "ANDROID_KEY_ALIAS",
  "ANDROID_KEY_PASSWORD",
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  throw new Error(`Missing Android signing variables: ${missing.join(", ")}`);
}

const lines = fs.readFileSync(buildGradle, "utf8").split("\n");

const blockEnd = (start) => {
  let depth = 0;
  for (let index = start; index < lines.length; index += 1) {
    for (const character of lines[index]) {
      if (character === "{") depth += 1;
      if (character === "}") depth -= 1;
    }
    if (index > start && depth === 0) return index;
  }
  throw new Error(`Unclosed Gradle block at line ${start + 1}`);
};

const signingStart = lines.findIndex((line) => /^\s*signingConfigs\s*\{/.test(line));
if (signingStart < 0) throw new Error("signingConfigs block was not generated");
const signingEnd = blockEnd(signingStart);
const signingIndent = lines[signingStart].match(/^\s*/)?.[0] ?? "";
const childIndent = `${signingIndent}    `;
lines.splice(
  signingEnd,
  0,
  `${childIndent}release {`,
  `${childIndent}    storeFile file(System.getenv("ANDROID_KEYSTORE_FILE"))`,
  `${childIndent}    storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")`,
  `${childIndent}    keyAlias System.getenv("ANDROID_KEY_ALIAS")`,
  `${childIndent}    keyPassword System.getenv("ANDROID_KEY_PASSWORD")`,
  `${childIndent}}`,
);

const buildTypesStart = lines.findIndex((line) => /^\s*buildTypes\s*\{/.test(line));
if (buildTypesStart < 0) throw new Error("buildTypes block was not generated");
const buildTypesEnd = blockEnd(buildTypesStart);
const releaseStart = lines.findIndex(
  (line, index) => index > buildTypesStart && index < buildTypesEnd && /^\s*release\s*\{/.test(line),
);
if (releaseStart < 0) throw new Error("release buildType was not generated");
const releaseEnd = blockEnd(releaseStart);
const debugSigningLine = lines.findIndex(
  (line, index) =>
    index > releaseStart &&
    index < releaseEnd &&
    /signingConfig\s+signingConfigs\.debug/.test(line),
);
if (debugSigningLine < 0) {
  throw new Error("release buildType no longer uses the expected Expo debug fallback");
}
lines[debugSigningLine] = lines[debugSigningLine].replace(
  /signingConfigs\.debug/,
  "signingConfigs.release",
);

fs.writeFileSync(buildGradle, lines.join("\n"));
console.log("Configured Android release signing from protected environment variables.");
