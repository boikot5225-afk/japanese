const JAPANESE_SCRIPT_PATTERN =
  /[\u3040-\u30ff\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9d]/;

const DISALLOWED_SPEECH_CHARACTERS_PATTERN =
  /[^\u3000-\u30ff\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9d0-9／\s]/g;

/**
 * Keeps only text that a Japanese voice can pronounce sensibly.
 * Russian labels and placeholders are presentation text and must never reach TTS.
 */
export function normalizeJapaneseSpeechText(text: string): string {
  const normalized = text
    .replace(/\[[^\]]*]/g, " ")
    .replace(/【[^】]*】/g, " ")
    .replace(/[|_]+/g, " ")
    .replace(/\?/g, "？")
    .replace(/!/g, "！")
    .replace(DISALLOWED_SPEECH_CHARACTERS_PATTERN, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([、。！？])/g, "$1")
    .trim();

  return JAPANESE_SCRIPT_PATTERN.test(normalized) ? normalized : "";
}
