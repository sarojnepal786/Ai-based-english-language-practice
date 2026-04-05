import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import './App.css'

import type { User, Course } from './types'

// Types are defined centrally in src/types.ts for reuse across components and pages.

// Mock Course Data
const courses: Course[] = [
  {
    id: '1',
    title: 'English Grammar Mastery',
    description: 'Complete guide to English grammar from basics to advanced concepts',
    instructor: 'Sarah Johnson',
    level: 'Beginner',
    duration: '8 weeks',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
    enrolled: 1234,
    rating: 4.8,
    modules: [
      {
        id: 1,
        title: 'Parts of Speech',
        duration: '45 min',
        content: 'Learn about nouns, pronouns, verbs, adjectives, adverbs, prepositions, conjunctions, and interjections.',
        quiz: {
          questions: [
            {
              id: 1,
              question: 'What is a noun?',
              options: ['An action word', 'A person, place, or thing', 'A describing word', 'A connecting word'],
              correct: 1,
              explanation: 'A noun is a word that represents a person, place, thing, or idea.'
            }
          ]
        }
      },
      {
        id: 2,
        title: 'Verb Tenses',
        duration: '60 min',
        content: 'Master present, past, and future tenses including simple, continuous, perfect, and perfect continuous forms.',
        quiz: {
          questions: [
            {
              id: 1,
              question: 'Which sentence is in present continuous tense?',
              options: ['She eats breakfast', 'She is eating breakfast', 'She ate breakfast', 'She will eat breakfast'],
              correct: 1,
              explanation: 'Present continuous uses "is/am/are" + verb-ing'
            }
          ]
        }
      },
      {
        id: 3,
        title: 'Sentence Structure',
        duration: '50 min',
        content: 'Understanding subjects, predicates, clauses, and different types of sentences.',
        quiz: {
          questions: [
            {
              id: 1,
              question: 'What is a compound sentence?',
              options: ['One independent clause', 'Two independent clauses joined by a conjunction', 'One independent and one dependent clause', 'No independent clauses'],
              correct: 1,
              explanation: 'A compound sentence has two or more independent clauses joined by a coordinating conjunction.'
            }
          ]
        }
      }
    ]
  },
  {
    id: '2',
    title: 'Business English Communication',
    description: 'Professional English for workplace communication, presentations, and emails',
    instructor: 'Michael Chen',
    level: 'Intermediate',
    duration: '6 weeks',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
    enrolled: 892,
    rating: 4.7,
    modules: [
      {
        id: 1,
        title: 'Business Email Writing',
        duration: '40 min',
        content: 'Learn to write professional emails, including structure, tone, and common phrases.',
        quiz: {
          questions: [
            {
              id: 1,
              question: 'What should be included in a professional email?',
              options: ['Only emojis', 'Clear subject line and greeting', 'Only the message', 'Random text'],
              correct: 1,
              explanation: 'Professional emails need clear subject lines, proper greetings, and appropriate closings.'
            }
          ]
        }
      },
      {
        id: 2,
        title: 'Presentation Skills',
        duration: '55 min',
        content: 'Master the art of giving presentations in English with confidence.'
      }
    ]
  },
  {
    id: '3',
    title: 'IELTS Preparation',
    description: 'Comprehensive preparation for IELTS Academic and General Training',
    instructor: 'Emma Watson',
    level: 'Advanced',
    duration: '10 weeks',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    enrolled: 2456,
    rating: 4.9,
    modules: [
      {
        id: 1,
        title: 'Listening Strategies',
        duration: '60 min',
        content: 'Techniques for IELTS listening section, including note-taking and predicting answers.',
        quiz: {
          questions: [
            {
              id: 1,
              question: 'What is a key strategy for IELTS listening?',
              options: ['Ignore the audio', 'Predict answers before listening', 'Write everything', 'Close your eyes'],
              correct: 1,
              explanation: 'Predicting answers helps you focus on relevant information during listening.'
            }
          ]
        }
      },
      {
        id: 2,
        title: 'Reading Comprehension',
        duration: '70 min',
        content: 'Speed reading and skimming techniques for IELTS reading passages.'
      }
    ]
  }
];

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('english_learning_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('english_learning_user');
        return null;
      }
    }
    return null;
  });

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('english_learning_user', JSON.stringify(user));
  };

  const handleRegister = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('english_learning_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('english_learning_user');
    // Force navigation to home page
    window.location.href = '/';
  };

  const enrollInCourse = (courseId: string) => {
    if (currentUser && !currentUser.enrolledCourses.includes(courseId)) {
      const updatedUser = {
        ...currentUser,
        enrolledCourses: [...currentUser.enrolledCourses, courseId],
        progress: {
          ...currentUser.progress,
          [courseId]: {
            completedModules: [],
            quizScores: {},
            lastAccessed: new Date()
          }
        }
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('english_learning_user', JSON.stringify(updatedUser));
    }
  };

  const updateProgress = (courseId: string, moduleId: number, score?: number) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser };
    if (!updatedUser.progress[courseId]) {
      updatedUser.progress[courseId] = {
        completedModules: [],
        quizScores: {},
        lastAccessed: new Date()
      };
    }
    
    if (!updatedUser.progress[courseId].completedModules.includes(moduleId)) {
      updatedUser.progress[courseId].completedModules.push(moduleId);
    }
    
    if (score !== undefined) {
      updatedUser.progress[courseId].quizScores[moduleId] = score;
    }
    
    updatedUser.progress[courseId].lastAccessed = new Date();
    setCurrentUser(updatedUser);
    localStorage.setItem('english_learning_user', JSON.stringify(updatedUser));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp onRegister={handleRegister} />} />
        
        {/* Protected route - Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            currentUser ? (
              <Dashboard
                currentUser={currentUser}
                onLogout={handleLogout}
                courses={courses}
                onEnrollCourse={enrollInCourse}
                onUpdateProgress={updateProgress}
              />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
