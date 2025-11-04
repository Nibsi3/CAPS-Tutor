const fs = require('fs');
const path = require('path');

// Load the Pexels search results
const resultsPath = path.join(__dirname, 'pexels-image-results.json');
let pexelsResults = {};
if (fs.existsSync(resultsPath)) {
  pexelsResults = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
}

// Slug mappings
const slugMappings = {
  'critical-thinking-ai-age': 'critical-thinking-ai-education',
  'remote-learning-success': 'remote-learning-success-strategies',
  'stem-education-revolution': 'stem-education-ai-enhanced-learning',
  'emotional-intelligence-learning': 'emotional-intelligence-learning-success',
};

// Load blog posts file
const blogPostsPath = path.join(__dirname, 'src', 'lib', 'blog-posts.ts');
let blogContent = fs.readFileSync(blogPostsPath, 'utf8');

let updatedCount = 0;

// Fix the URLs - they should have matching photo IDs in both path and filename
for (const [slug, photoId] of Object.entries(pexelsResults)) {
  const actualSlug = slugMappings[slug] || slug;
  
  // Pattern to find the imageUrl with mismatched IDs
  // Matches: imageUrl: 'https://images.pexels.com/photos/{pathId}/pexels-photo-{filenameId}.jpeg...'
  const pattern = new RegExp(
    `(slug: '${actualSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[\\s\\S]{0,1000}?imageUrl: 'https://images\\.pexels\\.com/photos/)\\d+(/pexels-photo-)\\d+(\\.jpeg\\?auto=compress&cs=tinysrgb&w=2070&dpr=2')`,
    'g'
  );
  
  const replacement = `$1${photoId}$2${photoId}$3`;
  
  if (blogContent.match(pattern)) {
    blogContent = blogContent.replace(pattern, replacement);
    updatedCount++;
    console.log(`✓ Fixed ${slug} → ${actualSlug} with photo ID ${photoId}`);
  }
}

// Also fix any remaining URLs that have mismatched IDs (path ID different from filename ID)
// This catches any that might have been missed
const mismatchedPattern = /(imageUrl: 'https:\/\/images\.pexels\.com\/photos\/)(\d+)(\/pexels-photo-)(\d+)(\.jpeg\?auto=compress&cs=tinysrgb&w=2070&dpr=2')/g;
const fixedCount = (blogContent.match(mismatchedPattern) || []).length;
blogContent = blogContent.replace(mismatchedPattern, (match, prefix, pathId, middle, filenameId, suffix) => {
  // Use the filename ID as the correct one (it's usually more recent)
  return `${prefix}${filenameId}${middle}${filenameId}${suffix}`;
});

if (fixedCount > 0) {
  console.log(`✓ Fixed ${fixedCount} additional mismatched photo IDs`);
}

// Write updated content back
fs.writeFileSync(blogPostsPath, blogContent, 'utf8');

console.log(`\n=== Summary ===`);
console.log(`Updated: ${updatedCount} blog posts with Pexels results`);
console.log(`Fixed mismatched IDs: ${fixedCount}`);
console.log(`\nNote: To update remaining blogs, run search-all-pexels-images.js to get more results`);








