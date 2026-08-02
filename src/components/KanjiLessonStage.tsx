import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { speakJapanese } from "../audio/japaneseSpeech";
import type { KanjiItem } from "../domain/course";
import { HandwritingPad } from "./HandwritingPad";

interface KanjiLessonStageProps {
  kanji: readonly KanjiItem[];
}

type StudyPhase = "preview" | "trace" | "memory";

const phaseLabels: Record<StudyPhase, string> = {
  preview: "Посмотреть",
  trace: "Обвести",
  memory: "По памяти",
};

export function KanjiLessonStage({ kanji }: KanjiLessonStageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<StudyPhase>("preview");
  const [hasInk, setHasInk] = useState(false);
  const [compared, setCompared] = useState(false);
  const activeItem = kanji[activeIndex];
  const example = activeItem?.examples[0];

  useEffect(() => {
    setActiveIndex((previous) => Math.min(previous, Math.max(kanji.length - 1, 0)));
  }, [kanji.length]);

  useEffect(() => {
    setHasInk(false);
    setCompared(false);
  }, [activeIndex, phase]);

  if (!activeItem) return null;

  const selectKanji = (index: number) => {
    setActiveIndex(index);
    setPhase("preview");
  };

  const nextKanji = () => {
    if (activeIndex + 1 < kanji.length) {
      selectKanji(activeIndex + 1);
      return;
    }
    setPhase("preview");
    setActiveIndex(0);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Кандзи урока</Text>
      <Text style={styles.intro}>
        Один и тот же знак проходит три шага: сначала рассматриваем его в слове,
        затем обводим и только после этого пишем по памяти.
      </Text>

      <View style={styles.kanjiSelector}>
        {kanji.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            accessibilityLabel={`Открыть кандзи ${item.literal}`}
            style={[
              styles.kanjiChip,
              index === activeIndex && styles.kanjiChipActive,
            ]}
            onPress={() => selectKanji(index)}
          >
            <Text
              style={[
                styles.kanjiChipText,
                index === activeIndex && styles.kanjiChipTextActive,
              ]}
            >
              {item.literal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.glyphBox}>
            <Text style={styles.glyph}>{activeItem.literal}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.meaning}>{activeItem.meaningsRu.join(", ")}</Text>
            <Text style={styles.level}>
              JLPT N5 · знак {activeIndex + 1} из {kanji.length}
            </Text>
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

        <View style={styles.phaseRow}>
          {(["preview", "trace", "memory"] as const).map((item, index) => (
            <View key={item} style={styles.phaseItem}>
              <View
                style={[
                  styles.phaseNumber,
                  item === phase && styles.phaseNumberActive,
                ]}
              >
                <Text
                  style={[
                    styles.phaseNumberText,
                    item === phase && styles.phaseNumberTextActive,
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.phaseLabel,
                  item === phase && styles.phaseLabelActive,
                ]}
              >
                {phaseLabels[item]}
              </Text>
            </View>
          ))}
        </View>

        {phase === "preview" && (
          <View style={styles.previewBlock}>
            <Text style={styles.previewGlyph}>{activeItem.literal}</Text>
            <Text style={styles.previewHint}>
              Посмотри на общий квадрат знака, расстояния между его частями и точки,
              где линии начинаются и заканчиваются. Не пытайся запомнить его как картинку целиком.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setPhase("trace")}
            >
              <Text style={styles.primaryButtonText}>Перейти к обведению</Text>
            </TouchableOpacity>
          </View>
        )}

        {phase !== "preview" && (
          <View style={styles.writingBlock}>
            <HandwritingPad
              key={`${activeItem.id}-${phase}`}
              reference={activeItem.literal}
              initialMode={phase === "trace" ? "trace" : "memory"}
              showModeControls={false}
              instruction={
                phase === "trace"
                  ? "Обведи знак поверх полупрозрачного образца. Нумерация показывает порядок твоих собственных штрихов."
                  : "Теперь напиши тот же знак без образца. Подсказка доступна, но после нового штриха снова скрывается."
              }
              onInkChange={setHasInk}
              onCompare={() => setCompared(true)}
              onEdit={() => setCompared(false)}
            />

            {compared && hasInk && (
              <Text style={styles.assessmentHint}>
                Сверь силуэт и последовательность штрихов. Здесь это учебная попытка:
                оценка в интервальное повторение пока не записывается.
              </Text>
            )}

            <View style={styles.navigation}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setPhase(phase === "trace" ? "preview" : "trace")}
              >
                <Text style={styles.secondaryButtonText}>
                  {phase === "trace" ? "К образцу" : "Ещё раз обвести"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButtonSmall}
                onPress={() => {
                  if (phase === "trace") {
                    setPhase("memory");
                  } else {
                    nextKanji();
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>
                  {phase === "trace"
                    ? "Написать по памяти"
                    : activeIndex + 1 < kanji.length
                      ? "Следующий кандзи"
                      : "Повторить набор"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
    marginTop: 8,
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
  kanjiSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kanjiChip: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#c9d4de",
    borderRadius: 15,
    backgroundColor: "#ffffff",
  },
  kanjiChipActive: {
    borderColor: "#183153",
    backgroundColor: "#183153",
  },
  kanjiChipText: {
    color: "#183153",
    fontSize: 29,
    fontWeight: "600",
  },
  kanjiChipTextActive: {
    color: "#ffffff",
  },
  card: {
    gap: 16,
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
  phaseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  phaseItem: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  phaseNumber: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#e5ebf0",
  },
  phaseNumberActive: {
    backgroundColor: "#183153",
  },
  phaseNumberText: {
    color: "#627486",
    fontSize: 13,
    fontWeight: "800",
  },
  phaseNumberTextActive: {
    color: "#ffffff",
  },
  phaseLabel: {
    color: "#718191",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
  },
  phaseLabelActive: {
    color: "#183153",
  },
  previewBlock: {
    gap: 14,
    alignItems: "stretch",
  },
  previewGlyph: {
    minHeight: 220,
    textAlign: "center",
    color: "#15202b",
    fontSize: 150,
    lineHeight: 210,
    borderWidth: 1,
    borderColor: "#d7e0e8",
    borderRadius: 22,
    backgroundColor: "#f8fafc",
  },
  previewHint: {
    color: "#52606d",
    fontSize: 14,
    lineHeight: 21,
  },
  writingBlock: {
    gap: 14,
  },
  assessmentHint: {
    color: "#415466",
    fontSize: 13,
    lineHeight: 19,
  },
  navigation: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#183153",
  },
  primaryButtonSmall: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "#183153",
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#9aa9b8",
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },
  primaryButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButtonText: {
    color: "#183153",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "800",
  },
});
