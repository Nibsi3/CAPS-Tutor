export const GROQ_API_KEY = "***REMOVED***";
export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function chatWithGroq(messages: any[]) {
    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.7,
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to call Groq");
    }

    return response.json();
}
