
import { BookCopy, CheckCircle, Target, Clock, AlertTriangle, Briefcase, Paintbrush, Wrench, VenetianMask, Lightbulb, Tractor } from 'lucide-react';

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
];

export const appLanguages = [
    { value: 'en', label: 'English' },
    { value: 'af', label: 'Afrikaans' },
    { value: 'nbl', label: 'isiNdebele' },
    { value: 'xh', label: 'isiXhosa' },
    { value: 'zu', label: 'isiZulu' },
    { value: 'nso', label: 'Sepedi' },
    { value: 'st', label: 'Sesotho' },
    { value: 'tn', label: 'Setswana' },
    { value: 'ss', label: 'siSwati' },
    { value: 'ven', label: 'Tshivenḓa' },
    { value: 'ts', label: 'Xitsonga' },
];


export const grades = [
    { value: "10", label: "Grade 10" },
    { value: "11", label: "Grade 11" },
    { value: "12", label: "Grade 12" },
];

export const languageSubjects = {
    english: [
        { value: "English Home Language", label: "English Home Language" },
        { value: "English First Additional Language", label: "English First Additional Language" },
    ],
    afrikaans: [
        { value: "Afrikaans Huistaal", label: "Afrikaans Huistaal" },
        { value: "Afrikaans Eerste Addisionele Taal", label: "Afrikaans Eerste Addisionele Taal" },
    ]
};

export const languages = [
    { value: 'english', label: 'English' },
    { value: 'afrikaans', label: 'Afrikaans' },
    { value: 'sepedi', label: 'Sepedi' },
    { value: 'setswana', label: 'Setswana' },
    { value: 'siswati', label: 'Siswati' },
    { value: 'tshivenda', label: 'Tshivenda' },
    { value: 'xitsonga', label: 'Xitsonga' },
];

export const contentSubjects = [
    { value: "Mathematics", label: "Mathematics" },
    { value: "Mathematical Literacy", label: "Mathematical Literacy" },
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
    // Foundation & Intermediate Phase subjects
    { value: "Life Skills", label: "Life Skills" },
    { value: "Natural Sciences and Technology", label: "Natural Sciences and Technology" },
    { value: "Social Sciences", label: "Social Sciences" },
    // Senior Phase subjects
    { value: "Natural Sciences", label: "Natural Sciences" },
    { value: "Technology", label: "Technology" },
    { value: "Economic & Management Sciences", label: "Economic & Management Sciences" },
    { value: "Life Orientation", label: "Life Orientation" },
];

export const subjects = [...contentSubjects, ...languageSubjects.english, ...languageSubjects.afrikaans];


export const subjectColors: Record<string, { bg: string, text: string, border: string }> = {
    "Mathematics": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500 dark:border-blue-400" },
    "Physical Sciences": { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500 dark:border-purple-400" },
    "Life Sciences": { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", border: "border-green-500 dark:border-green-400" },
    "Geography": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500 dark:border-orange-400" },
    "Accounting": { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500 dark:border-indigo-400" },
    "Business Studies": { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400", border: "border-pink-500 dark:border-pink-400" },
    "English Home Language": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", border: "border-red-500 dark:border-red-400" },
    "English First Additional Language": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", border: "border-red-500 dark:border-red-400" },
    "Afrikaans Huistaal": { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500 dark:border-yellow-400" },
    "Afrikaans Eerste Addisionele Taal": { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500 dark:border-yellow-400" },
    "History": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500 dark:border-amber-400" },
    "Economics": { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500 dark:border-cyan-400" },
    "Tourism": { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-600 dark:text-teal-400", border: "border-teal-500 dark:border-teal-400" },
    "Computer Applications Technology": { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-600 dark:text-gray-400", border: "border-gray-500 dark:border-gray-400" },
    "Computer Applications Technology (CAT)": { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-600 dark:text-gray-400", border: "border-gray-500 dark:border-gray-400" },
    "Information Technology": { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-600 dark:text-gray-400", border: "border-gray-500 dark:border-gray-400" },
    "Natural Sciences": { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300", border: "border-green-400 dark:border-green-500" },
    "Technology": { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-400 dark:border-blue-500" },
    "Economic & Management Sciences": { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-400 dark:border-cyan-500" },
    "Life Orientation": { bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-700 dark:text-pink-300", border: "border-pink-400 dark:border-pink-500" },
    "Agricultural Sciences": { bg: "bg-lime-100 dark:bg-lime-900/30", text: "text-lime-600 dark:text-lime-400", border: "border-lime-500 dark:border-lime-400" },
    "Dramatic Arts": { bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30", text: "text-fuchsia-600 dark:text-fuchsia-400", border: "border-fuchsia-500 dark:border-fuchsia-400" },
    "Visual Arts": { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500 dark:border-rose-400" },
    "Mechanical Technology": { bg: "bg-slate-100 dark:bg-slate-900/30", text: "text-slate-600 dark:text-slate-400", border: "border-slate-500 dark:border-slate-400" },
    "Electrical Technology": { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-600 dark:text-sky-400", border: "border-sky-500 dark:border-sky-400" },
    "Civil Technology": { bg: "bg-stone-100 dark:bg-stone-900/30", text: "text-stone-600 dark:text-stone-400", border: "border-stone-500 dark:border-stone-400" },
    "Mathematical Literacy": { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-400 dark:border-blue-500" },
    "Consumer Studies": { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500 dark:border-emerald-400" },
    "Hospitality Studies": { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500 dark:border-violet-400" },
    "Engineering Graphics & Design": { bg: "bg-zinc-100 dark:bg-zinc-900/30", text: "text-zinc-600 dark:text-zinc-400", border: "border-zinc-500 dark:border-zinc-400" },
    "Creative Arts": { bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-700 dark:text-rose-300", border: "border-rose-400 dark:border-rose-500" },
    "Technical Sciences": { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-400 dark:border-cyan-500" },
    "English HL": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", border: "border-red-500 dark:border-red-400" },
    "English FAL": { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", border: "border-red-500 dark:border-red-400" },
    "Afrikaans HT": { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500 dark:border-yellow-400" },
    "Afrikaans EAT": { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500 dark:border-yellow-400" },
    "Life Skills": { bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-700 dark:text-pink-300", border: "border-pink-400 dark:border-pink-500" },
    "Natural Sciences and Technology": { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300", border: "border-green-400 dark:border-green-500" },
    "Social Sciences": { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-400 dark:border-amber-500" },
    "Unknown": { bg: "bg-neutral-100 dark:bg-neutral-900/30", text: "text-neutral-600 dark:text-neutral-400", border: "border-neutral-500 dark:border-neutral-400" },
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
    // ========== FOUNDATION PHASE (Grades 1-3) ==========
    {
        gradeLevels: ["1", "2", "3"],
        subject: "Mathematics",
        textbookLink: "https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20MATHEMATICS%20SENIOR%20PHASE/CAPS%20Math%20Gr%201-3%20Web.pdf?ver=2015-01-27-154243-733",
        topics: [
            // Grade 1
            "Counting 0–99, Number Symbols & Names, Ordinal Numbers", "Addition & Subtraction up to 20, Problem-Solving", "Patterns - Repeating & Growing, Copying & Extending", "2D Shapes & 3D Objects, Position & Direction, Symmetry", "Length, Mass, Capacity, Time - Days, Months, Sequences", "Data Handling - Sorting, Picture Graphs, Yes/No Data",
            // Grade 2
            "Counting to 199, Place Value - Tens & Units", "Addition & Subtraction up to 99, Multiplication & Division Concept", "Number Patterns, Sequences in 2s, 5s, 10s", "More 2D Shapes & 3D Objects, Direction & Position", "Estimation & Comparison, Time - Calendar & Clocks to Half Hour", "Data Handling - Tally Marks, Bar Graphs, Sorting Categories",
            // Grade 3
            "Counting to 999, Place Value - Hundreds, Tens, Units", "Addition & Subtraction to 999, Multiplication Tables 2×-10×, Division", "Number Patterns & Function Tables", "2D Shapes Properties, 3D Objects - Faces, Edges, Corners", "Time - Quarter Past/To, Area & Perimeter Intro, Temperature", "Data Handling - Bar Graphs, Pictographs, Tables & Lists"
        ],
        source: "CAPS Mathematics Foundation Phase"
    },
    {
        gradeLevels: ["4", "5", "6"],
        subject: "Mathematics",
        textbookLink: "https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20MATHEMATICS%20SENIOR%20PHASE/CAPS%20Math%20Gr%201-3%20Web.pdf?ver=2015-01-27-154243-733",
        topics: [
            // Grade 4
            "Numbers, Operations & Relationships (whole numbers to 10,000, addition & subtraction, multiplication & division, simple fractions)", "Patterns & Algebra (number patterns, flow diagrams)", "Space & Shape (2D shapes - polygons, triangles, quadrilaterals, 3D objects, position, maps)", "Measurement (length, mass, capacity, time - analogue & digital, timelines, perimeter)", "Data Handling (bar graphs, tables, tally marks)",
            // Grade 5
            "Numbers, Operations & Relationships (whole numbers to 100,000, multiplying 3-digit × 2-digit, division with remainders, fractions - equivalent, comparing, adding, decimals intro)", "Patterns & Algebra (numeric & geometric patterns, input/output tables)", "Space & Shape (2D shapes - properties, angles - acute, obtuse, right, 3D objects)", "Measurement (perimeter & area, time - 24-hour, volume & capacity)", "Data Handling (bar & line graphs, mean, mode intro)",
            // Grade 6
            "Numbers, Operations & Relationships (whole numbers to 1,000,000, fractions - add, subtract, compare, decimals 1-2 decimal places, percentages intro, ratio and rate basic)", "Patterns & Algebra (sequences, function tables, simple algebraic expressions)", "Space & Shape (angles - rev & adjacent, complementary, supplementary, triangles, quadrilaterals, 3D objects - nets)", "Measurement (area & perimeter, volume, time zones)", "Data Handling (histograms, pie charts, averages)"
        ],
        source: "CAPS Mathematics Intermediate Phase"
    },
    {
        gradeLevels: ["1", "2", "3"],
        subject: "English Home Language",
        topics: [
            // Grade 1
            "Listening & Speaking - Stories, Instructions, Vocabulary Themes", "Phonological Awareness - Rhymes, Syllables, Beginning Sounds", "Phonics - Single Sounds, Simple Blends", "Reading & Viewing - Pictures, Simple Sentences", "Handwriting - Letter Formation, Print", "Writing - Simple Sentences, Guided Writing", "Language Structures - Nouns, Verbs, Plurals, Adjectives",
            // Grade 2
            "Listening & Speaking - Oral Instructions, Retelling Stories", "Phonics & Word Recognition - Blends, Digraphs", "Reading & Comprehension - Short Paragraphs", "Handwriting - Neatness, Full Sentences", "Writing - Descriptions, Simple Paragraphs", "Language Structures - Tenses, Punctuation, Adjectives, Pronouns",
            // Grade 3
            "Listening & Speaking - Listening for Detail, Debates, Discussions", "Phonics - Complex Blends, Syllables", "Reading & Comprehension - Longer Stories", "Writing - Paragraphs, Narratives, Instructions", "Language Structures - Tenses, Prepositions, Conjunctions, Pronouns, Plurals"
        ],
        source: "CAPS English Home Language Foundation Phase"
    },
    {
        gradeLevels: ["4", "5", "6"],
        subject: "English Home Language",
        topics: [
            // Grade 4
            "Listening & Speaking", "Reading & Viewing", "Phonics & Word-Recognition", "Handwriting", "Writing (paragraphs, stories, instructions)", "Language Structures (nouns, adjectives, verbs, simple & compound sentences, punctuation - full stop, comma, question mark, tenses - past/present/future)",
            // Grade 5
            "Listening comprehension", "Reading & comprehension", "Writing (narratives, descriptions, letters)", "Language Structures (compound & complex sentences, adverbs, conjunctions, prepositions, tenses full set, direct & indirect speech)",
            // Grade 6
            "Listening & summarising", "Reading longer texts", "Writing (essays, reports, letters)", "Grammar (active/passive voice, pronouns, conjunctions, prepositions, idioms & figurative language, complex tenses)"
        ],
        source: "CAPS English Home Language Intermediate Phase"
    },
    {
        gradeLevels: ["1", "2", "3"],
        subject: "English First Additional Language",
        topics: [
            // Grade 1
            "Listening & Speaking - Instructions, Songs, Rhymes, Basic Vocabulary", "Phonics - Letter-Sound Relationships, Basic Word Building", "Reading - Shared Reading, Sight Words, Simple Texts", "Writing - Copying Words & Sentences, Simple Word Building", "Language Structures - Basic Vocabulary, Simple Sentences, Punctuation",
            // Grade 2
            "Listening & Speaking - Comprehension, Oral Activities, Vocabulary Building", "Phonics & Word Recognition - Blends, Digraphs, Word Families", "Reading - Simple Texts, Comprehension Questions, Reading Aloud", "Writing - Completing Sentences, Creative Writing, Personal Writing", "Language Structures - Basic Grammar, Sentence Structure, Punctuation, Spelling",
            // Grade 3
            "Listening & Speaking - Comprehension, Discussions, Presentations, Vocabulary Expansion", "Reading & Viewing - Reading Strategies, Comprehension, Visual Literacy", "Phonics & Spelling - Word Building, Spelling Patterns, Dictionary Skills", "Writing & Presenting - Guided Writing, Creative Writing, Transactional Writing", "Language Structures - Parts of Speech, Sentence Types, Tenses, Punctuation, Grammar, Vocabulary"
        ],
        source: "CAPS English First Additional Language Foundation Phase"
    },
    {
        gradeLevels: ["4", "5", "6"],
        subject: "English First Additional Language",
        topics: [
            // Grade 4
            "Listening and speaking (listening comprehension, oral presentations, discussions, vocabulary building)", "Reading and viewing (reading strategies, comprehension skills, visual literacy, literature appreciation)", "Phonics and spelling (word building, spelling rules, dictionary and thesaurus skills)", "Writing and presenting (creative writing, transactional writing, paragraph writing, editing)", "Language structures and conventions (parts of speech, sentence structure, tenses, punctuation, grammar rules, vocabulary expansion)",
            // Grade 5
            "Listening and speaking (listening comprehension, oral presentations, discussions, vocabulary building)", "Reading and viewing (reading strategies, comprehension skills, visual literacy, literature appreciation)", "Phonics and spelling (word building, spelling rules, dictionary and thesaurus skills)", "Writing and presenting (creative writing, transactional writing, paragraph writing, editing)", "Language structures and conventions (parts of speech, sentence structure, tenses, punctuation, grammar rules, vocabulary expansion)",
            // Grade 6
            "Listening and speaking (listening comprehension, oral presentations, discussions, vocabulary building)", "Reading and viewing (reading strategies, comprehension skills, visual literacy, literature appreciation)", "Phonics and spelling (word building, spelling rules, dictionary and thesaurus skills)", "Writing and presenting (creative writing, transactional writing, paragraph writing, editing)", "Language structures and conventions (parts of speech, sentence structure, tenses, punctuation, grammar rules, vocabulary expansion)"
        ],
        source: "CAPS English First Additional Language Intermediate Phase"
    },
    {
        gradeLevels: ["1", "2", "3"],
        subject: "Life Skills",
        topics: [
            // Grade 1 (Term 1-4 Topics)
            "Term 1: Myself - My Body, School, Healthy Habits, Weather & Seasons, Safety", "Term 2: My Family, Safety at Home, Special Days, People Who Help Us, Feelings & Self-Esteem", "Term 3: Community & Helpers, Plants & Seeds, Food & Healthy Choices, Manners, Pets & Caring for Animals", "Term 4: Homes & Shelter, Water, Simple Maps, Night Sky, Recycling",
            // Grade 2 (Term 1-4 Topics)
            "Term 1: Me & My Abilities, My Body Inside & Outside, Safety Around Water, Weather & Seasons, Respecting Others", "Term 2: Healthy Eating, Insects, Life Cycles, Recycling, Special Days", "Term 3: Pollution, Public Safety, People Long Ago, Space & Planets Intro, Feelings & Relationships", "Term 4: Our Environment, Road Safety, Animals & Habitats, Basic Maps, Water Cycle Basics",
            // Grade 3 (Term 1-4 Topics)
            "Term 1: Myself as Part of Community, Safety Rules, Healthy Practices, Weather & Climate", "Term 2: Healthy Eating, Insects, Life Cycles of Plants & Animals, Recycling & Protecting Environment", "Term 3: Pollution, How People Lived Long Ago, Space (Sun, Moon, Earth), Natural Disasters Basics", "Term 4: Water, Saving Resources, Maps & Directions, Night Sky & Space Facts"
        ],
        source: "CAPS Life Skills Foundation Phase"
    },
    {
        gradeLevels: ["4", "5", "6"],
        subject: "Life Skills",
        topics: [
            // Grade 4
            "Personal & Social Well-Being (healthy habits, safety, dealing with emotions, respect & relationships)", "Creative Arts (drawing, painting, collage, drama: movement & storytelling, music: rhythm & percussion)", "Physical Education (locomotor skills, games, fitness)",
            // Grade 5
            "Personal & Social Well-Being (nutrition, substance abuse dangers, conflict resolution, rights & responsibilities)", "Creative Arts (drawing - tone & shading, drama - voice & character, music - beat & pitch)", "Physical Education (fitness circuits, games skills, team activities)",
            // Grade 6
            "Personal & Social Well-Being (puberty & reproduction age-appropriate, healthy lifestyle, relationships & decision-making, peer pressure)", "Creative Arts (advanced drawing, drama & performance, music notation basics)", "Physical Education (fitness, team sports, movement activities)"
        ],
        source: "CAPS Life Skills Intermediate Phase"
    },
    {
        gradeLevels: ["4", "5", "6"],
        subject: "Natural Sciences and Technology",
        topics: [
            // Grade 4
            "Term 1: Living & non-living things, structures: natural & man-made, food chains", "Term 2: Materials (properties, uses), energy & movement, process skills (investigation basics)", "Term 3: Solar system basics, planet Earth, soil & rocks", "Term 4: Energy transfer, life & living, recycling",
            // Grade 5
            "Term 1: Life & living, interdependence, skeletons & movement", "Term 2: Properties of materials, solutions & mixtures, processes (filtering, sieving)", "Term 3: Planet Earth - sedimentary, igneous, metamorphic rocks", "Term 4: Energy & electricity, electric circuits, technology: simple machines (gears, levers, pulleys)",
            // Grade 6
            "Term 1: Life & living - ecosystems, food webs, biodiversity", "Term 2: Materials & matter, reversible & irreversible changes, chemistry basics", "Term 3: Planet Earth & beyond - the moon, tides, space exploration", "Term 4: Energy & electricity, electric circuits, technology: structures & design (bridges, frames, loads)"
        ],
        source: "CAPS Natural Sciences and Technology Intermediate Phase"
    },
    {
        gradeLevels: ["4", "5", "6"],
        subject: "Social Sciences",
        topics: [
            // Grade 4 Geography
            "Map skills, local neighbourhood, landmarks, South Africa: provinces and capitals, water sources & conservation",
            // Grade 4 History
            "Local history, early travellers, first farmers in southern Africa, San & Khoi",
            // Grade 5 Geography
            "Maps revisited (scale, grid), climate & weather, water in the world, the earth's surface",
            // Grade 5 History
            "Hunter-gatherers, past societies, ancient civilizations, early farming communities",
            // Grade 6 Geography
            "Trade, weather patterns, hazards & disasters, population, climate zones",
            // Grade 6 History
            "Early trade, kingdoms of southern Africa, explorers & navigation, the transatlantic slave trade"
        ],
        source: "CAPS Social Sciences Intermediate Phase"
    },
    // ========== SENIOR PHASE (Grades 7-9) ==========
    {
        gradeLevels: ["7", "8", "9"],
        subject: "Mathematics",
        textbookLink: "https://www.siyavula.com/read/za/mathematics",
        topics: [
            // Grade 7
            "Numbers, Operations & Relationships (integers - add/sub/multiply/divide, fractions operations, decimals, percentages, ratio & rate)", "Patterns, Functions & Algebra (expressions, equations, input/output tables, number sequences)", "Space & Shape (Geometry) - angles & angle relationships, triangles, quadrilaterals, geometric construction, 2D → 3D objects", "Measurement (perimeter, area of rectangles/triangles, volume)", "Data Handling (bar graphs, histograms, pie charts, mean, median, mode)",
            // Grade 8
            "Numbers, Operations & Relationships (integer operations, exponents - laws of exponents, prime factors, scientific notation, ratio, rate & percentage)", "Patterns, Functions & Algebra (expressions, factorisation - common factors & trinomials intro, algebraic equations, linear functions - tables & graphs, number patterns)", "Space & Shape (Geometry) - geometry of straight lines, angles - adjacent, supplementary, co-interior, alternate, corresponding, triangles - properties, quadrilaterals, transformation geometry - reflection, rotation, translation)", "Measurement (area & perimeter, volume of prisms & cylinders)", "Data Handling (organising data, graphs - bar, histogram, line, measures of central tendency, intro probability)",
            // Grade 9
            "Numbers, Operations & Relationships (exponents, scientific notation, real numbers, ratio, rate, percentage)", "Patterns, Functions & Algebra (algebraic expressions, factorisation, algebraic equations, linear graphs, tables & rules)", "Geometry (geometry of straight lines, triangles & quadrilaterals, congruency, Pythagoras, geometric construction)", "Measurement (area & perimeter, volume of cylinders/prisms, surface area)", "Data Handling (statistical summaries, probability introduction)"
        ],
        source: "CAPS Mathematics Senior Phase"
    },
    {
        gradeLevels: ["7", "8", "9"],
        subject: "English Home Language",
        topics: [
            // Grade 7
            "Listening & speaking (oral presentations, debates, instructions)", "Reading & viewing (short stories, poems, transactional texts)", "Writing (essays, letters, reports, dialogues, descriptive & narrative writing)", "Language Structures (parts of speech, sentence structure, simple/compound/complex sentences, direct & indirect speech, concord, active & passive voice intro)",
            // Grade 8
            "Listening & Speaking (formal/informal conversations, speeches, instructions, note-taking)", "Reading & Viewing (short stories, novels, drama, poetry, visual texts - adverts, posters)", "Writing (essays - narrative/descriptive, transactional texts - letters, reports, dialogues, summaries)", "Language Structures (parts of speech, active/passive voice, phrases & clauses, direct/indirect speech, concord, punctuation, figurative language)",
            // Grade 9
            "Listening (speeches, instructions, formal listening)", "Reading (novels, poetry, drama, adverts)", "Writing (essays, transactional texts, summaries)", "Language Structures (complex sentences, clauses, active & passive voice, concord, idioms & figurative language, direct/indirect speech)"
        ],
        source: "CAPS English Home Language Senior Phase"
    },
    {
        gradeLevels: ["7", "8", "9"],
        subject: "Natural Sciences",
        topics: [
            // Grade 7
            "Term 1 - Life & Living (photosynthesis, classification of living things, cells)", "Term 2 - Matter & Materials (mixtures, solutions, separation methods)", "Term 3 - Energy & Change (potential & kinetic energy, heat transfer, electrical circuits intro)", "Term 4 - Earth & Beyond (the solar system, Earth's structure, volcanoes & earthquakes)",
            // Grade 8
            "Life & Living (cells - structure & function, body systems - digestive, circulatory, respiratory, photosynthesis & respiration, ecosystems & interactions)", "Matter & Materials (particle model of matter, compounds & mixtures, chemical reactions, acids & bases - indicators, pH)", "Energy & Change (energy forms, potential & kinetic energy, series & parallel circuits, resistance)", "Earth & Beyond (Earth as a system, fossil fuels & renewable energy, seasons, lunar phases, space exploration)",
            // Grade 9
            "Life & Living (cells, human reproduction, circulatory & respiratory systems, ecosystems)", "Matter & Materials (atoms, molecules, chemical reactions, periodic table basics, acids, bases & pH)", "Energy & Change (electricity & circuits, resistance, mechanical energy, heat transfer)", "Earth & Beyond (lithosphere, mining, atmosphere, climate change)"
        ],
        source: "CAPS Natural Sciences Senior Phase"
    },
    {
        gradeLevels: ["7", "8", "9"],
        subject: "Social Sciences",
        topics: [
            // Grade 7 Geography
            "Map skills, Earth's structure, tectonic plates, weather & climate, settlement patterns",
            // Grade 7 History
            "Kingdoms of Africa (Mapungubwe, Mali), trans-Saharan trade, early global trade routes, southern Africa before European colonisation",
            // Grade 8 Geography
            "Weather & climate, climate regions, fluvial processes (rivers), settlement patterns & land use, population growth & distribution, natural resources & sustainability",
            // Grade 8 History
            "The Industrial Revolution, mineral revolution in South Africa, the scramble for Africa, the rise of modern capitalism, colonisation & resistance, the Boer Wars, South Africa 1900–1910 (Union formation)",
            // Grade 9 Geography
            "Development issues, population & demographics, water resources, climate change, resource use & sustainability",
            // Grade 9 History
            "WW2 background, Nazi Germany, the rise & fall of apartheid, the struggle for democracy, 1994 elections"
        ],
        source: "CAPS Social Sciences Senior Phase"
    },
    {
        gradeLevels: ["7", "8", "9"],
        subject: "Technology",
        topics: [
            // Grade 7
            "Structures (frame vs shell), strengthening materials, types of bridges, mechanical systems (gears, pulleys), electricity basics, design process, simple project (bridge or mechanical model)",
            // Grade 8
            "Mechanical systems (gears, cams, pulleys), hydraulics & pneumatics intro, electrical systems (Ohm's law intro), processing materials (plastics, metals, composites), structures & forces, the design process (investigate, design, make, evaluate), practical project (mechanical or electrical device)",
            // Grade 9
            "Mechanical systems (advanced), electrical systems, processing materials, hydraulics & pneumatics, structures (complex), final design project (electronics/structures/mechanics)"
        ],
        source: "CAPS Technology Senior Phase"
    },
    {
        gradeLevels: ["7", "8", "9"],
        subject: "Economic & Management Sciences",
        topics: [
            // Grade 7
            "Needs & wants, goods & services, types of businesses, the economy, trade (local/global), financial literacy (budgets, income & expenses, savings & banking)",
            // Grade 8
            "Economy (the economic cycle, standard of living, government roles in the economy, national budget), entrepreneurship (business ideas & opportunities, forms of ownership, business plan basic), financial literacy (accounting concepts, source documents, cash receipts & payments journals, general ledger, trial balance, banking transactions)",
            // Grade 9
            "Entrepreneurship, business plans, financial records (income statement, balance sheet, accounting concepts), taxation, the circular flow of money, sectors of the economy"
        ],
        source: "CAPS Economic & Management Sciences Senior Phase"
    },
    {
        gradeLevels: ["7", "8", "9"],
        subject: "Life Orientation",
        topics: [
            // Grade 7
            "Development of self, peer influence, gender roles, substance abuse, personal health & hygiene, puberty & body changes, participation in sport, citizenship & leadership",
            // Grade 8
            "Development of self, decision-making skills, relationships & peer influence, gender & stereotypes & identity, substance abuse, healthy lifestyle habits, human rights & responsibilities, inclusivity & diversity, physical fitness, team sports & movement activities",
            // Grade 9
            "Physical changes (advanced), emotional/social changes, healthy lifestyle, substance abuse, sexuality education, conflict resolution, human rights & diversity, careers & subject choices, physical fitness & sport"
        ],
        source: "CAPS Life Orientation Senior Phase"
    },
    {
        gradeLevels: ["7", "8", "9"],
        subject: "Creative Arts",
        topics: [
            // Grade 7
            "Visual Arts (drawing skills, elements of art - line, colour, form, basic painting techniques), Drama (role-play, movement, storytelling), Music (rhythm, beat, instrument families, South African traditional music)",
            // Grade 8
            "Visual Arts (elements of art - line, colour, shape, texture, composition, perspective drawing, printmaking, painting techniques), Drama (improvisation, vocal techniques, movement & characterisation, scripted scenes, performance principles), Music (rhythm, melody, tempo, music notation, musical instruments, African music traditions, listening & analysis)",
            // Grade 9
            "Visual Arts (composition, colour theory, perspective, mixed media), Drama (improvisation, voice & movement, scripted scenes, performance), Music (melody, rhythm, harmony, notation, instruments, African music forms)"
        ],
        source: "CAPS Creative Arts Senior Phase"
    },
    // ========== SENIOR PHASE & FET (Grades 10-12) ==========
    {
        gradeLevels: ["10", "11", "12"],
        subject: "Mathematics",
        textbookLink: "https://www.siyavula.com/read/za/mathematics",
        topics: [
            // Grade 10
            "Algebra (exponents, surds, factorisation, quadratic equations, simultaneous equations)", "Functions & Graphs (linear, quadratic, hyperbola, exponential graphs)", "Number Patterns (arithmetic sequences, geometric sequences)", "Finance & Growth (simple & compound interest, depreciation)", "Trigonometry (ratios, identities, trig equations, trig graphs)", "Euclidean Geometry (line theorems, triangles, Euclidean proofs)", "Statistics (data organisation, box plots, measures of central tendency)",
            // Grade 11
            "Algebra (exponents & surds advanced, functions & inverses, quadratic equations & inequalities, simultaneous equations)", "Analytical Geometry (distance, midpoint, gradient, equation of a line)", "Trigonometry (identities, trig equations, reduction formulae, sine, cosine rule, area of triangles)", "Calculus Intro (first principles, derivative of polynomials)", "Euclidean Geometry (similarity, theorems on parallel lines, circle theorems)", "Statistics (probability, permutations & combinations)",
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
            // Literature (will be filtered by student selections)
            "Poetry analysis", "Novel study", "Drama study", "Short story analysis", "Film study",
            // Language and Grammar
            "Parts of Speech", "Nouns and Pronouns", "Verbs and Tenses", "Adjectives and Adverbs", "Prepositions and Conjunctions", 
            "Sentence Structure", "Active and Passive Voice", "Direct and Indirect Speech", "Punctuation", "Figures of Speech",
            // Reading and Writing
            "Comprehension skills", "Summary writing", "Essay writing (narrative, descriptive, argumentative)", 
            "Transactional writing (letters, emails, reports, speeches)", "Visual literacy (cartoons, advertisements, infographics)",
            // Oral Skills
            "Oral presentation skills", "Listening comprehension"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "CAPS English Home Language"
    },
    {
        gradeLevels: ["10", "11", "12"],
        subject: "English First Additional Language",
        topics: [
            // Literature (will be filtered by student selections)
            "Poetry analysis", "Novel study", "Drama study", "Short story analysis",
            // Language and Grammar
            "Parts of Speech", "Nouns and Pronouns", "Verbs and Tenses", "Adjectives and Adverbs", 
            "Sentence Structure", "Punctuation", "Language in context", "Vocabulary building",
            // Reading and Writing
            "Comprehension strategies", "Summary skills", "Writing descriptive essays", "Writing narrative essays",
            "Writing transactional texts (dialogue, formal letters, reports)", "Visual literacy",
            // Oral Skills
            "Listening and speaking skills", "Pronunciation and intonation"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "CAPS English FAL"
    },
    {
        gradeLevels: ["10", "11", "12"],
        subject: "Afrikaans Huistaal",
        topics: [
            // Literatuur (sal gefilter word volgens student se keuses)
            "Poësie-ontleding", "Romanstudie", "Dramastudie", "Kortverhaalanálise", "Filmstudie",
            // Taal en Grammatika
            "Woordsoorte", "Selfstandige naamwoorde en voornaamwoorde", "Werkwoorde en tye", "Byvoeglike naamwoorde en bywoorde",
            "Voorsetsels en voegwoorde", "Sinsbou", "Aktief en passief", "Direkte en indirekte rede", "Leestekens", "Taalbeelde",
            // Lees en Skryf
            "Begripsvaardighede", "Opsomming skryf", "Opstel skryf (verhalend, beskrywend, argumentatief)",
            "Transaksionele skryfwerk (formele brief, e-pos, verslae, toesprake)", "Visuele geletterdheid (spotprente, advertensies, grafieke)",
            // Mondelinge Vaardighede
            "Mondelinge vaardighede", "Luisterbegrip"
        ],
        pastPapersLink: "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx",
        source: "CAPS Afrikaans Huistaal"
    },
    {
        gradeLevels: ["10", "11", "12"],
        subject: "Afrikaans Eerste Addisionele Taal",
        topics: [
            // Literatuur (sal gefilter word volgens student se keuses)
            "Gedigte-ontleding", "Romanstudie", "Dramastudie", "Kortverhale",
            // Taal en Grammatika
            "Woordsoorte", "Selfstandige naamwoorde", "Voornaamwoorde", "Werkwoorde en tye", 
            "Byvoeglike naamwoorde", "Bywoorde", "Sinsbou", "Leestekens", "Taal in konteks", "Woordeskat",
            // Lees en Skryf
            "Begripstoets en -strategieë", "Opsommingstrategieë", "Beskrywende opstelle", "Verhalende opstelle",
            "Transaksionele tekste (dialoog, formele brief, resensie)", "Visuele geletterdheid",
            // Mondelinge Vaardighede
            "Luister- en praatvaardighede", "Uitspraak en intonasie"
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
      
      // Foundation Phase (Grades 1-3) 
      if (grade === "1") {
        if (lesson.subject === "Mathematics") {
          gradeTopics = lesson.topics.slice(0, 6); // Grade 1: first 6 topics
        } else if (lesson.subject === "English Home Language") {
          gradeTopics = lesson.topics.slice(0, 7); // Grade 1: first 7 topics
        } else if (lesson.subject === "English First Additional Language") {
          gradeTopics = lesson.topics.slice(0, 5); // Grade 1: first 5 topics
        } else if (lesson.subject === "Life Skills") {
          gradeTopics = lesson.topics.slice(0, 4); // Grade 1: first 4 topics
        } else {
          gradeTopics = lesson.topics;
        }
      } else if (grade === "2") {
        if (lesson.subject === "Mathematics") {
          gradeTopics = lesson.topics.slice(6, 12); // Grade 2: next 6 topics
        } else if (lesson.subject === "English Home Language") {
          gradeTopics = lesson.topics.slice(7, 13); // Grade 2: next 6 topics
        } else if (lesson.subject === "English First Additional Language") {
          gradeTopics = lesson.topics.slice(5, 10); // Grade 2: next 5 topics
        } else if (lesson.subject === "Life Skills") {
          gradeTopics = lesson.topics.slice(4, 8); // Grade 2: next 4 topics
        } else {
          gradeTopics = lesson.topics;
        }
      } else if (grade === "3") {
        if (lesson.subject === "Mathematics") {
          gradeTopics = lesson.topics.slice(12, 18); // Grade 3: last 6 topics
        } else if (lesson.subject === "English Home Language") {
          gradeTopics = lesson.topics.slice(13, 18); // Grade 3: last 5 topics
        } else if (lesson.subject === "English First Additional Language") {
          gradeTopics = lesson.topics.slice(10, 15); // Grade 3: last 5 topics
        } else if (lesson.subject === "Life Skills") {
          gradeTopics = lesson.topics.slice(8, 12); // Grade 3: last 4 topics
        } else {
          gradeTopics = lesson.topics;
        }
      } else if (grade === "4") {
        if (lesson.subject === "Mathematics") {
          gradeTopics = lesson.topics.slice(0, 5); // Grade 4: first 5 topics
        } else if (lesson.subject === "English Home Language") {
          gradeTopics = lesson.topics.slice(0, 6); // Grade 4: first 6 topics
        } else if (lesson.subject === "English First Additional Language") {
          gradeTopics = lesson.topics.slice(0, 5); // Grade 4: first 5 topics
        } else {
          // Life Skills (Grade 4-6), Natural Sciences and Technology, Social Sciences - all topics
          gradeTopics = lesson.topics;
        }
      } else if (grade === "5") {
        if (lesson.subject === "Mathematics") {
          gradeTopics = lesson.topics.slice(5, 10); // Grade 5: next 5 topics
        } else if (lesson.subject === "English Home Language") {
          gradeTopics = lesson.topics.slice(6, 10); // Grade 5: next 4 topics
        } else if (lesson.subject === "English First Additional Language") {
          gradeTopics = lesson.topics.slice(5, 10); // Grade 5: next 5 topics
        } else {
          gradeTopics = lesson.topics;
        }
      } else if (grade === "6") {
        if (lesson.subject === "Mathematics") {
          gradeTopics = lesson.topics.slice(10, 15); // Grade 6: last 5 topics
        } else if (lesson.subject === "English Home Language") {
          gradeTopics = lesson.topics.slice(10, 14); // Grade 6: last 4 topics
        } else if (lesson.subject === "English First Additional Language") {
          gradeTopics = lesson.topics.slice(10, 15); // Grade 6: last 5 topics
        } else {
          gradeTopics = lesson.topics;
        }
      } else if (grade === "7") {
        if (lesson.subject === "Mathematics") {
          gradeTopics = lesson.topics.slice(0, 5); // Grade 7: first 5 topics
        } else if (lesson.subject === "English Home Language") {
          gradeTopics = lesson.topics.slice(0, 4); // Grade 7: first 4 topics
        } else if (lesson.subject === "Natural Sciences") {
          gradeTopics = lesson.topics.slice(0, 4); // Grade 7: first 4 topics
        } else {
          gradeTopics = lesson.topics;
        }
      } else if (grade === "8") {
        if (lesson.subject === "Mathematics") {
          gradeTopics = lesson.topics.slice(5, 10); // Grade 8: next 5 topics
        } else if (lesson.subject === "English Home Language") {
          gradeTopics = lesson.topics.slice(4, 8); // Grade 8: next 4 topics
        } else if (lesson.subject === "Natural Sciences") {
          gradeTopics = lesson.topics.slice(4, 8); // Grade 8: next 4 topics
        } else {
          gradeTopics = lesson.topics;
        }
      } else if (grade === "9") {
        if (lesson.subject === "Mathematics") {
          gradeTopics = lesson.topics.slice(10, 15); // Grade 9: last 5 topics
        } else if (lesson.subject === "English Home Language") {
          gradeTopics = lesson.topics.slice(8, 12); // Grade 9: last 4 topics
        } else if (lesson.subject === "Natural Sciences") {
          gradeTopics = lesson.topics.slice(8, 12); // Grade 9: last 4 topics
        } else {
          gradeTopics = lesson.topics;
        }
      } else if (grade === "10") {
        gradeTopics = lesson.subject === "Mathematics" ? lesson.topics.slice(0, 7) :
                      lesson.subject === "Physical Sciences" ? [...lesson.topics.slice(0, 4), ...lesson.topics.slice(4, 9)] :
                      lesson.subject === "Life Sciences" ? lesson.topics.slice(0, 6) :
                      lesson.subject === "Geography" ? lesson.topics.slice(0, 6) :
                      lesson.topics;
      } else if (grade === "11") {
        gradeTopics = lesson.subject === "Mathematics" ? lesson.topics.slice(7, 13) :
                      lesson.subject === "Physical Sciences" ? [...lesson.topics.slice(4, 8), ...lesson.topics.slice(9, 14)] :
                      lesson.subject === "Life Sciences" ? lesson.topics.slice(6, 13) :
                      lesson.subject === "Geography" ? lesson.topics.slice(6, 10) :
                      lesson.topics;
      } else if (grade === "12") {
        gradeTopics = lesson.subject === "Mathematics" ? lesson.topics.slice(13, 22) :
                      lesson.subject === "Physical Sciences" ? [...lesson.topics.slice(14, 20), ...lesson.topics.slice(20)] :
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
  // Mathematical Literacy
  {
    id: "lesson-mathematical-literacy-10",
    gradeLevel: "10",
    subject: "Mathematical Literacy",
    topics: [
      "Numbers and calculations in context",
      "Finance (income, expenditure, budgets)",
      "Basic financial documents",
      "Measurement (length, area, volume, mass)",
      "Data handling and representation",
      "Probability and uncertainty"
    ],
  },
  {
    id: "lesson-mathematical-literacy-11",
    gradeLevel: "11",
    subject: "Mathematical Literacy",
    topics: [
      "Financial documents and tariffs",
      "Income and expenditure",
      "Taxation (income tax, VAT)",
      "Banking and financial services",
      "Measurement and conversions",
      "Statistics and data analysis",
      "Probability"
    ],
  },
  {
    id: "lesson-mathematical-literacy-12",
    gradeLevel: "12",
    subject: "Mathematical Literacy",
    topics: [
      "Financial mathematics (interest, loans, investments)",
      "Income tax and deductions",
      "VAT calculations",
      "Data handling and analysis",
      "Probability and predictions",
      "Maps, plans and scale",
      "Patterns and relationships"
    ],
  },
  // Economics
  {
    id: "lesson-economics-10",
    gradeLevel: "10",
    subject: "Economics",
    topics: [
      "Basic economic concepts",
      "Circular flow of goods and services",
      "Markets (demand and supply)",
      "Price mechanism",
      "Economic systems",
      "Government and the economy"
    ],
  },
  {
    id: "lesson-economics-11",
    gradeLevel: "11",
    subject: "Economics",
    topics: [
      "Microeconomics",
      "Production and costs",
      "Market structures",
      "Market failures",
      "Macroeconomics basics",
      "Economic indicators",
      "Fiscal and monetary policy"
    ],
  },
  {
    id: "lesson-economics-12",
    gradeLevel: "12",
    subject: "Economics",
    topics: [
      "Perfect markets",
      "Imperfect markets",
      "Market failures",
      "Macroeconomics",
      "Economic growth and development",
      "South African economic context",
      "International economics"
    ],
  },
  // History
  {
    id: "lesson-history-10",
    gradeLevel: "10",
    subject: "History",
    topics: [
      "The world around 1600",
      "Expansion of European settlement",
      "The French Revolution",
      "Transformations in southern Africa",
      "Colonial expansion in the 19th century",
      "South African War and Union"
    ],
  },
  {
    id: "lesson-history-11",
    gradeLevel: "11",
    subject: "History",
    topics: [
      "Communism in Russia 1900-1940",
      "Capitalism in the USA 1900-1940",
      "Nationalisms: China and Vietnam",
      "Apartheid in South Africa",
      "Resistance movements",
      "The coming of democracy in South Africa"
    ],
  },
  {
    id: "lesson-history-12",
    gradeLevel: "12",
    subject: "History",
    topics: [
      "The Cold War",
      "Independent Africa",
      "Civil Society protests 1950s-1970s",
      "The end of the Cold War and new world order",
      "Coming of democracy in South Africa and government since 1994",
      "The end of Apartheid and the Truth and Reconciliation Commission"
    ],
  },
  // Information Technology
  {
    id: "lesson-information-technology-10",
    gradeLevel: "10",
    subject: "Information Technology",
    topics: [
      "Computer systems and architecture",
      "Data representation",
      "Algorithms and flowcharts",
      "Programming concepts",
      "Database concepts",
      "Network technologies",
      "Internet and web technologies"
    ],
  },
  {
    id: "lesson-information-technology-11",
    gradeLevel: "11",
    subject: "Information Technology",
    topics: [
      "Systems Analysis and Design",
      "Database design and implementation",
      "Programming and problem solving",
      "Network technologies and security",
      "Internet technologies",
      "Social implications of IT",
      "Project management"
    ],
  },
  {
    id: "lesson-information-technology-12",
    gradeLevel: "12",
    subject: "Information Technology",
    topics: [
      "Systems Analysis and Design",
      "Database management",
      "Advanced programming",
      "Network architecture and security",
      "Web development",
      "IT project management",
      "IT careers and ethics"
    ],
  },
  // Computer Applications Technology (CAT)
  {
    id: "lesson-cat-10",
    gradeLevel: "10",
    subject: "Computer Applications Technology (CAT)",
    topics: [
      "Computer systems and software",
      "File management",
      "Word processing",
      "Spreadsheets",
      "Presentation software",
      "Internet and email",
      "Computer networks basics"
    ],
  },
  {
    id: "lesson-cat-11",
    gradeLevel: "11",
    subject: "Computer Applications Technology (CAT)",
    topics: [
      "Advanced word processing",
      "Advanced spreadsheets and data analysis",
      "Database applications",
      "Presentation design",
      "Web design basics",
      "Digital citizenship",
      "IT problem solving"
    ],
  },
  {
    id: "lesson-cat-12",
    gradeLevel: "12",
    subject: "Computer Applications Technology (CAT)",
    topics: [
      "Integrated applications",
      "Advanced spreadsheet analysis",
      "Database design and queries",
      "Web design and development",
      "Project management tools",
      "Digital communication and collaboration",
      "IT careers and responsibilities"
    ],
  },
  // Tourism
  {
    id: "lesson-tourism-10",
    gradeLevel: "10",
    subject: "Tourism",
    topics: [
      "Tourism sectors",
      "Tourism geography",
      "Tourist attractions",
      "Tourism service providers",
      "Sustainable and responsible tourism",
      "Cultural and heritage tourism",
      "Tourism marketing"
    ],
  },
  {
    id: "lesson-tourism-11",
    gradeLevel: "11",
    subject: "Tourism",
    topics: [
      "Domestic, regional and international tourism",
      "Map work and tour planning",
      "Foreign exchange",
      "Climate and weather in tourism",
      "Culture and heritage tourism",
      "Sustainable tourism",
      "Marketing in tourism"
    ],
  },
  {
    id: "lesson-tourism-12",
    gradeLevel: "12",
    subject: "Tourism",
    topics: [
      "Tourism geography and planning",
      "Foreign exchange and travel documents",
      "Sustainable and responsible tourism",
      "Culture and heritage in tourism",
      "Marketing and communication in tourism",
      "Tourism trends and future",
      "Tourism career opportunities"
    ],
  },
  // Consumer Studies
  {
    id: "lesson-consumer-studies-10",
    gradeLevel: "10",
    subject: "Consumer Studies",
    topics: [
      "Consumer rights and responsibilities",
      "Food and nutrition",
      "Textiles and clothing",
      "Personal finance and budgeting",
      "Sustainable consumer choices",
      "Food safety and hygiene",
      "Textile care and maintenance"
    ],
  },
  {
    id: "lesson-consumer-studies-11",
    gradeLevel: "11",
    subject: "Consumer Studies",
    topics: [
      "Consumer protection and legislation",
      "Nutrition and meal planning",
      "Textiles: fibres, fabrics and finishes",
      "Financial management",
      "Sustainable living",
      "Food preparation and presentation",
      "Clothing construction and design"
    ],
  },
  {
    id: "lesson-consumer-studies-12",
    gradeLevel: "12",
    subject: "Consumer Studies",
    topics: [
      "Consumer rights and responsibilities",
      "Advanced nutrition and diet planning",
      "Textile technology and innovation",
      "Financial planning and investment",
      "Sustainable and ethical consumerism",
      "Entrepreneurship in consumer industries",
      "Career opportunities in consumer-related fields"
    ],
  },
  // Hospitality Studies
  {
    id: "lesson-hospitality-studies-10",
    gradeLevel: "10",
    subject: "Hospitality Studies",
    topics: [
      "Introduction to hospitality",
      "Food safety and hygiene",
      "Basic food preparation",
      "Service skills",
      "Kitchen operations",
      "Customer service",
      "Hospitality career opportunities"
    ],
  },
  {
    id: "lesson-hospitality-studies-11",
    gradeLevel: "11",
    subject: "Hospitality Studies",
    topics: [
      "Food production and presentation",
      "Advanced food preparation techniques",
      "Beverage service",
      "Restaurant service",
      "Kitchen management",
      "Menu planning and costing",
      "Customer relations"
    ],
  },
  {
    id: "lesson-hospitality-studies-12",
    gradeLevel: "12",
    subject: "Hospitality Studies",
    topics: [
      "Advanced food production",
      "Hospitality operations management",
      "Event planning and management",
      "Restaurant and food service management",
      "Hospitality marketing",
      "Financial management in hospitality",
      "Hospitality career pathways"
    ],
  },
  // Engineering Graphics & Design
  {
    id: "lesson-egd-10",
    gradeLevel: "10",
    subject: "Engineering Graphics & Design",
    topics: [
      "Basic drawing principles",
      "Orthographic projection",
      "Isometric and oblique drawing",
      "Geometric construction",
      "Scale drawings",
      "Dimensioning and annotation",
      "CAD introduction"
    ],
  },
  {
    id: "lesson-egd-11",
    gradeLevel: "11",
    subject: "Engineering Graphics & Design",
    topics: [
      "Advanced orthographic projection",
      "Sectional views",
      "Auxiliary views",
      "Development of surfaces",
      "Geometric tolerancing",
      "CAD applications",
      "Design principles"
    ],
  },
  {
    id: "lesson-egd-12",
    gradeLevel: "12",
    subject: "Engineering Graphics & Design",
    topics: [
      "Advanced drawing techniques",
      "Assembly drawings",
      "Detail drawings",
      "Geometric dimensioning and tolerancing",
      "Computer-aided design (CAD)",
      "Design projects",
      "Engineering communication"
    ],
  },
  // Natural Sciences (Grades 10-12)
  {
    id: "lesson-natural-sciences-10",
    gradeLevel: "10",
    subject: "Natural Sciences",
    topics: [
      "Life and living (cells, tissues, organs)",
      "Matter and materials (atoms, elements, compounds)",
      "Energy and change (mechanical energy, thermal energy)",
      "Earth and beyond (solar system, Earth's processes)",
      "Ecosystems and interactions",
      "Chemical reactions"
    ],
  },
  {
    id: "lesson-natural-sciences-11",
    gradeLevel: "11",
    subject: "Natural Sciences",
    topics: [
      "Life processes (photosynthesis, respiration)",
      "Matter and materials (chemical bonding, acids and bases)",
      "Energy and change (work, power, energy transfer)",
      "Earth and beyond (atmosphere, climate)",
      "Biodiversity and classification",
      "Environmental studies"
    ],
  },
  {
    id: "lesson-natural-sciences-12",
    gradeLevel: "12",
    subject: "Natural Sciences",
    topics: [
      "Advanced life processes",
      "Matter and materials (organic chemistry basics)",
      "Energy and change (electrical circuits, energy resources)",
      "Earth and beyond (geology, environmental systems)",
      "Scientific investigations",
      "Applications of natural sciences"
    ],
  },
  // Social Sciences (Grades 10-12)
  {
    id: "lesson-social-sciences-10",
    gradeLevel: "10",
    subject: "Social Sciences",
    topics: [
      "History: The world around 1600",
      "Geography: Map skills and geographical techniques",
      "History: Expansion of European settlement",
      "Geography: Physical geography (rivers, mountains, climate)",
      "History: Transformations in southern Africa",
      "Geography: Human geography (population, settlements)",
      "Integrated studies: Historical and geographical perspectives"
    ],
  },
  {
    id: "lesson-social-sciences-11",
    gradeLevel: "11",
    subject: "Social Sciences",
    topics: [
      "History: Communism in Russia and capitalism in USA",
      "Geography: Economic geography and development",
      "History: Apartheid in South Africa",
      "Geography: Environmental geography",
      "History: Resistance movements",
      "Geography: Urban and rural geography",
      "Integrated studies: Contemporary social issues"
    ],
  },
  {
    id: "lesson-social-sciences-12",
    gradeLevel: "12",
    subject: "Social Sciences",
    topics: [
      "History: The Cold War and its impact",
      "Geography: Regional geography of South Africa",
      "History: The end of Apartheid and democracy",
      "Geography: Global geography and development",
      "History: Contemporary world history",
      "Geography: Geographical skills and fieldwork",
      "Integrated studies: Research skills in social sciences"
    ],
  },
  // Technology (Grades 10-12)
  {
    id: "lesson-technology-10",
    gradeLevel: "10",
    subject: "Technology",
    topics: [
      "Introduction to technology systems",
      "Design process and problem solving",
      "Structures and mechanisms",
      "Electrical and electronic systems",
      "Materials processing",
      "Tools and equipment",
      "Technology and society"
    ],
  },
  {
    id: "lesson-technology-11",
    gradeLevel: "11",
    subject: "Technology",
    topics: [
      "Advanced design processes",
      "Mechanical systems and control",
      "Electronic systems and programming",
      "Materials science and selection",
      "Manufacturing processes",
      "Engineering graphics",
      "Technology projects and applications"
    ],
  },
  {
    id: "lesson-technology-12",
    gradeLevel: "12",
    subject: "Technology",
    topics: [
      "Innovation and design thinking",
      "Advanced mechanical systems",
      "Digital systems and automation",
      "Advanced materials and manufacturing",
      "Technology project management",
      "Entrepreneurship in technology",
      "Technology careers and future trends"
    ],
  },
  // Economic & Management Sciences (Grades 10-12)
  {
    id: "lesson-economic-management-10",
    gradeLevel: "10",
    subject: "Economic & Management Sciences",
    topics: [
      "Economic systems and circular flow",
      "Business management basics",
      "Financial literacy",
      "Markets and prices",
      "Entrepreneurship fundamentals",
      "Business forms and legal aspects",
      "Personal financial management"
    ],
  },
  {
    id: "lesson-economic-management-11",
    gradeLevel: "11",
    subject: "Economic & Management Sciences",
    topics: [
      "Microeconomics and market structures",
      "Business operations and functions",
      "Financial management",
      "Human resources management",
      "Marketing principles",
      "Production and operations management",
      "Economic indicators and policy"
    ],
  },
  {
    id: "lesson-economic-management-12",
    gradeLevel: "12",
    subject: "Economic & Management Sciences",
    topics: [
      "Macroeconomics and economic policy",
      "Strategic business management",
      "Financial analysis and planning",
      "Business ethics and corporate governance",
      "International business",
      "Business planning and entrepreneurship",
      "Economic development and growth"
    ],
  },
  // Life Orientation (Grades 10-12)
  {
    id: "lesson-life-orientation-10",
    gradeLevel: "10",
    subject: "Life Orientation",
    topics: [
      "Development of the self in society",
      "Social and environmental responsibility",
      "Health, social and environmental responsibility",
      "Physical education and movement",
      "Study skills and career exploration",
      "Constitutional rights and responsibilities",
      "Life skills for healthy living"
    ],
  },
  {
    id: "lesson-life-orientation-11",
    gradeLevel: "11",
    subject: "Life Orientation",
    topics: [
      "Development of the self in society",
      "Democracy and human rights",
      "Social and environmental responsibility",
      "Physical education and wellness",
      "Career planning and decision making",
      "Stress management and coping skills",
      "Leadership and citizenship"
    ],
  },
  {
    id: "lesson-life-orientation-12",
    gradeLevel: "12",
    subject: "Life Orientation",
    topics: [
      "Self-awareness and personal development",
      "Citizenship and democracy",
      "Social and environmental responsibility",
      "Physical education and lifelong wellness",
      "Career preparation and job readiness",
      "Life skills for independence",
      "Transition to higher education and work"
    ],
  },
  // Creative Arts (Grades 10-12)
  {
    id: "lesson-creative-arts-10",
    gradeLevel: "10",
    subject: "Creative Arts",
    topics: [
      "Visual arts: Elements and principles of design",
      "Performing arts: Drama and theatre",
      "Music: Fundamentals of music theory",
      "Dance: Basic movement and expression",
      "Art history and appreciation",
      "Creative processes and techniques",
      "Arts in culture and society"
    ],
  },
  {
    id: "lesson-creative-arts-11",
    gradeLevel: "11",
    subject: "Creative Arts",
    topics: [
      "Visual arts: Advanced techniques and media",
      "Performing arts: Character development and staging",
      "Music: Composition and arrangement",
      "Dance: Choreography and performance",
      "Arts criticism and analysis",
      "Contemporary arts practices",
      "Arts and identity"
    ],
  },
  {
    id: "lesson-creative-arts-12",
    gradeLevel: "12",
    subject: "Creative Arts",
    topics: [
      "Visual arts: Portfolio development and exhibition",
      "Performing arts: Production and direction",
      "Music: Performance and recording",
      "Dance: Advanced choreography",
      "Arts research and theory",
      "Professional arts practice",
      "Arts careers and pathways"
    ],
  },
  // Life Skills (Grades 10-12)
  {
    id: "lesson-life-skills-10",
    gradeLevel: "10",
    subject: "Life Skills",
    topics: [
      "Personal and social well-being",
      "Physical education and movement",
      "Creative arts integration",
      "Study skills and organization",
      "Communication and relationships",
      "Health and safety",
      "Personal responsibility and decision making"
    ],
  },
  {
    id: "lesson-life-skills-11",
    gradeLevel: "11",
    subject: "Life Skills",
    topics: [
      "Personal development and self-awareness",
      "Physical education and fitness",
      "Creative expression",
      "Career and study planning",
      "Social responsibility",
      "Stress management",
      "Leadership and teamwork"
    ],
  },
  {
    id: "lesson-life-skills-12",
    gradeLevel: "12",
    subject: "Life Skills",
    topics: [
      "Self-management and independence",
      "Physical wellness and lifelong activity",
      "Creative problem solving",
      "Career readiness and planning",
      "Civic responsibility",
      "Life transition skills",
      "Preparation for adulthood"
    ],
  },
  // Natural Sciences and Technology (Grades 10-12)
  {
    id: "lesson-natural-sciences-tech-10",
    gradeLevel: "10",
    subject: "Natural Sciences and Technology",
    topics: [
      "Life processes and living things",
      "Matter and materials",
      "Energy and movement",
      "Planet Earth and beyond",
      "Technology processes and systems",
      "Structures and mechanisms",
      "Processing and manufacturing"
    ],
  },
  {
    id: "lesson-natural-sciences-tech-11",
    gradeLevel: "11",
    subject: "Natural Sciences and Technology",
    topics: [
      "Advanced life processes",
      "Chemistry and materials science",
      "Energy systems and conservation",
      "Earth systems and processes",
      "Advanced technology systems",
      "Design and innovation",
      "Technology and environment"
    ],
  },
  {
    id: "lesson-natural-sciences-tech-12",
    gradeLevel: "12",
    subject: "Natural Sciences and Technology",
    topics: [
      "Integrated science investigations",
      "Advanced materials and processes",
      "Sustainable energy and technology",
      "Environmental science and technology",
      "Innovation and design thinking",
      "Technology project development",
      "Science, technology and society"
    ],
  },
];

type SampleQuestion = { question: string, answer: string };

export const sampleQuestionsBySubject: Record<string, Record<string, SampleQuestion[]>> = {
  "Mathematics": {
    "1": [
      { question: "What is 1 + 1?", answer: "2" },
      { question: "Count the shapes: 🔵🔵⭐", answer: "3" },
      { question: "Which number is bigger: 5 or 3?", answer: "5" },
      { question: "If you have 2 apples and get 1 more, how many apples do you have?", answer: "3" }
    ],
    "2": [
      { question: "What is 10 - 4?", answer: "6" },
      { question: "What is the next number: 2, 4, 6, __?", answer: "8" },
      { question: "How many tens are in 30?", answer: "3" },
      { question: "A farmer has 5 chickens and 3 cows. How many animals in total?", answer: "8" }
    ],
    "3": [
      { question: "What is 5 multiplied by 3?", answer: "15" },
      { question: "What is 20 divided by 4?", answer: "5" },
      { question: "How many sides does a triangle have?", answer: "3" },
      { question: "Round 27 to the nearest 10.", answer: "30" }
    ],
    "4": [
      { question: "What is 3/4 as a decimal?", answer: "0.75" },
      { question: "Find the area of a square with a side length of 5 cm.", answer: "25 cm²" },
      { question: "What is 7 x 8?", answer: "56" },
      { question: "If a movie starts at 2:00 PM and is 90 minutes long, when does it end?", answer: "3:30 PM" }
    ],
    "5": [
      { question: "What is the lowest common multiple (LCM) of 4 and 6?", answer: "12" },
      { question: "Convert 2.5 kilograms to grams.", answer: "2500 grams" },
      { question: "What is 15% of 200?", answer: "30" },
      { question: "Identify the type of angle that is greater than 90 degrees but less than 180 degrees.", answer: "Obtuse angle" }
    ],
    "6": [
      { question: "Simplify the ratio 18:24.", answer: "3:4" },
      { question: "Solve for x: x + 15 = 40", answer: "x = 25" },
      { question: "Calculate the average of these numbers: 10, 20, 30, 40.", answer: "25" },
      { question: "What is the volume of a cube with a side length of 3 cm?", answer: "27 cm³" }
    ],
    "7": [
      { question: "What is -8 + 15?", answer: "7" },
      { question: "Simplify the expression: 3(x + 2y).", answer: "3x + 6y" },
      { question: "Find the value of π (pi) to two decimal places.", answer: "3.14" },
      { question: "If a circle has a radius of 5 cm, what is its circumference?", answer: "10π cm or approximately 31.42 cm" }
    ],
    "8": [
      { question: "Simplify the expression: 2x²y + 4x²y - x²y.", answer: "5x²y" },
      { question: "Solve for y: 4y - 7 = 21", answer: "y = 7" },
      { question: "What is the theorem of Pythagoras?", answer: "In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides (a² + b² = c²)." },
      { question: "Calculate 5³.", answer: "125" }
    ],
    "9": [
      { question: "Factorise: x² - 9", answer: "(x - 3)(x + 3)" },
      { question: "Find the gradient of the line passing through points (2, 3) and (4, 7).", answer: "2" },
      { question: "Solve the simultaneous equations: y = 2x and x + y = 9.", answer: "x = 3, y = 6" },
      { question: "What is the surface area of a sphere with a radius 'r'?", answer: "4πr²" }
    ],
    "10": [
      { question: "Factorize the quadratic expression: x² - 5x + 6", answer: "(x-2)(x-3)" },
      { question: "Simplify: (x³)²", answer: "x⁶" },
      { question: "In a right-angled triangle, if sin(θ) = 3/5, what is cos(θ)?", answer: "4/5" },
      { question: "What is the general equation of a straight line?", answer: "y = mx + c" }
    ],
    "11": [
      { question: "Solve the inequality: 2x - 1 < 7", answer: "x < 4" },
      { question: "What is the nature of the roots of the equation x² + 4x + 4 = 0?", answer: "Real, rational and equal" },
      { question: "Find the sum of the first 10 terms of the arithmetic sequence 2, 5, 8, ...", answer: "155" },
      { question: "What does the sine rule state in a triangle?", answer: "a/sin(A) = b/sin(B) = c/sin(C)" }
    ],
    "12": [
      { question: "Find the derivative of f(x) = 4x³ - 5x² + 2x - 10.", answer: "f'(x) = 12x² - 10x + 2" },
      { question: "What is the sum to infinity of a geometric series with first term a=4 and common ratio r=1/2?", answer: "8" },
      { question: "Given P(A) = 0.5, P(B) = 0.4 and P(A and B) = 0.2, find P(A or B).", answer: "0.7" },
      { question: "If you invest R1000 at 5% p.a. simple interest, how much will you have after 3 years?", answer: "R1150" }
    ],
  },
  "Physical Sciences": {
    "1": [
      { question: "Is wood a solid, liquid, or gas?", answer: "Solid" },
      { question: "What happens to water when you freeze it?", answer: "It turns into a solid (ice)." },
      { question: "Name a source of heat.", answer: "The sun, fire, or a heater." },
      { question: "What is a magnet?", answer: "An object that can pull on certain types of metal." }
    ],
    "2": [
      { question: "What are the three states of matter?", answer: "Solid, liquid, and gas." },
      { question: "What is a mixture?", answer: "A substance made by combining two or more different materials in such a way that no chemical reaction occurs." },
      { question: "Why does a ball fall to the ground when you drop it?", answer: "Because of gravity." },
      { question: "What is needed to make a shadow?", answer: "A light source, an object to block the light, and a surface for the shadow to fall on." }
    ],
    "3": [
      { question: "What is the difference between melting and freezing?", answer: "Melting is a solid turning into a liquid. Freezing is a liquid turning into a solid." },
      { question: "What is a conductor of electricity?", answer: "A material that allows electricity to pass through it, like copper wire." },
      { question: "What is a force?", answer: "A push or a pull." },
      { question: "How does a plant get its energy?", answer: "Through photosynthesis, using sunlight." }
    ],
    "4": [
      { question: "What is an atom?", answer: "The smallest particle of a chemical element that can exist." },
      { question: "What are the main parts of an atom?", answer: "Protons, neutrons, and electrons." },
      { question: "What is the formula for water?", answer: "H₂O" },
      { question: "What is energy?", answer: "The ability to do work." }
    ],
    "5": [
      { question: "What is the periodic table?", answer: "A table of the chemical elements arranged in order of atomic number." },
      { question: "What is the chemical symbol for gold?", answer: "Au" },
      { question: "What is a chemical reaction?", answer: "A process that leads to the chemical transformation of one set of chemical substances to another." },
      { question: "What is the difference between a physical and chemical change?", answer: "A physical change does not create a new substance, while a chemical change does." }
    ],
    "6": [
      { question: "What is an acid?", answer: "A chemical substance that neutralizes alkalis, dissolves some metals, and turns litmus red; typically, a corrosive or sour-tasting liquid of this kind." },
      { question: "What is a base?", answer: "A substance that can neutralize the acid by reacting with hydrogen ions." },
      { question: "What is a neutral pH?", answer: "A pH of 7." },
      { question: "What is an indicator in chemistry?", answer: "A substance that changes color in the presence of an acid or a base." }
    ],
    "7": [
      { question: "What is a fossil fuel?", answer: "A natural fuel such as coal or gas, formed in the geological past from the remains of living organisms." },
      { question: "What is renewable energy?", answer: "Energy from a source that is not depleted when used, such as wind or solar power." },
      { question: "What is Newton's First Law?", answer: "An object will remain at rest or in uniform motion in a straight line unless acted upon by an external force." },
      { question: "What is friction?", answer: "The resistance that one surface or object encounters when moving over another." }
    ],
    "8": [
      { question: "What is the law of conservation of energy?", answer: "Energy cannot be created or destroyed, only converted from one form to another." },
      { question: "What is the difference between mass and weight?", answer: "Mass is the amount of matter in an object, while weight is the force of gravity on an object." },
      { question: "What is a covalent bond?", answer: "A chemical bond that involves the sharing of electron pairs between atoms." },
      { question: "What is stoichiometry?", answer: "The calculation of reactants and products in chemical reactions." }
    ],
    "9": [
      { question: "What is an ionic bond?", answer: "A type of chemical bond that involves the electrostatic attraction between oppositely charged ions." },
      { question: "What is an isotope?", answer: "Atoms of the same element that have different numbers of neutrons." },
      { question: "What is the formula for calculating speed?", answer: "Speed = Distance / Time." },
      { question: "What is acceleration?", answer: "The rate of change of velocity per unit of time." }
    ],
    "10": [
      { question: "What is the difference between a scalar and a vector quantity?", answer: "A scalar has only magnitude, while a vector has both magnitude and direction." },
      { question: "State Ohm's Law.", answer: "The current through a conductor between two points is directly proportional to the voltage across the two points (V=IR)." },
      { question: "What is the purpose of the periodic table?", answer: "To organize elements based on their atomic number, electron configuration, and recurring chemical properties." },
      { question: "Define a mole in chemistry.", answer: "A standard scientific unit for measuring large quantities of very small entities such as atoms, molecules, or other specified particles." }
    ],
    "11": [
      { question: "What is intermolecular force?", answer: "The forces of attraction or repulsion which act between neighboring particles (atoms, molecules, or ions)." },
      { question: "State Newton's Second Law of Motion.", answer: "The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass (F=ma)." },
      { question: "What is electrostatics?", answer: "The study of stationary electric charges or fields as opposed to electric currents." },
      { question: "Define 'rate of reaction'.", answer: "The speed at which a chemical reaction proceeds." }
    ],
    "12": [
      { question: "State the Doppler Effect.", answer: "The change in frequency of a wave in relation to an observer who is moving relative to the wave source." },
      { question: "What is chemical equilibrium?", answer: "The state in which both reactants and products are present in concentrations which have no further tendency to change with time." },
      { question: "What is the work-energy theorem?", answer: "The net work done by the forces on an object equals the change in its kinetic energy." },
      { question: "Define an acid and a base according to the Brønsted-Lowry theory.", answer: "An acid is a proton (H⁺) donor, and a base is a proton acceptor." }
    ],
  },
  "Life Sciences": {
    "1": [
      { question: "What are the 7 life processes?", answer: "Movement, Respiration, Sensitivity, Growth, Reproduction, Excretion, Nutrition." },
      { question: "What do plants need to grow?", answer: "Sunlight, water, air (carbon dioxide), and nutrients from the soil." },
      { question: "Name two things that all living things have.", answer: "Cells and DNA." },
      { question: "What is a food chain?", answer: "It shows how each living thing gets its food." }
    ],
    "2": [
      { question: "What is a habitat?", answer: "The natural home or environment of an animal, plant, or other organism." },
      { question: "Name the five senses.", answer: "Sight, hearing, smell, taste, and touch." },
      { question: "What is the difference between a herbivore and a carnivore?", answer: "A herbivore eats plants, and a carnivore eats other animals." },
      { question: "Why is the sun important for life on Earth?", answer: "It provides light and heat, and plants use it to make food (photosynthesis)." }
    ],
    "3": [
      { question: "What are the main parts of a plant?", answer: "Roots, stem, leaves, and flower." },
      { question: "What is pollination?", answer: "The transfer of pollen from the male part of a flower to the female part." },
      { question: "What is a skeleton?", answer: "The framework of bones inside a body that provides support and protection." },
      { question: "What is the life cycle of a butterfly?", answer: "Egg, larva (caterpillar), pupa (chrysalis), and adult." }
    ],
    "4": [
      { question: "What is a cell?", answer: "The smallest structural and functional unit of an organism." },
      { question: "What are the two main types of cells?", answer: "Prokaryotic and Eukaryotic cells." },
      { question: "What is the function of the roots of a plant?", answer: "To anchor the plant and absorb water and nutrients from the soil." },
      { question: "What is an ecosystem?", answer: "A biological community of interacting organisms and their physical environment." }
    ],
    "5": [
      { question: "What is photosynthesis?", answer: "The process by which green plants use sunlight, water, and carbon dioxide to create their own food." },
      { question: "What is the function of the cell membrane?", answer: "It controls the movement of substances in and out of the cell." },
      { question: "Name the four main types of teeth in humans.", answer: "Incisors, canines, premolars, and molars." },
      { question: "What is biodiversity?", answer: "The variety of life in the world or in a particular habitat or ecosystem." }
    ],
    "6": [
      { question: "What is the function of the nucleus in a cell?", answer: "It controls the cell's activities and contains the genetic material (DNA)." },
      { question: "What are the three main types of rock?", answer: "Igneous, sedimentary, and metamorphic." },
      { question: "What is respiration?", answer: "The process in living organisms of taking in oxygen and releasing carbon dioxide." },
      { question: "What is a balanced diet?", answer: "A diet that contains the different kinds of foods in the right quantities." }
    ],
    "7": [
      { question: "What is the difference between a plant cell and an animal cell?", answer: "Plant cells have a cell wall, chloroplasts, and a large central vacuole, while animal cells do not." },
      { question: "What are the main organs of the human respiratory system?", answer: "The lungs, trachea, bronchi, and diaphragm." },
      { question: "What is classification in biology?", answer: "The arrangement of organisms into groups on the basis of their similarities." },
      { question: "What are micro-organisms?", answer: "Very small living things, such as bacteria and viruses, that can only be seen with a microscope." }
    ],
    "8": [
      { question: "What is mitosis?", answer: "A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus." },
      { question: "What is the function of the human heart?", answer: "To pump blood through the circulatory system by contraction and dilation." },
      { question: "What is transpiration in plants?", answer: "The process of water movement through a plant and its evaporation from aerial parts, such as leaves, stems and flowers." },
      { question: "What are the components of blood?", answer: "Red blood cells, white blood cells, platelets, and plasma." }
    ],
    "9": [
      { question: "What is the function of xylem and phloem in plants?", answer: "Xylem transports water and minerals from the roots to the leaves. Phloem transports food produced in the leaves to other parts of the plant." },
      { question: "What is homeostasis?", answer: "The tendency toward a relatively stable equilibrium between interdependent elements, especially as maintained by physiological processes." },
      { question: "What is the role of the nervous system?", answer: "To transmit nerve impulses between parts of the body; it controls and coordinates all essential functions of the human body." },
      { question: "What is the difference between vertebrates and invertebrates?", answer: "Vertebrates have a backbone or spinal column, while invertebrates do not." }
    ],
    "10": [
      { question: "What is a gene?", answer: "A unit of heredity which is transferred from a parent to offspring and is held to determine some characteristic of the offspring." },
      { question: "What is the 'chemistry of life' about?", answer: "It refers to the study of the chemical substances and processes that occur in plants, animals, and microorganisms." },
      { question: "What is a tissue in biology?", answer: "A group of similar cells that work together to perform a specific function." },
      { question: "What is the function of the leaf in a plant?", answer: "It is the primary site of photosynthesis." }
    ],
    "11": [
      { question: "What is cellular respiration?", answer: "The process by which organisms combine oxygen with foodstuff molecules, diverting the chemical energy in these substances into life-sustaining activities and discarding carbon dioxide as a waste product." },
      { question: "What is meiosis?", answer: "A type of cell division that results in four daughter cells each with half the number of chromosomes of the parent cell, as in the production of gametes." },
      { question: "What is the human endocrine system?", answer: "The collection of glands that produce hormones that regulate metabolism, growth and development, tissue function, sexual function, reproduction, sleep, and mood." },
      { question: "What is an allele?", answer: "One of two or more alternative forms of a gene that arise by mutation and are found at the same place on a chromosome." }
    ],
    "12": [
      { question: "What is DNA replication?", answer: "The process by which a double-stranded DNA molecule is copied to produce two identical DNA molecules." },
      { question: "Explain Darwin's theory of evolution by natural selection.", answer: "It is the process where organisms better adapted to their environment tend to survive and produce more offspring." },
      { question: "What is the difference between a genotype and a phenotype?", answer: "A genotype is the set of genes in our DNA which is responsible for a particular trait. A phenotype is the physical expression, or characteristics, of that trait." },
      { question: "Describe the process of protein synthesis (transcription and translation).", answer: "Transcription is the process of making an RNA copy of a gene sequence. Translation is the process where the genetic code carried by mRNA is decoded to produce the specific sequence of amino acids in a polypeptide chain." }
    ],
  }
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
  },
  grade9: {
      'english-hl': {
          novels: ["Animal Farm by George Orwell", "The Giver by Lois Lowry"],
          dramas: ["A Midsummer Night's Dream by William Shakespeare"],
          poems: [
            "Invictus - William Ernest Henley",
            "If - Rudyard Kipling",
            "The Raven - Edgar Allan Poe",
            "The Charge of the Light Brigade - Alfred Lord Tennyson",
            "Hope is the thing with feathers - Emily Dickinson",
          ]
      },
      'english-fal': {
          novels: ["The Lion, the Witch and the Wardrobe by C.S. Lewis"],
          dramas: ["Much Ado About Nothing by William Shakespeare"],
          poems: [
            "The Listeners - Walter de la Mare",
            "Stopping by Woods on a Snowy Evening - Robert Frost",
            "Fire and Ice - Robert Frost",
          ]
      },
      'afrikaans-ht': {
          novels: ["Kringe in 'n Bos deur Dalene Matthee"],
          dramas: ["Passe deur Deon Opperman"],
          poems: [
            "Die kind - Jan F.E. Celliers",
            "Perspektief - Ingrid Jonker",
            "Môre, môre - C. Louis Leipoldt",
          ]
      },
      'afrikaans-eat': {
          novels: ["Fiela se Kind deur Dalene Matthee"],
          dramas: ["Mooi Maria deur PG du Plessis"],
          poems: [
            "Boereplaas - C. Louis Leipoldt",
            "Ek het opgeteken - Eugène Marais",
          ]
      }
  },
  grade8: {
      'english-hl': {
          novels: ["Charlotte's Web by E.B. White", "The Hobbit by J.R.R. Tolkien"],
          dramas: ["Twelfth Night by William Shakespeare"],
          poems: [
            "Jabberwocky - Lewis Carroll",
            "The Owl and the Pussy-cat - Edward Lear",
            "Wind on the Hill - A.A. Milne",
          ]
      },
      'english-fal': {
          novels: ["The Secret Garden by Frances Hodgson Burnett"],
          dramas: ["As You Like It by William Shakespeare"],
          poems: [
            "Where the Wild Things Are - Maurice Sendak",
            "Silver - Walter de la Mare",
          ]
      },
      'afrikaans-ht': {
          novels: ["Kringe in 'n Bos deur Dalene Matthee"],
          dramas: ["Die Huweliksaanzoek deur Herman Charles Bosman"],
          poems: [
            "Winternag - Eugène Marais",
            "Die Skip - C. Louis Leipoldt",
          ]
      },
      'afrikaans-eat': {
          novels: ["Die Wit Kat deur Chris Barnard"],
          dramas: ["Strandloper deur Reza de Wet"],
          poems: [
            "Boereplaas - C. Louis Leipoldt",
            "Veldliedjie - Eugène Marais",
          ]
      }
  }
};

/**
 * Compulsory subjects for each grade based on CAPS curriculum
 * Grades 10-12 have subject selection - no compulsory subjects defined here
 */
export const compulsorySubjectsByGrade: Record<string, {
  contentSubjects: string[];
  languageSubjects: string[];
}> = {
  // Grades 10-12 have no compulsory subjects - users select their subjects
};
