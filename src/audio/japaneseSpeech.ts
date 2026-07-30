import * as Speech from "expo-speech";

const normalizeSpeechText = (text: string): string =>
  text.replaceAll("|", "").replaceAll("__", "").trim();

export async function speakJapanese(text: string): Promise<void> {
  const normalized = normalizeSpeechText(text);
  if (!normalized) {
    return;
  }

  await Speech.stop();
  Speech.speak(normalized, {
    language: "ja-JP",
    rate: 0.82,
    pitch: 1,
    volume: 1,
  });
}
