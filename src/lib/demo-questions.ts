export type Subject = 'Mathematics' | 'Physical Sciences' | 'Life Sciences';

export const grades = [8, 9, 10, 11, 12] as const;
export type Grade = typeof grades[number];

type QuestionBank = Record<Subject, Record<Grade, string[]>>;

// CAPS-aligned sample questions (concise). Four per subject per grade.
export const QUESTION_BANK: QuestionBank = {
	Mathematics: {
		8: [
			'Simplify: 3(x + 2) − 2(x − 4).',
			'Find the value of x if 2x + 5 = 15.',
			'Calculate the perimeter of a rectangle with length 8 cm and width 5 cm.',
			'Draw or describe the line of symmetry of an isosceles triangle.',
		],
		9: [
			'Factorise completely: x^2 − 9.',
			'Solve for x: 3x − 7 = 2x + 5.',
			'Convert 2500 ml to litres.',
			'Find the gradient of the line through (2,3) and (6,11).',
		],
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
		8: [
			'Define density and calculate the density of a 200 g block with volume 50 cm^3.',
			'List two methods of separating a sand–salt mixture.',
			'Explain why we see lightning before we hear thunder.',
			'Name the energy conversions in a battery-powered torch.',
		],
		9: [
			'State Newton’s First Law and give a simple example.',
			'Calculate speed if a car travels 150 km in 2 hours 30 minutes.',
			'Draw/describe the arrangement of particles in solids vs gases.',
			'What is the pH of a neutral solution at 25°C?',
		],
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
		8: [
			'Name the main organelles of a typical plant cell and one function of each.',
			'Describe the process of photosynthesis and write its balanced equation.',
			'Explain how biodiversity supports ecosystem stability.',
			'List three lifestyle factors that promote healthy growth during adolescence.',
		],
		9: [
			'Describe the structure–function relationship of alveoli.',
			'Explain natural selection using an example of antibiotic resistance.',
			'Draw/describe the digestive tract and identify where starch digestion begins.',
			'Define ecosystems and differentiate between biotic and abiotic components.',
		],
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

export function getQuestions(subject: Subject, grade: Grade): string[] {
	return QUESTION_BANK[subject][grade];
}


