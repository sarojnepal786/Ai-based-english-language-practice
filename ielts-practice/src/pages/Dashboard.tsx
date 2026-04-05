import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Course, Module } from '../types';
import '../styles/Dashboard.css';

interface DashboardProps {
  currentUser: User | null;
  onLogout: () => void;
  courses: Course[];
  onEnrollCourse: (courseId: string) => void;
  onUpdateProgress: (courseId: string, moduleId: number, score?: number) => void;
}

export default function Dashboard({
  currentUser,
  onLogout,
  courses,
  onEnrollCourse,
  onUpdateProgress
}: DashboardProps) {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    onLogout();
  };

  const getCourseProgress = (courseId: string) => {
    if (!currentUser?.progress[courseId]) return 0;
    const course = courses.find(c => c.id === courseId);
    if (!course) return 0;
    return (currentUser.progress[courseId].completedModules.length / course.modules.length) * 100;
  };

  const handleQuizSubmit = () => {
    if (!selectedModule?.quiz || !selectedCourse) return;
    
    let correct = 0;
    selectedModule.quiz.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) correct++;
    });
    
    const score = (correct / selectedModule.quiz.questions.length) * 100;
    setQuizScore(score);
    setQuizSubmitted(true);
    
    if (score >= 70) {
      onUpdateProgress(selectedCourse.id, selectedModule.id, score);
    }
  };

  // Dashboard content with all existing UI elements
  return (
    <div className="dashboard">
      {/* Header with user info and logout */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Welcome, {currentUser?.name}!</h1>
            {/* <p>{currentUser?.email}</p> */}
          </div>
          <div className="header-buttons">
            <button onClick={() => navigate('/')} className="home-btn">
              🏠 Home
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {selectedCourse ? (
        // Course view with modules and chat
        <div className="course-container">
          <div className="course-header">
            <button onClick={() => setSelectedCourse(null)} className="back-btn">← Back to Courses</button>
            <h2>{selectedCourse.title}</h2>
            <button onClick={() => onEnrollCourse(selectedCourse.id)} className="enroll-btn">
              {currentUser?.enrolledCourses.includes(selectedCourse.id) ? '✓ Enrolled' : 'Enroll Now'}
            </button>
          </div>

          <div className="course-content">
            <div className="modules-panel">
              <h3>Modules</h3>
              {selectedCourse.modules.map((module) => (
                <div
                  key={module.id}
                  className={`module-item ${selectedModule?.id === module.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedModule(module);
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                  }}
                >
                  <div className="module-title">{module.title}</div>
                  <div className="module-duration">{module.duration}</div>
                </div>
              ))}
            </div>

            <div className="module-content-panel">
              {selectedModule ? (
                <>
                  <h3>{selectedModule.title}</h3>
                  <p className="module-content">{selectedModule.content}</p>

                  {selectedModule.quiz && !quizSubmitted && (
                    <div className="quiz-section">
                      <h4>Quiz</h4>
                      {selectedModule.quiz.questions.map((q, idx) => (
                        <div key={q.id} className="quiz-question">
                          <p><strong>Q{idx + 1}: {q.question}</strong></p>
                          {q.options.map((option, optIdx) => (
                            <label key={optIdx} className="quiz-option">
                              <input
                                type="radio"
                                name={`question-${idx}`}
                                value={optIdx}
                                checked={quizAnswers[idx] === optIdx}
                                onChange={() => setQuizAnswers({ ...quizAnswers, [idx]: optIdx })}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ))}
                      <button onClick={handleQuizSubmit} className="submit-quiz-btn">
                        Submit Quiz
                      </button>
                    </div>
                  )}

                  {quizSubmitted && (
                    <div className={`quiz-result ${quizScore >= 70 ? 'pass' : 'fail'}`}>
                      <h4>Quiz Result</h4>
                      <p>Score: {Math.round(quizScore)}%</p>
                      {quizScore >= 70 ? (
                        <p className="pass-message">✓ Great job! You passed the quiz!</p>
                      ) : (
                        <p className="fail-message">Try again to pass the quiz (70% required)</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p>Select a module to view content</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Courses grid view
        <div className="dashboard-content">
          <div className="dashboard-stats">
            <div className="stat-card">
              <span className="stat-icon">📚</span>
              <div>
                <h3>{currentUser?.enrolledCourses.length || 0}</h3>
                <p>Courses Enrolled</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <div>
                <h3>{Object.values(currentUser?.progress || {}).reduce((sum, course) => sum + course.completedModules.length, 0)}</h3>
                <p>Modules Completed</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📊</span>
              <div>
                <h3>{(() => {
                  const progressValues = Object.entries(currentUser?.progress || {});
                  if (progressValues.length === 0) return 0;
                  const avgProgress = progressValues.reduce((sum, [courseId, courseProgress]) => {
                    const course = courses.find(c => c.id === courseId);
                    const percent = course ? (courseProgress.completedModules.length / course.modules.length) * 100 : 0;
                    return sum + percent;
                  }, 0) / progressValues.length;
                  return Math.round(avgProgress);
                })()}%</h3>
                <p>Average Progress</p>
              </div>
            </div>
          </div>

          <div className="courses-section-dashboard">
            <h3>Available Courses</h3>
            <div className="courses-grid-dashboard">
              {courses.map(course => {
                const isEnrolled = currentUser?.enrolledCourses.includes(course.id);
                const progress = getCourseProgress(course.id);
                
                return (
                  <div key={course.id} className="course-card-dashboard" onClick={() => setSelectedCourse(course)}>
                    <img src={course.thumbnail} alt={course.title} className="course-thumbnail-dashboard" />
                    <div className="course-info-dashboard">
                      <h4>{course.title}</h4>
                      <p className="course-instructor-dashboard">by {course.instructor}</p>
                      <div className="course-meta-dashboard">
                        <span className="level" style={{
                          backgroundColor: course.level === 'Beginner' ? '#4CAF50' : course.level === 'Intermediate' ? '#FFC107' : '#FF5722'
                        }}>
                          {course.level}
                        </span>
                        <span className="duration">⏱️ {course.duration}</span>
                      </div>
                      <div className="course-stats-dashboard">
                        <span>👥 {course.enrolled}</span>
                        <span>⭐ {course.rating}</span>
                      </div>
                      {isEnrolled && (
                        <div className="progress-bar-dashboard">
                          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                      )}
                      <div className="course-button">
                        {isEnrolled ? (
                          <span className="enrolled-badge">✓ Enrolled</span>
                        ) : (
                          <button className="enroll-button" onClick={() => onEnrollCourse(course.id)}>
                            Enroll Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
