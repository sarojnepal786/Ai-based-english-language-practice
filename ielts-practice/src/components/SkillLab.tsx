import { useMemo, useState } from 'react';
import {
  EXAM_TRACKS,
  SKILLS,
  getAdaptiveRecommendation,
  getPracticeTasks
} from '../data/learningEngine';
import { evaluateSubmission } from '../services/scoring';
import { getRecentAverage, getStoredPerformance, updateStoredPerformance } from '../services/storage';
import type { EvaluationResult, ExamTrack, PracticeTask, SkillType, User } from '../types';
import '../styles/SkillLab.css';

interface SkillLabProps {
  currentUser: User | null;
}

const scoreTagClass = (value: number): string => {
  if (value >= 7.5) return 'score-good';
  if (value >= 6.5) return 'score-mid';
  return 'score-low';
};

export default function SkillLab({ currentUser }: SkillLabProps) {
  const [track, setTrack] = useState<ExamTrack>('IELTS');
  const [skill, setSkill] = useState<SkillType>('Reading');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [submission, setSubmission] = useState<string>('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [performanceVersion, setPerformanceVersion] = useState<number>(0);

  const tasks = useMemo(() => getPracticeTasks(track, skill), [track, skill]);

  const selectedTask = useMemo<PracticeTask | null>(
    () => tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null,
    [selectedTaskId, tasks]
  );

  const performance = useMemo(() => getStoredPerformance(), [performanceVersion]);

  const recentAverage = useMemo(() => {
    const value = getRecentAverage(track, skill);
    return value > 0 ? [value] : [];
  }, [track, skill, performanceVersion]);

  const recommendation = useMemo(
    () => getAdaptiveRecommendation(track, skill, recentAverage),
    [track, skill, recentAverage]
  );

  const handleEvaluate = () => {
    if (!selectedTask || submission.trim().length < 40) {
      alert('Please provide at least 40 characters so the evaluator can score your response.');
      return;
    }

    const result = evaluateSubmission(selectedTask, submission.trim());
    setEvaluation(result);
    updateStoredPerformance(track, skill, result.overallBand);
    setPerformanceVersion((value) => value + 1);
  };

  const snapshot = performance.byTrack[track][skill];

  return (
    <section className="skill-lab">
      <div className="skill-lab-header">
        <div>
          <h3>Advanced IELTS + GRE Skill Lab</h3>
          <p>Personalized reading, writing, listening, and speaking drills with adaptive scoring.</p>
        </div>
        <div className="skill-lab-user">
          <span>Learner</span>
          <strong>{currentUser?.name ?? 'Guest'}</strong>
        </div>
      </div>

      <div className="skill-lab-controls">
        <div className="segmented-group">
          {EXAM_TRACKS.map((item) => (
            <button
              key={item}
              type="button"
              className={`segment-btn ${track === item ? 'active' : ''}`}
              onClick={() => {
                setTrack(item);
                setSelectedTaskId('');
                setEvaluation(null);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="segmented-group">
          {SKILLS.map((item) => (
            <button
              key={item}
              type="button"
              className={`segment-btn ${skill === item ? 'active' : ''}`}
              onClick={() => {
                setSkill(item);
                setSelectedTaskId('');
                setEvaluation(null);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="skill-metrics-grid">
        <article className="metric-card">
          <h4>Average Band</h4>
          <strong>{snapshot.averageScore.toFixed(1)}</strong>
          <span>{track} {skill}</span>
        </article>
        <article className="metric-card">
          <h4>Total Attempts</h4>
          <strong>{snapshot.attempts}</strong>
          <span>Persistent across sessions</span>
        </article>
        <article className="metric-card">
          <h4>Coach Recommendation</h4>
          <p>{recommendation}</p>
        </article>
      </div>

      <div className="skill-lab-body">
        <aside className="task-list">
          <h4>Practice Sets</h4>
          {tasks.map((task) => {
            const active = (selectedTask?.id ?? '') === task.id;
            return (
              <button
                key={task.id}
                type="button"
                className={`task-item ${active ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTaskId(task.id);
                  setEvaluation(null);
                }}
              >
                <strong>{task.title}</strong>
                <span>{task.level} - {task.estimatedMinutes} min</span>
              </button>
            );
          })}
        </aside>

        <div className="task-workbench">
          {selectedTask ? (
            <>
              <div className="task-details">
                <h4>{selectedTask.title}</h4>
                <p>{selectedTask.prompt}</p>
                <ul>
                  {selectedTask.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>

              <label htmlFor="submission-box">Your Response</label>
              <textarea
                id="submission-box"
                value={submission}
                onChange={(event) => setSubmission(event.target.value)}
                placeholder="Write or paste your answer/transcript/summary here..."
              />
              <div className="submission-actions">
                <span>{submission.trim().length} chars</span>
                <button type="button" onClick={handleEvaluate}>
                  Evaluate Attempt
                </button>
              </div>

              {evaluation && (
                <div className="evaluation-panel">
                  <div className="overall-band">
                    <h5>Estimated Band</h5>
                    <strong>{evaluation.overallBand.toFixed(1)}</strong>
                  </div>

                  <div className="criteria-grid">
                    {evaluation.criteria.map((criterion) => (
                      <article key={criterion.name} className={`criterion-card ${scoreTagClass(criterion.score)}`}>
                        <h6>{criterion.name}</h6>
                        <strong>{criterion.score.toFixed(1)}</strong>
                        <p>{criterion.feedback}</p>
                      </article>
                    ))}
                  </div>

                  <div className="coaching-grid">
                    <article>
                      <h6>Strengths</h6>
                      <ul>
                        {evaluation.strengths.map((value) => (
                          <li key={value}>{value}</li>
                        ))}
                      </ul>
                    </article>
                    <article>
                      <h6>Improvements</h6>
                      <ul>
                        {evaluation.improvements.map((value) => (
                          <li key={value}>{value}</li>
                        ))}
                      </ul>
                    </article>
                    <article>
                      <h6>Next Actions</h6>
                      <ul>
                        {evaluation.nextActions.map((value) => (
                          <li key={value}>{value}</li>
                        ))}
                      </ul>
                    </article>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p>No tasks available for this combination yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
