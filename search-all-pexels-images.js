const fs = require('fs');
const path = require('path');

const PEXELS_API_KEY = 'kCRXA1eqe8XOPmgA8tLJxF3c9Iv4LvsULhc3S62sD1MqMxgfAY2A4oWj';

// Complete mapping of all blog slugs to search terms
const allBlogTopics = [
  { slug: 'bridging-the-gap-ai-in-south-african-education', search: 'classroom students africa education school' },
  { slug: 'accessible-ai-learning-in-11-languages', search: 'languages multilingual communication diversity' },
  { slug: 'global-impact-of-ai-in-education', search: 'global education world technology' },
  { slug: 'preparing-for-nsc-exams-with-ai', search: 'exam study preparation test books' },
  { slug: 'caps-aligned-ai-why-it-matters', search: 'curriculum books education learning' },
  { slug: 'adaptive-learning-personalized-pathways', search: 'personalized learning individual technology' },
  { slug: 'supporting-teachers-with-ai', search: 'teacher classroom education teaching' },
  { slug: 'equity-in-education-bridging-digital-divide', search: 'digital technology access inequality laptop' },
  { slug: 'learning-from-mistakes-ai-feedback', search: 'mistakes learning feedback correction' },
  { slug: 'future-of-assessment-ai-evaluation', search: 'assessment test evaluation exam' },
  { slug: 'building-study-habits-ai-coaching', search: 'study habits routine learning schedule' },
  { slug: 'parent-role-ai-assisted-learning', search: 'parent child family learning together' },
  { slug: 'ai-tutoring-myths-realities', search: 'AI artificial intelligence technology robot' },
  { slug: 'research-personalized-learning-ai-effectiveness', search: 'research study data analysis charts' },
  { slug: 'research-ai-feedback-learning-outcomes', search: 'feedback learning research study' },
  { slug: 'global-studies-ai-education-meta-analysis', search: 'global study research analysis world' },
  { slug: 'how-to-pass-exams-flying-colours', search: 'exam success achievement celebration graduation' },
  { slug: 'ai-tutor-vs-traditional-tutoring-comparison', search: 'tutor teaching comparison traditional modern' },
  { slug: 'metacognition-self-regulated-learning', search: 'thinking brain cognitive learning mental' },
  { slug: 'critical-thinking-ai-education', search: 'critical thinking problem solving analysis' },
  { slug: 'remote-learning-success-strategies', search: 'laptop online learning remote education' },
  { slug: 'early-childhood-education-ai', search: 'children kids preschool learning toys' },
  { slug: 'stem-education-ai-enhanced-learning', search: 'science lab technology engineering math' },
  { slug: 'emotional-intelligence-learning-success', search: 'emotions social skills communication feelings' },
  { slug: 'south-africa-education-budget-2025', search: 'budget finance money education funding' },
  { slug: 'matric-results-2024-analysis-ai-impact', search: 'graduation cap results achievement certificate' },
  { slug: 'western-cape-digital-schools-initiative', search: 'digital school technology computer classroom' },
  { slug: 'teacher-shortage-crisis-south-africa', search: 'teacher shortage education empty classroom' },
  { slug: 'caps-curriculum-updates-2025', search: 'curriculum update education books documents' },
  { slug: 'cognitive-load-theory-optimizing-learning', search: 'brain cognitive load learning mental capacity' },
  { slug: 'gamification-ai-learning-engagement', search: 'game gamification fun learning interactive' },
  { slug: 'preparing-university-ai-study-skills', search: 'university college campus study preparation' },
  { slug: 'mastering-time-management-ai-tools', search: 'time management clock schedule organization' },
  { slug: 'building-confidence-through-ai-guided-practice', search: 'confidence support encouragement anxiety relief' },
  { slug: 'multilingual-ai-breaking-language-barriers', search: 'language translation multilingual communication' },
  { slug: 'data-driven-learning-analytics-and-insights', search: 'data analytics charts graphs learning' },
  { slug: 'collaborative-learning-in-digital-age', search: 'teamwork collaboration group learning' },
  { slug: 'inclusive-education-ai-accessibility', search: 'accessibility inclusive diversity learning' },
  { slug: 'motivation-and-engagement-ai-strategies', search: 'motivation inspiration goal achievement' },
  { slug: 'future-of-assessment-ai-evaluation', search: 'future technology assessment innovation' },
  { slug: 'parent-guide-ai-tutoring-success', search: 'parent guide book reading support' },
  { slug: 'holiday-learning-maintaining-momentum', search: 'holiday vacation reading learning book' },
  { slug: 'year-end-reflection-goal-setting', search: 'goal setting planning new year reflection' },
  { slug: 'exam-stress-management-techniques', search: 'stress relief meditation calm anxiety' },
  { slug: 'winter-school-programs-south-africa', search: 'winter school program education learning' },
  { slug: 'reading-comprehension-ai-support', search: 'reading books comprehension literacy' },
  { slug: 'new-year-academic-resolutions', search: 'new year resolution goal planning' },
  { slug: 'transitioning-grade-levels-ai-support', search: 'transition change growth education school' },
  { slug: 'back-to-school-preparation-2026', search: 'back to school backpack books preparation' },
  { slug: 'matric-preparation-early-start', search: 'matric grade 12 study preparation' },
  { slug: 'career-planning-education-pathways', search: 'career planning future job path' },
  { slug: 'learning-styles-ai-personalization', search: 'learning styles individual preference' },
  { slug: 'summer-learning-loss-prevention', search: 'summer learning book reading vacation' },
  { slug: 'community-learning-spaces-south-africa', search: 'community center learning library' },
  { slug: 'active-recall-study-technique-ai', search: 'recall memory study technique brain' },
  { slug: 'mindfulness-meditation-study-focus', search: 'mindfulness meditation calm focus' },
  { slug: 'note-taking-strategies-digital-age', search: 'note taking writing notebook' },
  { slug: 'growth-mindset-academic-success', search: 'growth mindset success achievement' },
  { slug: 'mathematics-anxiety-overcoming-fear', search: 'math numbers calculation confidence' },
  { slug: 'holiday-season-balancing-rest-learning', search: 'holiday rest relaxation balance' },
  { slug: 'personalized-feedback-ai-learning', search: 'personalized feedback correction improvement' },
  { slug: 'sleep-study-performance-link', search: 'sleep rest bed recovery health' },
  { slug: 'adaptive-learning-paths-ai', search: 'pathway journey learning road' },
  { slug: 'family-support-student-success', search: 'family support love encouragement together' },
  { slug: 'interactive-learning-engagement', search: 'interactive engagement participation learning' },
  { slug: 'year-end-review-planning-ahead', search: 'review planning reflection strategy' },
  { slug: 'new-year-fresh-start-academic', search: 'new year fresh start beginning' },
  { slug: 'habits-academic-success-formation', search: 'habits routine consistency discipline' },
  { slug: 'metacognition-thinking-about-thinking', search: 'thinking reflection metacognition brain' },
  { slug: 'peer-tutoring-ai-enhanced', search: 'peer tutoring collaboration help study' },
  { slug: 'problem-solving-skills-ai-development', search: 'problem solving puzzle solution' },
  { slug: 'motivation-sustaining-long-term', search: 'long term motivation persistence' },
  { slug: 'organizational-skills-student-success', search: 'organization planning structure order' },
  { slug: 'creative-thinking-innovation-education', search: 'creativity innovation thinking idea' },
  { slug: 'spaced-repetition-memory-retention', search: 'memory retention brain learning' },
  { slug: 'digital-literacy-21st-century-skills', search: 'digital literacy computer technology' },
  { slug: 'self-directed-learning-independence', search: 'independent learning self study' },
  { slug: 'mistakes-learning-opportunities', search: 'mistakes learning growth improvement' },
  { slug: 'multimodal-learning-approaches', search: 'multimodal senses learning visual' },
  { slug: 'procrastination-overcoming-delay', search: 'procrastination productivity action' },
  { slug: 'lifelong-learning-continuous-growth', search: 'lifelong learning growth development' },
];

async function searchPexelsImage(query) {
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5`, {
      headers: {
        'Authorization': PEXELS_API_KEY,
      },
    });
    
    if (!response.ok) {
      console.error(`Error searching for "${query}": ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].id;
    }
    return null;
  } catch (error) {
    console.error(`Error searching Pexels for "${query}":`, error.message);
    return null;
  }
}

async function main() {
  // Load existing results
  let existingResults = {};
  const resultsPath = path.join(__dirname, 'pexels-image-results.json');
  if (fs.existsSync(resultsPath)) {
    existingResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  }
  
  console.log(`Searching Pexels for relevant blog images...\n`);
  console.log(`Found ${Object.keys(existingResults).length} existing results\n`);
  
  const results = { ...existingResults };
  let searched = 0;
  
  for (const topic of allBlogTopics) {
    // Skip if we already have a result
    if (results[topic.slug]) {
      console.log(`Skipping ${topic.slug} (already has photo ID: ${results[topic.slug]})`);
      continue;
    }
    
    console.log(`Searching for: ${topic.search}...`);
    searched++;
    const photoId = await searchPexelsImage(topic.search);
    if (photoId) {
      results[topic.slug] = photoId;
      console.log(`  ✓ Found photo ID: ${photoId}\n`);
    } else {
      console.log(`  ✗ No results found\n`);
    }
    
    // Rate limiting - wait 1 second between requests
    if (searched < allBlogTopics.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n=== Final Results ===');
  console.log(`Total blog posts: ${allBlogTopics.length}`);
  console.log(`Results found: ${Object.keys(results).length}`);
  
  // Write results to a file
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to pexels-image-results.json`);
}

main().catch(console.error);








