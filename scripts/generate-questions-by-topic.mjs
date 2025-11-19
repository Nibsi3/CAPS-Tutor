/**
 * Systematic Question Generator
 * Generates at least 20 questions per topic per subject for Grade 12
 * Uses question presets and AI to create CAPS-aligned questions
 */

import { Client, Databases, ID, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'capstutor';
const PRESETS_COLLECTION_ID = 'custompresets'; // Store as custom presets for paper editor

// Grade 12 CAPS Topics by Subject
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
  'Economics': [
    'Circular flow',
    'Business cycles',
    'Public sector',
    'Foreign exchange markets',
    'Protectionism and free trade',
    'Economic growth and development',
    'Economic indicators',
    'Market structures',
    'Perfect markets',
    'Imperfect markets',
  ],
  'Geography': [
    'Climatology',
    'Geomorphology',
    'Rural and urban settlement',
    'Economic geography of South Africa',
    'Geographical skills and techniques',
  ],
  'History': [
    'The Cold War',
    'Independent Africa',
    'Civil society protests 1950s-1970s',
    'Civil resistance 1970s-1980s',
    'The coming of democracy in South Africa',
    'The end of the Cold War and a new world order',
  ],
};

// All 22 question types organized by category
const ALL_QUESTION_TYPES = {
  "Written": [
    "short-answer",
    "paragraph-long-answer",
    "reasoning-interpretation",
    "true-false-with-reason",
    "compare-evaluate-predict",
    "sequencing-ordering"
  ],
  "Objective": [
    "multiple-choice",
    "matching-pairing",
    "fill-in-blank"
  ],
  "Visual": [
    "diagram-interpretation",
    "diagram-labeling",
    "table-interpretation",
    "graph-interpretation",
    "map-cartoon",
    "data-set-analysis"
  ],
  "Extract-Based": [
    "extract-source",
    "case-study"
  ],
  "Calculation": [
    "numeric-calculation",
    "formula-based-calculation",
    "accounting-financial-calculation",
    "geography-scale-gradient",
    "biology-percentage-ratio"
  ]
};

// Question templates by type (CAPS-aligned)
const QUESTION_TEMPLATES = {
  'short-answer': [
    'Define {term} in the context of {topic}.',
    'State two characteristics of {concept}.',
    'Name the {component} responsible for {function}.',
    'List three examples of {concept}.',
    'What is the main function of {concept}?',
    'Explain briefly what {term} means.',
    'Give one example of {concept}.',
  ],
  'paragraph-long-answer': [
    'Explain in detail how {process} works in {topic}.',
    'Discuss the importance of {concept} in {context}.',
    'Describe the relationship between {concept1} and {concept2} in {topic}.',
    'Analyze the impact of {factor} on {outcome} in {topic}.',
    'Compare and contrast {concept1} with {concept2}.',
  ],
  'reasoning-interpretation': [
    'Explain why {phenomenon} occurs in {topic}.',
    'Interpret the significance of {concept} in {context}.',
    'Justify your reasoning for {statement} related to {topic}.',
    'Analyze the reasoning behind {process} in {topic}.',
  ],
  'true-false-with-reason': [
    'State whether the following is TRUE or FALSE: "{statement}". Give a reason for your answer.',
    'Determine if "{statement}" is correct. Justify your answer with reference to {topic}.',
  ],
  'compare-evaluate-predict': [
    'Compare {concept1} with {concept2} in {topic}.',
    'Evaluate the effectiveness of {approach} in {context}.',
    'Predict what would happen if {condition} in {topic}.',
  ],
  'sequencing-ordering': [
    'Arrange the following steps in the correct order: {steps}.',
    'Sequence the events that occur during {process} in {topic}.',
  ],
  'multiple-choice': [
    'Which of the following best describes {concept} in {topic}?',
    'What is the primary function of {component} in {topic}?',
    'Which statement about {topic} is correct?',
    'What happens when {action} occurs in {topic}?',
    'Which factor most influences {outcome} in {topic}?',
  ],
  'matching-pairing': [
    'Match the terms in Column A with their descriptions in Column B.',
    'Pair each {concept} with its corresponding {property} in {topic}.',
  ],
  'fill-in-blank': [
    'Complete the following: "{sentence with blank}" in {topic}.',
    'Fill in the missing word: "{sentence}" related to {topic}.',
  ],
  'diagram-interpretation': [
    'Study the diagram below showing {concept} in {topic}. Explain what is happening.',
    'Interpret the diagram of {concept} and describe the process shown.',
  ],
  'diagram-labeling': [
    'Label the parts A, B, and C in the diagram of {concept} below.',
    'Identify and label the structures shown in the {concept} diagram.',
  ],
  'table-interpretation': [
    'Study the table below showing {data} for {topic}. Analyze the trends.',
    'Interpret the data in the table and explain the patterns observed.',
  ],
  'graph-interpretation': [
    'Study the graph showing {relationship} in {topic}. Describe the trend.',
    'Analyze the graph and explain what it shows about {concept}.',
  ],
  'map-cartoon': [
    'Study the map/cartoon below. Explain what it represents in {topic}.',
    'Interpret the visual representation and describe its significance.',
  ],
  'data-set-analysis': [
    'Analyze the following data set for {topic} and identify key patterns.',
    'Examine the data provided and draw conclusions about {concept}.',
  ],
  'extract-source': [
    'Read the following extract about {topic} and answer the questions that follow.',
    'Study the source material and explain its relevance to {concept}.',
  ],
  'case-study': [
    'Read the case study about {scenario} in {topic} and analyze the situation.',
    'Examine the case study and evaluate the factors involved.',
  ],
  'numeric-calculation': [
    'Calculate {value} given that {conditions} in {topic}.',
    'Determine {result} if {parameters} for {concept}.',
    'Find the value of {variable} when {conditions} in {topic}.',
  ],
  'formula-based-calculation': [
    'Use the formula {formula} to calculate {result} for {concept} in {topic}.',
    'Apply the appropriate formula to determine {value} given {parameters}.',
  ],
  'accounting-financial-calculation': [
    'Calculate the {financial metric} for {scenario} using {method}.',
    'Determine the {accounting value} based on the following transactions.',
  ],
  'geography-scale-gradient': [
    'Calculate the gradient between point A and point B on the map.',
    'Determine the scale of the map and calculate the actual distance.',
  ],
  'biology-percentage-ratio': [
    'Calculate the percentage of {component} in {sample} for {topic}.',
    'Determine the ratio of {concept1} to {concept2} in {context}.',
  ],
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

/**
 * Generate question using AI (GROQ) or fallback to template
 */
async function generateQuestionText(type, topic, subject, questionNumber, template) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    // Fallback to template-based generation
    return generateQuestionFromTemplate(type, topic, subject, template);
  }
  
  try {
    const prompt = `You are an expert CAPS (Curriculum and Assessment Policy Statement) educator for Grade 12 ${subject} in South Africa.

Generate a ${type} question about "${topic}" that is:
- CAPS-aligned and appropriate for Grade 12 level
- Clear, specific, and exam-ready
- Similar in style to official DBE past papers
- Appropriate length for ${type} type questions

Topic: ${topic}
Subject: ${subject}
Question Type: ${type}
Template: ${template}

Generate ONLY the question text, no explanations or answers. Make it authentic and specific to ${topic}. Use the template as a guide but make it CAPS-appropriate.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert CAPS educator. Generate authentic, exam-ready questions for Grade 12 students in South Africa.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`GROQ API error: ${response.status}`);
    }
    
    const data = await response.json();
    const questionText = data.choices[0]?.message?.content?.trim();
    
    if (questionText) {
      return questionText;
    }
  } catch (error) {
    console.warn(`  ⚠️  AI generation failed for ${topic} ${type}, using template:`, error.message);
  }
  
  // Fallback to template
  return generateQuestionFromTemplate(type, topic, subject, template);
}

/**
 * Generate question from template (fallback)
 */
function generateQuestionFromTemplate(type, topic, subject, template) {
  let question = template
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
    .replace(/{abbreviation}/g, 'this abbreviation')
    .replace(/{statement}/g, 'this statement')
    .replace(/{steps}/g, 'step 1, step 2, step 3')
    .replace(/{sentence with blank}/g, `The ${topic} is important because ___`)
    .replace(/{sentence}/g, `In ${topic}, the main concept is ___`)
    .replace(/{relationship}/g, 'the relationship')
    .replace(/{scenario}/g, 'this scenario')
    .replace(/{formula}/g, 'the appropriate formula')
    .replace(/{financial metric}/g, 'the financial metric')
    .replace(/{method}/g, 'the appropriate method')
    .replace(/{accounting value}/g, 'the accounting value')
    .replace(/{sample}/g, 'the sample');
  
  return question;
}

/**
 * Get allowed question types for a subject
 */
function getAllowedQuestionTypesForSubject(subject) {
  // Get all question types, but filter based on subject
  const allTypes = Object.values(ALL_QUESTION_TYPES).flat();
  
  // Some subjects have restrictions (e.g., no map-cartoon for Math/Life Science)
  if (subject === 'Mathematics' || subject === 'Life Sciences') {
    return allTypes.filter(t => t !== 'map-cartoon');
  }
  
  // Accounting gets accounting-specific calculation types
  if (subject === 'Accounting') {
    return allTypes.filter(t => 
      t !== 'map-cartoon' && 
      t !== 'geography-scale-gradient' && 
      t !== 'biology-percentage-ratio'
    );
  }
  
  // Geography gets geography-specific calculation types
  if (subject === 'Geography') {
    return allTypes.filter(t => 
      t !== 'accounting-financial-calculation' && 
      t !== 'biology-percentage-ratio'
    );
  }
  
  return allTypes;
}

/**
 * Generate questions for a specific topic - creates at least 20 questions across all allowed types
 */
async function generateQuestionsForTopic(subject, topic, userId = 'system') {
  const presets = [];
  const allowedTypes = getAllowedQuestionTypesForSubject(subject);
  
  // Generate at least 1 question per type, then distribute remaining to reach 20+
  const minPerType = 1;
  const targetTotal = 20;
  const remaining = Math.max(0, targetTotal - (allowedTypes.length * minPerType));
  
  let questionNum = 1;
  
  // First pass: at least 1 per type
  for (const type of allowedTypes) {
    const templates = QUESTION_TEMPLATES[type] || QUESTION_TEMPLATES['short-answer'];
    const template = templates[questionNum % templates.length];
    
    // Generate question text (with AI if available)
    const questionText = await generateQuestionText(type, topic, subject, questionNum, template);
    
    // Determine marks based on type
    let marks = 2;
    if (type === 'multiple-choice') marks = 1;
    else if (type.includes('calculation')) marks = 3;
    else if (type === 'paragraph-long-answer') marks = 5;
    else if (type === 'reasoning-interpretation' || type === 'compare-evaluate-predict') marks = 4;
    
    const preset = {
      userId,
      name: `${subject} - ${topic} - ${type} - Q${questionNum}`,
      description: `Grade 12 ${subject} ${type} question about ${topic}`,
      type,
      text: questionText,
      marks,
      subject,
      instructionText: type === 'paragraph-long-answer' ? 'Write a detailed response.' : 
                      type === 'reasoning-interpretation' ? 'Provide reasoning for your answer.' : '',
    };
    
    // Add type-specific fields
    if (type === 'multiple-choice') {
      preset.options = ['Option A', 'Option B', 'Option C', 'Option D'];
    } else if (type === 'matching-pairing') {
      preset.instructionText = 'Match items from Column A with Column B.';
    } else if (type === 'diagram-interpretation' || type === 'diagram-labeling') {
      preset.hasDiagram = true;
      preset.diagramLabel = `Diagram for ${topic}`;
    } else if (type === 'table-interpretation') {
      preset.tableData = {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [['Data 1', 'Data 2', 'Data 3'], ['Data 4', 'Data 5', 'Data 6']],
        description: `Data table for ${topic}`
      };
    } else if (type === 'graph-interpretation') {
      preset.graphData = {
        type: 'line',
        description: `Graph showing ${topic} data`,
        xAxisLabel: 'X-axis',
        yAxisLabel: 'Y-axis',
        dataPoints: [
          { label: 'Point 1', value: 10 },
          { label: 'Point 2', value: 20 },
          { label: 'Point 3', value: 15 }
        ]
      };
    } else if (type === 'extract-source' || type === 'case-study') {
      preset.extractText = `Sample extract or case study text for ${topic} in ${subject}. This provides context for the question.`;
    }
    
    preset.answer = `Sample answer for ${type} question about ${topic}`;
    
    presets.push(preset);
    questionNum++;
    
    // Small delay to avoid rate limiting
    if (questionNum % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Second pass: distribute remaining questions across types
  for (let i = 0; i < remaining; i++) {
    const typeIndex = i % allowedTypes.length;
    const type = allowedTypes[typeIndex];
    const templates = QUESTION_TEMPLATES[type] || QUESTION_TEMPLATES['short-answer'];
    const template = templates[(questionNum + i) % templates.length];
    
    const questionText = await generateQuestionText(type, topic, subject, questionNum, template);
    
    let marks = 2;
    if (type === 'multiple-choice') marks = 1;
    else if (type.includes('calculation')) marks = 3;
    else if (type === 'paragraph-long-answer') marks = 5;
    
    const preset = {
      userId,
      name: `${subject} - ${topic} - ${type} - Q${questionNum}`,
      description: `Grade 12 ${subject} ${type} question about ${topic}`,
      type,
      text: questionText,
      marks,
      subject,
    };
    
    if (type === 'multiple-choice') {
      preset.options = ['Option A', 'Option B', 'Option C', 'Option D'];
    }
    
    preset.answer = `Sample answer for ${type} question about ${topic}`;
    presets.push(preset);
    questionNum++;
    
    if (questionNum % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return presets;
}

/**
 * Check if preset already exists
 */
async function presetExists(userId, subject, topic, questionNumber) {
  try {
    const presetName = `${subject} - ${topic} - Q${questionNumber}`;
    const results = await databases.listDocuments(
      DATABASE_ID,
      PRESETS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('name', presetName),
        Query.equal('subject', subject),
      ]
    );
    return results.documents.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Store preset in database
 */
async function storePreset(presetData) {
  try {
    // Check if preset already exists
    const questionNumber = presetData.name.split('Q').pop();
    const exists = await presetExists(presetData.userId, presetData.subject, presetData.description.split('about ')[1]?.split(' (')[0] || '', questionNumber);
    if (exists) {
      return { success: true, skipped: true };
    }
    
    const presetId = ID.unique();
    const documentData = {
      userId: presetData.userId,
      name: presetData.name,
      description: presetData.description,
      type: presetData.type,
      text: presetData.text,
      marks: presetData.marks,
      subject: presetData.subject || '',
    };
    
    // Add optional fields only if they exist
    if (presetData.instructionText) {
      documentData.instructionText = presetData.instructionText;
    }
    
    if (presetData.options && Array.isArray(presetData.options)) {
      documentData.options = JSON.stringify(presetData.options);
    }
    
    if (presetData.tableData) {
      documentData.tableData = JSON.stringify(presetData.tableData);
    }
    
    if (presetData.graphData) {
      documentData.graphData = JSON.stringify(presetData.graphData);
    }
    
    if (presetData.extractText) {
      documentData.extractText = presetData.extractText;
    }
    
    if (presetData.hasDiagram) {
      documentData.hasDiagram = presetData.hasDiagram;
      documentData.diagramLabel = presetData.diagramLabel || 'Diagram';
    }
    
    if (presetData.answer) {
      documentData.answer = presetData.answer;
    }
    
    await databases.createDocument(
      DATABASE_ID,
      PRESETS_COLLECTION_ID,
      presetId,
      documentData
    );
    
    return { success: true, skipped: false, id: presetId };
  } catch (error) {
    console.error(`  ❌ Error storing preset "${presetData.name}":`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main function to generate questions for all subjects and topics
 */
async function generateAllQuestions() {
  console.log('🚀 Starting systematic question generation...\n');
  console.log(`📊 Target: At least 20 questions per topic per subject\n`);
  console.log(`📦 Storing as custom presets in: ${PRESETS_COLLECTION_ID}\n`);
  console.log(`📝 Question types: All 22 types organized by category\n`);
  
  // Use a system user ID - you can change this to a specific admin user ID
  const SYSTEM_USER_ID = process.env.SYSTEM_USER_ID || 'system-generator';
  
  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const startTime = Date.now();
  
  for (const [subject, topics] of Object.entries(GRADE_12_TOPICS)) {
    console.log(`\n📚 Processing Subject: ${subject}`);
    console.log(`   Topics: ${topics.length}`);
    console.log(`   Expected presets: ${topics.length * 20}\n`);
    
    for (const topic of topics) {
      console.log(`  📝 Topic: ${topic}`);
      
      try {
        // Generate questions for this topic (at least 20, covering all allowed types)
        const presets = await generateQuestionsForTopic(subject, topic, SYSTEM_USER_ID);
        
        let topicGenerated = 0;
        let topicSkipped = 0;
        let topicErrors = 0;
        
        for (const preset of presets) {
          const result = await storePreset(preset);
          
          if (result.success) {
            if (result.skipped) {
              topicSkipped++;
              totalSkipped++;
            } else {
              topicGenerated++;
              totalGenerated++;
            }
          } else {
            topicErrors++;
            totalErrors++;
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log(`     ✅ Generated: ${topicGenerated}, ⏭️  Skipped: ${topicSkipped}, ❌ Errors: ${topicErrors}`);
      } catch (error) {
        console.error(`     ❌ Error processing topic ${topic}:`, error.message);
        totalErrors += 20; // Count all questions as errors
      }
    }
    
    console.log(`\n   ✅ Completed ${subject}`);
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log(`\n\n📊 Summary:`);
  console.log(`   ✅ Total Generated: ${totalGenerated}`);
  console.log(`   ⏭️  Total Skipped: ${totalSkipped}`);
  console.log(`   ❌ Total Errors: ${totalErrors}`);
  console.log(`   📝 Total Processed: ${totalGenerated + totalSkipped + totalErrors}`);
  console.log(`   ⏱️  Duration: ${duration}s\n`);
}

// Run the generator
generateAllQuestions().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

