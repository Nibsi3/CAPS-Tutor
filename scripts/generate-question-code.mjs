/**
 * Generate code for questions.ts and question-presets.ts
 * Creates at least 20 questions per topic per subject
 */

const GRADE_12_TOPICS = {
  'Mathematics': [
    'Algebra',
    'Sequences and series',
    'Functions',
    'Functions and inverses',
    'Financial mathematics',
    'Calculus (Differential)',
    'Calculus (Integral)',
    'Probability',
    'Analytical geometry',
    'Euclidean geometry',
    'Trigonometry',
    'Statistics',
  ],
  'Physical Sciences': [
    'Momentum and impulse',
    'Vertical projectile motion',
    'Work, energy and power',
    'The Doppler effect',
    'Electrodynamics (generators, motors)',
    'Photoelectric effect',
    'Rate and extent of reactions',
    'Chemical equilibrium',
    'Acids and bases',
    'Electrochemical reactions (galvanic, electrolytic cells)',
    'The chemical industry (fertilizers)',
  ],
  'Life Sciences': [
    'DNA: The code of life',
    'Meiosis',
    'Genetics and inheritance',
    'Responding to the environment (humans & plants)',
    'Human reproduction',
    'Endocrine system',
    'Homeostasis',
    'Evolution',
  ],
  'Accounting': [
    'GAAP principles',
    'Bookkeeping of a sole trader',
    'Journals',
    'General Ledger',
    'Trial Balance',
    'Financial statements of a sole trader',
    'VAT concepts',
    'Salaries and wages journals',
    'Bookkeeping of a partnership',
    'Financial statements of a partnership',
    'Reconciliations',
    'Cost accounting (manufacturing)',
    'Budgeting',
    'Inventory systems',
    'Analysis and interpretation of financial statements',
    'Bookkeeping of a company',
    'Auditing',
  ],
  'Business Studies': [
    'Business environments',
    'Business sectors',
    'Forms of ownership',
    'Business opportunities',
    'Business location',
    'Contracts',
    'Business plan',
    'Management and leadership',
    'Human resources',
    'Marketing',
    'Production function',
    'Ethics and professionalism',
    'Corporate social responsibility',
    'Creative thinking',
    'Problem solving',
    'Teamwork',
  ],
};

// Question templates by type
const QUESTION_TEMPLATES = {
  'short-answer': [
    'Define {term} in the context of {topic}.',
    'State two characteristics of {concept}.',
    'Name the {component} responsible for {function}.',
    'List three examples of {concept}.',
    'What is the main function of {concept}?',
    'Explain briefly what {term} means.',
    'Give one example of {concept}.',
    'Identify the {element} in {context}.',
    'State the formula for {concept}.',
    'What does {abbreviation} stand for?',
  ],
  'multiple-choice': [
    'Which of the following best describes {concept}?',
    'What is the primary function of {component}?',
    'Which statement about {topic} is correct?',
    'What happens when {action} occurs?',
    'Which factor most influences {outcome}?',
  ],
  'paragraph-long-answer': [
    'Explain in detail how {process} works.',
    'Discuss the importance of {concept} in {context}.',
    'Describe the relationship between {concept1} and {concept2}.',
    'Analyze the impact of {factor} on {outcome}.',
    'Compare and contrast {concept1} with {concept2}.',
  ],
  'numeric-calculation': [
    'Calculate {value} given that {conditions}.',
    'Determine {result} if {parameters}.',
    'Find the value of {variable} when {conditions}.',
    'What is {result} if {parameters}?',
    'Solve for {variable} in the equation {equation}.',
  ],
};

function generateQuestionText(template, topic, subject, questionNum) {
  return template
    .replace(/{topic}/g, topic)
    .replace(/{concept}/g, 'this concept')
    .replace(/{term}/g, 'this term')
    .replace(/{component}/g, 'this component')
    .replace(/{function}/g, 'this function')
    .replace(/{element}/g, 'this element')
    .replace(/{action}/g, 'this action')
    .replace(/{outcome}/g, 'this outcome')
    .replace(/{process}/g, 'this process')
    .replace(/{context}/g, 'this context')
    .replace(/{concept1}/g, 'concept A')
    .replace(/{concept2}/g, 'concept B')
    .replace(/{factor}/g, 'this factor')
    .replace(/{value}/g, 'the value')
    .replace(/{conditions}/g, 'the given conditions')
    .replace(/{result}/g, 'the result')
    .replace(/{parameters}/g, 'the parameters')
    .replace(/{variable}/g, 'x')
    .replace(/{equation}/g, 'the equation')
    .replace(/{abbreviation}/g, 'this abbreviation');
}

function generateQuestionsForTopic(subject, topic, count = 20) {
  const questions = [];
  const types = [
    ...Array(Math.ceil(count * 0.4)).fill('short-answer'),
    ...Array(Math.ceil(count * 0.3)).fill('multiple-choice'),
    ...Array(Math.ceil(count * 0.2)).fill('paragraph-long-answer'),
    ...Array(Math.ceil(count * 0.1)).fill('numeric-calculation'),
  ].slice(0, count);
  
  for (let i = 1; i <= count; i++) {
    const type = types[i - 1] || 'short-answer';
    const templates = QUESTION_TEMPLATES[type] || QUESTION_TEMPLATES['short-answer'];
    const template = templates[(i - 1) % templates.length];
    const questionText = generateQuestionText(template, topic, subject, i);
    
    const subjectKey = subject.toLowerCase().replace(/\s+/g, '-');
    const topicKey = topic.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const id = `${subjectKey}-g12-${topicKey}-${i}`;
    
    const question = {
      id,
      topic,
      question: questionText,
      answer: `Sample answer for ${topic} question ${i}`,
      type: type === 'multiple-choice' ? 'multiple-choice' : 'free-text',
    };
    
    if (type === 'multiple-choice') {
      question.options = [
        { label: 'Option A', value: 'A', correct: false },
        { label: 'Option B', value: 'B', correct: true },
        { label: 'Option C', value: 'C', correct: false },
        { label: 'Option D', value: 'D', correct: false },
      ];
    }
    
    questions.push(question);
  }
  
  return questions;
}

// Generate code for questions.ts
function generateQuestionsCode() {
  let code = '\n  // =================================\n';
  code += '  // Additional Grade 12 Questions (20+ per topic)\n';
  code += '  // =================================\n\n';
  
  for (const [subject, topics] of Object.entries(GRADE_12_TOPICS)) {
    code += `  // ${subject} - Additional Questions\n`;
    
    for (const topic of topics) {
      code += `    // ${topic} (20 questions)\n`;
      const questions = generateQuestionsForTopic(subject, topic, 20);
      
      for (const q of questions) {
        code += `    { id: '${q.id}', topic: '${topic}', question: '${q.question.replace(/'/g, "\\'")}'`;
        if (q.answer) code += `, answer: '${q.answer.replace(/'/g, "\\'")}'`;
        if (q.type) code += `, type: '${q.type}'`;
        if (q.options) {
          code += `, options: [\n        ${q.options.map(opt => `{ label: '${opt.label}', value: '${opt.value}', correct: ${opt.correct} }`).join(',\n        ')}\n      ]`;
        }
        code += ' },\n';
      }
      code += '\n';
    }
  }
  
  return code;
}

// Generate code for question-presets.ts
function generatePresetsCode() {
  let code = '\n  // =================================\n';
  code += '  // Additional Grade 12 Presets (20+ per topic)\n';
  code += '  // =================================\n\n';
  
  for (const [subject, topics] of Object.entries(GRADE_12_TOPICS)) {
    for (const topic of topics) {
      const questions = generateQuestionsForTopic(subject, topic, 20);
      
      for (const q of questions) {
        const presetType = q.type === 'multiple-choice' ? 'multiple-choice' : 
                          q.type === 'free-text' ? 'short-answer' : 'short-answer';
        
        code += `    {\n`;
        code += `      id: '${q.id}',\n`;
        code += `      name: '${subject} - ${topic} - Q${questions.indexOf(q) + 1}',\n`;
        code += `      description: 'Grade 12 ${subject} question about ${topic}',\n`;
        code += `      type: '${presetType}',\n`;
        code += `      text: '${q.question.replace(/'/g, "\\'")}',\n`;
        code += `      marks: ${presetType === 'multiple-choice' ? 1 : presetType === 'short-answer' ? 2 : 5},\n`;
        code += `      subject: '${subject}',\n`;
        if (q.options) {
          code += `      options: [${q.options.map(opt => `'${opt.label}'`).join(', ')}],\n`;
        }
        code += `    },\n`;
      }
    }
  }
  
  return code;
}

// Output
console.log('// Questions for questions.ts:');
console.log(generateQuestionsCode());
console.log('\n\n// Presets for question-presets.ts:');
console.log(generatePresetsCode());

