import * as Speech from "expo-speech";

import { normalizeJapaneseSpeechText } from "./japaneseSpeechText";

export async function speakJapanese(text: string): Promise<void> {
  const normalized = normalizeJapaneseSpeechText(text);
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
