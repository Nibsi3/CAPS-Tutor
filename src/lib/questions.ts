

export interface Question {
  id: string;
  question: string;
  topic: string;
  answer?: string; // The "correct" answer for the AI to reference
}

export const allSubjectsForLookup = [
    "Mathematics",
    "Physical Sciences",
    "Life Sciences",
    "Accounting",
    "Business Studies",
    "Economics",
    "Geography",
    "History",
    "Information Technology",
    "Computer Applications Technology (CAT)",
    "English Home Language",
    "English First Additional Language",
    "Afrikaans Huistaal",
    "Afrikaans Eerste Addisionele Taal",
];

const allQuestions: Record<string, Question[]> = {
  // =================================
  // Grade 10 Mathematics
  // =================================
  "Mathematics": [
    // --- Grade 10 ---
    { id: 'alg-exp-1', topic: 'Algebraic expressions', question: 'Simplify the following expression: (2x + 3y) - (x - 2y)' },
    { id: 'alg-exp-2', topic: 'Algebraic expressions', question: 'Expand and simplify: (x - 5)(x + 3)' },
    { id: 'alg-exp-3', topic: 'Algebraic expressions', question: 'Factorise the following expression completely: 2x² - 8' },
    { id: 'exp-g10-1', topic: 'Exponents', question: 'Simplify: 2x²y³ * 4x³y' },
    { id: 'exp-g10-5', topic: 'Exponents', question: 'Solve for x: 2ˣ = 16' },
    { id: 'np-1', topic: 'Number patterns', question: 'Find the next two terms in the sequence: 5, 8, 11, 14, ...' },
    { id: 'np-2', topic: 'Number patterns', question: 'Determine the general term (Tn) for the sequence: 3, 7, 11, 15, ...' },
    { id: 'eq-in-1', topic: 'Equations and inequalities', question: 'Solve for x: 3x - 7 = 5' },
    { id: 'eq-in-5', topic: 'Equations and inequalities', question: 'Solve for x: x² - 6x + 8 = 0' },
    { id: 'trig-1', topic: 'Trigonometry', question: 'In a right-angled triangle, if the side opposite to angle θ is 3 and the adjacent side is 4, what is the value of tan(θ)?' },
    { id: 'trig-2', topic: 'Trigonometry', question: 'What is the value of sin(30°)?' },
    { id: 'func-1', topic: 'Functions', question: 'Given f(x) = 2x - 3, find f(5).' },
    { id: 'func-4', topic: 'Functions', question: 'For the parabola y = x² - 4, what is the y-intercept?' },
    { id: 'euc-geo-1', topic: 'Euclidean geometry', question: 'State the theorem regarding the angle at the center of a circle relative to the angle at the circumference.' },
    { id: 'an-geo-1', topic: 'Analytical geometry', question: 'Find the distance between the points A(2, 3) and B(5, 7).' },
    { id: 'an-geo-3', topic: 'Analytical geometry', question: 'Calculate the gradient of the line passing through the points (1, 5) and (4, -1).' },
    { id: 'stat-2', topic: 'Statistics', question: 'Find the mean, median, and mode of the following data set: 2, 5, 5, 8, 10.' },
    { id: 'meas-1', topic: 'Measurement', question: 'Calculate the perimeter of a rectangle with length 10 cm and width 5 cm.' },
    { id: 'prob-1', topic: 'Probability', question: 'What is the probability of rolling a 4 on a standard six-sided die?' },
    // --- Grade 11 ---
    { id: 'exp-surd-1', topic: 'Exponents and surds', question: 'Simplify without a calculator: 27²/³' },
    { id: 'exp-surd-3', topic: 'Exponents and surds', question: 'Rationalise the denominator of: 4 / (√3 - 1)' },
    { id: 'exp-surd-4', topic: 'Exponents and surds', question: 'Solve for x: 3 * 2ˣ⁺¹ = 48' },
    { id: 'fin-g11-1', topic: 'Finance, growth and decay', question: 'Calculate the effective annual interest rate if the nominal rate is 12% p.a. compounded monthly.' },
    { id: 'fin-g11-2', topic: 'Finance, growth and decay', question: 'A car worth R200 000 depreciates at a rate of 15% p.a. on a reducing balance. What is the value of the car after 4 years?' },
    // --- Grade 12 ---
    { id: 'seq-1', topic: 'Sequences and series', question: 'Find the 10th term of the arithmetic sequence: 3, 7, 11, ...' },
    { id: 'seq-2', topic: 'Sequences and series', question: 'The first term of a geometric sequence is 2 and the common ratio is 3. What is the 5th term?' },
    { id: 'seq-4', topic: 'Sequences and series', question: 'Determine the sum to infinity of the geometric series: 16 + 8 + 4 + ...' },
    { id: 'func-inv-3', topic: 'Functions and inverses', question: 'Find the inverse of the function f(x) = 3x - 5. Let the inverse be g(x).' },
    { id: 'func-inv-7', topic: 'Functions and inverses', question: 'Find the inverse of the function g(x) = 2ˣ. What is this inverse function called?' },
    { id: 'calc-1', topic: 'Calculus (Differential)', question: 'Find the derivative of f(x) = x³ - 4x² + 7x - 1 from first principles.' },
    { id: 'calc-2', topic: 'Calculus (Differential)', question: 'Determine dy/dx if y = 5x⁴ - 3x⁻².' },
    { id: 'fin-math-2', topic: 'Financial mathematics', question: 'John deposits R500 every month into an account earning 6% p.a. compounded monthly. How much will he have after 5 years?' },
    { id: 'fin-math-4', topic: 'Financial mathematics', question: 'A loan of R100 000 is to be repaid with equal monthly payments over 10 years at an interest rate of 12% p.a. compounded monthly. Calculate the monthly payment.' },
    { id: 'prob-cp-2', topic: 'Probability (counting principles)', question: 'How many different 3-digit numbers can be formed using the digits 1, 2, 3, 4, 5 if repetition is allowed?' },
    { id: 'prob-cp-6', topic: 'Probability (counting principles)', question: 'In how many ways can 6 different books be arranged on a shelf?' },
  ],
  "Physical Sciences": [
      // --- Grade 10 ---
    { id: 'wave-snd-1', topic: 'Waves and sound', question: 'What is the difference between a transverse wave and a longitudinal wave?' },
    { id: 'wave-snd-4', topic: 'Waves and sound', question: 'What is the relationship between the speed, frequency, and wavelength of a wave?' },
    { id: 'light-1', topic: 'Light and optics', question: 'Is light a transverse or a longitudinal wave?' },
    { id: 'light-3', topic: 'Light and optics', question: 'State the law of reflection.' },
    { id: 'em-6', topic: 'Electricity and magnetism', question: 'Define electric current. What is its unit?' },
    { id: 'em-9', topic: 'Electricity and magnetism', question: 'State Ohm\'s Law.' },
    { id: 'mech-1', topic: 'Mechanics (vectors, motion)', question: 'What is the difference between a scalar and a vector quantity? Give an example of each.' },
    { id: 'mech-5', topic: 'Mechanics (vectors, motion)', question: 'A car accelerates from rest to 20 m/s in 5 seconds. What is its acceleration?' },
    { id: 'matter-1', topic: 'Matter and materials', question: 'Name the three main states of matter.' },
    // --- Grade 11 ---
    { id: 'newton-1', topic: 'Newton\'s Laws', question: 'State Newton\'s First Law of Motion.' },
    { id: 'newton-4', topic: 'Newton\'s Laws', question: 'State Newton\'s Second Law of Motion in words and as an equation.' },
    { id: 'es-1', topic: 'Electrostatics', question: 'State the Principle of Conservation of Charge.' },
    { id: 'es-5', topic: 'Electrostatics', question: 'State Coulomb\'s Law in words.' },
    { id: 'circ-1', topic: 'Electric circuits', question: 'State Ohm\'s Law.' },
    { id: 'circ-3', topic: 'Electric circuits', question: 'Define EMF (electromotive force) of a battery.' },
    { id: 'emag-1', topic: 'Electromagnetism', question: 'What is the relationship between electricity and magnetism discovered by Oersted?' },
    { id: 'emag-10', topic: 'Electromagnetism', question: 'What is electromagnetic induction?' },
    { id: 'stoic-1', topic: 'Stoichiometry', question: 'Define the mole.' },
    // --- Grade 12 ---
    { id: 'mom-1', topic: 'Momentum and impulse', question: 'Define momentum in words.' },
    { id: 'mom-3', topic: 'Momentum and impulse', question: 'State the principle of conservation of linear momentum.' },
    { id: 'rate-1', topic: 'Rate and extent of reactions', question: 'Define reaction rate in words.' },
    { id: 'rate-3', topic: 'Rate and extent of reactions', question: 'Explain, using the Collision Theory, why increasing the temperature increases the reaction rate.' },
    { id: 'eqm-2', topic: 'Chemical equilibrium', question: 'Define dynamic chemical equilibrium.' },
    { id: 'eqm-4', topic: 'Chemical equilibrium', question: 'State Le Chatelier\'s Principle.' },
    { id: 'acid-2', topic: 'Acids and bases', question: 'Define a Brønsted-Lowry base.' },
    { id: 'acid-8', topic: 'Acids and bases', question: 'Calculate the pH of a 0.01 mol·dm⁻³ solution of HCl.' },
    { id: 'vpm-1', topic: 'Vertical projectile motion', question: 'An object is thrown vertically upwards with an initial velocity of 20 m/s. What is its velocity at the maximum height? (Ignore air resistance)' },
    { id: 'wep-1', topic: 'Work, energy and power', question: 'Define work done by a constant force.' },
    { id: 'wep-7', topic: 'Work, energy and power', question: 'State the work-energy theorem.' },
    { id: 'doppler-1', topic: 'The Doppler effect', question: 'What is the Doppler effect?' },
  ],
  "Life Sciences": [
    // --- Grade 12 ---
    { id: 'dna-1', topic: 'DNA: The code of life', question: 'What do the letters DNA stand for?' },
    { id: 'dna-3', topic: 'DNA: The code of life', question: 'Name the three components of a DNA nucleotide.' },
    { id: 'dna-5', topic: 'DNA: The code of life', question: 'Describe the complementary base pairing rule in DNA.' },
    { id: 'dna-8', topic: 'DNA: The code of life', question: 'Briefly describe the process of DNA replication.' },
    { id: 'meiosis-1', topic: 'Meiosis', question: 'What is the main purpose of meiosis?' },
    { id: 'meiosis-4', topic: 'Meiosis', question: 'What is the difference between a diploid (2n) and a haploid (n) cell?' },
    { id: 'meiosis-8', topic: 'Meiosis', question: 'What is "crossing over" and why is it important?' },
    { id: 'gen-2', topic: 'Genetics and inheritance', question: 'Differentiate between genotype and phenotype.' },
    { id: 'gen-5', topic: 'Genetics and inheritance', question: 'State Mendel\'s Law of Segregation.' },
    { id: 'gen-11', topic: 'Genetics and inheritance', question: 'What is a sex-linked trait?' },
    { id: 'evo-1', topic: 'Evolution', question: 'What is the biological definition of evolution?' },
    { id: 'evo-3', topic: 'Evolution', question: 'List the four main principles/observations of natural selection.' },
    { id: 'evo-6', topic: 'Evolution', question: 'What are homologous structures? Give an example.' },
    { id: 'resp-1', topic: 'Responding to the environment (humans & plants)', question: 'Name the two main parts of the human nervous system.' },
    { id: 'resp-12', topic: 'Responding to the environment (humans & plants)', question: 'What is phototropism?' },
    { id: 'hr-1', topic: 'Human reproduction', question: 'Name the primary male reproductive organ that produces sperm.' },
    { id: 'hr-5', topic: 'Human reproduction', question: 'Where does fertilization typically occur in the female reproductive system?' },
  ],
};

export const getQuestionsForTopic = (topic: string, grade: number): Question[] => {
  const matchingQuestions = allQuestions[topic];
  if (!matchingQuestions) {
    return [];
  }
  // This is a simplified filter. In a real app, questions would be more explicitly tagged by grade.
  // For now, we'll return a slice based on grade to simulate grade-specific content.
  if (grade === 10) {
    return matchingQuestions.slice(0, 15);
  }
  if (grade === 11) {
    return matchingQuestions.slice(5, 20);
  }
  if (grade === 12) {
    return matchingQuestions.slice(10, 25);
  }
  return matchingQuestions;
};

    
