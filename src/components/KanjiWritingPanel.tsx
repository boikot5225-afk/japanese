import { StyleSheet, Text, View } from "react-native";

import { getKanjiStrokeData } from "../content/kanjiStrokeData";
import type { KanjiItem } from "../domain/course";
import type { KanjiSkillProgress } from "../engine/kanjiProgress";
import { KanjiStrokeOrder } from "./KanjiStrokeOrder";
import {
  KanjiTracingPad,
  type KanjiTracingResult,
} from "./KanjiTracingPad";

interface KanjiWritingPanelProps {
  item: KanjiItem;
  progress: KanjiSkillProgress;
  onComplete: (result: KanjiTracingResult) => void;
}

export function KanjiWritingPanel({
  item,
  progress,
  onComplete,
}: KanjiWritingPanelProps) {
  const data = getKanjiStrokeData(item.literal);

  if (!data) {
    return (
      <View style={styles.unavailable}>
        <Text style={styles.unavailableTitle}>Порядок черт пока недоступен</Text>
        <Text style={styles.unavailableBody}>
          Для {item.literal} не найден векторный источник. Знак не будет оцениваться
          по выдуманной логике: данные надо сначала добавить и проверить.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Письмо</Text>
          <Text style={styles.title}>Порядок и форма штрихов</Text>
        </View>
        <Text style={styles.mastery}>{progress.mastery}%</Text>
      </View>
      <Text style={styles.description}>
        Сначала посмотри последовательность, затем повтори её. Неверный штрих не
        засчитывается: тренажёр укажет, где ошибка — старт, направление, конец или форма.
      </Text>
      <KanjiStrokeOrder data={data} />
      <KanjiTracingPad data={data} onComplete={onComplete} />
      <Text style={styles.attribution}>
        Векторные данные: KanjiVG, CC BY-SA 3.0.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 14,
    paddingTop: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    color: "#66788a",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 3,
    color: "#15202b",
    fontSize: 20,
    fontWeight: "900",
  },
  mastery: {
    color: "#183153",
    fontSize: 24,
    fontWeight: "900",
  },
  description: {
    color: "#52606d",
    fontSize: 14,
    lineHeight: 21,
  },
  attribution: {
    color: "#7b8794",
    fontSize: 11,
    lineHeight: 16,
  },
  unavailable: {
    gap: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e0c7c7",
    borderRadius: 16,
    backgroundColor: "#fff8f8",
  },
  unavailableTitle: {
    color: "#8a3030",
    fontSize: 15,
    fontWeight: "800",
  },
  unavailableBody: {
    color: "#6c5050",
    fontSize: 13,
    lineHeight: 19,
  },
});
