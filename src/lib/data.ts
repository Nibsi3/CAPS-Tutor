import { Award, BookCopy, CheckCircle, Target, Clock, AlertTriangle } from 'lucide-react';

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
    { value: "8", label: "Grade 8" },
    { value: "9", label: "Grade 9" },
    { value: "10", label: "Grade 10" },
    { value: "11", label: "Grade 11" },
    { value: "12", label: "Grade 12" },
];

// Re-structured subjects to be derived from the new curriculum data
export const subjects = [
    { value: "Mathematics", label: "Mathematics" },
    { value: "Mathematical Literacy", label: "Mathematical Literacy" },
    { value: "Physical Sciences", label: "Physical Sciences" },
    { value: "Life Sciences", label: "Life Sciences" },
    { value: "Accounting", label: "Accounting" },
    { value: "Business Studies", label: "Business Studies" },
    { value: "Economics", label: "Economics" },
    { value: "Geography", label: "Geography" },
    { value: "History", label: "History" },
    { value: "Information Technology / CAT", label: "Information Technology / CAT" },
    { value: "Tourism", label: "Tourism" },
    { value: "Consumer Studies / Hospitality", label: "Consumer Studies / Hospitality" },
    { value: "Engineering Graphics & Design / Technical Subjects", label: "Engineering Graphics & Design" },
    { value: "Creative Arts / Visual Arts / Music / Drama", label: "Creative Arts" },
];

export interface Lesson {
    id: string;
    gradeLevels: string[];
    subject: string;
    textbookLink: string;
    topics: string[];
    pastPapersLink: string;
    source: string;
}

export const lessons: Lesson[] = [
    {
        id: "math-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Mathematics",
        textbookLink: "https://www.siyavula.com/downloads/books/maths/Gr10_Mathematics_Learner_Eng_v11.pdf",
        topics: ["Numbers & patterns", "Algebra (expressions, equations, inequalities)", "Functions (polynomial, exponential, logarithmic)", "Trigonometry", "Euclidean & analytical geometry", "Calculus (differentiation & integration basics, applications - Grade 12)", "Probability & Statistics", "Finance & growth models"],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate%28NSC%29Examinations/NSCPastExaminationpapers.aspx",
        source: "Siyavula / DBE"
    },
    {
        id: "math-lit-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Mathematical Literacy",
        textbookLink: "DBE Mind the Gap study guides (see DBE Self Study Guides)",
        topics: ["Number sense in real contexts", "Financial mathematics (interest, annuities, inflation)", "Data handling & graphs", "Measurement & scale", "Maps & plans", "Consumer & business calculations", "Problem-solving in context"],
        pastPapersLink: "DBE NSC past papers (Maths Lit) via DBE & TestPapers",
        source: "DBE Mind the Gap"
    },
    {
        id: "phys-sci-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Physical Sciences",
        textbookLink: "https://www.siyavula.com/downloads/books/science/Gr10_PhysicalSciences_Learner_Eng.pdf",
        topics: ["Scientific method & lab skills", "Matter & materials", "Atomic structure", "Periodic trends", "Chemical bonding", "Stoichiometry", "Chemical reactions & equilibrium (Gr12)", "Mechanics (kinematics, dynamics, energy)", "Waves", "Electricity & magnetism", "Optics", "Thermal physics", "Chemical kinetics & electrochemistry (Gr12)"],
        pastPapersLink: "DBE NSC past papers (Physical Sciences) / TestPapers",
        source: "DBE Physical Sciences CAPS document & Siyavula"
    },
    {
        id: "life-sci-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Life Sciences",
        textbookLink: "https://www.education.gov.za/LinkClick.aspx?fileticket=gQvYxE2bl9M%3D&mid=9704&portalid=0&tabid=2720",
        topics: ["Cells & cell structure", "Cell division (mitosis, meiosis)", "DNA, genes & heredity", "Proteins & enzymes", "Physiology (plant & animal systems)", "Ecology & ecosystems", "Evolution", "Biotechnology & applications", "Human health & diseases (Gr12 depth topics)"],
        pastPapersLink: "DBE NSC past papers (Life Sciences) / TestPapers",
        source: "DBE Life Sciences CAPS PDF"
    },
    {
        id: "accounting-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Accounting",
        textbookLink: "DBE LTSM Accounting learner books (search on DBE LTSM)",
        topics: ["Accounting concepts", "Double-entry bookkeeping", "Journals & ledgers", "Financial statements (income statement, balance sheet)", "Cost accounting", "Budgets & cashflow", "VAT & tax basics", "Ratio analysis", "Project work (Grade 12)"],
        pastPapersLink: "DBE NSC past papers (Accounting) / TestPapers",
        source: "DBE LTSM Accounting listings"
    },
    {
        id: "business-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Business Studies",
        textbookLink: "https://www.education.gov.za/Curriculum/LearningandTeachingSupportMaterials%28LTSM%29/FETBusinessStudiesTextbooks.aspx",
        topics: ["Business environments & sectors", "Entrepreneurship & business planning", "Marketing", "Human resources", "Operations management", "Financial basics", "Business ethics", "Strategy", "Case studies and project work"],
        pastPapersLink: "DBE NSC past papers (Business Studies) / TestPapers / SA Papers",
        source: "DBE FET Business Studies page"
    },
    {
        id: "economics-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Economics",
        textbookLink: "DBE CAPS Economics document (download via CAPS FET page)",
        topics: ["Microeconomics (demand & supply, elasticity, market structures)", "Macroeconomics (GDP, inflation, unemployment, fiscal & monetary policy)", "International trade", "Development economics", "Economic indicators", "Data interpretation & policy analysis (Gr12 case studies)"],
        pastPapersLink: "DBE NSC past papers (Economics) / TestPapers",
        source: "DBE CAPS Economics listing"
    },
    {
        id: "geography-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Geography",
        textbookLink: "DBE Mind the Gap / CAPS Geography resources (DBE LTSM)",
        topics: ["Physical geography: geomorphology, climate, hydrology", "Human geography: population, urbanization, settlement", "Economic geography & resources", "Fieldwork & map skills", "GIS basics", "Sustainable development case studies"],
        pastPapersLink: "DBE NSC past papers (Geography) / TestPapers",
        source: "DBE Mind the Gap & LTSM"
    },
    {
        id: "history-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "History",
        textbookLink: "DBE LTSM History CAPS documents",
        topics: ["Historical skills & sources", "South African 19th & 20th century topics", "Apartheid & liberation history", "World history themes (industrialization, wars, decolonization)", "Source analysis & essay writing"],
        pastPapersLink: "DBE NSC past papers (History) / TestPapers",
        source: "DBE LTSM History listing"
    },
    {
        id: "it-cat-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Information Technology / CAT",
        textbookLink: "DBE digital CAT & IT learner books (PDFs / web versions on DBE site)",
        topics: ["Computer systems", "Software", "Databases", "Spreadsheets", "Programming fundamentals", "Networking basics", "Practical project (portfolio-based assessment)"],
        pastPapersLink: "DBE NSC past papers (CAT/IT) / TestPapers",
        source: "DBE digital content listings (CAT/IT)"
    },
    {
        id: "tourism-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Tourism",
        textbookLink: "DBE Mind the Gap & LTSM tourism resources",
        topics: ["Tourism industry overview", "Marketing & product development", "Customer service", "Sustainable tourism", "Travel & hospitality operations", "Economics of tourism", "Fieldwork & industry case studies"],
        pastPapersLink: "DBE NSC past papers (Tourism) / TestPapers",
        source: "DBE Mind the Gap / LTSM tourism resources"
    },
    {
        id: "hospitality-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Consumer Studies / Hospitality",
        textbookLink: "DBE LTSM & Mind the Gap resources",
        topics: ["Nutrition & food science", "Consumer rights", "Household management", "Clothing & textiles", "Hospitality operations", "Food safety & service", "Entrepreneurship in hospitality"],
        pastPapersLink: "DBE NSC past papers (Consumer Studies / Hospitality) / TestPapers",
        source: "DBE LTSM / Mind the Gap"
    },
    {
        id: "egd-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Engineering Graphics & Design / Technical Subjects",
        textbookLink: "DBE technical subject learner books (LTSM)",
        topics: ["Technical drawing & CAD", "Materials & properties", "Measurement & tolerances", "Design processes", "Mechanical & civil basics", "Project-based assessments and SBA"],
        pastPapersLink: "DBE NSC past papers & SBA exemplars",
        source: "DBE LTSM technical listings"
    },
    {
        id: "creative-arts-10-12",
        gradeLevels: ["10", "11", "12"],
        subject: "Creative Arts / Visual Arts / Music / Drama",
        textbookLink: "DBE LTSM creative arts resources",
        topics: ["Design elements", "Art media & techniques", "Music theory & performance", "Drama techniques", "Portfolio and practical assessment guidance"],
        pastPapersLink: "DBE NSC past papers & portfolio exemplars",
        source: "DBE LTSM creative arts listings"
    }
];

// Placeholder for Grade 8 and 9 since no data was provided
export const placeholderLessons = [
  {
    id: "lesson-math-8-1",
    gradeLevels: ["8"],
    subject: "Mathematics",
    topics: [
      "Algebraic Expressions",
      "Exponents",
      "Geometric constructions",
      "Geometry of 2D shapes"
    ],
  },
  {
    id: "lesson-math-9-1",
    gradeLevels: ["9"],
    subject: "Mathematics",
    topics: [
        "Number system & real numbers",
        "Algebraic expressions & equations",
        "Functions & relationships",
        "Geometry of straight lines & 2D shapes",
        "Trigonometry basics"
    ],
  }
];
