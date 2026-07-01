import { NextRequest } from "next/server";
import { ChatOllama } from "@langchain/ollama";
import { createAgent } from "langchain";
import { createUIMessageStreamResponse, UIMessage } from "ai";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { getCurrentDateTool, searchAllProductTool } from "@/agent-tools";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const llmModel = new ChatOllama({
    model: 'gemma4:31b-cloud',
    think: false,
    temperature: 0.2,
    maxRetries: 2,
});

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) {
        redirect('/sign-in');
    }

    const { messages }: { messages: UIMessage[] } = await req.json();

    const langchainMessages = await toBaseMessages(messages);

    // create AI Agent
    const agent = createAgent({
        name: 'customer_support_agent',
        model: llmModel,
        systemPrompt: `คุณเป็น Ecommerce Customer Support ช่วยตอบคำถามเกี่ยวกับสินค้า บริการ 
        คำสั่งซื้อให้กับลูกค้า ให้ข้อมูลเกี่ยวกับวันและเวลาปัจจุบัน รหัสลูกค้า คือ ${session.user.id} ชื่อลูกค้า คือ ${session.user.name} ตอบเป็นภาษาไทย และสุภาพ **ห้ามตอบเรื่องอื่นที่ไม่เกี่ยวข้อง**`,
        tools: [ getCurrentDateTool, searchAllProductTool ],
    });
    
    const response = agent.streamEvents(
      { messages:  langchainMessages },
      { streamMode: ['messages'] }
    );
    
    return createUIMessageStreamResponse({ stream: toUIMessageStream(response)});
}