import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
})

export const maxDuration = 30

export async function POST(req: Request) {
    const { messages } = await req.json()

    // Rate limiting logic
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
    const { success, limit, reset, remaining } = await ratelimit.limit(
        `ratelimit_${ip}`
    )

    if (!success) {
        return new Response("Too many requests", {
            status: 429,
            headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
            },
        })
    }

    const result = streamText({
        model: openai("gpt-4o"),
        messages,
    })

    return result.toDataStreamResponse()
}
