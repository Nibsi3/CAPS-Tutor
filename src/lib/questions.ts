
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
    "Computer Applications Technology",
    "English Home Language",
    "English First Additional Language",
    "Afrikaans Huistaal",
    "Afrikaans Eerste Addisionele Taal",
];

const allQuestions: Record<string, Question[]> = {
  // =================================
  // Mathematics
  // =================================
  "Mathematics": [
    // --- Grade 10 ---
    { id: 'math-g10-1', topic: 'Algebraic expressions', question: 'Simplify the following expression: `(3x - 2y)(x + 4y)`' },
    { id: 'math-g10-2', topic: 'Algebraic expressions', question: 'Factorise fully: `3x² - 12`' },
    { id: 'math-g10-3', topic: 'Exponents', question: 'Simplify the expression, leaving your answer with positive exponents: `(8a⁶b⁹)^(1/3) / (a⁻²b³)`' },
    { id: 'math-g10-4', topic: 'Equations and inequalities', question: 'Solve for x: `2x² - 5x = 3`' },
    { id: 'math-g10-5', topic: 'Equations and inequalities', question: 'Solve for x and y simultaneously: `y = 2x - 1` and `3x + 2y = 12`' },
    { id: 'math-g10-6', topic: 'Trigonometry', question: 'If `sin(θ) = 5/13` and θ is an acute angle, find the value of `cos(θ)` and `tan(θ)` without using a calculator.' },
    { id: 'math-g10-7', topic: 'Analytical geometry', question: 'Given points A(1, -2) and B(7, 6), determine: \na) The length of the line segment AB. \nb) The coordinates of the midpoint of AB.' },
    { id: 'math-g10-8', topic: 'Euclidean geometry', question: 'In the diagram below, O is the centre of the circle. If angle ABC = 110°, calculate the size of the reflex angle AOC.\n\n![A diagram showing a circle with center O. Points A, B, and C are on the circumference.](https://picsum.photos/seed/geom1/400/300)' },
    // --- Grade 11 ---
    { id: 'math-g11-1', topic: 'Exponents and surds', question: 'Simplify without using a calculator: `(√12 + √27) / √3`' },
    { id: 'math-g11-2', topic: 'Equations and inequalities', question: 'Solve for x: `√(2x - 1) = x - 2`' },
    { id: 'math-g11-3', topic: 'Number patterns', question: 'The first three terms of a quadratic number pattern are 6, 15, and 28. Determine the general term, Tₙ.' },
    { id: 'math-g11-4', topic: 'Functions', question: 'Given `f(x) = -x² + 4x + 5`. \na) Determine the coordinates of the turning point. \nb) Determine the x- and y-intercepts.' },
    { id: 'math-g11-5', topic: 'Finance, growth and decay', question: 'A car depreciates at a rate of 12% per annum on a reducing balance basis. If its initial value is R250 000, what is its value after 5 years?' },
    { id: 'math-g11-6', topic: 'Euclidean geometry', question: 'In the given circle with centre O, prove the theorem that states that the angle subtended by a chord at the centre is double the angle subtended by the same chord at the circumference.\n\n![A diagram for the circle geometry theorem proof](https://picsum.photos/seed/geom2/400/300)' },
    // --- Grade 12 ---
    { id: 'math-g12-1', topic: 'Sequences and series', question: 'The sum of the first `n` terms of a series is given by Sₙ = 2n² + 3n. Determine the 10th term of the series.' },
    { id: 'math-g12-2', topic: 'Sequences and series', question: 'For which values of x will the geometric series `2(1 - x) + 2(1 - x)² + 2(1 - x)³ + ...` converge?' },
    { id: 'math-g12-3', topic: 'Functions and inverses', question: 'Given the function `f(x) = 2x³`. Find the equation of the inverse function, `f⁻¹(x)`.' },
    { id: 'math-g12-4', topic: 'Calculus (Differential)', question: 'Find the derivative of `f(x) = 4x³ - 5/x` from first principles.' },
    { id: 'math-g12-5', topic: 'Calculus (Differential)', question: 'Determine the equation of the tangent to the curve `y = 2x² - 3x + 1` at the point where `x = 2`.' },
    { id: 'math-g12-6', topic: 'Financial mathematics', question: 'A loan of R500 000 is repaid by means of equal monthly instalments, starting one month after the loan was granted. The interest rate is 9% p.a., compounded monthly. If the loan is repaid over 20 years, calculate the monthly instalment.' },
    { id: 'math-g12-7', topic: 'Probability (counting principles)', question: 'In how many ways can the letters of the word `PARALLEL` be arranged?' },
    { id: 'math-g12-8', topic: 'Statistics', question: 'The marks of 10 learners are given: 55, 62, 78, 45, 89, 72, 68, 50, 65, 71. Calculate the standard deviation of this data set.' },
  ],
  // =================================
  // Physical Sciences
  // =================================
  "Physical Sciences": [
    // --- Grade 10 ---
    { id: 'phys-g10-1', topic: 'Mechanics (vectors, motion)', question: 'A car travels 3 km east and then 4 km north. Calculate the magnitude and direction of the resultant displacement.' },
    { id: 'phys-g10-2', topic: 'Waves and sound', question: 'A wave has a frequency of 50 Hz and a wavelength of 2 m. Calculate the speed of the wave.' },
    { id: 'phys-g10-3', topic: 'The atom', question: 'An atom has 13 protons and 14 neutrons. Write down the standard notation for this nuclide.' },
    { id: 'phys-g10-4', topic: 'Chemical bonding', question: 'Draw the Lewis dot structure for a molecule of ammonia (NH₃).' },
    // --- Grade 11 ---
    { id: 'phys-g11-1', topic: 'Newton\'s Laws', question: 'A block of mass 5 kg is pulled on a horizontal surface by a force of 20 N at an angle of 30° to the horizontal. The frictional force is 4 N. Draw a labelled free-body diagram showing all the forces acting on the block.\n\n![A block on a horizontal surface being pulled by a force at an angle.](https://picsum.photos/seed/force1/400/200)' },
    { id: 'phys-g11-2', topic: 'Newton\'s Laws', question: 'Using the information from the previous question, calculate the acceleration of the block.' },
    { id: 'phys-g11-3', topic: 'Electric circuits', question: 'Two resistors, 4 Ω and 6 Ω, are connected in parallel. This combination is then connected in series with a 3 Ω resistor and a 12 V battery with negligible internal resistance. Calculate the total current flowing from the battery.' },
    { id: 'phys-g11-4', topic: 'Stoichiometry', question: '25.0 cm³ of 0.1 mol·dm⁻³ HCl is used to titrate 20.0 cm³ of NaOH solution. The reaction is: `HCl + NaOH -> NaCl + H₂O`. Calculate the concentration of the NaOH solution.' },
    { id: 'phys-g11-5', topic: 'Intermolecular forces', question: 'Name the type of intermolecular force present in each of the following: \na) H₂O \nb) CO₂ \nc) CH₄' },
    { id: 'phys-g11-6', topic: 'Ideal gases', question: 'A container of volume 20 dm³ contains 5 moles of an ideal gas at a pressure of 150 kPa. Calculate the temperature of the gas in Kelvin.' },
    // --- Grade 12 ---
    { id: 'phys-g12-1', topic: 'Momentum and impulse', question: 'A trolley of mass 1.5 kg moving at 2 m/s collides with a stationary trolley of mass 2.5 kg. After the collision, the two trolleys stick together and move as one. Calculate their velocity after the collision.' },
    { id: 'phys-g12-2', topic: 'Vertical projectile motion', question: 'A ball is thrown vertically upwards from the top of a 50 m high building with an initial velocity of 15 m/s. Calculate the time it takes for the ball to reach the ground below. (Ignore air resistance, g = 9.8 m/s²)' },
    { id: 'phys-g12-3', topic: 'Work, energy and power', question: 'State the work-energy theorem in words.' },
    { id: 'phys-g12-4', topic: 'The Doppler effect', question: 'A police car with its siren on (frequency 600 Hz) moves towards a stationary observer at a constant speed. The observer hears a frequency of 650 Hz. Is the car moving towards or away from the observer? Explain your answer.' },
    { id: 'phys-g12-5', topic: 'Rate and extent of reactions', question: 'For the reaction `A + B -> C`, the following data was obtained. Determine the rate law for the reaction.\n\n| Experiment | [A] (mol/dm³) | [B] (mol/dm³) | Initial Rate (mol/dm³/s) |\n|---|---|---|---|\n| 1 | 0.1 | 0.1 | 2.0 x 10⁻³ |\n| 2 | 0.2 | 0.1 | 4.0 x 10⁻³ |\n| 3 | 0.1 | 0.2 | 8.0 x 10⁻³ |' },
    { id: 'phys-g12-6', topic: 'Chemical equilibrium', question: 'Consider the following equilibrium: `2SO₂(g) + O₂(g) ⇌ 2SO₃(g)`, ΔH < 0. Explain how you would change the temperature and pressure to maximize the yield of SO₃.' },
    { id: 'phys-g12-7', topic: 'Acids and bases', question: 'Calculate the pH of a 0.05 mol·dm⁻³ solution of Ba(OH)₂.' },
    { id: 'phys-g12-8', topic: 'Electrochemical reactions', question: 'Draw a fully labelled diagram of a Zinc-Copper (Daniell) galvanic cell. Indicate the anode, cathode, direction of electron flow, and salt bridge.' },
    { id: 'phys-g12-9', topic: 'Photoelectric effect', question: 'Light of a certain frequency is shone onto a metal surface, but no electrons are emitted. In terms of the work function and threshold frequency, explain why this is the case.' },
  ],
  // =================================
  // Life Sciences
  // =================================
  "Life Sciences": [
    // --- Grade 10 ---
    { id: 'life-g10-1', topic: 'The chemistry of life', question: 'List the four major groups of organic compounds found in living cells.' },
    { id: 'life-g10-2', topic: 'Cells: The basic unit of life', question: 'Draw a labelled diagram of a typical animal cell. \n\n![A diagram of an animal cell with organelles](https://picsum.photos/seed/cell1/400/350)' },
    { id: 'life-g10-3', topic: 'Plant and animal tissues', question: 'Differentiate between xylem and phloem in plants.' },
    { id: 'life-g10-4', topic: 'Support and transport systems in plants and animals', question: 'Describe the path of blood through the pulmonary circuit, starting from the right ventricle.' },
    // --- Grade 11 ---
    { id: 'life-g11-1', topic: 'Biodiversity', question: 'Name the five kingdoms used to classify living organisms.' },
    { id: 'life-g11-2', topic: 'Photosynthesis', question: 'Write the balanced chemical equation for photosynthesis.' },
    { id: 'life-g11-3', topic: 'Photosynthesis', question: 'Describe the difference between the light-dependent and light-independent phases of photosynthesis.' },
    { id: 'life-g11-4', topic: 'Cellular respiration', question: 'What are the three main stages of aerobic cellular respiration?' },
    { id: 'life-g11-5', topic: 'Human impact on the environment', question: 'Explain the concept of the "greenhouse effect" and how human activities contribute to its enhancement.' },
    // --- Grade 12 ---
    { id: 'life-g12-1', topic: 'DNA: The code of life', question: 'Name the three components that make up a nucleotide.' },
    { id: 'life-g12-2', topic: 'DNA: The code of life', question: 'Using a diagram, show the process of DNA replication. Your diagram should show the unwinding of the helix and the role of enzymes. \n\n![A diagram showing DNA replication](https://picsum.photos/seed/dna1/500/250)' },
    { id: 'life-g12-3', topic: 'Meiosis', question: 'What is the significance of "crossing over" during Prophase I of meiosis?' },
    { id: 'life-g12-4', topic: 'Genetics and inheritance', question: 'In pea plants, tall (T) is dominant to short (t). A heterozygous tall plant is crossed with a short plant. Use a Punnett square to show the expected genotypic and phenotypic ratios of the offspring.' },
    { id: 'life-g12-5', topic: 'Genetics and inheritance', question: 'Explain the difference between complete dominance, incomplete dominance, and codominance, providing an example for each.' },
    { id: 'life-g12-6', topic: 'Evolution', question: 'Describe Darwin\'s theory of evolution by natural selection, mentioning the key observations he made.' },
    { id: 'life-g12-7', topic: 'Evolution', question: 'Explain the difference between homologous and analogous structures, and how they provide evidence for evolution.' },
    { id: 'life-g12-8', topic: 'Responding to the environment (humans & plants)', question: 'Describe the path of a nerve impulse in a reflex arc, from stimulus to response.' },
    { id: 'life-g12-9', topic: 'Human reproduction', question: 'Describe the roles of FSH and LH in the human menstrual cycle. \n\n![A graph of hormone levels during the menstrual cycle](https://picsum.photos/seed/cycle1/400/300)' },
    { id: 'life-g12-10', topic: 'Homeostasis', question: 'Explain how the body regulates blood glucose levels when they are too high (negative feedback).' },
  ],
};

export const getQuestionsForTopic = (subject: string, grade: number): Question[] => {
  const subjectQuestions = allQuestions[subject];
  if (!subjectQuestions) {
    return [];
  }
  // This is a simplified filter. A real app would have questions tagged by grade.
  // We return a slice to simulate a full paper's worth of questions for that grade.
  if (grade === 10) {
    return subjectQuestions.filter(q => q.id.includes('-g10-'));
  }
  if (grade === 11) {
    return subjectQuestions.filter(q => q.id.includes('-g11-'));
  }
  if (grade === 12) {
    return subjectQuestions.filter(q => q.id.includes('-g12-'));
  }
  return [];
};

    
