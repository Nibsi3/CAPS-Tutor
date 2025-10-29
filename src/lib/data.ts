import { Award, BookCopy, CheckCircle, Target, Clock, AlertTriangle } from 'lucide-react';

export const statCardsData = [
  {
    title: 'Lessons Completed',
    value: '0 / 0',
    icon: BookCopy,
    change: 'Start a lesson to see progress',
  },
  {
    title: 'Avg. Score',
    value: '0%',
    icon: Target,
    change: 'Complete a quiz to see your score',
  },
  {
    title: 'Time Spent',
    value: '0h 0m',
    icon: Clock,
    change: 'Updated as you learn',
  },
  {
    title: 'Weakest Topic',
    value: 'Not determined yet',
    icon: AlertTriangle,
    change: 'Practice to identify weak areas',
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
    { value: "Mathematical Literacy", label: "Mathematical Literacy" },
    { value: "English Home Language", label: "English Home Language" },
    { value: "English First Additional Language", label: "English First Additional Language" },
    { value: "Afrikaans Huistaal", label: "Afrikaans Huistaal" },
    { value: "Afrikaans Eerste Addisionele Taal", label: "Afrikaans Eerste Addisionele Taal" },
    { value: "Physical Sciences", label: "Physical Sciences" },
    { value: "Life Sciences", label: "Life Sciences" },
    { value: "Accounting", label: "Accounting" },
    { value: "Business Studies", label: "Business Studies" },
    { value: "Economics", label: "Economics" },
    { value: "Geography", label: "Geography" },
    { value: "History", label: "History" },
    { value: "Information Technology", label: "Information Technology" },
    { value: "Computer Applications Technology (CAT)", label: "Computer Applications Technology (CAT)" },
    { value: "Tourism", label: "Tourism" },
    { value: "Consumer Studies", label: "Consumer Studies" },
    { value: "Hospitality Studies", label: "Hospitality Studies" },
    { value: "Engineering Graphics & Design", label: "Engineering Graphics & Design" },
    { value: "Creative Arts", label: "Creative Arts" },
];

export const subjectColors: Record<string, { bg: string, text: string }> = {
    "Mathematics": {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400"
    },
    "Physical Sciences": {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400"
    },
    "Life Sciences": {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400"
    },
    "Geography": {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-600 dark:text-orange-400"
    },
    "Accounting": {
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      text: "text-indigo-600 dark:text-indigo-400"
    },
    "Business Studies": {
      bg: "bg-pink-100 dark:bg-pink-900/30",
      text: "text-pink-600 dark:text-pink-400"
    },
    "English Home Language": {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-600 dark:text-red-400"
    },
    "English First Additional Language": {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-600 dark:text-red-400"
    },
    "Afrikaans Huistaal": {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-600 dark:text-yellow-400"
    },
    "Afrikaans Eerste Addisionele Taal": {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-600 dark:text-yellow-400"
    },
};

export interface Lesson {
    id: string;
    gradeLevel: string;
    subject: string;
    textbookLink?: string;
    topics: string[];
    pastPapersLink?: string;
    source?: string;
}

const rawLessons = [
    {
        gradeLevels: ["10", "11", "12"],
        subject: "Mathematics",
        textbookLink: "https://www.siyavula.com/read/za/mathematics",
        topics: [
            // Grade 10
            "Algebraic expressions", "Exponents", "Number patterns", "Equations and inequalities", "Trigonometry", "Functions", "Euclidean geometry", "Analytical geometry", "Finance and growth", "Statistics", "Measurement", "Probability",
            // Grade 11
            "Exponents and surds", "Equations and inequalities", "Number patterns", "Analytical geometry", "Functions", "Trigonometry", "Euclidean geometry", "Finance, growth and decay", "Statistics", "Probability",
            // Grade 12
            "Sequences and series", "Functions and inverses", "Calculus (Differential)", "Financial mathematics", "Analytical geometry", "Trigonometry", "Euclidean geometry", "Statistics", "Probability (counting principles)"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "Siyavula / DBE"
    },
    {
        gradeLevels: ["10", "11", "12"],
        subject: "Physical Sciences",
        textbookLink: "https://www.siyavula.com/read/za/physical-sciences",
        topics: [
            // Grade 10 (Physics)
            "Waves and sound", "Light and optics", "Electricity and magnetism", "Mechanics (vectors, motion)",
            // Grade 10 (Chemistry)
            "Matter and materials", "The atom", "The periodic table", "Chemical bonding", "Particles substances are made of",
            // Grade 11 (Physics)
            "Newton's Laws", "Electrostatics", "Electric circuits", "Electromagnetism",
            // Grade 11 (Chemistry)
            "Stoichiometry", "Intermolecular forces", "Ideal gases", "Energy and chemical change", "Types of reaction",
            // Grade 12 (Physics)
            "Momentum and impulse", "Vertical projectile motion", "Work, energy and power", "The Doppler effect", "Electrodynamics (generators, motors)", "Photoelectric effect",
            // Grade 12 (Chemistry)
            "Rate and extent of reactions", "Chemical equilibrium", "Acids and bases", "Electrochemical reactions (galvanic, electrolytic cells)", "The chemical industry (fertilizers)"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "DBE Physical Sciences CAPS document & Siyavula"
    },
    {
        gradeLevels: ["10", "11", "12"],
        subject: "Life Sciences",
        textbookLink: "https://www.education.gov.za/LinkClick.aspx?fileticket=gQvYxE2bl9M%3D&mid=9704&portalid=0&tabid=2720",
        topics: [
            // Grade 10
            "The chemistry of life", "Cells: The basic unit of life", "Mitosis", "Plant and animal tissues", "Leaf structure", "Support and transport systems in plants and animals",
            // Grade 11
            "Biodiversity", "Micro-organisms", "Plant diversity", "Animal diversity", "Photosynthesis", "Cellular respiration", "Human impact on the environment",
            // Grade 12
            "DNA: The code of life", "Meiosis", "Genetics and inheritance", "Responding to the environment (humans & plants)", "Human reproduction", "Endocrine system", "Homeostasis", "Evolution"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "DBE Life Sciences CAPS PDF"
    },
    {
        gradeLevels: ["10", "11", "12"],
        subject: "Accounting",
        topics: [
            "Indigenous bookkeeping", "GAAP principles", "Bookkeeping of a sole trader", "Journals", "General Ledger", "Trial Balance", "Financial statements of a sole trader", "VAT concepts", "Salaries and wages journals", "Bookkeeping of a partnership", "Financial statements of a partnership", "Reconciliations", "Cost accounting (manufacturing)", "Budgeting", "Inventory systems", "Analysis and interpretation of financial statements", "Bookkeeping of a company", "Auditing"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "DBE LTSM Accounting listings"
    },
    {
        gradeLevels: ["10", "11", "12"],
        subject: "Business Studies",
        topics: [
            "Business environments", "Business sectors", "Forms of ownership", "Business opportunities", "Business location", "Contracts", "Business plan", "Management and leadership", "Human resources", "Marketing", "Production function", "Ethics and professionalism", "Corporate social responsibility", "Creative thinking", "Problem solving", "Teamwork"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "DBE FET Business Studies page"
    },
    {
        gradeLevels: ["10", "11", "12"],
        subject: "Geography",
        topics: [
            // Grade 10
            "Geographical skills and techniques", "The structure of the Earth", "Plate tectonics", "Volcanoes and earthquakes", "Folding and faulting", "Weather and climate",
            // Grade 11
            "Geomorphology", "Development geography", "Resources and sustainability", "Geographical skills and techniques",
            // Grade 12
            "Climate and weather", "Geomorphology", "Rural and urban settlements", "Economic geography of South Africa", "Geographical skills and techniques"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "DBE Mind the Gap & LTSM"
    },
    {
        gradeLevels: ["10", "11", "12"],
        subject: "English Home Language",
        topics: [
            "Poetry analysis", "Novel study (e.g., Things Fall Apart, The Great Gatsby)", "Drama analysis (e.g., Macbeth, My Children! My Africa!)", "Short story analysis", "Film study", "Language structures and conventions", "Comprehension skills", "Summary writing", "Essay writing (narrative, descriptive, argumentative)", "Transactional writing (letters, emails, reports)", "Oral presentation skills", "Visual literacy (cartoons, advertisements)"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "CAPS English Home Language"
    },
    {
        gradeLevels: ["10", "11", "12"],
        subject: "English First Additional Language",
        topics: [
            "Poetry analysis (prescribed poems)", "Novel study (prescribed books)", "Drama analysis (prescribed plays)", "Short story analysis", "Comprehension strategies", "Summary skills", "Language in context (grammar, punctuation)", "Writing descriptive and narrative essays", "Writing transactional texts (dialogue, formal letters)", "Listening and speaking skills", "Visual literacy"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "CAPS English FAL"
    },
    {
        gradeLevels: ["10", "11", "12"],
        subject: "Afrikaans Huistaal",
        topics: [
            "Poësie-ontleding (voorgeskrewe gedigte)", "Romanstudie (bv. Fiela se Kind, Die Kruppel Engel)", "Dramastudie (bv. Die Koning Sterf)", "Kortverhaalanálise", "Taalstrukture en -konvensies", "Begripsvaardighede", "Opsomming skryf", "Opstel skryf (verhalend, beskrywend, argumentatief)", "Transaksionele skryfwerk (formele brief, e-pos)", "Mondelinge vaardighede", "Visuele geletterdheid (spotprente, advertensies)"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "CAPS Afrikaans Huistaal"
    },
    {
        gradeLevels: ["10", "11", "12"],
        subject: "Afrikaans Eerste Addisionele Taal",
        topics: [
            "Gedigte (voorgeskrewe)", "Romanstudie (voorgeskrewe boeke)", "Dramastudie", "Kortverhale", "Begripstoets en -strategieë", "Opsommingstrategieë", "Taal in konteks (grammatika, leestekens)", "Skryf van opstelle", "Skryf van transaksionele tekste (dialoog, resensie)", "Luister- en praatvaardighede", "Visuele geletterdheid"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "CAPS Afrikaans EAT"
    }
];

// This function expands the raw lessons into individual lessons for each grade.
function expandLessons(lessons: any[]): Lesson[] {
  const expanded: Lesson[] = [];
  lessons.forEach(lesson => {
    lesson.gradeLevels.forEach((grade: string) => {
      
      // Basic filter logic to assign topics per grade
      let gradeTopics: string[] = [];
      if (grade === "10") {
        gradeTopics = lesson.subject === "Mathematics" ? lesson.topics.slice(0, 12) :
                      lesson.subject === "Physical Sciences" ? [...lesson.topics.slice(0, 4), ...lesson.topics.slice(8, 13)] :
                      lesson.subject === "Life Sciences" ? lesson.topics.slice(0, 6) :
                      lesson.subject === "Geography" ? lesson.topics.slice(0, 6) :
                      lesson.topics;
      } else if (grade === "11") {
        gradeTopics = lesson.subject === "Mathematics" ? lesson.topics.slice(12, 22) :
                      lesson.subject === "Physical Sciences" ? [...lesson.topics.slice(4, 8), ...lesson.topics.slice(13, 18)] :
                      lesson.subject === "Life Sciences" ? lesson.topics.slice(6, 13) :
                      lesson.subject === "Geography" ? lesson.topics.slice(6, 10) :
                      lesson.topics;
      } else if (grade === "12") {
        gradeTopics = lesson.subject === "Mathematics" ? lesson.topics.slice(22) :
                      lesson.subject === "Physical Sciences" ? [...lesson.topics.slice(18, 24), ...lesson.topics.slice(24)] :
                      lesson.subject === "Life Sciences" ? lesson.topics.slice(13) :
                      lesson.subject === "Geography" ? lesson.topics.slice(10) :
                      lesson.topics;
      } else {
        gradeTopics = lesson.topics;
      }
      
      expanded.push({
        ...lesson,
        id: `${lesson.subject.toLowerCase().replace(/[^a-z0-9]/g, '-')}-grade-${grade}`,
        gradeLevel: grade,
        topics: gradeTopics.length > 0 ? gradeTopics : lesson.topics, // Fallback to all topics if filtering fails
        gradeLevels: undefined, // remove the array
      });
    });
  });
  return expanded;
}

export const lessons: Lesson[] = expandLessons(rawLessons);

export const placeholderLessons: Lesson[] = [
  {
    id: "lesson-math-8-1",
    gradeLevel: "8",
    subject: "Mathematics",
    topics: [
      "Algebraic Expressions",
      "Exponents",
      "Geometric constructions",
      "Geometry of 2D shapes",
      "Number system",
      "Problem solving"
    ],
  },
  {
    id: "lesson-math-9-1",
    gradeLevel: "9",
    subject: "Mathematics",
    topics: [
        "Number system & real numbers",
        "Algebraic expressions & equations",
        "Functions & relationships",
        "Geometry of straight lines & 2D shapes",
        "Trigonometry basics",
        "Area and perimeter"
    ],
  }
];

export const mathQuestionsByGrade: Record<string, { question: string, answer: string }> = {
    "1": { question: "If you have 2 apples and you get 3 more, how many apples do you have?", answer: "5" },
    "2": { question: "What is 15 - 8?", answer: "7" },
    "3": { question: "If a box has 6 crayons, how many crayons are in 4 boxes?", answer: "24" },
    "4": { question: "What is 56 divided by 7?", answer: "8" },
    "5": { question: "A movie starts at 2:15 PM and lasts for 1 hour and 30 minutes. What time does it end?", answer: "3:45 PM" },
    "6": { question: "What is 3/4 as a decimal?", answer: "0.75" },
    "7": { question: "Solve for x: 3x + 5 = 14", answer: "3" },
    "8": { question: "What is the area of a circle with a radius of 5 cm? (Use π ≈ 3.14)", answer: "78.5 cm²" },
    "9": { question: "Simplify the expression: (2x^2)(3x^3)", answer: "6x^5" },
    "10": { question: "Factorize the quadratic expression: x² + 5x + 6", answer: "(x+2)(x+3)" },
    "11": { question: "Find the value of sin(30°) + cos(60°)", answer: "1" },
    "12": { question: "Find the derivative of f(x) = 3x² + 2x - 1", answer: "f'(x) = 6x + 2" },
};

export const literatureOptions = {
  grade12: {
    'english-hl': {
      novels: ["The Picture of Dorian Gray by Oscar Wilde", "Life of Pi by Yann Martel", "Things Fall Apart by Chinua Achebe"],
      dramas: ["Hamlet by William Shakespeare", "The Crucible by Arthur Miller", "Othello by William Shakespeare"],
      poems: [
        "Sonnet 130 - William Shakespeare",
        "The child who was shot dead by soldiers at Nyanga - Ingrid Jonker",
        "An African Elegy - Ben Okri",
        "First day after the war - Mazisi Kunene",
        "A Hard Frost - Cecil Day Lewis",
        "Vultures - Chinua Achebe",
        "The garden of love - William Blake",
        "At a funeral - Dennis Brutus",
        "Remember - Christina Rossetti",
        "An African thunderstorm - David Rubadiri",
        "Somewhere I have never travelled, gladly beyond - e.e. cummings",
        "The Zulu Girl - Roy Campbell",
      ]
    },
    'english-fal': {
      novels: ["Cry, the Beloved Country by Alan Paton", "Strange Case of Dr Jekyll and Mr Hyde by Robert Louis Stevenson"],
      dramas: ["Macbeth by William Shakespeare", "My Children! My Africa! by Athol Fugard"],
      poems: [
          "Sonnet 18 – William Shakespeare",
          "Everything has changed (except graves) – Mzi Mahola",
          "The first day after the war – Mazisi Kunene",
          "The herb garden – Katherine Beeman",
          "The slave dealer – Thomas Pringle",
          "To learn how to speak – Jeremy Cronin",
      ]
    },
    'afrikaans-ht': {
      novels: ["Fiela se Kind deur Dalene Matthee", "Die Kruppel Engel deur Francois Smith", "Onderwêreld deur Fanie Viljoen"],
      dramas: ["Die Koning Sterf deur Eugène Ionesco", "Mis deur Reza de Wet"],
      poems: [
        "Die huis luister - D.J. Opperman",
        "Middelburg - T.T. Cloete",
        "swettertjie - A.G. Visser",
        "Strelitzia - T.T. Cloete",
        "Verlore stad - F.I.S.F. Marais",
        "Die boodskapper - S.J. Pretorius",
        "Die nuwe kind - Lina Spies",
        "Touloper - Boerneef",
        "Mevrou van Skewes - Lina Spies",
        "Spore op die maan - Koos du Plessis",
        "Geboorte - I.L. de Villiers",
        "My venster is ’n blank reghoek - I.L. de Villiers",
      ]
    },
    'afrikaans-eat': {
      novels: ["Asem deur Jan van Tonder", "Lien se Lankstaanskoene deur Derick van der Walt"],
      dramas: ["Paljas deur Chris Barnard"],
      poems: [
        "Huiskat – Elisabeth Eybers",
        "Die boodskapper – S.J. Pretorius",
        "Ek het ‘n huisie by die see – H.A. Fagan",
        "Die wereld het so klein geword – Totius",
        "Staan op! – F.P. van der Merwe",
        "Resep – C.J. Langenhoven",
      ]
    }
  },
  grade11: {
      'english-hl': {
          novels: ["Tsotsi by Athol Fugard", "The Great Gatsby by F. Scott Fitzgerald"],
          dramas: ["My Children! My Africa! by Athol Fugard", "A Doll's House by Henrik Ibsen"],
          poems: [
            "Sonnet 73 - William Shakespeare",
            "The wind begun to rock the grass - Emily Dickinson",
            "Dulce et Decorum Est - Wilfred Owen",
            "Ozymandias - Percy Bysshe Shelley",
            "The Tyger - William Blake",
            "Funeral Blues - W.H. Auden",
            "Dover Beach - Matthew Arnold",
            "Auto Wreck - Karl Shapiro",
            "On his blindness - John Milton",
            "To the virgins, to make much of time - Robert Herrick",
          ]
      },
      // ... more FAL, HT, EAT for Grade 11
  },
  grade10: {
      'english-hl': {
          novels: ["Lord of the Flies by William Golding", "To Kill a Mockingbird by Harper Lee"],
          dramas: ["Romeo and Juliet by William Shakespeare"],
          poems: [
            "The Road Not Taken - Robert Frost",
            "I Know Why the Caged Bird Sings - Maya Angelou",
            "A Dream Deferred - Langston Hughes",
            "Sonnet 18 - William Shakespeare",
            "Still I Rise - Maya Angelou",
          ]
      },
      // ... more FAL, HT, EAT for Grade 10
  }
};
