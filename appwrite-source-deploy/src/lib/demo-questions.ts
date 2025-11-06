export type Subject = 'Mathematics' | 'Physical Sciences' | 'Life Sciences';

export const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export type Grade = typeof grades[number];

export interface QuestionWithAnswer {
	question: string;
	answer: string;
}

type QuestionBank = Record<Subject, Record<Grade, string[]>>;
type QuestionBankWithAnswers = Record<Subject, Record<Grade, QuestionWithAnswer[]>>;

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
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
		1: [
			'What is 1 + 1?',
			'Count the shapes: 🔵🔵⭐',
			'Which number is bigger: 5 or 3?',
			'If you have 2 apples and get 1 more, how many apples do you have?',
		],
		2: [
			'What is 10 - 4?',
			'What is the next number: 2, 4, 6, __?',
			'How many tens are in 30?',
			'A farmer has 5 chickens and 3 cows. How many animals in total?',
		],
		3: [
			'What is 5 multiplied by 3?',
			'What is 20 divided by 4?',
			'How many sides does a triangle have?',
			'Round 27 to the nearest 10.',
		],
		4: [
			'What is 3/4 as a decimal?',
			'Find the area of a square with a side length of 5 cm.',
			'What is 7 x 8?',
			'If a movie starts at 2:00 PM and is 90 minutes long, when does it end?',
		],
		5: [
			'What is the lowest common multiple (LCM) of 4 and 6?',
			'Convert 2.5 kilograms to grams.',
			'What is 15% of 200?',
			'Identify the type of angle that is greater than 90 degrees but less than 180 degrees.',
		],
		6: [
			'Simplify the ratio 18:24.',
			'Solve for x: x + 15 = 40',
			'Calculate the average of these numbers: 10, 20, 30, 40.',
			'What is the volume of a cube with a side length of 3 cm?',
		],
		7: [
			'What is -8 + 15?',
			'Simplify the expression: 3(x + 2y).',
			'Find the value of π (pi) to two decimal places.',
			'If a circle has a radius of 5 cm, what is its circumference?',
		],
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
		1: [
			'Is wood a solid, liquid, or gas?',
			'What happens to water when you freeze it?',
			'Name a source of heat.',
			'What is a magnet?',
		],
		2: [
			'What are the three states of matter?',
			'What is a mixture?',
			'Why does a ball fall to the ground when you drop it?',
			'What is needed to make a shadow?',
		],
		3: [
			'What is the difference between melting and freezing?',
			'What is a conductor of electricity?',
			'What is a force?',
			'How does a plant get its energy?',
		],
		4: [
			'What is an atom?',
			'What are the main parts of an atom?',
			'What is the formula for water?',
			'What is energy?',
		],
		5: [
			'What is the periodic table?',
			'What is the chemical symbol for gold?',
			'What is a chemical reaction?',
			'What is the difference between a physical and chemical change?',
		],
		6: [
			'What is an acid?',
			'What is a base?',
			'What is a neutral pH?',
			'What is an indicator in chemistry?',
		],
		7: [
			'What is a fossil fuel?',
			'What is renewable energy?',
			'What is Newton\'s First Law?',
			'What is friction?',
		],
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
		1: [
			'What do plants need to grow?',
			'Name two animals that live in the ocean.',
			'What do you use your eyes for?',
			'What do we breathe in from the air?',
		],
		2: [
			'What are the main parts of a plant?',
			'How do animals move?',
			'What do we use our ears for?',
			'What happens to food in your stomach?',
		],
		3: [
			'What is a habitat?',
			'What do animals need to survive?',
			'How do plants make their food?',
			'What is the difference between a living and non-living thing?',
		],
		4: [
			'What is a food chain?',
			'What are the five senses?',
			'How do plants reproduce?',
			'What is the difference between a mammal and a bird?',
		],
		5: [
			'What is the difference between vertebrates and invertebrates?',
			'What is photosynthesis?',
			'What are the main parts of the human body?',
			'What is an ecosystem?',
		],
		6: [
			'What is the difference between a producer and a consumer?',
			'What is the function of the heart?',
			'How do plants adapt to their environment?',
			'What is biodiversity?',
		],
		7: [
			'What are the main systems in the human body?',
			'What is the role of DNA?',
			'How do plants and animals depend on each other?',
			'What is evolution?',
		],
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

// Question bank with correct answers
export const QUESTION_BANK_WITH_ANSWERS: QuestionBankWithAnswers = {
	Mathematics: {
		1: [
			{ question: 'What is 1 + 1?', answer: '2' },
			{ question: 'Count the shapes: 🔵🔵⭐', answer: '3' },
			{ question: 'Which number is bigger: 5 or 3?', answer: '5' },
			{ question: 'If you have 2 apples and get 1 more, how many apples do you have?', answer: '3' },
		],
		2: [
			{ question: 'What is 10 - 4?', answer: '6' },
			{ question: 'What is the next number: 2, 4, 6, __?', answer: '8' },
			{ question: 'How many tens are in 30?', answer: '3' },
			{ question: 'A farmer has 5 chickens and 3 cows. How many animals in total?', answer: '8' },
		],
		3: [
			{ question: 'What is 5 multiplied by 3?', answer: '15' },
			{ question: 'What is 20 divided by 4?', answer: '5' },
			{ question: 'How many sides does a triangle have?', answer: '3' },
			{ question: 'Round 27 to the nearest 10.', answer: '30' },
		],
		4: [
			{ question: 'What is 3/4 as a decimal?', answer: '0.75' },
			{ question: 'Find the area of a square with a side length of 5 cm.', answer: '25 cm^2 or 25cm2 or 25 cm2' },
			{ question: 'What is 7 x 8?', answer: '56' },
			{ question: 'If a movie starts at 2:00 PM and is 90 minutes long, when does it end?', answer: '3:30 PM or 3:30pm' },
		],
		5: [
			{ question: 'What is the lowest common multiple (LCM) of 4 and 6?', answer: '12' },
			{ question: 'Convert 2.5 kilograms to grams.', answer: '2500 g or 2500g or 2500 grams' },
			{ question: 'What is 15% of 200?', answer: '30' },
			{ question: 'Identify the type of angle that is greater than 90 degrees but less than 180 degrees.', answer: 'obtuse angle or obtuse' },
		],
		6: [
			{ question: 'Simplify the ratio 18:24.', answer: '3:4' },
			{ question: 'Solve for x: x + 15 = 40', answer: '25 or x=25' },
			{ question: 'Calculate the average of these numbers: 10, 20, 30, 40.', answer: '25' },
			{ question: 'What is the volume of a cube with a side length of 3 cm?', answer: '27 cm^3 or 27cm3 or 27 cm3' },
		],
		7: [
			{ question: 'What is -8 + 15?', answer: '7' },
			{ question: 'Simplify the expression: 3(x + 2y).', answer: '3x + 6y' },
			{ question: 'Find the value of π (pi) to two decimal places.', answer: '3.14' },
			{ question: 'If a circle has a radius of 5 cm, what is its circumference?', answer: '31.42 cm or 10π cm or 10pi cm or approximately 31.4 cm' },
		],
		8: [
			{ question: 'Simplify: 3(x + 2) − 2(x − 4).', answer: 'x + 14' },
			{ question: 'Find the value of x if 2x + 5 = 15.', answer: '5 or x=5' },
			{ question: 'Calculate the perimeter of a rectangle with length 8 cm and width 5 cm.', answer: '26 cm or 26cm' },
			{ question: 'Draw or describe the line of symmetry of an isosceles triangle.', answer: 'One line of symmetry through the vertex to the midpoint of the base, or vertical line through the apex' },
		],
		9: [
			{ question: 'Factorise completely: x^2 − 9.', answer: '(x+3)(x-3) or (x-3)(x+3)' },
			{ question: 'Solve for x: 3x − 7 = 2x + 5.', answer: '12 or x=12' },
			{ question: 'Convert 2500 ml to litres.', answer: '2.5 L or 2.5l or 2.5 liters or 2.5 litres' },
			{ question: 'Find the gradient of the line through (2,3) and (6,11).', answer: '2' },
		],
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
		1: [
			{ question: 'Is wood a solid, liquid, or gas?', answer: 'solid' },
			{ question: 'What happens to water when you freeze it?', answer: 'It becomes ice or it solidifies or it turns into a solid' },
			{ question: 'Name a source of heat.', answer: 'sun, fire, stove, electricity, friction (any valid source)' },
			{ question: 'What is a magnet?', answer: 'An object that attracts iron or magnetic materials or a material that produces a magnetic field' },
		],
		2: [
			{ question: 'What are the three states of matter?', answer: 'solid, liquid, gas' },
			{ question: 'What is a mixture?', answer: 'A combination of two or more substances that are not chemically combined' },
			{ question: 'Why does a ball fall to the ground when you drop it?', answer: 'gravity or gravitational force' },
			{ question: 'What is needed to make a shadow?', answer: 'light source, object, and surface or light and an opaque object' },
		],
		3: [
			{ question: 'What is the difference between melting and freezing?', answer: 'Melting is solid to liquid, freezing is liquid to solid or melting is when a solid becomes liquid, freezing is when a liquid becomes solid' },
			{ question: 'What is a conductor of electricity?', answer: 'A material that allows electric current to flow through it, like metals' },
			{ question: 'What is a force?', answer: 'A push or pull that can change the motion or shape of an object' },
			{ question: 'How does a plant get its energy?', answer: 'Photosynthesis or from sunlight through photosynthesis' },
		],
		4: [
			{ question: 'What is an atom?', answer: 'The smallest unit of an element that retains the properties of that element or the basic building block of matter' },
			{ question: 'What are the main parts of an atom?', answer: 'protons, neutrons, electrons or nucleus (protons and neutrons) and electrons' },
			{ question: 'What is the formula for water?', answer: 'H2O or H₂O' },
			{ question: 'What is energy?', answer: 'The ability to do work or cause change' },
		],
		5: [
			{ question: 'What is the periodic table?', answer: 'A table that organizes all known chemical elements by their atomic number' },
			{ question: 'What is the chemical symbol for gold?', answer: 'Au' },
			{ question: 'What is a chemical reaction?', answer: 'A process where substances are transformed into new substances with different properties' },
			{ question: 'What is the difference between a physical and chemical change?', answer: 'Physical change: no new substance formed. Chemical change: new substance formed with different properties' },
		],
		6: [
			{ question: 'What is an acid?', answer: 'A substance that releases H+ ions in solution or has pH less than 7' },
			{ question: 'What is a base?', answer: 'A substance that releases OH- ions in solution or has pH greater than 7' },
			{ question: 'What is a neutral pH?', answer: '7' },
			{ question: 'What is an indicator in chemistry?', answer: 'A substance that changes color to indicate the pH or acidity/alkalinity of a solution' },
		],
		7: [
			{ question: 'What is a fossil fuel?', answer: 'Fuels formed from ancient organic matter, like coal, oil, natural gas' },
			{ question: 'What is renewable energy?', answer: 'Energy from sources that can be replenished, like solar, wind, hydroelectric' },
			{ question: "What is Newton's First Law?", answer: "An object at rest stays at rest, and an object in motion stays in motion at constant velocity unless acted upon by an unbalanced force or law of inertia" },
			{ question: 'What is friction?', answer: 'A force that opposes motion between surfaces in contact' },
		],
		8: [
			{ question: 'Define density and calculate the density of a 200 g block with volume 50 cm^3.', answer: 'Density = mass/volume. Density = 4 g/cm^3 or 4g/cm3 or 4 gcm-3' },
			{ question: 'List two methods of separating a sand–salt mixture.', answer: 'Filtration and evaporation or dissolving and filtering then evaporating' },
			{ question: 'Explain why we see lightning before we hear thunder.', answer: 'Light travels faster than sound or light speed is much greater than sound speed' },
			{ question: 'Name the energy conversions in a battery-powered torch.', answer: 'Chemical to electrical to light (and some heat) or battery chemical energy to electrical to light energy' },
		],
		9: [
			{ question: "State Newton's First Law and give a simple example.", answer: "An object at rest stays at rest unless acted upon. Example: a book on a table stays still" },
			{ question: 'Calculate speed if a car travels 150 km in 2 hours 30 minutes.', answer: '60 km/h or 60km/h or 60 kmh-1' },
			{ question: 'Draw/describe the arrangement of particles in solids vs gases.', answer: 'Solids: tightly packed, ordered. Gases: far apart, random motion' },
			{ question: 'What is the pH of a neutral solution at 25°C?', answer: '7' },
		],
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
		1: [
			{ question: 'What do plants need to grow?', answer: 'water, sunlight, air (carbon dioxide), nutrients/soil (any of these)' },
			{ question: 'Name two animals that live in the ocean.', answer: 'fish, whale, shark, octopus, dolphin, sea turtle (any two ocean animals)' },
			{ question: 'What do you use your eyes for?', answer: 'seeing or vision' },
			{ question: 'What do we breathe in from the air?', answer: 'oxygen or O2' },
		],
		2: [
			{ question: 'What are the main parts of a plant?', answer: 'roots, stem, leaves, flowers (any of these)' },
			{ question: 'How do animals move?', answer: 'using muscles, legs, wings, fins (depends on animal type)' },
			{ question: 'What do we use our ears for?', answer: 'hearing or sound detection' },
			{ question: 'What happens to food in your stomach?', answer: 'digestion or it is broken down by acid and enzymes' },
		],
		3: [
			{ question: 'What is a habitat?', answer: 'The natural environment where an organism lives' },
			{ question: 'What do animals need to survive?', answer: 'food, water, shelter, air (any of these)' },
			{ question: 'How do plants make their food?', answer: 'photosynthesis' },
			{ question: 'What is the difference between a living and non-living thing?', answer: 'Living things grow, reproduce, respond to stimuli, need energy. Non-living things do not' },
		],
		4: [
			{ question: 'What is a food chain?', answer: 'A sequence showing how energy flows from one organism to another or who eats whom' },
			{ question: 'What are the five senses?', answer: 'sight, hearing, smell, taste, touch' },
			{ question: 'How do plants reproduce?', answer: 'through seeds, spores, or pollination (flowering plants)' },
			{ question: 'What is the difference between a mammal and a bird?', answer: 'Mammals have hair/fur, give live birth, produce milk. Birds have feathers, lay eggs, have beaks' },
		],
		5: [
			{ question: 'What is the difference between vertebrates and invertebrates?', answer: 'Vertebrates have a backbone/spinal column. Invertebrates do not' },
			{ question: 'What is photosynthesis?', answer: 'The process where plants use sunlight, water, and CO2 to make glucose and oxygen' },
			{ question: 'What are the main parts of the human body?', answer: 'head, torso, arms, legs or organ systems (skeletal, muscular, circulatory, etc.)' },
			{ question: 'What is an ecosystem?', answer: 'A community of living organisms and their physical environment interacting together' },
		],
		6: [
			{ question: 'What is the difference between a producer and a consumer?', answer: 'Producers make their own food (plants). Consumers eat other organisms (animals)' },
			{ question: 'What is the function of the heart?', answer: 'To pump blood throughout the body or circulate blood' },
			{ question: 'How do plants adapt to their environment?', answer: 'Through structural features like roots, leaves, stems that help them survive (examples vary)' },
			{ question: 'What is biodiversity?', answer: 'The variety of different species and ecosystems in an area' },
		],
		7: [
			{ question: 'What are the main systems in the human body?', answer: 'digestive, circulatory, respiratory, nervous, skeletal, muscular, reproductive (any of these)' },
			{ question: 'What is the role of DNA?', answer: 'Stores genetic information, codes for proteins, controls heredity' },
			{ question: 'How do plants and animals depend on each other?', answer: 'Plants produce oxygen and food. Animals produce CO2 and nutrients (cycle of interdependence)' },
			{ question: 'What is evolution?', answer: 'The process by which species change over time through natural selection' },
		],
		8: [
			{ question: 'Name the main organelles of a typical plant cell and one function of each.', answer: 'Nucleus (control center), chloroplast (photosynthesis), cell wall (support), mitochondria (energy), vacuole (storage)' },
			{ question: 'Describe the process of photosynthesis and write its balanced equation.', answer: '6CO2 + 6H2O + light energy → C6H12O6 + 6O2 or CO2 + H2O → glucose + O2' },
			{ question: 'Explain how biodiversity supports ecosystem stability.', answer: 'Greater diversity provides resilience, reduces risk of collapse, supports food webs' },
			{ question: 'List three lifestyle factors that promote healthy growth during adolescence.', answer: 'balanced diet, exercise, adequate sleep, avoiding drugs/alcohol (any three)' },
		],
		9: [
			{ question: 'Describe the structure–function relationship of alveoli.', answer: 'Tiny air sacs with thin walls and large surface area for efficient gas exchange' },
			{ question: 'Explain natural selection using an example of antibiotic resistance.', answer: 'Bacteria with resistance survive antibiotics and reproduce, passing resistance to offspring' },
			{ question: 'Draw/describe the digestive tract and identify where starch digestion begins.', answer: 'Mouth (saliva/amylase) or small intestine' },
			{ question: 'Define ecosystems and differentiate between biotic and abiotic components.', answer: 'Ecosystem: living and non-living components. Biotic: living. Abiotic: non-living (water, soil, temperature)' },
		],
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
	const questions = QUESTION_BANK[subject][grade];
	// Return a shuffled copy of the questions array
	return shuffleArray(questions);
}

export function getQuestionWithAnswer(subject: Subject, grade: Grade, questionText: string): QuestionWithAnswer | null {
	const questions = QUESTION_BANK_WITH_ANSWERS[subject][grade];
	const found = questions.find(q => q.question === questionText);
	return found || null;
}


