import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import { courses } from './data/courseCatalog'
import type { Course, User } from './types'

const Home = lazy(() => import('./pages/Home'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chat = lazy(() => import('./pages/Chat'));

// Types are defined centrally in src/types.ts for reuse across components and pages.

const hydrateUser = (rawUser: string): User | null => {
  try {
    const parsed = JSON.parse(rawUser) as User;
    const safeProgress = Object.fromEntries(
      Object.entries(parsed.progress || {}).map(([courseId, value]) => [
        courseId,
        {
          completedModules: Array.isArray(value.completedModules) ? value.completedModules : [],
          quizScores: value.quizScores || {},
          lastAccessed: new Date(value.lastAccessed)
        }
      ])
    );

    return {
      ...parsed,
      enrolledCourses: Array.isArray(parsed.enrolledCourses) ? parsed.enrolledCourses : [],
      progress: safeProgress
    };
  } catch {
    return null;
  }
};

function AppContent() {
  const [catalogCourses, setCatalogCourses] = useState<Course[]>(courses);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('english_learning_user');
    if (savedUser) {
      const hydrated = hydrateUser(savedUser);
      if (hydrated) {
        return hydrated;
      }

      try {
        localStorage.removeItem('english_learning_user');
      } catch (error) {
        console.error('Failed to clean invalid user data:', error);
      }
    }
    return null;
  });

  useEffect(() => {
    // Only use static courses, don't add database curriculum
    setCatalogCourses(courses);
  }, []);

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading learning platform...</div>}>
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
                  courses={catalogCourses}
                  onEnrollCourse={enrollInCourse}

                />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
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
