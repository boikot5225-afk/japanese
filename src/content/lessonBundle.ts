import type {
  ExampleSentence,
  Exercise,
  GrammarPoint,
  Lesson,
  VocabularyItem,
} from "../domain/course";

export interface LessonBundle {
  lesson: Lesson;
  vocabulary: VocabularyItem[];
  grammar: GrammarPoint[];
  sentences: ExampleSentence[];
  exercises: Exercise[];
  outcomes: string[];
}
