// Utility and server-only fetch wrapper for Groq API

// Minimal Groq Chat API client for server-side usage
// Exposes a helper to get a chat completion from Groq's OpenAI-compatible endpoint

export type GroqChatOptions = {
	model?: string;
	temperature?: number;
	maxTokens?: number;
	images?: string[]; // Array of base64 data URIs for images
};

export async function groqChat(prompt: string, options: GroqChatOptions = {}): Promise<string> {
	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey) {
		throw new Error('GROQ_API_KEY is not set');
	}

	const model = options.model ?? 'llama-3.1-8b-instant';
	const temperature = options.temperature ?? 0.2;
	const maxTokens = options.maxTokens ?? 2048;

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

	const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			messages: [
				{ role: 'system', content: 'You are a helpful AI tutor following instructions exactly and keeping outputs well-structured.' },
				{ role: 'user', content: userContent },
			],
			temperature,
			max_tokens: maxTokens,
		})
	});

	if (!response.ok) {
		const text = await response.text().catch(() => '');
		throw new Error(`Groq API error: ${response.status} ${response.statusText} ${text}`);
	}

	const data = await response.json();
	const content: string | undefined = data?.choices?.[0]?.message?.content;
	if (!content) {
		throw new Error('Groq API returned no content');
	}
	return content;
}

export function extractJsonFromText(text: string): string | null {
	// Try to find a fenced JSON block first
	const fenced = text.match(/```json[\s\S]*?```/i) || text.match(/```[\s\S]*?```/i);
	if (fenced && fenced[0]) {
		const inner = fenced[0].replace(/```json/i, '```').slice(3, -3).trim();
		return inner || null;
	}
	// Fallback: attempt to find the first JSON object/array
	const firstBrace = text.indexOf('{');
	const firstBracket = text.indexOf('[');
	const start = firstBrace === -1 ? firstBracket : (firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket));
	if (start === -1) return null;
	const candidate = text.slice(start).trim();
	return candidate || null;
}



