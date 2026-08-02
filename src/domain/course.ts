export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type LearningItemType =
  | "kana"
  | "kanji"
  | "vocabulary"
  | "grammar"
  | "sentence"
  | "conjugation";

export type Skill =
  | "recognition"
  | "recall"
  | "reading"
  | "listening"
  | "writing"
  | "usage";

export interface VocabularyItem {
  id: string;
  type: "vocabulary";
  writtenForm: string;
  reading: string;
  alternativeReadings?: string[];
  meaningsRu: string[];
  partOfSpeech: string[];
  jlptLevel?: JlptLevel;
  tags?: string[];
}

export interface KanjiExample {
  written: string;
  reading: string;
  kanjiReading: string;
  meaningRu: string;
}

export interface KanjiItem {
  id: string;
  type: "kanji";
  literal: string;
  meaningsRu: string[];
  jlptLevel: JlptLevel;
  introducedInLessonId: string;
  examples: KanjiExample[];
}

export interface GrammarPoint {
  id: string;
  type: "grammar";
  title: string;
  meaningRu: string;
  explanationRu: string;
  formation: string[];
  cautions?: string[];
  relatedGrammarIds?: string[];
  jlptLevel?: JlptLevel;
}

export interface ExampleSentence {
  id: string;
  type: "sentence";
  japanese: string;
  reading?: string;
  translationRu: string;
  grammarIds: string[];
  vocabularyIds: string[];
}

export type LearningItem = VocabularyItem | KanjiItem | GrammarPoint | ExampleSentence;

export type ExerciseType =
  | "multiple-choice"
  | "text-input"
  | "sentence-builder"
  | "particle-gap"
  | "listening"
  | "conjugation"
  | "handwriting";

export interface HandwritingGuide {
  reference: string;
  initialMode: "trace" | "memory";
  instructionRu?: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  targetItemIds: string[];
  correctAnswers: string[];
  acceptableAnswers?: string[];
  distractors?: string[];
  explanationRu?: string;
  variantGroup?: string;
  contentKey?: string;
  difficulty?: 1 | 2 | 3 | 4;
  confusionItemIds?: string[];
  audioText?: string;
  skill?: Skill;
  sessionRole?: "core" | "remediation";
  handwritingGuide?: HandwritingGuide;
}

export interface Lesson {
  id: string;
  unitId: string;
  order: number;
  title: string;
  description: string;
  theory: string[];
  itemIds: string[];
  exerciseIds: string[];
  estimatedMinutes: number;
}

export interface SkillProgress {
  itemId: string;
  skill: Skill;
  stability: number;
  difficulty: number;
  dueAt: string;
  correctCount: number;
  incorrectCount: number;
}
