import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { speakJapanese } from "../audio/japaneseSpeech";
import type { KanjiItem } from "../domain/course";

interface KanjiLessonStageProps {
  kanji: readonly KanjiItem[];
}

export function KanjiLessonStage({ kanji }: KanjiLessonStageProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Кандзи урока</Text>
      <Text style={styles.intro}>
        Сначала знак встречается в знакомом слове. Учим только нужное здесь чтение —
        остальные варианты появятся вместе с новыми словами.
      </Text>

      {kanji.map((item) => {
        const example = item.examples[0];
        return (
          <View key={item.id} style={styles.card}>
            <View style={styles.header}>
              <View style={styles.glyphBox}>
                <Text style={styles.glyph}>{item.literal}</Text>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.meaning}>{item.meaningsRu.join(", ")}</Text>
                <Text style={styles.level}>JLPT N5 · новый знак</Text>
              </View>
            </View>

            {example && (
              <View style={styles.example}>
                <View style={styles.exampleText}>
                  <Text style={styles.word}>{example.written}</Text>
                  <Text style={styles.reading}>{example.reading}</Text>
                  <Text style={styles.translation}>{example.meaningRu}</Text>
                </View>
                <TouchableOpacity
                  accessibilityLabel={`Прослушать ${example.written}`}
                  style={styles.soundButton}
                  onPress={() => void speakJapanese(example.reading)}
                >
                  <Text style={styles.soundButtonText}>🔊</Text>
                </TouchableOpacity>
              </View>
            )}

            {example && (
              <View style={styles.focusRow}>
                <Text style={styles.focusLabel}>Чтение знака в этом слове</Text>
                <Text style={styles.focusReading}>{example.kanjiReading}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: "#15202b",
    fontSize: 22,
    fontWeight: "800",
  },
  intro: {
    color: "#52606d",
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    gap: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d7e0e8",
    borderRadius: 22,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  glyphBox: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#eef4f8",
  },
  glyph: {
    color: "#15202b",
    fontSize: 60,
    lineHeight: 74,
    fontWeight: "500",
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  meaning: {
    color: "#15202b",
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "700",
  },
  level: {
    color: "#66788a",
    fontSize: 13,
    fontWeight: "600",
  },
  example: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
  },
  exampleText: {
    flex: 1,
    gap: 2,
  },
  word: {
    color: "#15202b",
    fontSize: 25,
    fontWeight: "700",
  },
  reading: {
    color: "#31546f",
    fontSize: 16,
  },
  translation: {
    color: "#52606d",
    fontSize: 14,
  },
  soundButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#e7eef5",
  },
  soundButtonText: {
    fontSize: 19,
  },
  focusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  focusLabel: {
    flex: 1,
    color: "#52606d",
    fontSize: 14,
    lineHeight: 19,
  },
  focusReading: {
    color: "#183153",
    fontSize: 22,
    fontWeight: "800",
  },
});
