import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Course, Module } from '../types';
import SkillLab from '../components/SkillLab';
import '../styles/Dashboard.css';

interface DashboardProps {
  currentUser: User | null;
  onLogout: () => void;
  courses: Course[];
  onEnrollCourse: (courseId: string) => void;
}

export default function Dashboard({
  currentUser,
  onLogout,
  courses,
  onEnrollCourse
}: DashboardProps) {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeTab, setActiveTab] = useState<'read' | 'analyze' | 'do'>('read');
  const [userSummary, setUserSummary] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [selectedQuizOptions, setSelectedQuizOptions] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizMessage, setQuizMessage] = useState('');

  type QuizQuestionView = {
    id: number;
    question: string;
    options: string[];
    correct: number | null;
    explanation: string;
  };

  const quizBankByModuleId: Record<number, QuizQuestionView[]> = {
    1: [
      { id: 1, question: 'What is the main goal of the diagnostic baseline?', options: ['Memorize vocabulary only', 'Measure level across four skills', 'Practice only speaking', 'Avoid timed practice'], correct: 1, explanation: 'The baseline session is used to measure Reading, Listening, Writing, and Speaking.' },
      { id: 2, question: 'Which habit is identified as causing avoidable errors?', options: ['Regular review habits', 'Clear planning', 'Poor review habits', 'Balanced timing'], correct: 2, explanation: 'The passage explicitly says poor review habits cause avoidable errors.' }
    ],
    2: [
      { id: 1, question: 'What time does the library open on weekdays?', options: ['8:00 a.m.', '8:30 a.m.', '9:00 a.m.', '9:30 a.m.'], correct: 1, explanation: 'Scenario B says the city library opens from 8:30 a.m. on weekdays.' },
      { id: 2, question: 'How long can a study room be booked?', options: ['1 hour', '90 minutes', '2 hours', '3 hours'], correct: 2, explanation: 'The text states study rooms can be booked for two hours.' }
    ],
    3: [
      { id: 1, question: 'How many residents were surveyed in Section 3?', options: ['180', '240', '260', '300'], correct: 1, explanation: 'The conversation states they surveyed 240 residents.' },
      { id: 2, question: 'What percentage reported higher indoor temperatures?', options: ['52%', '61%', '68%', '74%'], correct: 2, explanation: 'The report says 68 percent noticed higher summer indoor temperatures.' },
      { id: 3, question: 'Which solution was proposed in the project?', options: ['Ban public transport', 'Plant street trees', 'Close city centers', 'Replace all buses'], correct: 1, explanation: 'Students proposed planting street trees and installing reflective roofs.' }
    ],
    4: [
      { id: 1, question: 'Which function of sleep is mentioned in the passage?', options: ['Improves internet speed', 'Consolidates memory', 'Eliminates all stress', 'Replaces exercise'], correct: 1, explanation: 'The passage states that sleep consolidates memory.' },
      { id: 2, question: 'Sleeping fewer than six hours can reduce what?', options: ['Reading speed only', 'Attention control', 'Vocabulary size', 'Handwriting quality'], correct: 1, explanation: 'The text links short sleep to lower attention control and slower decisions.' },
      { id: 3, question: 'Best heading for the passage is:', options: ['Sleep and Technology', 'Why Sleep Quality and Quantity Matter', 'The History of Sleep Research'], correct: 1, explanation: 'The passage emphasizes both sleep duration and quality.' }
    ],
    5: [
      { id: 1, question: 'Urban farming can reduce what according to the passage?', options: ['Tuition costs', 'Food transport distances', 'Internet usage', 'Energy bills only'], correct: 1, explanation: 'The passage says urban farming can reduce transport distances.' },
      { id: 2, question: 'Does the author claim urban farming should fully replace traditional agriculture?', options: ['Yes', 'No'], correct: 1, explanation: 'The author says replacement is not the goal; it complements existing systems.' }
    ],
    6: [
      { id: 1, question: 'In Task 1, what must you avoid?', options: ['Overview sentence', 'Accurate numbers', 'Opinions', 'Comparisons'], correct: 2, explanation: 'The checklist explicitly says avoid opinions.' },
      { id: 2, question: 'Which method increases from 2015 to 2025?', options: ['Self-study', 'Online classes', 'Group study', 'None'], correct: 1, explanation: 'Online classes rise from 20% to 42%.' }
    ],
    7: [
      { id: 1, question: 'How many words are required in Writing Task 2?', options: ['150', '200', '250', '300'], correct: 2, explanation: 'The requirement says write at least 250 words.' },
      { id: 2, question: 'What must the essay include?', options: ['Only one view', 'No conclusion', 'Both views and your opinion', 'Bullet points only'], correct: 2, explanation: 'The prompt requires discussing both views and giving your opinion.' }
    ],
    8: [
      { id: 1, question: 'How long should the Part 2 recording be?', options: ['1 minute', '2 minutes', '3 minutes', '4 minutes'], correct: 1, explanation: 'The Do Task asks for a 2-minute answer.' },
      { id: 2, question: 'What should you do after recording?', options: ['Submit immediately', 'Replay and note 3 improvements', 'Delete recording', 'Translate it'], correct: 1, explanation: 'The task asks learners to replay and note three improvements.' }
    ],
    9: [
      { id: 1, question: 'Which topic is used for Part 3 questions?', options: ['Tourism and media', 'Education and technology', 'Sports and health', 'Food and travel'], correct: 1, explanation: 'The section title says Topic: Education and Technology.' },
      { id: 2, question: 'Which element is part of the answer framework?', options: ['State opinion clearly', 'Avoid examples', 'Use single-word answers', 'Ignore contrasts'], correct: 0, explanation: 'The framework starts with stating your opinion clearly.' }
    ],
    10: [
      { id: 1, question: 'Which reading question type appears in Mock Test 1?', options: ['Diagram labeling only', 'True/False/Not Given', 'Sentence translation', 'Dictation only'], correct: 1, explanation: 'Mock Test 1 includes True/False/Not Given.' },
      { id: 2, question: 'What should you do after completing the mock?', options: ['Skip review', 'Write a 100-word error report', 'Only retake listening', 'Change module'], correct: 1, explanation: 'The Do Task requires a 100-word error report with top weak areas.' }
    ],
    11: [
      { id: 1, question: 'What is the main goal of Mock Test 2?', options: ['Start from zero', 'Compare progress after correction', 'Practice vocabulary only', 'Avoid timing'], correct: 1, explanation: 'The goal states retest after correction and compare progress with Mock Test 1.' },
      { id: 2, question: 'Which skill area is listed in focus areas?', options: ['Reading speed and evidence marking', 'Drawing interpretation', 'Coding accuracy', 'Handwriting style'], correct: 0, explanation: 'Reading speed and evidence marking is explicitly listed.' }
    ],
    12: [
      { id: 1, question: 'Which is a high-band reading behavior?', options: ['Skip hard questions', 'Verify difficult answers with evidence', 'Depend on guesses', 'Read without timing'], correct: 1, explanation: 'The consolidation list says verify every difficult answer with evidence.' },
      { id: 2, question: 'What is planned for Day 6?', options: ['Light review', 'Vocabulary only', 'Full mock test', 'No study'], correct: 2, explanation: 'The 7-day plan sets Day 6 as a full mock test.' }
    ],
    13: [
      { id: 1, question: 'How many core Cambridge books are listed?', options: ['4', '5', '6', '7'], correct: 2, explanation: 'Six books are listed: 9, 10, 15, 16, 18, 19.' },
      { id: 2, question: 'What is the Friday focus in the weekly cycle?', options: ['Reading', 'Listening', 'Writing Task 2', 'Speaking'], correct: 3, explanation: 'The weekly cycle marks Friday as Speaking practice.' }
    ]
  };

  const totalCompletedModules = Object.values(currentUser?.progress || {}).reduce(
    (sum, courseProgress) => sum + courseProgress.completedModules.length,
    0
  );

  const averageProgress = (() => {
    const progressValues = Object.entries(currentUser?.progress || {});
    if (progressValues.length === 0) return 0;

    const avgProgress =
      progressValues.reduce((sum, [courseId, courseProgress]) => {
        const course = courses.find((c) => c.id === courseId);
        const percent = course ? (courseProgress.completedModules.length / course.modules.length) * 100 : 0;
        return sum + percent;
      }, 0) / progressValues.length;

    return Math.round(avgProgress);
  })();

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

  const getModuleText = (module: Module | null) => {
    if (!module) return '';
    return module.fullContent || module.content || '';
  };

  const getDynamicQuestions = (text: string) => {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const questionLines = lines
      .filter((line) => line.includes('?') || /^\d+\./.test(line))
      .filter((line) => !line.toLowerCase().startsWith('do task'))
      .slice(0, 6);

    return questionLines;
  };

  const getKeyPoints = (text: string) => {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.includes('?'))
      .filter((line) => !/^\d+\./.test(line));

    const bullets = lines
      .filter((line) => line.startsWith('- ') || line.startsWith('+ '))
      .map((line) => line.substring(2).trim())
      .slice(0, 5);

    if (bullets.length > 0) return bullets;

    return lines
      .filter((line) => line.length > 30)
      .slice(0, 5);
  };

  const getDoTaskPrompt = (text: string) => {
    const lines = text.split('\n').map((line) => line.trim());
    const doIndex = lines.findIndex((line) => line.toLowerCase().startsWith('do task'));

    if (doIndex >= 0) {
      const firstLine = lines[doIndex].replace(/^do task:\s*/i, '').trim();
      const extra = lines
        .slice(doIndex + 1, doIndex + 4)
        .filter(Boolean)
        .join(' ')
        .trim();

      return [firstLine, extra].filter(Boolean).join(' ').trim();
    }

    return 'Complete one exam-style response based on this module, then self-check grammar, task response, and vocabulary.';
  };

  const parseQuizFromContent = (text: string): QuizQuestionView[] => {
    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const question =
      lines.find((line) => /\?$/.test(line) && !line.toLowerCase().startsWith('do task')) ||
      lines.find((line) => /^\d+\./.test(line) && line.includes('?')) ||
      null;

    const optionsFromInline = lines.flatMap((line) => {
      const matches = Array.from(line.matchAll(/(?:^|\s)([a-d])[\).]\s*([^]+?)(?=\s+[a-d][\).]|$)/gi));
      return matches.map((match) => match[2].trim()).filter(Boolean);
    });

    const optionsFromSeparateLines = lines
      .filter((line) => /^[a-d][\).]/i.test(line))
      .map((line) => line.replace(/^[a-d][\).]\s*/i, '').trim());

    const rawOptions = optionsFromInline.length >= 2 ? optionsFromInline : optionsFromSeparateLines;
    const options = Array.from(new Set(rawOptions)).slice(0, 4);

    if (!question || options.length < 2) {
      return [];
    }

    return [
      {
        id: 1,
        question: question.replace(/^\d+\.\s*/, ''),
        options,
        correct: null,
        explanation: ''
      }
    ];
  };

  const getQuizForModule = (module: Module | null, text: string): QuizQuestionView[] => {
    if (!module) return [];

    if (quizBankByModuleId[module.id]) {
      return quizBankByModuleId[module.id];
    }

    if (module.quiz?.questions && module.quiz.questions.length > 0) {
      return module.quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation
      }));
    }

    return parseQuizFromContent(text);
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
                    setActiveTab('read');
                    setUserSummary('');
                    setUserNotes('');
                    setSelectedQuizOptions({});
                    setQuizSubmitted(false);
                    setQuizScore(null);
                    setQuizMessage('');
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
                  {(() => {
                    const moduleText = getModuleText(selectedModule);
                    const keyPoints = getKeyPoints(moduleText);
                    const dynamicQuestions = getDynamicQuestions(moduleText);
                    const doTaskPrompt = getDoTaskPrompt(moduleText);
                    const quizData = getQuizForModule(selectedModule, moduleText);

                    return (
                      <>
                  <h3>{selectedModule.title}</h3>
                  {selectedModule.readingTime && (
                    <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '1.5rem' }}>
                      ⏱️ Estimated reading time: {selectedModule.readingTime} minutes
                    </p>
                  )}

                  {/* Interactive Tabs */}
                  <div className="content-tabs">
                    <button 
                      className={`tab-btn ${activeTab === 'read' ? 'active' : ''}`}
                      onClick={() => setActiveTab('read')}
                    >
                      📖 Read
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'analyze' ? 'active' : ''}`}
                      onClick={() => setActiveTab('analyze')}
                    >
                      🔍 Analyze
                    </button>
                    <button 
                      className={`tab-btn ${activeTab === 'do' ? 'active' : ''}`}
                      onClick={() => setActiveTab('do')}
                    >
                      ✏️ Do
                    </button>
                  </div>

                  {/* READ TAB - Display PDF Content */}
                  {activeTab === 'read' && (
                    <>
                      <div className="pdf-content-panel">
                        {selectedModule.fullContent || selectedModule.content}
                      </div>

                      {quizData.length > 0 && (
                        <div className="quiz-section" style={{ marginTop: '1.5rem' }}>
                          <h4>Quiz Bucket ({quizData.length} questions)</h4>
                          {quizData.map((q, qIndex) => (
                            <div className="quiz-question" key={`quiz-q-${q.id}-${qIndex}`}>
                              <p>Q{qIndex + 1}: {q.question}</p>
                              {q.options.map((option, optionIndex) => (
                                <label
                                  key={`${q.id}-${option}-${optionIndex}`}
                                  className={`quiz-option ${
                                    quizSubmitted && q.correct !== null && optionIndex === q.correct ? 'correct' : ''
                                  } ${
                                    quizSubmitted &&
                                    selectedQuizOptions[q.id] === optionIndex &&
                                    q.correct !== null &&
                                    optionIndex !== q.correct
                                      ? 'incorrect'
                                      : ''
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`module-quiz-${q.id}`}
                                    checked={selectedQuizOptions[q.id] === optionIndex}
                                    disabled={quizSubmitted}
                                    onChange={() =>
                                      {
                                        setQuizMessage('');
                                        setSelectedQuizOptions((prev) => ({
                                          ...prev,
                                          [q.id]: optionIndex
                                        }));
                                      }
                                    }
                                  />
                                  {option}
                                </label>
                              ))}
                            </div>
                          ))}

                          <button
                            className="submit-quiz-btn"
                            onClick={() => {
                              if (quizData.some((q) => selectedQuizOptions[q.id] === undefined)) {
                                setQuizMessage('Please answer all quiz questions before submitting.');
                                return;
                              }

                              const gradable = quizData.filter((q) => q.correct !== null);
                              if (gradable.length === 0) {
                                setQuizScore(null);
                                setQuizMessage('Your answers were recorded for practice review.');
                                setQuizSubmitted(true);
                                return;
                              }

                              const correctCount = gradable.reduce((count, q) => {
                                return count + (selectedQuizOptions[q.id] === q.correct ? 1 : 0);
                              }, 0);

                              const score = Math.round((correctCount / gradable.length) * 100);
                              setQuizScore(score);
                              setQuizMessage(
                                `You got ${correctCount} out of ${gradable.length} graded questions correct.`
                              );
                              setQuizSubmitted(true);
                            }}
                            disabled={quizSubmitted}
                          >
                            {quizSubmitted ? 'Quiz Submitted' : 'Submit Quiz'}
                          </button>

                          {!quizSubmitted && quizMessage && (
                            <p style={{ marginTop: '0.75rem', color: '#b45309', fontWeight: 600 }}>{quizMessage}</p>
                          )}

                          {quizSubmitted && (
                            <div
                              className={`quiz-result ${
                                quizScore === null ? 'pass' : quizScore >= 70 ? 'pass' : 'fail'
                              }`}
                              style={{ marginTop: '1rem' }}
                            >
                              <h4>
                                {quizScore === null
                                  ? 'Submitted'
                                  : quizScore >= 70
                                    ? 'Correct Answer'
                                    : 'Try Again'}
                              </h4>
                              <p>
                                {quizScore === null
                                  ? 'Your answers have been recorded for practice.'
                                  : `Score: ${quizScore}%`}
                              </p>
                              {quizMessage && <p>{quizMessage}</p>}
                              <p className={quizScore === null || quizScore >= 70 ? 'pass-message' : 'fail-message'}>
                                {quizScore === null || quizScore >= 70
                                  ? 'Great work. Review the passage to reinforce your reasoning.'
                                  : 'Review incorrect options and retry to improve your score.'}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* ANALYZE TAB - Key Points & Questions */}
                  {activeTab === 'analyze' && (
                    <div className="analyze-section">
                      <div className="key-points-box">
                        <h4>📌 Key Takeaways</h4>
                        <ul>
                          {keyPoints.map((point, index) => (
                            <li key={`${point}-${index}`}>{point}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="activity-section">
                        <h4>❓ Exam-Style Questions</h4>
                        <p>Answer these based on the module content:</p>
                        <ul style={{ marginLeft: '1.5rem' }}>
                          {(dynamicQuestions.length > 0 ? dynamicQuestions : [
                            'What is the main argument or theme in this module?',
                            'Which evidence or examples support the main idea?',
                            'What exam strategy can you apply from this material?',
                            'Which vocabulary items are most useful for IELTS?'
                          ]).map((question, index) => (
                            <li key={`${question}-${index}`}>{question}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* DO TAB - Writing Activities */}
                  {activeTab === 'do' && (
                    <div className="analyze-section">
                      <div className="activity-section">
                        <h4>📝 Write a Summary</h4>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                          {doTaskPrompt || 'Summarize the key points in your own words (150-250 words)'}
                        </p>
                        <textarea
                          className="activity-input"
                          value={userSummary}
                          onChange={(e) => setUserSummary(e.target.value)}
                          placeholder="Write your summary here... Focus on main ideas and key concepts."
                        />
                        <div className="word-counter">
                          Word count: {userSummary.trim().split(/\s+/).filter(w => w).length}
                        </div>
                        <button className="activity-button" onClick={() => {
                          if (userSummary.trim().length > 50) {
                            alert('✓ Summary submitted! Great effort in capturing the main ideas.');
                            setUserSummary('');
                          }
                        }}>
                          Submit Summary
                        </button>
                      </div>

                      <div className="activity-section">
                        <h4>📚 Take Notes</h4>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                          Record important points, vocabulary, or questions
                        </p>
                        <textarea
                          className="activity-input"
                          value={userNotes}
                          onChange={(e) => setUserNotes(e.target.value)}
                          placeholder="• Note vocabulary and definitions here&#10;• Write down important concepts&#10;• Ask questions for clarification"
                        />
                        <button className="activity-button" onClick={() => {
                          if (userNotes.trim().length > 20) {
                            alert('✓ Notes saved! Review these regularly to reinforce learning.');
                            setUserNotes('');
                          }
                        }}>
                          Save Notes
                        </button>
                      </div>

                      <div className="activity-section">
                        <h4>💡 Reflection</h4>
                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                          How does this content connect to your learning goals?
                        </p>
                        <textarea
                          className="activity-input"
                          placeholder="Write how you can apply this knowledge..."
                          style={{ minHeight: '80px' }}
                          onBlur={(e) => {
                            if (e.target.value.trim().length > 20) {
                              alert('✓ Reflection recorded! Connecting theory to practice is key to progress.');
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Study Materials */}
                  {selectedModule.materials && selectedModule.materials.length > 0 && (
                    <div className="module-materials" style={{ marginTop: '2rem' }}>
                      <h4>📋 Module Info</h4>
                      <ul>
                        {selectedModule.materials.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                      </>
                    );
                  })()}
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
                <h3>{totalCompletedModules}</h3>
                <p>Modules Completed</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📊</span>
              <div>
                <h3>{averageProgress}%</h3>
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

          <SkillLab currentUser={currentUser} />
        </div>
      )}
    </div>
  );
}
