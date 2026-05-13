// Shared types for the application
export interface User {
  id: string;
  email: string;
  name: string;
  enrolledCourses: string[];
  progress: {
    [courseId: string]: {
      completedModules: number[];
      quizScores: { [moduleId: string]: number };
      lastAccessed: Date;
    };
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  modules: Module[];
  thumbnail: string;
  enrolled: number;
  rating: number;
}

export interface Module {
  id: number;
  title: string;
  duration: string;
  content: string;
  fullContent?: string;
  summary?: string;
  wordCount?: number;
  readingTime?: number;
  objectives?: string[];
  materials?: string[];
  assignments?: string[];
  quiz?: Quiz;
}

export interface Quiz {
  questions: {
    id: number;
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }[];
}

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  imagePreview?: string | null;
  timestamp?: Date;
}

export type ExamTrack = 'IELTS' | 'GRE';

export type SkillType = 'Reading' | 'Writing' | 'Listening' | 'Speaking';

export interface PerformanceSnapshot {
  averageScore: number;
  attempts: number;
  updatedAt: string;
}

export interface UserPerformance {
  byTrack: Record<ExamTrack, Record<SkillType, PerformanceSnapshot>>;
}

export interface PracticeTask {
  id: string;
  title: string;
  track: ExamTrack;
  skill: SkillType;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  prompt: string;
  tips: string[];
  rubric: string[];
  sampleHighlights: string[];
}

export interface EvaluationResult {
  overallBand: number;
  criteria: {
    name: string;
    score: number;
    feedback: string;
  }[];
  strengths: string[];
  improvements: string[];
  nextActions: string[];
}
