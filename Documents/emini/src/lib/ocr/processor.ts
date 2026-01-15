export interface OCRResult {
    content: string
    merchant?: string
    date?: string
    amount?: number
    currency?: string
    confidence: number
}

export async function processDocument(file: File | Blob): Promise<OCRResult> {
    // Mocking Google Document AI / AI extraction
    // In a real implementation, this would call a server action or Edge Function

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                content: "Amazon.com\nOrder #123-456\nTotal: $120.50\nDate: 2024-01-14",
                merchant: "Amazon",
                date: "2024-01-14",
                amount: 120.50,
                currency: "USD",
                confidence: 0.98
            })
        }, 2000)
    })
}

export async function generateEmbedding(text: string): Promise<number[]> {
    // Mocking Google Gemini Embedding (768 dimensions)
    // In reality, this would call the Gemini API
    return Array.from({ length: 768 }, () => Math.random() * 2 - 1)
}
