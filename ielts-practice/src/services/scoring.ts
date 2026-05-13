import type { EvaluationResult, PracticeTask, SkillType } from '../types';

const roundToHalf = (value: number): number => Math.max(0, Math.min(9, Math.round(value * 2) / 2));

const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

const sentenceCount = (text: string): number => {
  const matches = text.match(/[.!?]+/g);
  return matches ? matches.length : 0;
};

const lexicalVariety = (text: string): number => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);

  if (words.length === 0) {
    return 0;
  }

  return new Set(words).size / words.length;
};

const baseCriteriaBySkill = (skill: SkillType): string[] => {
  switch (skill) {
    case 'Writing':
      return ['Task Achievement', 'Organization', 'Lexical Resource', 'Grammar Control'];
    case 'Speaking':
      return ['Fluency', 'Coherence', 'Lexical Range', 'Pronunciation Readiness'];
    case 'Reading':
      return ['Accuracy', 'Inference Discipline', 'Speed Management', 'Evidence Use'];
    case 'Listening':
      return ['Detail Capture', 'Main Idea Tracking', 'Note Quality', 'Error Recovery'];
    default:
      return ['Accuracy'];
  }
};

export const evaluateSubmission = (task: PracticeTask, submission: string): EvaluationResult => {
  const words = wordCount(submission);
  const sentences = sentenceCount(submission);
  const variety = lexicalVariety(submission);
  const criteriaNames = baseCriteriaBySkill(task.skill);

  const lengthScore = task.skill === 'Writing' ? words / 45 : words / 35;
  const structureScore = sentences >= 4 ? 7.2 : 5.8;
  const varietyScore = 5 + variety * 5;
  const instructionScore = submission.toLowerCase().includes('because') || submission.toLowerCase().includes('however') ? 7.4 : 6.2;

  const rawScores = [lengthScore, structureScore, varietyScore, instructionScore].slice(0, criteriaNames.length);

  const criteria = criteriaNames.map((name, idx) => {
    const score = roundToHalf(rawScores[idx] ?? 6);
    return {
      name,
      score,
      feedback:
        score >= 7.5
          ? `Strong ${name.toLowerCase()} performance. Keep this under timed conditions.`
          : `Improve ${name.toLowerCase()} with one focused revision cycle.`
    };
  });

  const overallBand = roundToHalf(criteria.reduce((sum, item) => sum + item.score, 0) / criteria.length);

  const strengths = criteria
    .filter((item) => item.score >= overallBand)
    .map((item) => `${item.name} is currently a relative strength.`)
    .slice(0, 2);

  const improvements = criteria
    .filter((item) => item.score < overallBand)
    .map((item) => `Prioritize ${item.name.toLowerCase()} in your next session.`)
    .slice(0, 3);

  const nextActions = [
    `Rewrite this response in ${Math.max(8, Math.round(task.estimatedMinutes * 0.6))} minutes with a clearer structure.`,
    'Create an error log with three specific edits and why they improve scoring.',
    `Complete one additional ${task.track} ${task.skill.toLowerCase()} drill today.`
  ];

  return {
    overallBand,
    criteria,
    strengths: strengths.length > 0 ? strengths : ['You maintained consistent effort across criteria.'],
    improvements: improvements.length > 0 ? improvements : ['Raise precision and control under time constraints.'],
    nextActions
  };
};
