export type BlogPost = {
	slug: string;
	title: string;
	date: string;
	excerpt: string;
	content: string; // markdown
};

export const posts: BlogPost[] = [
	{
		slug: 'sa-education-challenges',
		title: 'Why South African education needs urgent support — and how AI can help',
		date: '2025-10-31',
		excerpt: 'A brief review of learning outcomes, teacher shortages, and infrastructure gaps, with evidence-backed opportunities for AI-assisted learning.',
		content: `South Africa faces persistent challenges in education outcomes, including large learning backlogs and uneven access to quality teaching. International assessments have repeatedly highlighted concerns in literacy and numeracy.

Key factors include:

- Teacher shortages and uneven resource allocation across provinces.
- Learning losses exacerbated by disruptions.
- Limited access to supplemental support outside school hours.

Evidence and sources:

- **DBE**: National policy documents outline CAPS and priorities for improving basic education ([DBE](https://www.education.gov.za/)).
- **PIRLS**: Progress in International Reading Literacy Study has reported reading challenges among Grade 4 learners ([PIRLS](https://pirls2021.org/)).
- **World Bank**: Reports on learning poverty and strategies to recover foundational learning ([World Bank – Learning Poverty](https://www.worldbank.org/en/topic/education/brief/learning-poverty)).

Where AI fits:

- Personalised practice aligned to CAPS.
- On‑demand explanations available after school.
- Multilingual feedback to support learning in home languages.
`,
	},
	{
		slug: 'ai-education-11-languages',
		title: 'A new AI education layer for South Africa — in all 11 official languages',
		date: '2025-10-31',
		excerpt: 'How multilingual AI support can expand access and equity for learners across the country.',
		content: `Multilingual access matters. Research and classroom practice show that learning in familiar languages improves comprehension and engagement.

What this means for CAPS Tutor:

- Explanations and feedback can be generated in any of the 11 official languages.
- Teachers can share structured prompts aligned to units and topics.
- Parents can assist learners after hours with trusted guidance.

References:

- **UNESCO**: Guidance on multilingual education and its benefits for inclusion ([UNESCO – Multilingual Education](https://www.unesco.org/en/multilingual-education)).
- **DBE**: Language in Education policy materials ([DBE](https://www.education.gov.za/Resources/Policies.aspx)).
`,
	},
	{
		slug: 'global-ai-education-impact',
		title: 'What the world is learning from AI in education',
		date: '2025-10-31',
		excerpt: 'A snapshot of pilots and studies on AI‑assisted tutoring and feedback worldwide.',
		content: `Early evidence from AI tutoring tools suggests promising gains when used to supplement, not replace, teaching.

Highlights:

- Immediate feedback supports mastery learning.
- Targeted practice reduces time on-task for similar outcomes.
- Teachers leverage AI to generate explanations and formative checks faster.

Suggested reading:

- **OECD**: Policy perspectives on AI in education ([OECD – AI in Education](https://www.oecd.org/education/ai/)).
- **Education Endowment Foundation (EEF)**: Evidence on digital and feedback interventions ([EEF](https://educationendowmentfoundation.org.uk/)).
`,
	},
];

export function getPost(slug: string) {
	return posts.find(p => p.slug === slug) || null;
}


