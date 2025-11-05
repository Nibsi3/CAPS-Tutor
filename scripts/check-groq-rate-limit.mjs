/**
 * Check Groq API rate limit status
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

async function checkRateLimit() {
    try {
        console.log('Checking Groq API rate limit status...\n');
        
        // Make a small test request to check rate limit headers
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: 'user', content: 'test' }],
                max_tokens: 1
            })
        });
        
        // Check all response headers for rate limit info
        const allHeaders = {};
        response.headers.forEach((value, key) => {
            if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('limit')) {
                allHeaders[key] = value;
            }
        });
        
        // Also check standard rate limit headers
        const rateLimitHeaders = {
            'x-ratelimit-limit': response.headers.get('x-ratelimit-limit'),
            'x-ratelimit-remaining': response.headers.get('x-ratelimit-remaining'),
            'x-ratelimit-reset': response.headers.get('x-ratelimit-reset'),
            'x-ratelimit-reset-after': response.headers.get('x-ratelimit-reset-after'),
            'x-ratelimit-limit-requests': response.headers.get('x-ratelimit-limit-requests'),
            'x-ratelimit-remaining-requests': response.headers.get('x-ratelimit-remaining-requests'),
            'x-ratelimit-reset-requests': response.headers.get('x-ratelimit-reset-requests'),
        };
        
        console.log('\nAll Rate Limit Related Headers:');
        if (Object.keys(allHeaders).length > 0) {
            console.log(JSON.stringify(allHeaders, null, 2));
        } else {
            console.log(JSON.stringify(rateLimitHeaders, null, 2));
        }
        
        // Show all headers if no rate limit headers found
        if (Object.keys(allHeaders).length === 0 && Object.values(rateLimitHeaders).every(v => v === null)) {
            console.log('\n⚠️  No rate limit headers found. Showing all headers:');
            const allResponseHeaders = {};
            response.headers.forEach((value, key) => {
                allResponseHeaders[key] = value;
            });
            console.log(JSON.stringify(allResponseHeaders, null, 2));
        }
        
        if (response.status === 429) {
            const errorData = await response.json();
            console.log('\n❌ Rate Limit Exceeded:');
            console.log(JSON.stringify(errorData, null, 2));
            
            if (errorData.error?.message) {
                const message = errorData.error.message;
                const retryMatch = message.match(/try again in ([\d\.]+)([smh])/i);
                if (retryMatch) {
                    const time = parseFloat(retryMatch[1]);
                    const unit = retryMatch[2].toLowerCase();
                    let seconds = 0;
                    if (unit === 'h') seconds = time * 3600;
                    else if (unit === 'm') seconds = time * 60;
                    else seconds = time;
                    
                    const resetTime = new Date(Date.now() + seconds * 1000);
                    console.log(`\n⏰ Estimated Reset Time: ${resetTime.toLocaleString()}`);
                    console.log(`   (${Math.round(seconds / 60)} minutes from now)`);
                }
            }
        } else if (response.ok) {
            console.log('\n✅ API is available - rate limit not exceeded');
            if (rateLimitHeaders['x-ratelimit-remaining']) {
                console.log(`   Remaining: ${rateLimitHeaders['x-ratelimit-remaining']} tokens`);
            }
        } else {
            const errorData = await response.json();
            console.log('\nResponse Status:', response.status);
            console.log(JSON.stringify(errorData, null, 2));
        }
        
    } catch (error) {
        console.error('Error checking rate limit:', error.message);
    }
}

checkRateLimit();

