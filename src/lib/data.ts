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
