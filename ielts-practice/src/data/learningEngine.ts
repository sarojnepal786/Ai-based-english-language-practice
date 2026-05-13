import type { ExamTrack, PracticeTask, SkillType } from '../types';

const tasks: PracticeTask[] = [
  {
    id: 'ielts-reading-headings',
    title: 'Matching Headings Under Time Pressure',
    track: 'IELTS',
    skill: 'Reading',
    level: 'Advanced',
    estimatedMinutes: 25,
    prompt:
      'Read a 900-word academic passage. Write one heading for each paragraph in 6 words or fewer. Then justify two hardest decisions in 120 words.',
    tips: [
      'Skim first sentence and final sentence of each paragraph.',
      'Eliminate heading options that are too specific.',
      'Track synonyms rather than exact word matches.'
    ],
    rubric: ['Task completion', 'Accuracy of paragraph mapping', 'Time management'],
    sampleHighlights: ['Main idea before detail', 'Use keyword mapping', 'Avoid trap headings']
  },
  {
    id: 'ielts-writing-task2-argument',
    title: 'Task 2 Balanced Argument Essay',
    track: 'IELTS',
    skill: 'Writing',
    level: 'Advanced',
    estimatedMinutes: 40,
    prompt:
      'Some people believe governments should fund public transport over road expansion. Discuss both views and give your opinion in 250-300 words.',
    tips: [
      'Use one position sentence in every body paragraph.',
      'Support each idea with one concrete example.',
      'Reserve 5 minutes for grammar and cohesion checks.'
    ],
    rubric: ['Task response', 'Coherence and cohesion', 'Lexical resource', 'Grammar range and accuracy'],
    sampleHighlights: ['Clear thesis', 'Balanced discussion', 'Concrete examples']
  },
  {
    id: 'ielts-listening-note-completion',
    title: 'Section 3 Note Completion Strategy',
    track: 'IELTS',
    skill: 'Listening',
    level: 'Intermediate',
    estimatedMinutes: 20,
    prompt:
      'Listen to an academic discussion and complete notes with one or two words. Predict likely word types for each blank before listening.',
    tips: [
      'Mark nouns, numbers, and adjectives expected in each blank.',
      'Follow speaker signposting: firstly, however, in conclusion.',
      'Use capital letters in notes for proper nouns.'
    ],
    rubric: ['Prediction quality', 'Answer accuracy', 'Error correction discipline'],
    sampleHighlights: ['Pre-listen prediction', 'Signpost tracking', 'Final transfer checks']
  },
  {
    id: 'ielts-speaking-part2',
    title: 'Fluent Story Arc for Speaking Part 2',
    track: 'IELTS',
    skill: 'Speaking',
    level: 'Advanced',
    estimatedMinutes: 15,
    prompt:
      'Speak for 2 minutes on a time you solved a difficult problem. Use context, challenge, action, and result structure.',
    tips: [
      'Spend one minute creating four bullet points.',
      'Use temporal connectors to keep flow.',
      'Add one reflective sentence at the end.'
    ],
    rubric: ['Fluency and coherence', 'Lexical range', 'Grammar control', 'Pronunciation clarity'],
    sampleHighlights: ['Story structure', 'Natural transition phrases', 'Self-correction control']
  },
  {
    id: 'gre-reading-multi-select',
    title: 'GRE Multi-Select Evidence Trap Drill',
    track: 'GRE',
    skill: 'Reading',
    level: 'Advanced',
    estimatedMinutes: 30,
    prompt:
      'Read two short passages and choose all statements supported by the author. Explain why one tempting option is wrong.',
    tips: [
      'Classify each option as supported, contradicted, or unstated.',
      'Use sentence-level evidence references.',
      'Do not infer beyond author claims.'
    ],
    rubric: ['Evidence precision', 'Inference control', 'Option elimination discipline'],
    sampleHighlights: ['Evidence tagging', 'Trap elimination', 'Claim-bound reasoning']
  },
  {
    id: 'gre-writing-issue',
    title: 'GRE Issue Essay with Counterargument',
    track: 'GRE',
    skill: 'Writing',
    level: 'Advanced',
    estimatedMinutes: 35,
    prompt:
      'Write a response to: "Universities should require all students to study economics." Develop your position with at least one counterargument.',
    tips: [
      'State your position in the introduction directly.',
      'Use one paragraph to steelman the opposite view.',
      'Keep topic sentences argumentative, not descriptive.'
    ],
    rubric: ['Idea development', 'Organization', 'Language control', 'Argument depth'],
    sampleHighlights: ['Nuanced position', 'Counterargument handling', 'Specific evidence']
  },
  {
    id: 'gre-listening-lecture-logic',
    title: 'Lecture Logic Mapping',
    track: 'GRE',
    skill: 'Listening',
    level: 'Intermediate',
    estimatedMinutes: 22,
    prompt:
      'Listen to a 5-minute mini-lecture and map claim, evidence, and concession points in bullet form.',
    tips: [
      'Track relationship words: therefore, despite, although.',
      'Capture function of each detail, not every word.',
      'Summarize each minute in one line.'
    ],
    rubric: ['Logical mapping', 'Conciseness', 'Information hierarchy'],
    sampleHighlights: ['Argument skeleton', 'Signal-word awareness', 'High-value notes']
  },
  {
    id: 'gre-speaking-analytical-summary',
    title: '90-Second Analytical Summary',
    track: 'GRE',
    skill: 'Speaking',
    level: 'Advanced',
    estimatedMinutes: 12,
    prompt:
      'Speak for 90 seconds summarizing a short argument and evaluate one weakness in evidence quality.',
    tips: [
      'Use a three-part structure: claim, support, critique.',
      'Avoid filler by planning 3 anchor phrases.',
      'End with a concise judgement sentence.'
    ],
    rubric: ['Analytical clarity', 'Reasoning quality', 'Delivery confidence'],
    sampleHighlights: ['Structured critique', 'Precise vocabulary', 'Concise close']
  }
];

export const EXAM_TRACKS: ExamTrack[] = ['IELTS', 'GRE'];
export const SKILLS: SkillType[] = ['Reading', 'Writing', 'Listening', 'Speaking'];

export const getPracticeTasks = (track: ExamTrack, skill: SkillType): PracticeTask[] =>
  tasks.filter((task) => task.track === track && task.skill === skill);

export const getAdaptiveRecommendation = (
  track: ExamTrack,
  skill: SkillType,
  recentScores: number[]
): string => {
  if (recentScores.length === 0) {
    return `Start with a baseline ${track} ${skill.toLowerCase()} task and focus on process, not speed.`;
  }

  const average = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;

  if (average >= 8) {
    return `You are performing strongly in ${skill}. Move to mixed-difficulty ${track} drills with stricter timing.`;
  }

  if (average >= 6.5) {
    return `Your ${skill} is stable. Keep the same difficulty and add one deliberate practice loop on weak criteria.`;
  }

  return `Rebuild core accuracy in ${skill}: complete shorter ${track} sets and do immediate error analysis after each attempt.`;
};
