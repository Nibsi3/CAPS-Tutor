import { BarChart, BookCopy, Target, Clock, AlertTriangle, CheckCircle, Award } from 'lucide-react';

export const statCardsData = [
  {
    title: 'Lessons Completed',
    value: '12 / 78',
    icon: BookCopy,
    change: '+2 this week',
  },
  {
    title: 'Avg. Score',
    value: '82%',
    icon: Target,
    change: '+3% this month',
  },
  {
    title: 'Time Spent',
    value: '7h 45m',
    icon: Clock,
    change: '+1h this week',
  },
  {
    title: 'Weakest Topic',
    value: 'Algebraic Fractions',
    icon: AlertTriangle,
    change: 'Practice now',
  },
];

export const progressChartData = [
  { date: 'Mon', 'This Week': 60, 'Last Week': 45 },
  { date: 'Tue', 'This Week': 75, 'Last Week': 50 },
  { date: 'Wed', 'This Week': 50, 'Last Week': 60 },
  { date: 'Thu', 'This Week': 80, 'Last Week': 70 },
  { date: 'Fri', 'This Week': 65, 'Last Week': 75 },
  { date: 'Sat', 'This Week': 90, 'Last Week': 85 },
  { date: 'Sun', 'This Week': 85, 'Last Week': 80 },
];

export const recentActivityData = [
  {
    id: 'act1',
    type: 'Quiz',
    description: 'Completed quiz on "Linear Equations"',
    time: '2 hours ago',
    status: 'passed',
    icon: CheckCircle,
    score: '9/10',
  },
  {
    id: 'act2',
    type: 'Lesson',
    description: 'Started lesson on "Euclidean Geometry"',
    time: '1 day ago',
    status: 'in-progress',
    icon: BookCopy,
  },
  {
    id: 'act3',
    type: 'Exam',
    description: 'Generated an adaptive exam',
    time: '2 days ago',
    status: 'generated',
    icon: Target,
  },
  {
    id: 'act4',
    type: 'Achievement',
    description: 'Unlocked "Geometry Genius" badge',
    time: '3 days ago',
    status: 'unlocked',
    icon: Award,
  },
];

export const grades = [
    { value: "1", label: "Grade 1" },
    { value: "2", label: "Grade 2" },
    { value: "3", label: "Grade 3" },
    { value: "4", label: "Grade 4" },
    { value: "5", label: "Grade 5" },
    { value: "6", label: "Grade 6" },
    { value: "7", label: "Grade 7" },
    { value: "8", label: "Grade 8" },
    { value: "9", label: "Grade 9" },
    { value: "10", label: "Grade 10" },
    { value: "11", label: "Grade 11" },
    { value: "12", label: "Grade 12" },
];

export const subjects = [
    { value: "Mathematics", label: "Mathematics" },
    { value: "Physical Sciences", label: "Physical Sciences" },
    { value: "Life Sciences", label: "Life Sciences" },
    { value: "Geography", label: "Geography" },
    { value: "History", label: "History" },
];

export const lessons = [
  {
    id: "lesson-math-8-1",
    gradeLevel: 8,
    subject: "Mathematics",
    topic: "Algebraic Expressions",
    learningObjectives: [
      "Understand variables and constants",
      "Simplify expressions by collecting like terms",
      "Apply the distributive property",
    ],
  },
  {
    id: "lesson-math-8-2",
    gradeLevel: 8,
    subject: "Mathematics",
    topic: "Exponents",
    learningObjectives: [
      "Understand the laws of exponents (multiplication, division, power of a power)",
      "Simplify expressions involving exponents",
      "Solve simple exponential equations",
    ],
  },
  {
    id: "lesson-science-10-1",
    gradeLevel: 10,
    subject: "Physical Sciences",
    topic: "Vectors and Scalars",
    learningObjectives: [
      "Define and differentiate between vectors and scalars",
      "Represent vectors graphically",
      "Calculate the resultant vector",
    ],
  },
  {
    id: "lesson-science-10-2",
    gradeLevel: 10,
    subject: "Physical Sciences",
    topic: "Chemical Bonding",
    learningObjectives: [
      "Describe ionic, covalent and metallic bonding",
      "Draw Lewis dot structures",
      "Predict the shape of molecules",
    ],
  },
  {
    id: "lesson-lifesci-11-1",
    gradeLevel: 11,
    subject: "Life Sciences",
    topic: "The Chemistry of Life",
    learningObjectives: [
      "Identify organic and inorganic compounds",
      "Understand the role of carbohydrates, lipids, and proteins",
      "Explain the importance of water for life",
    ],
  },
  {
    id: "lesson-geo-12-1",
    gradeLevel: 12,
    subject: "Geography",
    topic: "Climate and Weather",
    learningObjectives: [
      "Analyze synoptic weather maps",
      "Explain the causes and effects of cyclones",
      "Discuss urban climates and their impact",
    ],
  },
  {
    id: "lesson-hist-9-1",
    gradeLevel: 9,
    subject: "History",
    topic: "The Cold War",
    learningObjectives: [
      "Understand the origins of the Cold War",
      "Describe key events like the Berlin Wall and Cuban Missile Crisis",
      "Analyze the impact of the Cold War on different regions",
    ],
  },
];
