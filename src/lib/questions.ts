

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
    // --- Grade 12 (Paper 1 Style - 76 Questions Total) ---
    // Question 1: Algebra (1.1.1 - 1.3)
    { id: 'math-g12-p1-1.1.1', topic: 'Algebra', question: 'Solve for x: \\n`x² - 2x - 24 = 0`' },
    { id: 'math-g12-p1-1.1.2', topic: 'Algebra', question: 'Solve for x (correct to TWO decimal places): \\n`2x² - 3x - 7 = 0`' },
    { id: 'math-g12-p1-1.1.3', topic: 'Algebra', question: 'Solve for x: \\n`x² + 9x - 36 > 0`' },
    { id: 'math-g12-p1-1.1.4', topic: 'Algebra', question: 'Solve for x: \\n`√(x - 2) + 2 = x`' },
    { id: 'math-g12-p1-1.2', topic: 'Algebra', question: 'Solve for x and y simultaneously: \\n`y = -2x + 7` \\n`x² + 2x = y + 9`' },
    { id: 'math-g12-p1-1.3', topic: 'Algebra', question: 'Show that the roots of `3x² + (k+2)x - k - 1 = 0` are rational for all rational values of k.' },

    // Question 2: Sequences and Series (2.1 - 2.2.2)
    { id: 'math-g12-p1-2.1.1', topic: 'Sequences and series', question: 'A quadratic number pattern `Tₙ = an² + bn + c` has a third term equal to 1. The general term of the first differences is `6n - 4`. Determine the first term of the quadratic pattern.' },
    { id: 'math-g12-p1-2.1.2', topic: 'Sequences and series', question: 'Using the pattern from the previous question, determine the value of `n` if `Tₙ = 289`.' },
    { id: 'math-g12-p1-2.2.1', topic: 'Sequences and series', question: 'Consider the arithmetic sequence: `3; 7; 11; 15; ...` \\nDetermine the formula for the nth term, Tₙ.' },
    { id: 'math-g12-p1-2.2.2', topic: 'Sequences and series', question: 'Which term in the arithmetic sequence `3; 7; 11; 15; ...` is equal to 123?' },
    { id: 'math-g12-p1-2.3.1', topic: 'Sequences and series', question: 'Consider the geometric series: `27 + 9 + 3 + ...` \\nCalculate the value of the common ratio `r`.' },
    { id: 'math-g12-p1-2.3.2', topic: 'Sequences and series', question: 'Calculate the sum to infinity of the series `27 + 9 + 3 + ...`' },
    { id: 'math-g12-p1-2.3.3', topic: 'Sequences and series', question: 'Explain why the series `27 + 9 + 3 + ...` converges.' },
    
    // Question 3: Functions (3.1 - 3.5)
    { id: 'math-g12-p1-3.1', topic: 'Functions', question: 'The diagram shows the graph of `f(x) = -x² - 6x + 7`. A is the turning point. Find the coordinates of A.\\n\\n![Parabola graph with turning point A at (-3, 16) and y-intercept at (0, 7)](https://placehold.co/400x300/e2e8f0/64748b?text=Parabola+f(x)\\nTurning+Point+A(-3,16)\\ny-intercept+(0,7))' },
    { id: 'math-g12-p1-3.2', topic: 'Functions', question: 'Write down the range of the function `f(x) = -x² - 6x + 7`.' },
    { id: 'math-g12-p1-3.3', topic: 'Functions', question: 'The graph of `f(x)` is shifted 2 units to the right and 3 units down to obtain `g(x)`. Write down the equation of `g(x)`.' },
    { id: 'math-g12-p1-3.4', topic: 'Functions', question: 'Given `h(x) = 2x + 1`, determine the point of intersection of `f(x)` and `h(x)`.' },
    { id: 'math-g12-p1-3.5', topic: 'Functions', question: 'For which values of x is `f(x) > 0`?' },

    // Question 4: Inverse Functions
    { id: 'math-g12-p1-4.1', topic: 'Functions and inverses', question: 'Given `g(x) = 3^x`. Write down the equation of the inverse function, `g⁻¹(x)`, in the form `y = ...`' },
    { id: 'math-g12-p1-4.2', topic: 'Functions and inverses', question: 'Sketch the graphs of `g(x)` and `g⁻¹(x)` on the same set of axes. Show all intercepts and one other point on each graph.\\n\\n![Exponential graph g(x) passing through (0,1) and (1,3). Logarithmic graph g⁻¹(x) passing through (1,0) and (3,1), reflecting over y=x.](https://placehold.co/350x350/e2e8f0/64748b?text=Exponential+g(x)\\nand+Log+g⁻¹(x))' },
    { id: 'math-g12-p1-4.3', topic: 'Functions and inverses', question: 'Write down the domain of `g⁻¹(x)`.' },

    // Question 5: Financial Maths
    { id: 'math-g12-p1-5.1', topic: 'Financial mathematics', question: 'A company purchases a new machine for R1 200 000. It depreciates at 15% p.a. on a reducing-balance basis. Calculate the book value of the machine after 5 years.' },
    { id: 'math-g12-p1-5.2', topic: 'Financial mathematics', question: 'How much money must be invested now at 8.5% p.a. compounded quarterly to have R50 000 in 6 years’ time?' },
    { id: 'math-g12-p1-5.3', topic: 'Financial mathematics', question: 'John takes out a home loan of R1 500 000. It is repaid over 20 years with equal monthly payments starting one month after the loan is granted. The interest rate is 10.5% p.a. compounded monthly. Calculate the monthly payment.' },
    { id: 'math-g12-p1-5.4', topic: 'Financial mathematics', question: 'After 10 years, John decides to pay off the loan. Calculate the outstanding balance on the loan immediately after the 120th payment.' },

    // Question 6: Calculus
    { id: 'math-g12-p1-6.1', topic: 'Calculus (Differential)', question: 'Determine `f\\\'(x)` from first principles if `f(x) = -3x²`.' },
    { id: 'math-g12-p1-6.2.1', topic: 'Calculus (Differential)', question: 'Determine `dy/dx` if `y = 5x⁴ - 2x + 7`.' },
    { id: 'math-g12-p1-6.2.2', topic: 'Calculus (Differential)', question: 'Determine `dy/dx` if `y = (√x - 2/x)²`.' },

    // Question 7: Calculus Applications
    { id: 'math-g12-p1-7.1', topic: 'Calculus (Differential)', question: 'The graph of `f(x) = x³ - 3x² - 9x + 27` is shown. Find the coordinates of the local maximum and minimum turning points.\\n\\n![Cubic graph with local max, local min, and intercepts labeled.](https://placehold.co/400x300/e2e8f0/64748b?text=Cubic+Graph+f(x))' },
    { id: 'math-g12-p1-7.2', topic: 'Calculus (Differential)', question: 'For which values of `k` will the equation `f(x) = k` have exactly three distinct real roots?' },
    { id: 'math-g12-p1-7.3', topic: 'Calculus (Differential)', question: 'Determine the point of inflection of the graph of `f(x)`.' },
    { id: 'math-g12-p1-7.4', topic: 'Calculus (Differential)', question: 'Show that the graph of `f(x)` is concave down for `x < 1`.' },

    // Question 8: Probability
    { id: 'math-g12-p1-8.1', topic: 'Probability', question: 'Events A and B are such that P(A) = 0.4, P(B) = 0.5 and P(A or B) = 0.7. Are events A and B mutually exclusive? Justify your answer.' },
    { id: 'math-g12-p1-8.2', topic: 'Probability', question: 'Using the probabilities from the previous question, determine if events A and B are independent.' },
    { id: 'math-g12-p1-8.3', topic: 'Probability (counting principles)', question: 'How many different 5-digit codes can be formed using the digits 1, 2, 3, 4, 5, 6, 7 if the digits may not be repeated?' },
    { id: 'math-g12-p1-8.4', topic: 'Probability (counting principles)', question: 'From a group of 10 boys and 8 girls, a committee of 5 is to be chosen. In how many ways can this be done if the committee must contain 3 boys and 2 girls?' },
    
    // Question 9: Calculus Optimization
    { id: 'math-g12-p1-9.1', topic: 'Calculus (Differential)', question: 'A rectangular box has a square base and the sum of its length, width and height is 120 cm. Find the dimensions that will give the maximum volume.' },

    // Question 10: More Algebra
    { id: 'math-g12-p1-10.1', topic: 'Algebra', question: 'Simplify the expression: `(3^(n+2) * 9^(n-1)) / 27^n`' },
    { id: 'math-g12-p1-10.2', topic: 'Algebra', question: 'If `3^x = 5`, what is the value of `3^(x+1)`?' },

    // Question 11: More Sequences
    { id: 'math-g12-p1-11.1', topic: 'Sequences and series', question: 'An arithmetic sequence has `T₄ = 11` and `T₈ = 23`. Find the first term `a` and common difference `d`.' },
    { id: 'math-g12-p1-11.2', topic: 'Sequences and series', question: 'Calculate the sum of the first 20 terms of the sequence found in the previous question.' },
    { id: 'math-g12-p1-11.3', topic: 'Sequences and series', question: 'A geometric sequence has `T₃ = 20` and `T₆ = 160`. Find the common ratio `r`.' },

    // Question 12: Multiple Choice
    { id: 'math-g12-p1-12.1', topic: 'Probability', question: 'A bag contains 5 red balls and 3 blue balls. A ball is drawn at random. What is the probability that it is blue?\\n\\nA) 5/8\\nB) 3/8\\nC) 3/5\\nD) 1/2' },
    { id: 'math-g12-p1-12.2', topic: 'Functions', question: 'The graph of `y = a/x + q` has a horizontal asymptote of `y = -1` and passes through the point `(2, 1)`. What is the value of `a`?\\n\\nA) 2\\nB) -2\\nC) 4\\nD) -4' },
    
    // Fillers to reach 76 questions
    { id: 'math-g12-p1-13.1', topic: 'Algebra', question: 'Solve for x: `log₂(x) + log₂(x-2) = 3`' },
    { id: 'math-g12-p1-13.2', topic: 'Algebra', question: 'For which value(s) of `p` will the equation `x² + px + p = 0` have non-real roots?' },
    { id: 'math-g12-p1-14.1', topic: 'Sequences and series', question: 'Evaluate: `Σ (3k - 1)` from k=1 to 15.' },
    { id: 'math-g12-p1-15.1', topic: 'Functions', question: 'Determine the equation of the hyperbola with asymptotes `y=2` and `x=-1`, and passing through the origin (0,0).' },
    { id: 'math-g12-p1-16.1', topic: 'Financial mathematics', question: 'A sinking fund is set up to replace a machine in 5 years. R5000 is deposited monthly into an account earning 12% p.a. compounded monthly. How much will be in the fund immediately after the final deposit?' },
    { id: 'math-g12-p1-17.1', topic: 'Calculus (Differential)', question: 'The displacement of a particle is given by `s(t) = t³ - 6t² + 9t`. Find the velocity of the particle when its acceleration is zero.' },
    { id: 'math-g12-p1-18.1', topic: 'Probability', question: 'A survey found that 60% of people like tea, 70% like coffee, and 40% like both. What is the probability that a randomly selected person likes either tea or coffee?' },
    { id: 'math-g12-p1-19', topic: 'Algebra', question: 'Solve for x: `2^(2x+1) - 9 * 2^x + 4 = 0`' },
    { id: 'math-g12-p1-20', topic: 'Sequences and series', question: 'The first term of an arithmetic series is -7 and the last term is 83. The sum of the series is 722. Find the number of terms.' },
    { id: 'math-g12-p1-21', topic: 'Functions', question: 'Given `f(x) = 2/(x-3) + 1`. Write down the equations of the asymptotes of `f`.' },
    { id: 'math-g12-p1-22', topic: 'Financial mathematics', question: 'Calculate the effective annual interest rate if the nominal rate is 9.6% p.a. compounded monthly.' },
    { id: 'math-g12-p1-23', topic: 'Calculus (Differential)', question: 'Find the average gradient of `f(x) = x² + 1` between x = 1 and x = 4.' },
    { id: 'math-g12-p1-24', topic: 'Probability (counting principles)', question: 'A password consists of 3 letters followed by 2 digits. How many passwords can be formed if repetition is allowed?' },
    { id: 'math-g12-p1-25', topic: 'Algebra', question: 'If `f(x) = x² - 4`, determine `f(x-1)`.' },
    { id: 'math-g12-p1-26', topic: 'Sequences and series', question: 'Determine `n` if `Σ (2k - 3)` from k=1 to n equals 48.' },
    { id: 'math-g12-p1-27', topic: 'Functions', question: 'What transformation maps the graph of `f(x) = sin(x)` to `g(x) = sin(x - 30°)`?' },
    { id: 'math-g12-p1-28', topic: 'Calculus (Differential)', question: 'For which values of x is the function `f(x) = 2x³ - 3x²` decreasing?' },
    { id: 'math-g12-p1-29', topic: 'Financial mathematics', question: 'A person invests R1000 for 5 years. For the first 2 years, the interest is 6% compounded semi-annually. For the last 3 years, it is 7% compounded annually. Calculate the final amount.' },
    { id: 'math-g12-p1-30', topic: 'Probability', question: 'What is the probability of drawing a king from a standard deck of 52 cards?' },
    { id: 'math-g12-p1-31', topic: 'Algebra', question: 'Given `x = (√3 + 1)/2`, find the value of `4x² - 2x`.' },
    { id: 'math-g12-p1-32', topic: 'Sequences and series', question: 'Find the 15th term of the sequence `5; 10; 20; 40; ...`' },
    { id: 'math-g12-p1-33', topic: 'Functions', question: 'If `f(x) = x/2 - 1`, find the inverse `f⁻¹(x)`.' },
    { id: 'math-g12-p1-34', topic: 'Calculus (Differential)', question: 'Find `d/dx (x² * sin(x))`.' },
    { id: 'math-g12-p1-35', topic: 'Financial mathematics', question: 'What is the difference between nominal and effective interest rates?' },
    { id: 'math-g12-p1-36', topic: 'Probability', question: 'If P(A) = 0.3 and P(B) = 0.6, and A and B are independent, find P(A and B).' },
    { id: 'math-g12-p1-37', topic: 'Algebra', question: 'Determine the nature of the roots of `2x² - 6x + 5 = 0` without solving the equation.' },
    { id: 'math-g12-p1-38', topic: 'Sequences and series', question: 'Insert three arithmetic means between 5 and 21.' },
    { id: 'math-g12-p1-39', topic: 'Functions', question: 'Sketch the graph of `y = -log₃(x)`. \\n\\n![Logarithmic graph reflected over the x-axis, passing through (1,0)](https://placehold.co/400x300/e2e8f0/64748b?text=Graph+of+y=-log₃(x))' },
    { id: 'math-g12-p1-40', topic: 'Calculus (Differential)', question: 'The volume of a sphere is increasing at a rate of 10 cm³/s. Find the rate of increase of the radius when the radius is 5 cm.' },
    { id: 'math-g12-p1-41', topic: 'Financial mathematics', question: 'Explain what a perpetuity is.' },
    { id: 'math-g12-p1-42', topic: 'Probability', question: 'From the letters of the word ‘TRIANGLE’, how many arrangements are possible if the vowels must be together?' },
    { id: 'math-g12-p1-43', topic: 'Algebra', question: 'Simplify: `(x² - 4) / (x² - 2x)`' },
    { id: 'math-g12-p1-44', topic: 'Sequences and series', question: 'The sum of the first `n` terms of a series is given by `Sₙ = 2n² + 3n`. Find the 10th term.' },
    { id: 'math-g12-p1-45', topic: 'Functions', question: 'Determine the equation of the axis of symmetry for the parabola `f(x) = 2(x-3)² + 5`.' },
    { id: 'math-g12-p1-46', topic: 'Financial mathematics', question: 'If a car depreciates by 20% per year on a reducing balance, what percentage of its original value is it worth after 3 years?' },
    { id: 'math-g12-p1-47', topic: 'Calculus (Differential)', question: 'Find the equation of the tangent to the curve `f(x) = x² - 5` at the point `x = 2`.' },
    { id: 'math-g12-p1-48', topic: 'Probability', question: 'A coin is tossed 3 times. What is the probability of getting exactly two heads?' },
  ],
  "Physical Sciences": [
    // --- Grade 12 (Physics Questions) - 15 Questions ---
    { id: 'phys-g12-1', topic: 'Momentum and impulse', question: 'A cricket ball of mass 150 g moving at 30 m/s is hit by a bat and leaves the bat at 40 m/s in the opposite direction. The contact time is 0.02 s. Calculate the impulse on the ball.' },
    { id: 'phys-g12-2', topic: 'Vertical projectile motion', question: 'A ball is thrown vertically upwards from the top of a 50 m high building with an initial velocity of 15 m/s. Calculate the maximum height the ball reaches above the ground.' },
    { id: 'phys-g12-3', topic: 'Vertical projectile motion', question: 'For the ball in the previous question, calculate the time it takes to hit the ground.' },
    { id: 'phys-g12-4', topic: 'Work, energy and power', question: 'A 1000 kg car accelerates from rest to 20 m/s over a distance of 100 m on a horizontal road. A constant frictional force of 500 N opposes the motion. Calculate the work done by the engine.' },
    { id: 'phys-g12-5', topic: 'The Doppler effect', question: 'An ambulance moves towards a stationary observer at 25 m/s. Its siren emits a sound with a frequency of 800 Hz. Calculate the frequency heard by the observer. (Speed of sound in air = 340 m/s).' },
    { id: 'phys-g12-6', topic: 'Electrodynamics', question: 'State Faraday\\\'s law of electromagnetic induction.' },
    { id: 'phys-g12-7', topic: 'Photoelectric effect', question: 'Light of frequency 6.5 x 10¹⁴ Hz is incident on a metal surface with a work function of 2.1 eV. Will photoelectrons be emitted? Justify your answer with a calculation.' },
    { id: 'phys-g12-8', topic: 'Electrostatics', question: 'Two point charges, Q1 = +3 nC and Q2 = -5 nC, are separated by a distance of 10 cm. Calculate the magnitude and direction of the electrostatic force that Q1 exerts on Q2.' },
    { id: 'phys-g12-9', topic: 'Electric circuits', question: 'A battery with an internal resistance of 1 Ω and an emf of 12 V is connected to a circuit containing a 5 Ω resistor and a 10 Ω resistor in parallel. Calculate the current flowing from the battery.\\n\\n![Circuit diagram with a battery, internal resistance, and two resistors in parallel.](https://placehold.co/400x250/e2e8f0/64748b?text=Circuit+Diagram\\nEMF=12V,+r=1Ω\\nR1=5Ω,+R2=10Ω)' },
    { id: 'phys-g12-10', topic: 'Electromagnetism', question: 'Draw a sketch of the magnetic field around a straight, current-carrying conductor. Indicate the direction of the current and the field.' },
    { id: 'phys-g12-11', topic: 'Momentum and impulse', question: 'State the principle of conservation of linear momentum.' },
    { id: 'phys-g12-12', topic: 'Vertical projectile motion', question: 'A stone is dropped from a hot air balloon that is ascending at a constant velocity of 5 m/s. If the stone takes 4 s to hit the ground, how high was the balloon when the stone was dropped?' },
    { id: 'phys-g12-13', topic: 'Work, energy and power', question: 'A crane lifts a 500 kg load at a constant velocity of 2 m/s. Calculate the power output of the crane.' },
    { id: 'phys-g12-14', topic: 'The Doppler effect', question: 'How would the observed frequency of a sound source change if the source moves away from the observer? Explain.' },
    { id: 'phys-g12-15', topic: 'Photoelectric effect', question: 'What is meant by the term "threshold frequency" in the context of the photoelectric effect?' },

    // --- Grade 12 (Chemistry Questions) - 10 Questions ---
    { id: 'chem-g12-1', topic: 'Rate and extent of reactions', question: 'List TWO factors that can increase the rate of a chemical reaction.' },
    { id: 'chem-g12-2', topic: 'Chemical equilibrium', question: 'Consider the reversible reaction: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) ΔH < 0. Explain how increasing the temperature will affect the yield of ammonia (NH₃).' },
    { id: 'chem-g12-3', topic: 'Chemical equilibrium', question: 'State Le Chatelier\\\'s principle.' },
    { id: 'chem-g12-4', topic: 'Acids and bases', question: 'Calculate the pH of a 0.05 mol·dm⁻³ solution of hydrochloric acid (HCl).' },
    { id: 'chem-g12-5', topic: 'Acids and bases', question: 'Define a conjugate acid-base pair according to the Brønsted-Lowry theory.' },
    { id: 'chem-g12-6', topic: 'Electrochemical reactions', question: 'Draw a labelled diagram of a galvanic (voltaic) cell using a zinc half-cell and a copper half-cell. Show the direction of electron flow.\\n\\n![Diagram of a galvanic cell with Zn and Cu electrodes, a salt bridge, and voltmeter.](https://placehold.co/400x350/e2e8f0/64748b?text=Galvanic+Cell\\n(Zn-Cu))' },
    { id: 'chem-g12-7', topic: 'Electrochemical reactions', question: 'Write down the half-reaction that occurs at the anode in the Zn-Cu cell.' },
    { id: 'chem-g12-8', topic: 'The chemical industry', question: 'Name the primary industrial process used to produce fertilizers like ammonium nitrate.' },
    { id: 'chem-g12-9', topic: 'Rate and extent of reactions', question: 'Sketch a potential energy diagram for an exothermic reaction, labelling the reactants, products, activation energy, and enthalpy change (ΔH).\\n\\n![Energy profile diagram for an exothermic reaction showing reactants higher than products.](https://placehold.co/400x300/e2e8f0/64748b?text=Exothermic+Reaction\\nEnergy+Profile)' },
    { id: 'chem-g12-10', topic: 'Acids and bases', question: 'A 25 cm³ sample of a sodium hydroxide (NaOH) solution is titrated with a 0.1 mol·dm⁻³ solution of sulfuric acid (H₂SO₄). If 15 cm³ of the acid is required to reach the equivalence point, calculate the concentration of the NaOH solution.' },
  ],
  "Life Sciences": [
    // --- Grade 12 Questions - 15 Questions ---
    { id: 'life-g12-1', topic: 'DNA: The code of life', question: 'Describe the structure of a DNA molecule, mentioning its components (nucleotides, sugar-phosphate backbone, and base pairing).' },
    { id: 'life-g12-2', topic: 'DNA: The code of life', question: 'Explain the process of DNA replication.' },
    { id: 'life-g12-3', topic: 'Meiosis', question: 'What is the significance of "crossing over" during Prophase I of meiosis?' },
    { id: 'life-g12-4', topic: 'Genetics and inheritance', question: 'In pea plants, tall (T) is dominant to short (t). A heterozygous tall plant is crossed with a short plant. Use a Punnett square to show the expected genotypic and phenotypic ratios of the offspring.' },
    { id: 'life-g12-5', topic: 'Genetics and inheritance', question: 'Explain the difference between complete dominance, incomplete dominance, and codominance, providing an example for each.' },
    { id: 'life-g12-6', topic: 'Evolution', question: 'Describe Darwin\\\'s theory of evolution by natural selection, mentioning the key observations he made.' },
    { id: 'life-g12-7', topic: 'Evolution', question: 'Explain the difference between homologous and analogous structures, and how they provide evidence for evolution.' },
    { id: 'life-g12-8', topic: 'Responding to the environment (humans & plants)', question: 'Describe the path of a nerve impulse in a reflex arc, from stimulus to response.' },
    { id: 'life-g12-9', topic: 'Human reproduction', question: 'Draw and label a diagram of the human male reproductive system.\\n\\n![Diagram showing the main parts of the male reproductive system: testis, epididymis, vas deferens, prostate gland, urethra, penis.](https://placehold.co/400x350/e2e8f0/64748b?text=Male+Reproductive+System)' },
    { id: 'life-g12-10', topic: 'Homeostasis', question: 'Explain the role of ADH (antidiuretic hormone) in osmoregulation.' },
    { id: 'life-g12-11', topic: 'Endocrine system', question: 'Explain the negative feedback mechanism involving insulin and glucagon in regulating blood glucose levels.' },
    { id: 'life-g12-12', topic: 'DNA: The code of life', question: 'Tabulate THREE differences between DNA and RNA.' },
    { id: 'life-g12-13', topic: 'Meiosis', question: 'Name and describe TWO ways in which meiosis contributes to genetic variation.' },
    { id: 'life-g12-14', topic: 'Genetics and inheritance', question: 'A man with blood type A and a woman with blood type B have a child with blood type O. What are the genotypes of the parents?' },
    { id: 'life-g12-15', topic: 'Evolution', question: 'Explain the concept of speciation, referring to geographic isolation.' },

    // --- Grade 11 Questions - 5 Questions ---
    { id: 'life-g11-1', topic: 'Biodiversity', question: 'Name the five kingdoms used to classify living organisms.' },
    { id: 'life-g11-2', topic: 'Photosynthesis', question: 'Write down the balanced chemical equation for photosynthesis.' },
    { id: 'life-g11-3', topic: 'Photosynthesis', question: 'Describe the light-dependent phase of photosynthesis.' },
    { id: 'life-g11-4', topic: 'Cellular respiration', question: 'What are the three main stages of cellular respiration?' },
    { id: 'life-g11-5', topic: 'Human impact on the environment', question: 'Explain the greenhouse effect and its link to global warming.' },

    // --- Grade 10 Questions - 5 Questions ---
    { id: 'life-g10-1', topic: 'The chemistry of life', question: 'List the four main types of organic molecules found in living organisms.' },
    { id: 'life-g10-2', topic: 'Cells: The basic unit of life', question: 'Draw a labelled diagram of a typical animal cell.\\n\\n![Diagram of an animal cell showing nucleus, cytoplasm, cell membrane, mitochondria, and ribosomes.](https://placehold.co/400x350/e2e8f0/64748b?text=Animal+Cell)' },
    { id: 'life-g10-3', topic: 'Mitosis', question: 'List the four phases of mitosis in the correct order.' },
    { id: 'life-g10-4', topic: 'Plant and animal tissues', question: 'Differentiate between epithelial tissue and connective tissue.' },
    { id: 'life-g10-5', topic: 'Support and transport systems in plants and animals', question: 'Describe the functions of xylem and phloem in plants.' },
  ],
};


/**
 * Gets questions for a given subject, optionally filtered by grade.
 * This function should be used by the practice page.
 */
export function getQuestionsForSubject(subject: string, grade?: number): Question[] {
    const questions = allQuestions[subject];
    if (!questions) {
        return [];
    }

    if (grade) {
        // This is a basic filter based on ID naming convention, which is fragile.
        // A better data model would have a 'grade' property on each question.
        const gradePrefix = `g${grade}`;
        return questions.filter(q => q.id.includes(gradePrefix));
    }
    
    return questions;
}
