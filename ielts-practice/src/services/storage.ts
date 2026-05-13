import type { ExamTrack, SkillType, UserPerformance } from '../types';

const PERFORMANCE_KEY = 'english_learning_performance_v1';

const emptySnapshot = () => ({ averageScore: 0, attempts: 0, updatedAt: new Date().toISOString() });

const emptyPerformance = (): UserPerformance => ({
  byTrack: {
    IELTS: {
      Reading: emptySnapshot(),
      Writing: emptySnapshot(),
      Listening: emptySnapshot(),
      Speaking: emptySnapshot()
    },
    GRE: {
      Reading: emptySnapshot(),
      Writing: emptySnapshot(),
      Listening: emptySnapshot(),
      Speaking: emptySnapshot()
    }
  }
});

export const getStoredPerformance = (): UserPerformance => {
  try {
    const raw = localStorage.getItem(PERFORMANCE_KEY);
    if (!raw) {
      return emptyPerformance();
    }

    const parsed = JSON.parse(raw) as UserPerformance;
    if (!parsed?.byTrack?.IELTS || !parsed?.byTrack?.GRE) {
      return emptyPerformance();
    }

    return parsed;
  } catch {
    return emptyPerformance();
  }
};

export const updateStoredPerformance = (track: ExamTrack, skill: SkillType, score: number): UserPerformance => {
  const performance = getStoredPerformance();
  const current = performance.byTrack[track][skill];

  const updatedAttempts = current.attempts + 1;
  const updatedAverage = Number(((current.averageScore * current.attempts + score) / updatedAttempts).toFixed(2));

  performance.byTrack[track][skill] = {
    averageScore: updatedAverage,
    attempts: updatedAttempts,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(PERFORMANCE_KEY, JSON.stringify(performance));
  return performance;
};

export const getRecentAverage = (track: ExamTrack, skill: SkillType): number => {
  const value = getStoredPerformance().byTrack[track][skill].averageScore;
  return Number.isFinite(value) ? value : 0;
};
