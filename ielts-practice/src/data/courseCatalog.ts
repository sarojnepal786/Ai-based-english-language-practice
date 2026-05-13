import type { Course } from '../types';

export const courses: Course[] = [
  {
    id: '0',
    title: 'IELTS Practice',
    description: 'Complete IELTS preparation with reading, writing, listening, and speaking practice.',
    instructor: 'AI Curriculum Engine',
    level: 'Advanced',
    duration: '16 weeks',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400',
    enrolled: 1,
    rating: 4.9,
    modules: [
      {
        id: 1,
        title: 'Orientation & Diagnostic Baseline',
        duration: '90 min',
        content: `DIAGNOSTIC BASELINE SESSION

Goal:
- Measure your current level in Reading, Listening, Writing, and Speaking.

Mini Reading Passage:
Many candidates lose marks not because they lack language ability, but because they do not apply an exam strategy. Time pressure, unclear planning, and poor review habits cause avoidable errors.

Diagnostic Questions:
1. What are the three most common causes of lost marks?
2. Which one affects you most right now?
3. Write one action you will take this week to reduce that error.

Writing Task (150 words):
Describe your current IELTS strengths and weaknesses. Include your target band and weekly study plan.

Speaking Task:
Record a 2-minute response: "Why are you preparing for IELTS, and what is your main challenge?"`
      },
      {
        id: 2,
        title: 'Listening Section 1-2: Everyday Contexts',
        duration: '80 min',
        content: `LISTENING PRACTICE: SECTION 1-2

Scenario A (Form Completion):
Caller name: Daniel Brooks
Course: Evening English Support
Start date: 14 October
Fee: 180 dollars
Room: B12

Questions:
1. What is the caller's full name?
2. Which date does the course begin?
3. How much is the fee?
4. Which room is assigned?

Scenario B (Local Information Talk):
The city library now opens from 8:30 a.m. on weekdays. New members need photo ID and proof of address. Study rooms can be booked for two hours.

Questions:
1. What time does the library open on weekdays?
2. List two documents required for new members.
3. How long can a study room be booked?

Do Task:
Write all number/date answers in words and digits to improve transfer accuracy.`
      },
      {
        id: 3,
        title: 'Listening Section 3-4: Academic Logic',
        duration: '90 min',
        content: `LISTENING PRACTICE: SECTION 3-4 ACADEMIC LOGIC

Section 3 Conversation:
Two students discuss a research project on urban heat islands. They surveyed 240 residents. 68 percent reported higher summer indoor temperatures over the last five years. They propose planting street trees and installing reflective roofs.

Questions (Multiple Choice):
1. How many residents were surveyed?
   a) 180  b) 240  c) 260  d) 300
2. What percentage reported higher indoor temperatures?
   a) 52%  b) 61%  c) 68%  d) 74%
3. Which two solutions were proposed?

Section 4 Lecture Notes:
Topic: Public transport integration
- Main claim: single-mode transport is inefficient in large cities
- Best model: integrated bus, metro, and cycling systems
- Example result: reduced congestion and lower emissions

Completion Questions:
1. Single-mode transport is often ____ in large cities.
2. The best model combines bus, metro, and ____.
3. A major benefit is lower traffic ____.

Do Task:
Write a 120-word summary of the lecture using at least 3 linking words (however, therefore, moreover).`
        ,
        quiz: {
          questions: [
            {
              id: 1,
              question: 'How many residents were surveyed?',
              options: ['180', '240', '260', '300'],
              correct: 1,
              explanation: 'The passage states that the students surveyed 240 residents.'
            }
          ]
        }
      },
      {
        id: 4,
        title: 'Reading Foundation: Navigation Strategy',
        duration: '85 min',
        content: `READING PASSAGE 1: THE POWER OF SLEEP

Passage:
Sleep is not simply a passive state of rest. During sleep, the brain consolidates memory, regulates emotion, and supports physical recovery. Recent studies suggest that adults who regularly sleep fewer than six hours have lower attention control and slower decision-making. In education and workplace settings, this may reduce productivity and increase error rates. However, sleep quality matters as much as sleep duration. Interrupted sleep can weaken memory performance even when total time in bed appears sufficient.

Questions:
1. According to the passage, name two key functions of sleep.
2. What is one effect of sleeping fewer than six hours?
3. True/False/Not Given: Sleep duration is the only factor that affects memory.
4. Choose the best heading:
   a) Sleep and Technology
   b) Why Sleep Quality and Quantity Matter
   c) The History of Sleep Research

Do Task:
Find one sentence that supports the answer to Question 3 and copy it exactly.`
        ,
        quiz: {
          questions: [
            {
              id: 1,
              question: 'Choose the best heading for the passage.',
              options: ['Sleep and Technology', 'Why Sleep Quality and Quantity Matter', 'The History of Sleep Research'],
              correct: 1,
              explanation: 'The passage focuses on both sleep duration and sleep quality, not technology or history.'
            }
          ]
        }
      },
      {
        id: 5,
        title: 'Reading Advanced: T/F/NG & Matching',
        duration: '90 min',
        content: `READING PASSAGE 2: URBAN FARMING

Passage:
Urban farming has grown rapidly in many cities due to concerns about food security and sustainability. Rooftop farms, vertical gardens, and community plots can reduce transport distances and increase access to fresh produce. Critics argue that city-based farming cannot replace large-scale agriculture. Supporters respond that replacement is not the goal; instead, urban farming complements existing systems and improves local resilience.

True/False/Not Given:
1. Urban farming was created mainly for tourism.
2. Urban farming can shorten food transport distances.
3. The author claims urban farming should fully replace traditional agriculture.

Matching Information:
Match each idea to the paragraph:
A. Criticism of urban farming scale
B. Benefits for local food access
C. Main reason for urban farming growth

Do Task:
Explain in 80 words why Question 3 is False or Not Given.`
      },
      {
        id: 6,
        title: 'Writing Task 1: Academic Reports',
        duration: '95 min',
        content: `WRITING TASK 1 PRACTICE

Prompt:
The chart shows the percentage of students using three study methods (self-study, online classes, group study) in 2015 and 2025.

Data:
- Self-study: 55% (2015) -> 38% (2025)
- Online classes: 20% (2015) -> 42% (2025)
- Group study: 25% (2015) -> 20% (2025)

Task:
Write at least 150 words.

Checklist:
1. Write a clear overview sentence.
2. Compare highest and lowest values.
3. Report major trends with accurate numbers.
4. Avoid opinions.

Do Task:
Write your report and then underline all comparison phrases (e.g., "whereas", "in contrast").`
      },
      {
        id: 7,
        title: 'Writing Task 2: Argument Engine',
        duration: '100 min',
        content: `WRITING TASK 2 ESSAY PRACTICE

Essay Question:
Some people think university education should be free for everyone. Others believe students should pay tuition fees.
Discuss both views and give your own opinion.

Reading Input (Idea Bank):
- Free education may increase equal access and social mobility.
- Public budgets are limited; full subsidies may reduce quality if funding is insufficient.
- Shared-cost models can balance access and sustainability.

Exam Requirements:
1. Write at least 250 words.
2. Present both views fairly.
3. Give a clear thesis and consistent opinion.
4. Use topic sentences and examples.

Do Task:
Write a 4-paragraph essay plan first:
- Introduction with thesis
- Body 1 (view A)
- Body 2 (view B)
- Conclusion with final opinion`
      },
      {
        id: 8,
        title: 'Speaking Part 1-2: Fluency Building',
        duration: '75 min',
        content: `SPEAKING PART 1-2 PRACTICE

Part 1 Questions:
1. Do you prefer studying in the morning or evening?
2. What kind of books do you enjoy reading?
3. How often do you use English outside class?

Part 2 Cue Card:
Describe a teacher who helped you learn effectively.
You should say:
- who this person is
- what subject they taught
- what made their teaching effective
- and explain how they influenced your learning

Do Task:
Record a 2-minute answer. Then replay and note 3 improvements for fluency and vocabulary.`
      },
      {
        id: 9,
        title: 'Speaking Part 3: Analytical Discussion',
        duration: '80 min',
        content: `SPEAKING PART 3 ANALYTICAL QUESTIONS

Topic: Education and Technology
1. How has technology changed classroom learning in your country?
2. Do you think online education can replace traditional classrooms?
3. What are the long-term social effects of digital learning?
4. Should governments regulate the use of AI tools in education?

Answer Framework:
- State opinion clearly
- Give reason
- Provide example
- Add limitation or contrast

Do Task:
Answer Questions 2 and 4 in 60-90 seconds each using at least one example per answer.`
      },
      {
        id: 10,
        title: 'Full Mock Test 1: Comprehensive Practice',
        duration: '120 min',
        content: `FULL MOCK TEST 1

Reading Mini Test:
Passage Topic: Remote Work Productivity
Question Types: matching headings, short answer, True/False/Not Given

Writing Test:
- Task 1: Report on data trends (150 words)
- Task 2: Opinion essay on remote work and city life (250 words)

Listening Test:
- Section 1: booking details form completion
- Section 2: campus information talk
- Section 3: student project discussion
- Section 4: lecture on renewable energy adoption

Speaking Test:
- Part 1: work/study routines
- Part 2: describe a difficult decision
- Part 3: decision-making in modern society

Do Task:
After completion, calculate section scores and write a 100-word error report with your top 3 weak areas.`
      },
      {
        id: 11,
        title: 'Full Mock Test 2: Refinement & Validation',
        duration: '120 min',
        content: `FULL MOCK TEST 2

Goal:
Retest after correction and compare progress with Mock Test 1.

Focus Areas:
1. Reading speed and evidence marking
2. Writing coherence and paragraph unity
3. Listening answer transfer accuracy
4. Speaking fluency under pressure

Comparison Questions:
1. Which section improved most and why?
2. Which error type still repeats?
3. What strategy changed your performance?

Do Task:
Create a before/after table with four skills and at least one concrete improvement action for each.`
      },
      {
        id: 12,
        title: 'Band 8 Strategy Consolidation',
        duration: '90 min',
        content: `BAND 8 CONSOLIDATION

High-Band Behaviors:
- Reading: verify every difficult answer with evidence
- Writing: strong thesis, clear paragraph logic, precise vocabulary
- Listening: predict answer type before each section
- Speaking: extended responses with relevant examples

Final 7-Day Plan:
Day 1-2: Reading + Listening intensive
Day 3-4: Writing Task 1 and Task 2 timed practice
Day 5: Full speaking simulation
Day 6: Full mock test
Day 7: Light review and confidence routine

Do Task:
Write your personal exam-day checklist (arrival, timing, materials, mindset).`
      },
      {
        id: 13,
        title: 'Cambridge IELTS Library Materials',
        duration: '60 min',
        content: `CAMBRIDGE MATERIALS STUDY MAP

Available Core Books:
- Cambridge IELTS 9
- Cambridge IELTS 10
- Cambridge IELTS 15
- Cambridge IELTS 16
- Cambridge IELTS 18
- Cambridge IELTS 19

How to Use Each Set:
1. Attempt one reading test under 60-minute timing.
2. Attempt one listening test and check transfer mistakes.
3. Choose one Task 2 prompt and write a 250-word essay.
4. Use speaking topics for Part 2 and Part 3 recording practice.

Weekly Exam Cycle:
- Monday: Reading
- Tuesday: Listening
- Wednesday: Writing Task 1
- Thursday: Writing Task 2
- Friday: Speaking
- Saturday: Full mini mock
- Sunday: Error review + vocabulary revision

Do Task:
Pick one Cambridge test today and complete the full cycle with self-scoring notes.`
      }
    ]
  }
];
