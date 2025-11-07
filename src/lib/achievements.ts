import { 
  Trophy, 
  Calendar, 
  Clock, 
  Target, 
  BookOpen, 
  GraduationCap, 
  Award, 
  Star, 
  Flame, 
  Zap, 
  Crown, 
  Gem, 
  Rocket, 
  Coffee, 
  Moon, 
  Sun,
  Sparkles,
  Brain,
  CheckCircle,
  TrendingUp,
  Gamepad2,
  Library,
  LucideIcon,
  Heart,
  Shield,
  Lightbulb,
  Puzzle,
  Compass,
  Calculator,
  Microscope,
  Atom,
  Mountain,
  Waves,
  Leaf,
  Users,
  ThumbsUp,
  Gift,
  Bell,
  Activity,
  BarChart,
  Infinity,
  Layers,
  Key,
  Lock,
  Unlock,
  Timer,
  Hourglass,
  Gauge,
  Signal,
  Navigation,
  Map,
  Flag,
  Hammer,
  Wrench,
  Megaphone,
  Radio,
  Volume2,
  Music,
  Film,
  Camera,
  Globe,
  Building,
  School,
  Smile,
  PartyPopper,
  FileText,
  Download,
  Upload,
  Share,
  Mail,
  MessageCircle,
  Settings,
  Search,
  Eye,
  Sparkles as SparklesIcon,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  Play,
  Pause,
  RefreshCw,
  Plus,
  Minus,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Star as StarIcon,
  Medal,
  Badge as BadgeIcon,
  Ribbon
} from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: 'login' | 'time' | 'score' | 'subject' | 'streak' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirement: {
    type: 'daily_login' | 'total_time' | 'single_score' | 'avg_score' | 'subject_count' | 'streak' | 'perfect_score';
    value: number;
    subject?: string;
  };
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  // DAILY LOGIN ACHIEVEMENTS (1-20)
  {
    id: 'first_login',
    title: 'Getting Started',
    description: 'Logged in for the first time.',
    icon: Coffee,
    category: 'login',
    rarity: 'common',
    points: 10,
    requirement: { type: 'daily_login', value: 1 }
  },
  {
    id: 'three_day_login',
    title: 'Three Day Starter',
    description: 'Logged in 3 days in a row.',
    icon: Calendar,
    category: 'login',
    rarity: 'common',
    points: 25,
    requirement: { type: 'daily_login', value: 3 }
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Logged in 7 days in a row.',
    icon: Flame,
    category: 'login',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'daily_login', value: 7 }
  },
  {
    id: 'ten_day_dedication',
    title: 'Ten Day Dedication',
    description: 'Logged in 10 days consecutively.',
    icon: Heart,
    category: 'login',
    rarity: 'rare',
    points: 60,
    requirement: { type: 'daily_login', value: 10 }
  },
  {
    id: 'two_week_champion',
    title: 'Two Week Champion',
    description: 'Logged in 15 days in a row.',
    icon: Flame,
    category: 'login',
    rarity: 'rare',
    points: 75,
    requirement: { type: 'daily_login', value: 15 }
  },
  {
    id: 'month_master',
    title: 'Monthly Master',
    description: 'Logged in 20 days in a row.',
    icon: Flame,
    category: 'login',
    rarity: 'epic',
    points: 100,
    requirement: { type: 'daily_login', value: 20 }
  },
  {
    id: 'dedicated_learner',
    title: 'Dedicated Learner',
    description: 'Logged in 30 days in a row.',
    icon: Crown,
    category: 'login',
    rarity: 'legendary',
    points: 200,
    requirement: { type: 'daily_login', value: 30 }
  },
  {
    id: 'sixty_day_legend',
    title: 'Sixty Day Legend',
    description: 'Logged in 60 days consecutively.',
    icon: Crown,
    category: 'login',
    rarity: 'legendary',
    points: 500,
    requirement: { type: 'daily_login', value: 60 }
  },
  {
    id: 'hundred_day_hero',
    title: 'Century Hero',
    description: '100 days of consistent logins.',
    icon: Gem,
    category: 'login',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'daily_login', value: 100 }
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Logged in on both weekend days.',
    icon: Calendar,
    category: 'login',
    rarity: 'common',
    points: 20,
    requirement: { type: 'daily_login', value: 2 }
  },
  {
    id: 'monday_motivation',
    title: 'Monday Motivation',
    description: 'Logged in every Monday for a month.',
    icon: Rocket,
    category: 'login',
    rarity: 'epic',
    points: 150,
    requirement: { type: 'daily_login', value: 4 }
  },
  {
    id: 'friday_finisher',
    title: 'Friday Finisher',
    description: 'Logged in every Friday for a month.',
    icon: PartyPopper,
    category: 'login',
    rarity: 'epic',
    points: 150,
    requirement: { type: 'daily_login', value: 4 }
  },
  {
    id: 'holiday_hardworker',
    title: 'Holiday Hardworker',
    description: 'Logged in on holidays too.',
    icon: Gift,
    category: 'login',
    rarity: 'rare',
    points: 100,
    requirement: { type: 'daily_login', value: 5 }
  },
  {
    id: 'vacation_visionary',
    title: 'Vacation Visionary',
    description: 'Studied even during vacation.',
    icon: Compass,
    category: 'login',
    rarity: 'epic',
    points: 200,
    requirement: { type: 'daily_login', value: 7 }
  },
  {
    id: 'login_legend',
    title: 'Login Legend',
    description: '365 days of logging in.',
    icon: Infinity,
    category: 'login',
    rarity: 'legendary',
    points: 2600,
    requirement: { type: 'daily_login', value: 365 }
  },

  // TIME SPENT ACHIEVEMENTS (21-40)
  {
    id: 'hour_of_study',
    title: 'First Hour',
    description: 'Studied for 1 hour total.',
    icon: Clock,
    category: 'time',
    rarity: 'common',
    points: 20,
    requirement: { type: 'total_time', value: 60 }
  },
  {
    id: 'two_hours',
    title: 'Double Time',
    description: 'Studied for 2 hours total.',
    icon: Clock,
    category: 'time',
    rarity: 'common',
    points: 35,
    requirement: { type: 'total_time', value: 120 }
  },
  {
    id: 'five_hours',
    title: 'Dedicated Student',
    description: 'Studied for 5 hours total.',
    icon: Clock,
    category: 'time',
    rarity: 'rare',
    points: 75,
    requirement: { type: 'total_time', value: 300 }
  },
  {
    id: 'ten_hours',
    title: 'Serious Learner',
    description: 'Studied for 10 hours total.',
    icon: Clock,
    category: 'time',
    rarity: 'rare',
    points: 150,
    requirement: { type: 'total_time', value: 600 }
  },
  {
    id: 'fifteen_hours',
    title: 'Fifteen Hour Fighter',
    description: '15 hours of dedicated study time.',
    icon: Timer,
    category: 'time',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'total_time', value: 900 }
  },
  {
    id: 'twenty_five_hours',
    title: 'Scholar',
    description: 'Studied for 25 hours total.',
    icon: GraduationCap,
    category: 'time',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'total_time', value: 1500 }
  },
  {
    id: 'fifty_hours',
    title: 'Master Student',
    description: 'Studied for 50 hours total.',
    icon: Crown,
    category: 'time',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'total_time', value: 3000 }
  },
  {
    id: 'seventy_five_hours',
    title: 'Seventy-Five Hour Hero',
    description: '75 hours of studying completed.',
    icon: Award,
    category: 'time',
    rarity: 'epic',
    points: 750,
    requirement: { type: 'total_time', value: 4500 }
  },
  {
    id: 'hundred_hours',
    title: 'Academic Legend',
    description: 'Studied for 100 hours total.',
    icon: Crown,
    category: 'time',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'total_time', value: 6000 }
  },
  {
    id: 'two_hundred_hours',
    title: 'Two Hundred Hour Titan',
    description: '200 hours of study time achieved.',
    icon: Gem,
    category: 'time',
    rarity: 'legendary',
    points: 2000,
    requirement: { type: 'total_time', value: 12000 }
  },
  {
    id: 'five_hundred_hours',
    title: 'Five Hundred Hour Phoenix',
    description: '500 hours of dedicated learning.',
    icon: Infinity,
    category: 'time',
    rarity: 'legendary',
    points: 5000,
    requirement: { type: 'total_time', value: 30000 }
  },
  {
    id: 'thousand_hours',
    title: 'Thousand Hour Master',
    description: '1000 hours of studying completed.',
    icon: Crown,
    category: 'time',
    rarity: 'legendary',
    points: 10180,
    requirement: { type: 'total_time', value: 60000 }
  },
  {
    id: 'marathon_session',
    title: 'Marathon Session',
    description: 'Studied for 4 hours in one session.',
    icon: Activity,
    category: 'time',
    rarity: 'epic',
    points: 250,
    requirement: { type: 'total_time', value: 240 }
  },
  {
    id: 'speed_learner',
    title: 'Speed Learner',
    description: 'Studied efficiently for 30 minutes daily.',
    icon: Zap,
    category: 'time',
    rarity: 'common',
    points: 40,
    requirement: { type: 'total_time', value: 30 }
  },
  {
    id: 'deep_diver',
    title: 'Deep Diver',
    description: 'Focused study sessions totaling 50 hours.',
    icon: Waves,
    category: 'time',
    rarity: 'epic',
    points: 600,
    requirement: { type: 'total_time', value: 3000 }
  },
  {
    id: 'hourglass_master',
    title: 'Hourglass Master',
    description: 'Perfectly timed study sessions.',
    icon: Hourglass,
    category: 'time',
    rarity: 'epic',
    points: 350,
    requirement: { type: 'total_time', value: 2000 }
  },
  {
    id: 'consistent_clock',
    title: 'Consistent Clock',
    description: 'Studied at least 1 hour daily for 30 days.',
    icon: Timer,
    category: 'time',
    rarity: 'legendary',
    points: 800,
    requirement: { type: 'total_time', value: 1800 }
  },
  {
    id: 'weekend_warrior_time',
    title: 'Weekend Study Warrior',
    description: 'Studied 10 hours on weekends.',
    icon: Calendar,
    category: 'time',
    rarity: 'rare',
    points: 120,
    requirement: { type: 'total_time', value: 600 }
  },
  {
    id: 'night_shift_learner',
    title: 'Night Shift Learner',
    description: 'Studied 20 hours during night hours.',
    icon: Moon,
    category: 'time',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'total_time', value: 1200 }
  },

  // SCORE ACHIEVEMENTS (41-60)
  {
    id: 'first_perfect',
    title: 'Perfect Score',
    description: 'Got 100% on a quiz.',
    icon: Star,
    category: 'score',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'perfect_score', value: 1 }
  },
  {
    id: 'two_perfect',
    title: 'Double Perfect',
    description: 'Got 100% on 2 quizzes.',
    icon: Star,
    category: 'score',
    rarity: 'rare',
    points: 100,
    requirement: { type: 'perfect_score', value: 2 }
  },
  {
    id: 'five_perfect',
    title: 'Perfectionist',
    description: 'Got 100% on 5 quizzes.',
    icon: Star,
    category: 'score',
    rarity: 'epic',
    points: 200,
    requirement: { type: 'perfect_score', value: 5 }
  },
  {
    id: 'ten_perfect',
    title: 'Flawless',
    description: 'Got 100% on 10 quizzes.',
    icon: Gem,
    category: 'score',
    rarity: 'legendary',
    points: 500,
    requirement: { type: 'perfect_score', value: 10 }
  },
  {
    id: 'twenty_perfect',
    title: 'Perfect Master',
    description: '20 perfect scores achieved.',
    icon: Crown,
    category: 'score',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'perfect_score', value: 20 }
  },
  {
    id: 'fifty_perfect',
    title: 'Perfect Legend',
    description: '50 flawless quiz performances.',
    icon: Gem,
    category: 'score',
    rarity: 'legendary',
    points: 2500,
    requirement: { type: 'perfect_score', value: 50 }
  },
  {
    id: 'score_eighty',
    title: 'Excellent Work',
    description: 'Achieved 80% or higher on a quiz.',
    icon: Target,
    category: 'score',
    rarity: 'common',
    points: 25,
    requirement: { type: 'single_score', value: 80 }
  },
  {
    id: 'score_ninety',
    title: 'Outstanding',
    description: 'Achieved 90% or higher on a quiz.',
    icon: Award,
    category: 'score',
    rarity: 'rare',
    points: 75,
    requirement: { type: 'single_score', value: 90 }
  },
  {
    id: 'score_ninety_five',
    title: 'Near Perfect',
    description: 'Achieved 95% or higher on a quiz.',
    icon: Medal,
    category: 'score',
    rarity: 'epic',
    points: 150,
    requirement: { type: 'single_score', value: 95 }
  },
  {
    id: 'avg_eighty',
    title: 'Consistent Excellence',
    description: 'Average score of 80% or higher.',
    icon: TrendingUp,
    category: 'score',
    rarity: 'epic',
    points: 250,
    requirement: { type: 'avg_score', value: 80 }
  },
  {
    id: 'avg_ninety',
    title: 'Academic Excellence',
    description: 'Average score of 90% or higher.',
    icon: Trophy,
    category: 'score',
    rarity: 'legendary',
    points: 750,
    requirement: { type: 'avg_score', value: 90 }
  },
  {
    id: 'improvement_master',
    title: 'Improvement Master',
    description: 'Improved from below 50% to above 80%.',
    icon: TrendingUp,
    category: 'score',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'avg_score', value: 80 }
  },
  {
    id: 'steady_riser',
    title: 'Steady Riser',
    description: 'Consistent improvement over time.',
    icon: ArrowUp,
    category: 'score',
    rarity: 'rare',
    points: 125,
    requirement: { type: 'avg_score', value: 70 }
  },
  {
    id: 'no_mistakes',
    title: 'No Mistakes Zone',
    description: 'Perfect score on a difficult quiz.',
    icon: Shield,
    category: 'score',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'perfect_score', value: 3 }
  },
  {
    id: 'first_hundred',
    title: 'Century Club',
    description: 'Scored 100% for the first time.',
    icon: Star,
    category: 'score',
    rarity: 'rare',
    points: 75,
    requirement: { type: 'perfect_score', value: 1 }
  },
  {
    id: 'high_achiever',
    title: 'High Achiever',
    description: 'Scored above 85% on 10 quizzes.',
    icon: Award,
    category: 'score',
    rarity: 'epic',
    points: 350,
    requirement: { type: 'single_score', value: 85 }
  },
  {
    id: 'score_consistency',
    title: 'Score Consistency',
    description: 'Maintained 80%+ across all quizzes.',
    icon: Gauge,
    category: 'score',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'avg_score', value: 80 }
  },
  {
    id: 'perfect_streak',
    title: 'Perfect Streak',
    description: 'Got 100% on 3 quizzes in a row.',
    icon: Flame,
    category: 'score',
    rarity: 'legendary',
    points: 600,
    requirement: { type: 'perfect_score', value: 3 }
  },
  {
    id: 'master_of_all',
    title: 'Master of All',
    description: 'Scored 90%+ in all subjects attempted.',
    icon: Trophy,
    category: 'score',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'avg_score', value: 90 }
  },
  {
    id: 'zero_to_hero',
    title: 'Zero to Hero',
    description: 'Improved from failing to excellent.',
    icon: Rocket,
    category: 'score',
    rarity: 'legendary',
    points: 800,
    requirement: { type: 'avg_score', value: 85 }
  },

  // SUBJECT ACHIEVEMENTS (61-80)
  {
    id: 'three_subjects',
    title: 'Multi-Talented',
    description: 'Active in 3 different subjects.',
    icon: BookOpen,
    category: 'subject',
    rarity: 'common',
    points: 50,
    requirement: { type: 'subject_count', value: 3 }
  },
  {
    id: 'five_subjects',
    title: 'Well-Rounded',
    description: 'Active in 5 different subjects.',
    icon: Sparkles,
    category: 'subject',
    rarity: 'rare',
    points: 150,
    requirement: { type: 'subject_count', value: 5 }
  },
  {
    id: 'seven_subjects',
    title: 'Jack of All Trades',
    description: 'Active in 7 different subjects.',
    icon: Brain,
    category: 'subject',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'subject_count', value: 7 }
  },
  {
    id: 'ten_subjects',
    title: 'Subject Explorer',
    description: 'Active in 10 different subjects.',
    icon: Compass,
    category: 'subject',
    rarity: 'legendary',
    points: 750,
    requirement: { type: 'subject_count', value: 10 }
  },
  {
    id: 'subject_master_math',
    title: 'Math Master',
    description: 'Achieved 90%+ in Mathematics.',
    icon: Calculator,
    category: 'subject',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'avg_score', value: 90, subject: 'Mathematics' }
  },
  {
    id: 'subject_master_science',
    title: 'Science Expert',
    description: 'Achieved 90%+ in Physical Sciences or Life Sciences.',
    icon: Atom,
    category: 'subject',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'avg_score', value: 90 }
  },
  {
    id: 'biology_brilliant',
    title: 'Biology Brilliant',
    description: 'Mastered Life Sciences with 90%+.',
    icon: Microscope,
    category: 'subject',
    rarity: 'epic',
    points: 350,
    requirement: { type: 'avg_score', value: 90, subject: 'Life Sciences' }
  },
  {
    id: 'physics_phoenix',
    title: 'Physics Phoenix',
    description: 'Excelled in Physical Sciences.',
    icon: Atom,
    category: 'subject',
    rarity: 'epic',
    points: 350,
    requirement: { type: 'avg_score', value: 90, subject: 'Physical Sciences' }
  },
  {
    id: 'language_lord',
    title: 'Language Lord',
    description: 'Achieved 90%+ in English or Afrikaans.',
    icon: BookOpen,
    category: 'subject',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'avg_score', value: 90 }
  },
  {
    id: 'history_hero',
    title: 'History Hero',
    description: 'Mastered History with excellent scores.',
    icon: Flag,
    category: 'subject',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'avg_score', value: 90, subject: 'History' }
  },
  {
    id: 'geography_guru',
    title: 'Geography Guru',
    description: 'Became an expert in Geography.',
    icon: Globe,
    category: 'subject',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'avg_score', value: 90, subject: 'Geography' }
  },
  {
    id: 'accounting_ace',
    title: 'Accounting Ace',
    description: 'Mastered Accounting principles.',
    icon: Calculator,
    category: 'subject',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'avg_score', value: 90, subject: 'Accounting' }
  },
  {
    id: 'triple_threat',
    title: 'Triple Threat',
    description: 'Achieved 90%+ in 3 different subjects.',
    icon: Layers,
    category: 'subject',
    rarity: 'legendary',
    points: 900,
    requirement: { type: 'subject_count', value: 3 }
  },
  {
    id: 'subject_specialist',
    title: 'Subject Specialist',
    description: 'Mastered one subject completely.',
    icon: Award,
    category: 'subject',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'avg_score', value: 95 }
  },
  {
    id: 'balanced_learner',
    title: 'Balanced Learner',
    description: 'Active in both languages and sciences.',
    icon: Gauge,
    category: 'subject',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'subject_count', value: 4 }
  },
  {
    id: 'arts_master',
    title: 'Arts Master',
    description: 'Excelled in Creative Arts subjects.',
    icon: Music,
    category: 'subject',
    rarity: 'epic',
    points: 350,
    requirement: { type: 'avg_score', value: 90 }
  },
  {
    id: 'stem_scholar',
    title: 'STEM Scholar',
    description: 'Mastered Science, Technology, Engineering, Math.',
    icon: Rocket,
    category: 'subject',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'subject_count', value: 4 }
  },
  {
    id: 'humanities_hunter',
    title: 'Humanities Hunter',
    description: 'Excelled in History, Geography, Languages.',
    icon: Globe,
    category: 'subject',
    rarity: 'epic',
    points: 450,
    requirement: { type: 'subject_count', value: 3 }
  },
  {
    id: 'commerce_captain',
    title: 'Commerce Captain',
    description: 'Mastered Business Studies, Economics, Accounting.',
    icon: Building,
    category: 'subject',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'subject_count', value: 3 }
  },
  {
    id: 'all_subjects_king',
    title: 'All Subjects King',
    description: 'Active in 12+ different subjects.',
    icon: Crown,
    category: 'subject',
    rarity: 'legendary',
    points: 1500,
    requirement: { type: 'subject_count', value: 12 }
  },

  // STREAK ACHIEVEMENTS (81-90)
  {
    id: 'three_day_streak',
    title: 'Building Momentum',
    description: 'Studied 3 days in a row.',
    icon: Zap,
    category: 'streak',
    rarity: 'common',
    points: 30,
    requirement: { type: 'streak', value: 3 }
  },
  {
    id: 'five_day_streak',
    title: 'Five Day Force',
    description: 'Studied 5 days consecutively.',
    icon: Flame,
    category: 'streak',
    rarity: 'rare',
    points: 75,
    requirement: { type: 'streak', value: 5 }
  },
  {
    id: 'week_streak',
    title: 'Unstoppable',
    description: 'Studied 7 days in a row.',
    icon: Rocket,
    category: 'streak',
    rarity: 'rare',
    points: 100,
    requirement: { type: 'streak', value: 7 }
  },
  {
    id: 'ten_day_streak',
    title: 'Ten Day Titan',
    description: '10 days of continuous study.',
    icon: Flame,
    category: 'streak',
    rarity: 'epic',
    points: 200,
    requirement: { type: 'streak', value: 10 }
  },
  {
    id: 'two_week_streak',
    title: 'Two Week Thunder',
    description: 'Studied 14 days straight.',
    icon: Zap,
    category: 'streak',
    rarity: 'epic',
    points: 350,
    requirement: { type: 'streak', value: 14 }
  },
  {
    id: 'month_streak',
    title: 'On Fire',
    description: 'Studied 30 days in a row.',
    icon: Flame,
    category: 'streak',
    rarity: 'legendary',
    points: 600,
    requirement: { type: 'streak', value: 30 }
  },
  {
    id: 'two_month_streak',
    title: 'Two Month Marvel',
    description: '60 days of unbroken study streak.',
    icon: Crown,
    category: 'streak',
    rarity: 'legendary',
    points: 1200,
    requirement: { type: 'streak', value: 60 }
  },
  {
    id: 'three_month_streak',
    title: 'Quarter Champion',
    description: '90 days of continuous studying.',
    icon: Gem,
    category: 'streak',
    rarity: 'legendary',
    points: 2000,
    requirement: { type: 'streak', value: 90 }
  },
  {
    id: 'six_month_streak',
    title: 'Half Year Hero',
    description: '180 days of studying every day.',
    icon: Infinity,
    category: 'streak',
    rarity: 'legendary',
    points: 3500,
    requirement: { type: 'streak', value: 180 }
  },
  {
    id: 'year_streak',
    title: 'Year of Excellence',
    description: '365 days of non-stop studying.',
    icon: Crown,
    category: 'streak',
    rarity: 'legendary',
    points: 5100,
    requirement: { type: 'streak', value: 365 }
  },

  // SPECIAL ACHIEVEMENTS (91-100)
  {
    id: 'first_lesson',
    title: 'First Steps',
    description: 'Completed your first lesson.',
    icon: BookOpen,
    category: 'special',
    rarity: 'common',
    points: 20,
    requirement: { type: 'daily_login', value: 1 }
  },
  {
    id: 'library_legend',
    title: 'Library Legend',
    description: 'Completed 50 lessons.',
    icon: Library,
    category: 'special',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'total_time', value: 1 }
  },
  {
    id: 'puzzle_solver',
    title: 'Puzzle Solver',
    description: 'Solved complex problems across subjects.',
    icon: Puzzle,
    category: 'special',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'perfect_score', value: 5 }
  },
  {
    id: 'lightbulb_moment',
    title: 'Lightbulb Moment',
    description: 'Had breakthrough insights in learning.',
    icon: Lightbulb,
    category: 'special',
    rarity: 'rare',
    points: 150,
    requirement: { type: 'avg_score', value: 85 }
  },
  {
    id: 'team_player',
    title: 'Team Player',
    description: 'Collaborated and learned with others.',
    icon: Users,
    category: 'special',
    rarity: 'rare',
    points: 100,
    requirement: { type: 'subject_count', value: 3 }
  },
  {
    id: 'rising_star',
    title: 'Rising Star',
    description: 'Showed exceptional improvement.',
    icon: Star,
    category: 'special',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'avg_score', value: 85 }
  },
  {
    id: 'gift_of_knowledge',
    title: 'Gift of Knowledge',
    description: 'Shared learning with others.',
    icon: Gift,
    category: 'special',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'subject_count', value: 5 }
  },
  {
    id: 'heart_of_learning',
    title: 'Heart of Learning',
    description: 'Passionate about education.',
    icon: Heart,
    category: 'special',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'total_time', value: 600 }
  },
  {
    id: 'shield_of_perseverance',
    title: 'Shield of Perseverance',
    description: 'Never gave up despite challenges.',
    icon: Shield,
    category: 'special',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'streak', value: 30 }
  },
  {
    id: 'ultimate_achiever',
    title: 'Ultimate Achiever',
    description: 'Unlocked 50 achievements total.',
    icon: Crown,
    category: 'special',
    rarity: 'legendary',
    points: 2000,
    requirement: { type: 'daily_login', value: 30 }
  },

  // ADDITIONAL LOGIN ACHIEVEMENTS (101-115)
  {
    id: 'quarter_century_login',
    title: 'Quarter Century',
    description: 'Logged in 25 days in a row.',
    icon: Flame,
    category: 'login',
    rarity: 'epic',
    points: 125,
    requirement: { type: 'daily_login', value: 25 }
  },
  {
    id: 'forty_five_days',
    title: '45 Day Dedication',
    description: 'Logged in 45 days consecutively.',
    icon: Crown,
    category: 'login',
    rarity: 'legendary',
    points: 350,
    requirement: { type: 'daily_login', value: 45 }
  },
  {
    id: 'seventy_five_days',
    title: '75 Day Streak',
    description: '75 days of consistent logins.',
    icon: Gem,
    category: 'login',
    rarity: 'legendary',
    points: 750,
    requirement: { type: 'daily_login', value: 75 }
  },
  {
    id: 'hundred_fifty_days',
    title: '150 Day Milestone',
    description: '150 days of logging in.',
    icon: Trophy,
    category: 'login',
    rarity: 'legendary',
    points: 1500,
    requirement: { type: 'daily_login', value: 150 }
  },
  {
    id: 'two_hundred_days',
    title: '200 Day Champion',
    description: '200 days of dedication.',
    icon: Crown,
    category: 'login',
    rarity: 'legendary',
    points: 2000,
    requirement: { type: 'daily_login', value: 200 }
  },
  {
    id: 'weekend_consistent',
    title: 'Weekend Warrior',
    description: 'Logged in every weekend for a month.',
    icon: Calendar,
    category: 'login',
    rarity: 'rare',
    points: 80,
    requirement: { type: 'daily_login', value: 8 }
  },
  {
    id: 'weekday_warrior',
    title: 'Weekday Warrior',
    description: 'Logged in every weekday for a month.',
    icon: Calendar,
    category: 'login',
    rarity: 'rare',
    points: 80,
    requirement: { type: 'daily_login', value: 20 }
  },
  {
    id: 'holiday_hero',
    title: 'Holiday Hero',
    description: 'Logged in on special holidays.',
    icon: Gift,
    category: 'login',
    rarity: 'epic',
    points: 200,
    requirement: { type: 'daily_login', value: 5 }
  },
  {
    id: 'triple_digit_login',
    title: 'Triple Digit Login',
    description: '100+ days of logging in.',
    icon: Infinity,
    category: 'login',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'daily_login', value: 100 }
  },

  // ADDITIONAL TIME ACHIEVEMENTS (116-130)
  {
    id: 'thirty_minutes',
    title: 'Half Hour Hero',
    description: 'Studied for 30 minutes total.',
    icon: Clock,
    category: 'time',
    rarity: 'common',
    points: 15,
    requirement: { type: 'total_time', value: 30 }
  },
  {
    id: 'three_hours',
    title: 'Three Hour Learner',
    description: '3 hours of study time.',
    icon: Clock,
    category: 'time',
    rarity: 'common',
    points: 50,
    requirement: { type: 'total_time', value: 180 }
  },
  {
    id: 'seven_hours',
    title: 'Seven Hour Student',
    description: '7 hours of dedicated studying.',
    icon: Clock,
    category: 'time',
    rarity: 'rare',
    points: 100,
    requirement: { type: 'total_time', value: 420 }
  },
  {
    id: 'twelve_hours',
    title: 'Twelve Hour Scholar',
    description: '12 hours of learning completed.',
    icon: Clock,
    category: 'time',
    rarity: 'rare',
    points: 125,
    requirement: { type: 'total_time', value: 720 }
  },
  {
    id: 'eighteen_hours',
    title: '18 Hour Achiever',
    description: '18 hours of study time.',
    icon: Timer,
    category: 'time',
    rarity: 'rare',
    points: 175,
    requirement: { type: 'total_time', value: 1080 }
  },
  {
    id: 'thirty_hours',
    title: '30 Hour Master',
    description: '30 hours of studying achieved.',
    icon: GraduationCap,
    category: 'time',
    rarity: 'epic',
    points: 350,
    requirement: { type: 'total_time', value: 1800 }
  },
  {
    id: 'seventy_hours',
    title: '70 Hour Learner',
    description: '70 hours of dedicated study.',
    icon: Crown,
    category: 'time',
    rarity: 'epic',
    points: 700,
    requirement: { type: 'total_time', value: 4200 }
  },
  {
    id: 'ninety_hours',
    title: '90 Hour Expert',
    description: '90 hours of learning completed.',
    icon: Award,
    category: 'time',
    rarity: 'epic',
    points: 900,
    requirement: { type: 'total_time', value: 5400 }
  },
  {
    id: 'one_hundred_fifty_hours',
    title: '150 Hour Specialist',
    description: '150 hours of study time.',
    icon: Gem,
    category: 'time',
    rarity: 'legendary',
    points: 1500,
    requirement: { type: 'total_time', value: 9000 }
  },
  {
    id: 'two_hundred_fifty_hours',
    title: '250 Hour Legend',
    description: '250 hours of dedicated learning.',
    icon: Crown,
    category: 'time',
    rarity: 'legendary',
    points: 2500,
    requirement: { type: 'total_time', value: 15000 }
  },
  {
    id: 'daily_hour_commitment',
    title: 'Daily Hour Commitment',
    description: 'Studied 1 hour daily for 7 days.',
    icon: Timer,
    category: 'time',
    rarity: 'epic',
    points: 200,
    requirement: { type: 'total_time', value: 420 }
  },
  {
    id: 'intensive_study',
    title: 'Intensive Study',
    description: 'Studied 6+ hours in one day.',
    icon: Activity,
    category: 'time',
    rarity: 'legendary',
    points: 500,
    requirement: { type: 'total_time', value: 360 }
  },
  {
    id: 'consistent_learner_time',
    title: 'Consistent Learner',
    description: 'Studied at least 30 min daily for 30 days.',
    icon: Clock,
    category: 'time',
    rarity: 'legendary',
    points: 600,
    requirement: { type: 'total_time', value: 900 }
  },

  // ADDITIONAL SCORE ACHIEVEMENTS (131-145)
  {
    id: 'fifteen_perfect',
    title: '15 Perfect Scores',
    description: 'Got 100% on 15 quizzes.',
    icon: Gem,
    category: 'score',
    rarity: 'legendary',
    points: 750,
    requirement: { type: 'perfect_score', value: 15 }
  },
  {
    id: 'twenty_five_perfect',
    title: '25 Perfect Scores',
    description: 'Achieved 25 flawless quizzes.',
    icon: Crown,
    category: 'score',
    rarity: 'legendary',
    points: 1250,
    requirement: { type: 'perfect_score', value: 25 }
  },
  {
    id: 'seventy_five_perfect',
    title: '75 Perfect Master',
    description: '75 perfect score achievements.',
    icon: Gem,
    category: 'score',
    rarity: 'legendary',
    points: 3750,
    requirement: { type: 'perfect_score', value: 75 }
  },
  {
    id: 'score_seventy',
    title: 'Good Score',
    description: 'Achieved 70% or higher on a quiz.',
    icon: Target,
    category: 'score',
    rarity: 'common',
    points: 15,
    requirement: { type: 'single_score', value: 70 }
  },
  {
    id: 'score_eighty_five_new',
    title: 'Great Score',
    description: 'Scored 85% or higher on a quiz.',
    icon: Award,
    category: 'score',
    rarity: 'rare',
    points: 50,
    requirement: { type: 'single_score', value: 85 }
  },
  {
    id: 'score_ninety_five_new',
    title: 'Near Perfect',
    description: 'Scored 95% or higher on a quiz.',
    icon: Medal,
    category: 'score',
    rarity: 'epic',
    points: 150,
    requirement: { type: 'single_score', value: 95 }
  },
  {
    id: 'avg_seventy',
    title: 'Above Average',
    description: 'Average score of 70% or higher.',
    icon: TrendingUp,
    category: 'score',
    rarity: 'rare',
    points: 150,
    requirement: { type: 'avg_score', value: 70 }
  },
  {
    id: 'avg_ninety_five',
    title: 'Near Perfect Average',
    description: 'Average score of 95% or higher.',
    icon: Trophy,
    category: 'score',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'avg_score', value: 95 }
  },
  {
    id: 'hundred_perfect_streak',
    title: 'Perfect Streak Champion',
    description: 'Got 100% on 5 quizzes in a row.',
    icon: Flame,
    category: 'score',
    rarity: 'legendary',
    points: 800,
    requirement: { type: 'perfect_score', value: 5 }
  },
  {
    id: 'improvement_champion',
    title: 'Improvement Champion',
    description: 'Improved your average by 30%.',
    icon: ArrowUp,
    category: 'score',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'avg_score', value: 75 }
  },
  {
    id: 'no_failures',
    title: 'No Failures',
    description: 'Never scored below 50% on any quiz.',
    icon: Shield,
    category: 'score',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'avg_score', value: 50 }
  },
  {
    id: 'consistent_high',
    title: 'Consistent High',
    description: 'Scored 80%+ on 20 quizzes.',
    icon: TrendingUp,
    category: 'score',
    rarity: 'epic',
    points: 600,
    requirement: { type: 'single_score', value: 80 }
  },
  {
    id: 'quiz_master',
    title: 'Quiz Master',
    description: 'Completed 100 quizzes.',
    icon: Award,
    category: 'score',
    rarity: 'legendary',
    points: 750,
    requirement: { type: 'avg_score', value: 70 }
  },
  {
    id: 'rising_performer',
    title: 'Rising Performer',
    description: 'Consistently improving scores.',
    icon: ArrowUp,
    category: 'score',
    rarity: 'rare',
    points: 100,
    requirement: { type: 'avg_score', value: 65 }
  },
  {
    id: 'excellence_master',
    title: 'Excellence Master',
    description: 'Maintained 90%+ for 10 quizzes.',
    icon: Trophy,
    category: 'score',
    rarity: 'legendary',
    points: 900,
    requirement: { type: 'avg_score', value: 90 }
  },

  // ADDITIONAL SUBJECT ACHIEVEMENTS (146-155)
  {
    id: 'eight_subjects',
    title: '8 Subject Explorer',
    description: 'Active in 8 different subjects.',
    icon: Compass,
    category: 'subject',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'subject_count', value: 8 }
  },
  {
    id: 'nine_subjects',
    title: '9 Subject Master',
    description: 'Active in 9 different subjects.',
    icon: Brain,
    category: 'subject',
    rarity: 'epic',
    points: 600,
    requirement: { type: 'subject_count', value: 9 }
  },
  {
    id: 'eleven_subjects',
    title: '11 Subject Expert',
    description: 'Active in 11 different subjects.',
    icon: Sparkles,
    category: 'subject',
    rarity: 'legendary',
    points: 1100,
    requirement: { type: 'subject_count', value: 11 }
  },
  {
    id: 'mathematics_legend',
    title: 'Mathematics Legend',
    description: 'Perfect scores in Mathematics.',
    icon: Calculator,
    category: 'subject',
    rarity: 'legendary',
    points: 500,
    requirement: { type: 'avg_score', value: 95, subject: 'Mathematics' }
  },
  {
    id: 'physics_pro',
    title: 'Physics Pro',
    description: 'Mastered Physical Sciences.',
    icon: Atom,
    category: 'subject',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'avg_score', value: 90, subject: 'Physical Sciences' }
  },
  {
    id: 'biology_brilliant_new',
    title: 'Biology Brilliant',
    description: 'Excelled in Life Sciences.',
    icon: Microscope,
    category: 'subject',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'avg_score', value: 90, subject: 'Life Sciences' }
  },
  {
    id: 'english_elite',
    title: 'English Elite',
    description: 'Achieved 95%+ in English.',
    icon: BookOpen,
    category: 'subject',
    rarity: 'legendary',
    points: 500,
    requirement: { type: 'avg_score', value: 95 }
  },
  {
    id: 'afrikaans_ace',
    title: 'Afrikaans Ace',
    description: 'Mastered Afrikaans language.',
    icon: BookOpen,
    category: 'subject',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'avg_score', value: 90 }
  },
  {
    id: 'geography_genius',
    title: 'Geography Genius',
    description: 'Became a Geography expert.',
    icon: Globe,
    category: 'subject',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'avg_score', value: 90, subject: 'Geography' }
  },
  {
    id: 'history_historian',
    title: 'History Historian',
    description: 'Mastered History with excellence.',
    icon: Flag,
    category: 'subject',
    rarity: 'epic',
    points: 400,
    requirement: { type: 'avg_score', value: 90, subject: 'History' }
  },

  // BONUS ACHIEVEMENTS TO REACH 100,000 POINTS (156-158)
  {
    id: 'grand_master',
    title: 'Grand Master',
    description: 'Unlocked 100+ achievements.',
    icon: Crown,
    category: 'special',
    rarity: 'legendary',
    points: 2800,
    requirement: { type: 'daily_login', value: 100 }
  },
  {
    id: 'knowledge_phoenix',
    title: 'Knowledge Phoenix',
    description: 'Achieved excellence across all categories.',
    icon: Sparkles,
    category: 'special',
    rarity: 'legendary',
    points: 2600,
    requirement: { type: 'subject_count', value: 10 }
  },
];

export const getAchievementById = (id: string): Achievement | undefined => {
  return ALL_ACHIEVEMENTS.find(a => a.id === id);
};

export const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common':
      return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
    case 'rare':
      return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    case 'epic':
      return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30';
    case 'legendary':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800';
  }
};

export const getRarityBorderColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common':
      return 'border-gray-300 dark:border-gray-700';
    case 'rare':
      return 'border-blue-300 dark:border-blue-700';
    case 'epic':
      return 'border-purple-300 dark:border-purple-700';
    case 'legendary':
      return 'border-yellow-400 dark:border-yellow-600';
    default:
      return 'border-gray-300 dark:border-gray-700';
  }
};
