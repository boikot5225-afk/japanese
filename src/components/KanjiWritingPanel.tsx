import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { getKanjiStrokeData } from "../content/kanjiStrokeData";
import type { KanjiItem } from "../domain/course";
import type { KanjiSkillProgress } from "../engine/kanjiProgress";
import type { ReviewItem } from "../engine/reviewEngine";
import {
  getInitialWritingMode,
  nextLearningWritingMode,
  type WritingMode,
} from "../engine/writingSession";
import { previewWritingGradeIntervals } from "../engine/writingReview";
import { KanjiStrokeOrder } from "./KanjiStrokeOrder";
import {
  SkritterWritingPad,
  type SkritterWritingResult,
} from "./SkritterWritingPad";

interface KanjiWritingPanelProps {
  item: KanjiItem;
  progress: KanjiSkillProgress;
  reviewItem?: ReviewItem;
  onComplete: (result: SkritterWritingResult) => void;
}

export function KanjiWritingPanel({
  item,
  progress,
  reviewItem,
  onComplete,
}: KanjiWritingPanelProps) {
  const data = getKanjiStrokeData(item.literal);
  const initialMode = getInitialWritingMode(progress.attempts, progress.mastery);
  const [mode, setMode] = useState<WritingMode>(initialMode);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const intervals = useMemo(
    () => previewWritingGradeIntervals(reviewItem),
    [reviewItem],
  );

  if (!data) {
    return (
      <View style={styles.unavailable}>
        <Text style={styles.unavailableTitle}>Порядок черт пока недоступен</Text>
        <Text style={styles.unavailableBody}>
          Для {item.literal} не найден проверенный векторный источник. Знак не будет
          оцениваться по выдуманной логике.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Письмо · механика Skritter</Text>
          <Text style={styles.title}>От показа до письма по памяти</Text>
        </View>
        <Text style={styles.mastery}>{progress.mastery}%</Text>
      </View>
      <Text style={styles.description}>
        Программа постепенно убирает опору: обучение чертам → контур с прилипанием →
        письмо по памяти → свободная самопроверка. Подсказки и оценки меняют интервал SRS.
      </Text>

      <View style={styles.optionRow}>
        <TouchableOpacity
          style={[styles.optionButton, autoAdvance && styles.optionButtonActive]}
          onPress={() => setAutoAdvance((previous) => !previous)}
        >
          <Text
            style={[
              styles.optionButtonText,
              autoAdvance && styles.optionButtonTextActive,
            ]}
          >
            Автопереход: {autoAdvance ? "вкл" : "выкл"}
          </Text>
        </TouchableOpacity>
        {nextLearningWritingMode(mode) && (
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              const next = nextLearningWritingMode(mode);
              if (next) setMode(next);
            }}
          >
            <Text style={styles.optionButtonText}>Убрать подсказку</Text>
          </TouchableOpacity>
        )}
      </View>

      <KanjiStrokeOrder data={data} />
      <SkritterWritingPad
        key={`${item.id}:${mode}:${autoAdvance}`}
        data={data}
        initialMode={mode}
        autoAdvance={autoAdvance}
        gradeIntervalLabels={intervals}
        onComplete={onComplete}
      />
      <Text style={styles.attribution}>
        Поведение воспроизведено независимо; векторные данные: KanjiVG, CC BY-SA 3.0.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 14, paddingTop: 4 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  headerCopy: { flex: 1 },
  eyebrow: { color: "#66788a", fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8 },
  title: { marginTop: 3, color: "#15202b", fontSize: 20, fontWeight: "900" },
  mastery: { color: "#183153", fontSize: 24, fontWeight: "900" },
  description: { color: "#52606d", fontSize: 14, lineHeight: 21 },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionButton: { paddingVertical: 9, paddingHorizontal: 12, borderWidth: 1, borderColor: "#bdcad5", borderRadius: 999, backgroundColor: "#ffffff" },
  optionButtonActive: { borderColor: "#1b5d7a", backgroundColor: "#e4f2f8" },
  optionButtonText: { color: "#42596d", fontSize: 12, fontWeight: "800" },
  optionButtonTextActive: { color: "#175b78" },
  attribution: { color: "#7b8794", fontSize: 11, lineHeight: 16 },
  unavailable: { gap: 6, padding: 14, borderWidth: 1, borderColor: "#e0c7c7", borderRadius: 16, backgroundColor: "#fff8f8" },
  unavailableTitle: { color: "#8a3030", fontSize: 15, fontWeight: "800" },
  unavailableBody: { color: "#6c5050", fontSize: 13, lineHeight: 19 },
});
