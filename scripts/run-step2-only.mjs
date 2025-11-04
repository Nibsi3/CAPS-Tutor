/**
 * Run only Step 2: Generate Questions
 * This will regenerate questions from already-extracted PDFs
 */

// Import the generate function
import { main } from './generate_questions_with_metadata.mjs';

console.log('🚀 Starting question generation...\n');
console.log('Make sure GROQ_API_KEY is set!\n');

main()
    .then(() => {
        console.log('\n✅ Question generation complete!');
        console.log('\n📋 Next step: Upload to Firestore');
        console.log('   node scripts/upload_to_firebase_with_metadata.mjs');
    })
    .catch(error => {
        console.error('\n❌ Error:', error.message);
        if (error.message.includes('GROQ_API_KEY')) {
            console.error('\n💡 Fix: Set GROQ_API_KEY in your environment or .env.local');
        }
        process.exit(1);
    });

