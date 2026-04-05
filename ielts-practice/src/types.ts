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
