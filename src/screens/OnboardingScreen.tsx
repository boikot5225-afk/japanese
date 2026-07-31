import { useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

import type { LearnerStartLevel } from "../storage/learnerStorage";
import { kanaStyles } from "../theme/kanaStyles";

interface OnboardingScreenProps {
  onComplete: (level: LearnerStartLevel) => void;
}

const options: Array<{
  id: LearnerStartLevel;
  title: string;
  body: string;
}> = [
  {
    id: "zero",
    title: "Начинаю с нуля",
    body: "Сначала пройду хирагану, звук и базовые упражнения, затем перейду к предложениям.",
  },
  {
    id: "hiragana",
    title: "Хирагану уже знаю",
    body: "Базовые знаки будут отмечены известными. Модуль останется доступен для проверки слуха и скорости.",
  },
  {
    id: "kana",
    title: "Знаю хирагану и катакану",
    body: "Сразу открою курс предложений. Катакана появится отдельным расширенным модулем позже.",
  },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [selected, setSelected] = useState<LearnerStartLevel>("zero");

  return (
    <SafeAreaView style={kanaStyles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={kanaStyles.centeredContainer}>
        <Text style={kanaStyles.eyebrow}>Первый запуск</Text>
        <Text style={kanaStyles.title}>С чего начнём?</Text>
        <Text style={kanaStyles.description}>
          Выбор не блокирует разделы. Он только определяет стартовую точку и не заставляет тебя
          повторять уже знакомое.
        </Text>

        <View style={{ marginTop: 18 }}>
          {options.map((option) => {
            const active = option.id === selected;
            return (
              <TouchableOpacity
                key={option.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[kanaStyles.optionCard, active && kanaStyles.optionCardSelected]}
                onPress={() => setSelected(option.id)}
              >
                <Text style={kanaStyles.optionTitle}>{active ? "● " : "○ "}{option.title}</Text>
                <Text style={kanaStyles.optionBody}>{option.body}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={kanaStyles.primaryButton} onPress={() => onComplete(selected)}>
          <Text style={kanaStyles.primaryButtonText}>
            {selected === "zero" ? "Начать с хираганы" : "Открыть курс"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
