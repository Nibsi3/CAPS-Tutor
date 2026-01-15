import { chatWithGroq } from "@/lib/groq";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();
        const data = await chatWithGroq(messages);

        return NextResponse.json({
            content: data.choices[0].message.content
        });
    } catch (error: any) {
        console.error("AI Assistant Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process request" },
            { status: 500 }
        );
    }
}
