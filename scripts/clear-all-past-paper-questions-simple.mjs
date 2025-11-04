/**
 * Simple script to clear all past paper questions via API endpoint
 * Run with: node scripts/clear-all-past-paper-questions-simple.mjs
 * 
 * Make sure your Next.js dev server is running on http://localhost:3000
 */

async function clearAllQuestions() {
    console.log('🚀 Starting to clear all past paper questions via API...\n');
    
    try {
        const response = await fetch('http://localhost:9002/api/clear-all-past-paper-questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        console.log('✨ Process Complete!');
        console.log(`✅ ${result.message}`);
        console.log(`📊 Total papers: ${result.total}`);
        console.log(`✅ Updated: ${result.updated}`);
        if (result.errors && result.errors.length > 0) {
            console.log(`❌ Errors: ${result.errors.length}`);
            result.errors.forEach(err => console.log(`   - ${err}`));
        }
        
    } catch (error) {
        if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
            console.error('❌ Error: Could not connect to server.');
            console.error('   Make sure your Next.js dev server is running on http://localhost:9002');
            console.error('   Start it with: npm run dev');
        } else {
            console.error('❌ Fatal error:', error.message);
        }
        process.exit(1);
    }
}

clearAllQuestions()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });

