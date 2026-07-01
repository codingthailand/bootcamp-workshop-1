import { NextRequest } from "next/server";
import { ChatOllama } from "@langchain/ollama";
import { createAgent } from "langchain";
import { createUIMessageStreamResponse, UIMessage } from "ai";
import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { executeSql, getCurrentDateTool, searchAllProductTool } from "@/agent-tools";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCheckpointer } from "@/db/checkpointer";
import { prisma } from "@/lib/prisma";
import { skillMiddleware } from "@/agent-middlewares/skill-prompt";

const llmModel = new ChatOllama({
    model: 'gemma4:31b-cloud',
    think: true,
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

    const { messages, sessionId }: { messages: UIMessage[], sessionId: string } = await req.json();

    // ส่งให้ agent เฉพาะข้อความล่าสุดของ user เท่านั้นก็พอ
    const lastUserUiMessage = [...messages].reverse().find((message) => message.role === 'user');
    const [lastLangchainMessages] = lastUserUiMessage ? await toBaseMessages([lastUserUiMessage]) : [];

    // Short-term memory
    const checkpointer = await getCheckpointer();

    // create AI Agent
    const agent = createAgent({
        name: 'customer_support_agent',
        model: llmModel,
        systemPrompt: `
        คุณเป็น Ecommerce Customer Support 
        
        รหัสลูกค้า คือ ${session.user.id} ชื่อลูกค้า คือ ${session.user.name}

        - ถ้าถามข้อมูลเกี่ยวกับวันที่และเวลาปัจจุบันให้เรียกใช้เครื่องมือ get_current_date เสมอ ห้ามเดาคำตอบ
        - ช่วยตอบคำถามเกี่ยวกับสินค้า บริการ คำสั่งซื้อให้กับลูกค้า ให้เรียก search_product_database
        - ถ้าถามข้อมูลเกี่ยวกับยอดขาย รายได้ สรุปยอดขายให้เรียก load_skill('sale-analytics') ก่อน แล้วเขียน SQL (MariaDB) ส่งให้ -> execute_sql
        - ตอบเป็นภาษาไทย และสุภาพ
        `,
        tools: [ getCurrentDateTool, searchAllProductTool, executeSql ],
        checkpointer: checkpointer,
        middleware: [
            skillMiddleware,
        ]
    });
    
    const response = agent.streamEvents(
      { messages:  lastLangchainMessages },
      { streamMode: ['messages'], configurable: { thread_id: sessionId } }
    );

    const uiStream = toUIMessageStream(response, {
        onFinal: async () => {
            const previewText = JSON.stringify(lastLangchainMessages.content.slice(0, 50) ?? '');
            console.log(previewText);
            const res = await prisma.chatThread.upsert({
                where: { threadId: sessionId },
                update: {
                    preview: previewText,
                    messageCount: { increment: 2 },
                    updatedAt: new Date()
                },
                create: {
                    threadId: sessionId,
                    userId: session.user.id,
                    preview: previewText,
                    messageCount: 2
                }
            });
            console.log(res.threadId);
        }
    });
    
    return createUIMessageStreamResponse({ stream: uiStream });
}