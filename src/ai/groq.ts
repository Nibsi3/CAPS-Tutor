// Utility and server-only fetch wrapper for Groq API

// Minimal Groq Chat API client for server-side usage
// Exposes a helper to get a chat completion from Groq's OpenAI-compatible endpoint

export type GroqChatOptions = {
	model?: string;
	temperature?: number;
	maxTokens?: number;
	images?: string[]; // Array of base64 data URIs for images
};

/**
 * Wait helper for exponential backoff
 */
async function wait(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry mechanism for Groq API calls with exponential backoff
 * Handles rate limits and network errors
 */
async function safeGroqCall<T>(
	fn: () => Promise<T>,
	retries: number = 4
): Promise<T> {
	let delay = 2000; // Start with 2 seconds
	
	for (let i = 0; i < retries; i++) {
		try {
			return await fn();
		} catch (err) {
			if (i === retries - 1) {
				throw err; // Last retry, throw the error
			}
			
			console.log(`   ⏳ Retry ${i + 1}/${retries - 1} after ${delay}ms...`);
			await wait(delay);
			delay *= 2; // Exponential backoff: 2s, 4s, 8s, 16s
		}
	}
	throw new Error('All retries exhausted');
}

/**
 * Validate and clean JSON content
 */
function validateAndCleanJson(content: string): string {
	// Remove markdown code blocks
	let cleaned = content.replace(/```json|```/g, '').trim();
	
	// Remove invisible control characters
	cleaned = cleaned.replace(/[\u0000-\u001F\u007F]/g, '');
	
	// Validate JSON structure
	if (!cleaned.startsWith('{')) {
		throw new Error('JSON does not start with {');
	}
	
	if (!cleaned.endsWith('}')) {
		throw new Error('JSON does not end with }');
	}
	
	return cleaned;
}

export async function groqChat(prompt: string, options: GroqChatOptions = {}): Promise<string> {
	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey) {
		throw new Error('GROQ_API_KEY is not set');
	}

	// Use llama-3.1-8b-instant as the default model (small, fast, reliable for deterministic JSON outputs)
	const model = options.model ?? 'llama-3.1-8b-instant';
	const temperature = options.temperature ?? 0;
	const maxTokens = options.maxTokens ?? 3000;

	// Check prompt length
	const promptLength = typeof prompt === 'string' ? prompt.length : JSON.stringify(prompt).length;
	if (promptLength > 12000) {
		console.warn(`⚠️ Prompt length (${promptLength}) exceeds recommended 12k limit`);
	}

	// Build user message content - support both text and images
	let userContent: string | Array<{ type: string; text?: string; image_url?: { url: string } }> = prompt;
	
	// If images are provided, use multimodal format (OpenAI-compatible)
	if (options.images && options.images.length > 0) {
		userContent = [
			{ type: 'text', text: prompt },
			...options.images.map(img => ({
				type: 'image_url' as const,
				image_url: { url: img }
			}))
		];
	}

	// Use retry mechanism with exponential backoff
	const content = await safeGroqCall(async () => {
		const requestBody = {
			model,
			temperature,
			max_tokens: maxTokens,
			response_format: { type: 'json_object' }, // CRITICAL: Must be exactly this format
			messages: [
				{
					role: 'system',
					content: 'You output ONLY valid JSON. Never output prose or markdown.'
				},
				{
					role: 'user',
					content: userContent
				}
			]
		};

		const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`,
			},
			body: JSON.stringify(requestBody)
		});

		if (!response.ok) {
			const text = await response.text().catch(() => '');
			throw new Error(`Groq API error: ${response.status} ${response.statusText} ${text}`);
		}

		const data = await response.json();
		
		// Log raw response for debugging
		console.log('Groq RAW:', JSON.stringify(data, null, 2));

		// Strict null-check BEFORE parsing (Fix 3)
		if (!data?.choices?.[0]?.message?.content) {
			console.error('Groq returned empty content. Full response:', JSON.stringify(data, null, 2));
			throw new Error('Groq returned empty content');
		}

		// Validate response structure
		if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
			console.error('Groq returned empty or malformed response:', JSON.stringify(data, null, 2));
			throw new Error('Groq returned empty or malformed response');
		}

		const choice = data.choices[0];
		if (!choice || !choice.message) {
			console.error('Groq response missing message:', JSON.stringify(data, null, 2));
			throw new Error('Groq response missing message');
		}

		const rawContent = choice.message.content;
		if (!rawContent || typeof rawContent !== 'string') {
			console.error('Groq returned no content. Full response:', JSON.stringify(data, null, 2));
			throw new Error('Groq returned no content');
		}
		
		// Validate and clean JSON
		return validateAndCleanJson(rawContent);
	});

	return content;
}

export function extractJsonFromText(text: string): string | null {
	// With response_format: { type: 'json_object' }, response should be pure JSON
	// But we still need to handle edge cases
	
	// Remove markdown code blocks if present
	let cleaned = text.replace(/```json|```/g, '').trim();
	
	// Reject anything with leading text (should start with {)
	if (!cleaned.startsWith('{')) {
		// Try to find JSON object
		const firstBrace = cleaned.indexOf('{');
		if (firstBrace > 0) {
			// There's text before the JSON - reject it
			console.warn('⚠️ Rejecting response with leading text');
			return null;
		}
		if (firstBrace === -1) {
			return null; // No JSON found
		}
	}
	
	// Ensure it ends with }
	if (!cleaned.endsWith('}')) {
		// Try to find the last }
		const lastBrace = cleaned.lastIndexOf('}');
		if (lastBrace > 0) {
			cleaned = cleaned.substring(0, lastBrace + 1);
		} else {
			return null; // No valid JSON structure
		}
	}
	
	return cleanJsonString(cleaned) || null;
}

/**
 * Clean JSON string by properly escaping control characters
 * This fixes issues where AI returns unescaped newlines, tabs, etc.
 */
function cleanJsonString(jsonStr: string): string {
	try {
		// First, try parsing as-is (it might be valid)
		JSON.parse(jsonStr);
		return jsonStr;
	} catch (e) {
		// If parsing fails, try to fix common issues with control characters
		let cleaned = jsonStr;
		
		// Strategy: Replace control characters that would break JSON parsing
		// We need to be careful not to double-escape already-escaped sequences
		
		// First, temporarily replace already-escaped sequences
		const placeholders = new Map<string, string>();
		let placeholderIndex = 0;
		
		// Protect already-escaped sequences
		cleaned = cleaned.replace(/\\n|\\r|\\t|\\\\|\\"/g, (match) => {
			const placeholder = `__PLACEHOLDER_${placeholderIndex++}__`;
			placeholders.set(placeholder, match);
			return placeholder;
		});
		
		// Now escape unescaped control characters
		cleaned = cleaned
			.replace(/\r\n/g, '\\n')  // Windows line endings
			.replace(/\n/g, '\\n')    // Unix line endings
			.replace(/\r/g, '\\r')    // Old Mac line endings
			.replace(/\t/g, '\\t')    // Tabs
			.replace(/[\x00-\x1F]/g, ''); // Remove other control characters
		
		// Restore the protected sequences
		placeholders.forEach((original, placeholder) => {
			cleaned = cleaned.replace(placeholder, original);
		});
		
		// Try parsing again
		try {
			JSON.parse(cleaned);
			console.log('✓ Successfully cleaned JSON with control characters');
			return cleaned;
		} catch (e2) {
			// Try to fix unterminated strings by finding and closing them
			try {
				const fixed = fixUnterminatedStrings(cleaned);
				JSON.parse(fixed);
				console.log('✓ Successfully fixed unterminated strings');
				return fixed;
			} catch (e3) {
				console.warn('⚠️ JSON cleaning failed, returning original:', (e2 as Error).message);
				// If still failing, return original and let caller handle the error
				return jsonStr;
			}
		}
	}
}

/**
 * Attempt to fix unterminated strings in JSON
 * This handles cases where the AI cuts off strings mid-way
 */
function fixUnterminatedStrings(jsonStr: string): string {
	let fixed = jsonStr;
	let inString = false;
	let escapeNext = false;
	const stack: string[] = [];
	
	// Find unterminated strings and close them
	for (let i = 0; i < fixed.length; i++) {
		const char = fixed[i];
		
		if (escapeNext) {
			escapeNext = false;
			continue;
		}
		
		if (char === '\\') {
			escapeNext = true;
			continue;
		}
		
		if (char === '"') {
			inString = !inString;
		}
		
		if (char === '{' && !inString) {
			stack.push('}');
		}
		
		if (char === '[' && !inString) {
			stack.push(']');
		}
		
		if ((char === '}' || char === ']') && !inString) {
			stack.pop();
		}
	}
	
	// If we're still in a string at the end, close it
	if (inString) {
		fixed += '"';
	}
	
	// Close any unclosed brackets
	while (stack.length > 0) {
		fixed += stack.pop();
	}
	
	return fixed;
}



