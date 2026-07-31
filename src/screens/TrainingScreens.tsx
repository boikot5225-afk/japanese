import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

import { speakJapanese } from "../audio/japaneseSpeech";
import { PracticeCard } from "../components/PracticeCard";
import type { LessonBundle } from "../content/lessonBundle";
import type { Exercise } from "../domain/course";
import type { AnswerCheckResult } from "../engine/checkAnswer";
import { styles } from "../theme/appStyles";

export type LessonStage = "theory" | "words" | "examples" | "practice";

const lessonStages: LessonStage[] = ["theory", "words", "examples", "practice"];
const stageLabels: Record<LessonStage, string> = {
  theory: "Грамматика",
  words: "Слова",
  examples: "Примеры",
  practice: "Практика",
};

const getGrammarSpeechText = (
  bundle: LessonBundle,
  grammarId: string,
  fallbackTitle: string,
): string => {
  const example = bundle.sentences.find((sentence) => sentence.grammarIds.includes(grammarId));
  return example?.reading ?? example?.japanese ?? fallbackTitle;
};

interface CommonPracticeProps {
  currentExercise: Exercise;
  exerciseIndex: number;
  exerciseCount: number;
  answer: string;
  selectedTokens: string[];
  availableBuilderTokens: string[];
  result: AnswerCheckResult | null;
  onAnswerChange: (value: string) => void;
  onChoice: (choice: string) => void;
  onToken: (token: string) => void;
  onRemoveToken: (index: number) => void;
  onClearTokens: () => void;
  onSubmit: () => void;
  onContinue: () => void;
}

interface LessonScreenProps extends CommonPracticeProps {
  activeBundle: LessonBundle;
  stage: LessonStage;
  practiceMode: boolean;
  onCourse: () => void;
  onPreviousStage: () => void;
  onNextStage: () => void;
}

export function LessonScreen({
  activeBundle,
  stage,
  practiceMode,
  currentExercise,
  exerciseIndex,
  exerciseCount,
  answer,
  selectedTokens,
  availableBuilderTokens,
  result,
  onCourse,
  onPreviousStage,
  onNextStage,
  onAnswerChange,
  onChoice,
  onToken,
  onRemoveToken,
  onClearTokens,
  onSubmit,
  onContinue,
}: LessonScreenProps) {
  const stageIndex = lessonStages.indexOf(stage);
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backLink} onPress={onCourse}>
          <Text style={styles.backLinkText}>‹ К курсу</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>Урок {activeBundle.lesson.order}</Text>
        <Text style={styles.title}>{activeBundle.lesson.title}</Text>
        <Text style={styles.description}>{activeBundle.lesson.description}</Text>
        {practiceMode && (
          <Text style={styles.caution}>
            Свободное повторение: ответы здесь не меняют интервальное расписание.
          </Text>
        )}

        <View style={styles.stageRow}>
          {lessonStages.map((item, index) => (
            <View key={item} style={styles.stageItem}>
              <View
                style={[
                  styles.stageDot,
                  index <= stageIndex ? styles.stageDotActive : styles.stageDotInactive,
                ]}
              />
              <Text style={[styles.stageLabel, item === stage && styles.stageLabelActive]}>
                {stageLabels[item]}
              </Text>
            </View>
          ))}
        </View>

        {stage === "theory" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Грамматика</Text>
            {activeBundle.grammar.map((grammar) => (
              <View key={grammar.id} style={styles.card}>
                <View style={styles.audioHeaderRow}>
                  <Text style={styles.japaneseTitle}>{grammar.title}</Text>
                  <TouchableOpacity
                    accessibilityLabel={`Прослушать пример для ${grammar.title}`}
                    style={styles.soundButton}
                    onPress={() =>
                      void speakJapanese(
                        getGrammarSpeechText(activeBundle, grammar.id, grammar.title),
                      )
                    }
                  >
                    <Text style={styles.soundButtonText}>🔊</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.meaning}>{grammar.meaningRu}</Text>
                <Text style={styles.body}>{grammar.explanationRu}</Text>
                <Text style={styles.formula}>{grammar.formation.join(" · ")}</Text>
                {grammar.cautions?.map((caution) => (
                  <Text key={caution} style={styles.caution}>
                    ⚠ {caution}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {stage === "words" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Новые слова</Text>
            {activeBundle.vocabulary.map((word) => (
              <View key={word.id} style={styles.wordRow}>
                <View style={styles.wordTextBlock}>
                  <Text style={styles.wordWritten}>{word.writtenForm}</Text>
                  <Text style={styles.wordReading}>{word.reading}</Text>
                </View>
                <View style={styles.wordActions}>
                  <Text style={styles.wordMeaning}>{word.meaningsRu.join(", ")}</Text>
                  <TouchableOpacity
                    accessibilityLabel={`Прослушать ${word.writtenForm}`}
                    style={styles.soundButton}
                    onPress={() => void speakJapanese(word.reading || word.writtenForm)}
                  >
                    <Text style={styles.soundButtonText}>🔊</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {stage === "examples" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Примеры</Text>
            {activeBundle.sentences.map((sentence) => (
              <View key={sentence.id} style={styles.card}>
                <View style={styles.audioHeaderRow}>
                  <Text style={styles.exampleJapanese}>{sentence.japanese}</Text>
                  <TouchableOpacity
                    accessibilityLabel="Прослушать пример"
                    style={styles.soundButton}
                    onPress={() =>
                      void speakJapanese(sentence.reading ?? sentence.japanese)
                    }
                  >
                    <Text style={styles.soundButtonText}>🔊</Text>
                  </TouchableOpacity>
                </View>
                {sentence.reading && (
                  <Text style={styles.exampleReading}>{sentence.reading}</Text>
                )}
                <Text style={styles.exampleTranslation}>{sentence.translationRu}</Text>
              </View>
            ))}
          </View>
        )}

        {stage === "practice" && (
          <PracticeCard
            title="Практика"
            finishLabel="Завершить урок"
            exercise={currentExercise}
            exerciseIndex={exerciseIndex}
            exerciseCount={exerciseCount}
            answer={answer}
            selectedTokens={selectedTokens}
            availableBuilderTokens={availableBuilderTokens}
            result={result}
            onAnswerChange={onAnswerChange}
            onChoice={onChoice}
            onToken={onToken}
            onRemoveToken={onRemoveToken}
            onClearTokens={onClearTokens}
            onSubmit={onSubmit}
            onContinue={onContinue}
          />
        )}

        {stage !== "practice" && (
          <View style={styles.navigation}>
            <TouchableOpacity
              disabled={stageIndex === 0}
              onPress={onPreviousStage}
              style={[styles.secondaryButton, stageIndex === 0 && styles.disabledButton]}
            >
              <Text style={styles.secondaryButtonText}>Назад</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButtonSmall} onPress={onNextStage}>
              <Text style={styles.primaryButtonText}>Дальше</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface ReviewScreenProps extends CommonPracticeProps {
  lessonTitle: string;
  focusLabel: string;
  onCourse: () => void;
}

export function ReviewScreen({
  lessonTitle,
  focusLabel,
  currentExercise,
  exerciseIndex,
  exerciseCount,
  answer,
  selectedTokens,
  availableBuilderTokens,
  result,
  onCourse,
  onAnswerChange,
  onChoice,
  onToken,
  onRemoveToken,
  onClearTokens,
  onSubmit,
  onContinue,
}: ReviewScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backLink} onPress={onCourse}>
          <Text style={styles.backLinkText}>‹ Закончить повторение</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>Повторение</Text>
        <Text style={styles.title}>{lessonTitle}</Text>
        <Text style={styles.meaning}>Сейчас проверяем: {focusLabel}</Text>
        <Text style={styles.description}>
          Задание выбрано по сроку именно этого знания и навыка, а не всего упражнения целиком.
        </Text>
        <PracticeCard
          title="Повторить сегодня"
          finishLabel="Завершить повторение"
          exercise={currentExercise}
          exerciseIndex={exerciseIndex}
          exerciseCount={exerciseCount}
          answer={answer}
          selectedTokens={selectedTokens}
          availableBuilderTokens={availableBuilderTokens}
          result={result}
          onAnswerChange={onAnswerChange}
          onChoice={onChoice}
          onToken={onToken}
          onRemoveToken={onRemoveToken}
          onClearTokens={onClearTokens}
          onSubmit={onSubmit}
          onContinue={onContinue}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
