export type Subject = 'Mathematics' | 'Physical Sciences' | 'Life Sciences';

export const grades = [10, 11, 12] as const;
export type Grade = typeof grades[number];

export interface QuestionWithAnswer {
	question: string;
	answer: string;
}

type QuestionBank = Record<Subject, Record<Grade, string[]>>;
type QuestionBankWithAnswers = Record<Subject, Record<Grade, QuestionWithAnswer[]>>;

// Helper function to shuffle array
function shuffleArray<T>(array: T[] | null | undefined): T[] {
	// Guard against null, undefined, or non-array values
	if (!array || !Array.isArray(array)) {
		return [];
	}
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

// CAPS-aligned sample questions (concise). Four per subject per grade.
export const QUESTION_BANK: QuestionBank = {
	Mathematics: {
		10: [
			'Solve for x: x^2 − 5x + 6 = 0.',
			'Simplify: (2x^2y)^3.',
			'In similar triangles, if the scale factor is 3:2 and a side is 12 cm in the larger triangle, find the corresponding side in the smaller.',
			'Determine the equation of the straight line with gradient 2 passing through (−1,4).',
		],
		11: [
			'Solve for x in 2^(x+1) = 16.',
			'Rationalise the denominator: 5/√3.',
			'Find the turning point of f(x) = x^2 − 4x − 5.',
			'Given sin θ = 3/5 and θ acute, determine cos θ and tan θ.',
		],
		12: [
			'Evaluate: log_2(32) + log_2(4).',
			'Determine the derivative of f(x) = 3x^3 − 5x^2 + 2x − 7.',
			'Find the equation of the tangent to y = x^2 at x = 3.',
			'Calculate the probability of drawing 2 red balls in succession without replacement from a bag with 3 red and 2 blue balls.',
		],
	},
	'Physical Sciences': {
		10: [
			'Balance: C3H8 + O2 → CO2 + H2O.',
			'Define resultant force and calculate it for forces 10 N right and 4 N left.',
			'Calculate the potential difference if a 2 Ω resistor carries 3 A.',
			'Define frequency and calculate the frequency of a wave with period 0.02 s.',
		],
		11: [
			'Using vectors: Find the magnitude of the resultant of A = (3,4) and B = (−1,2).',
			'Calculate ΔH for a reaction given average bond energies.',
			'Define refractive index and calculate n if c = 3.0×10^8 m/s and v = 2.0×10^8 m/s.',
			'Describe the photoelectric effect in terms of threshold frequency.',
		],
		12: [
			'Apply momentum conservation: A 0.2 kg trolley moving at 3 m/s hits a 0.3 kg trolley at rest and they stick together. Find final velocity.',
			'Calculate emf given terminal voltage 11.5 V and internal resistance 0.5 Ω with current 3 A.',
			'Define conjugate acid–base pairs and identify them in NH3 + H2O ↔ NH4+ + OH−.',
			'Explain the difference between alpha, beta and gamma radiation in terms of penetration and ionising power.',
		],
	},
	'Life Sciences': {
		10: [
			'Outline mitosis phases and state one importance of mitosis.',
			'Explain the role of enzymes and two factors affecting enzyme activity.',
			'Describe transpiration and two adaptations that reduce water loss.',
			'Use a simple pedigree to determine the probability of an offspring expressing a recessive trait.',
		],
		11: [
			'Explain DNA replication in terms of semi-conservative mechanism.',
			'Describe homeostasis with reference to blood glucose regulation.',
			'Compare sympathetic and parasympathetic nervous systems.',
			'Explain natural selection and speciation with an example.',
		],
		12: [
			'Discuss human evolution evidence from fossils and genetics.',
			'Explain the nephron’s role in osmoregulation.',
			'Describe human reproduction hormonal regulation (FSH, LH, estrogen, progesterone).',
			'Explain ecological succession and its importance for biodiversity.',
		],
	},
};

// Question bank with correct answers
export const QUESTION_BANK_WITH_ANSWERS: QuestionBankWithAnswers = {
	Mathematics: {
		10: [
			{ question: 'Solve for x: x^2 − 5x + 6 = 0.', answer: 'x=2, x=3 or 2 and 3 or {2, 3}' },
			{ question: 'Simplify: (2x^2y)^3.', answer: '8x^6y^3 or 8x6y3' },
			{ question: 'In similar triangles, if the scale factor is 3:2 and a side is 12 cm in the larger triangle, find the corresponding side in the smaller.', answer: '8 cm or 8cm' },
			{ question: 'Determine the equation of the straight line with gradient 2 passing through (−1,4).', answer: 'y = 2x + 6 or y=2x+6' },
		],
		11: [
			{ question: 'Solve for x in 2^(x+1) = 16.', answer: '3 or x=3' },
			{ question: 'Rationalise the denominator: 5/√3.', answer: '5√3/3 or (5√3)/3 or 5√3 over 3' },
			{ question: 'Find the turning point of f(x) = x^2 − 4x − 5.', answer: '(2, -9) or x=2, y=-9' },
			{ question: 'Given sin θ = 3/5 and θ acute, determine cos θ and tan θ.', answer: 'cos θ = 4/5, tan θ = 3/4 or cos=4/5, tan=3/4' },
		],
		12: [
			{ question: 'Evaluate: log_2(32) + log_2(4).', answer: '7' },
			{ question: 'Determine the derivative of f(x) = 3x^3 − 5x^2 + 2x − 7.', answer: "f'(x) = 9x^2 - 10x + 2 or 9x2-10x+2" },
			{ question: 'Find the equation of the tangent to y = x^2 at x = 3.', answer: 'y = 6x - 9 or y=6x-9' },
			{ question: 'Calculate the probability of drawing 2 red balls in succession without replacement from a bag with 3 red and 2 blue balls.', answer: '3/10 or 0.3' },
		],
	},
	'Physical Sciences': {
		10: [
			{ question: 'Balance: C3H8 + O2 → CO2 + H2O.', answer: 'C3H8 + 5O2 → 3CO2 + 4H2O' },
			{ question: 'Define resultant force and calculate it for forces 10 N right and 4 N left.', answer: 'Resultant force is the net force. Resultant = 6 N to the right or 6N right' },
			{ question: 'Calculate the potential difference if a 2 Ω resistor carries 3 A.', answer: '6 V or 6V or 6 volts' },
			{ question: 'Define frequency and calculate the frequency of a wave with period 0.02 s.', answer: 'Frequency = 1/period. Frequency = 50 Hz or 50Hz or 50 hertz' },
		],
		11: [
			{ question: 'Using vectors: Find the magnitude of the resultant of A = (3,4) and B = (−1,2).', answer: 'Magnitude = √20 = 2√5 or approximately 4.47' },
			{ question: 'Calculate ΔH for a reaction given average bond energies.', answer: 'ΔH = sum of bond energies broken - sum of bond energies formed (depends on specific reaction)' },
			{ question: 'Define refractive index and calculate n if c = 3.0×10^8 m/s and v = 2.0×10^8 m/s.', answer: 'Refractive index n = c/v. n = 1.5 or 3/2' },
			{ question: 'Describe the photoelectric effect in terms of threshold frequency.', answer: 'Photoelectrons are only emitted when light frequency exceeds a minimum threshold frequency' },
		],
		12: [
			{ question: 'Apply momentum conservation: A 0.2 kg trolley moving at 3 m/s hits a 0.3 kg trolley at rest and they stick together. Find final velocity.', answer: '1.2 m/s or 1.2m/s or 1.2 ms-1' },
			{ question: 'Calculate emf given terminal voltage 11.5 V and internal resistance 0.5 Ω with current 3 A.', answer: '13 V or 13V or E = 13 volts' },
			{ question: 'Define conjugate acid–base pairs and identify them in NH3 + H2O ↔ NH4+ + OH−.', answer: 'Conjugate pairs: NH3/NH4+ and H2O/OH-. Pairs differ by one H+ ion' },
			{ question: 'Explain the difference between alpha, beta and gamma radiation in terms of penetration and ionising power.', answer: 'Alpha: high ionisation, low penetration. Beta: moderate both. Gamma: low ionisation, high penetration' },
		],
	},
	'Life Sciences': {
		10: [
			{ question: 'Outline mitosis phases and state one importance of mitosis.', answer: 'Prophase, metaphase, anaphase, telophase. Importance: growth, repair, asexual reproduction' },
			{ question: 'Explain the role of enzymes and two factors affecting enzyme activity.', answer: 'Enzymes speed up chemical reactions. Factors: temperature, pH, substrate concentration' },
			{ question: 'Describe transpiration and two adaptations that reduce water loss.', answer: 'Transpiration: water loss from leaves. Adaptations: waxy cuticle, stomata closure, reduced leaf surface' },
			{ question: 'Use a simple pedigree to determine the probability of an offspring expressing a recessive trait.', answer: 'Depends on parent genotypes, typically 25% if both parents heterozygous' },
		],
		11: [
			{ question: 'Explain DNA replication in terms of semi-conservative mechanism.', answer: 'Each DNA strand serves as template; new DNA has one original and one new strand' },
			{ question: 'Describe homeostasis with reference to blood glucose regulation.', answer: 'Insulin lowers blood glucose, glucagon raises it; maintains stable glucose levels' },
			{ question: 'Compare sympathetic and parasympathetic nervous systems.', answer: 'Sympathetic: fight or flight, increases activity. Parasympathetic: rest and digest, decreases activity' },
			{ question: 'Explain natural selection and speciation with an example.', answer: 'Natural selection: favorable traits increase. Speciation: new species form through isolation (example: Darwin finches)' },
		],
		12: [
			{ question: 'Discuss human evolution evidence from fossils and genetics.', answer: 'Fossils show anatomical changes. Genetics show DNA similarities with primates and evolutionary relationships' },
			{ question: "Explain the nephron's role in osmoregulation.", answer: 'Nephron filters blood, reabsorbs water/solutes, secretes waste; maintains water balance' },
			{ question: 'Describe human reproduction hormonal regulation (FSH, LH, estrogen, progesterone).', answer: 'FSH/LH from pituitary stimulate gamete production and sex hormones. Estrogen/progesterone regulate menstrual cycle and pregnancy' },
			{ question: 'Explain ecological succession and its importance for biodiversity.', answer: 'Gradual change in community over time. Increases biodiversity as ecosystem matures and becomes more stable' },
		],
	},
};

export function getQuestions(subject: Subject, grade: Grade): string[] {
	const questions = QUESTION_BANK[subject]?.[grade];
	// Return a shuffled copy of the questions array, or empty array if not found
	if (!questions || !Array.isArray(questions)) {
		return [];
	}
	return shuffleArray(questions);
}

export function getQuestionWithAnswer(subject: Subject, grade: Grade, questionText: string): QuestionWithAnswer | null {
	const questions = QUESTION_BANK_WITH_ANSWERS[subject]?.[grade];
	if (!questions || !Array.isArray(questions)) {
		return null;
	}
	const found = questions.find(q => q.question === questionText);
	return found || null;
}


