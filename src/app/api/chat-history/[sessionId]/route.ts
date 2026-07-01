import { NextRequest, NextResponse } from "next/server";
import { getCheckpointer } from "@/db/checkpointer";
import type { BaseMessage } from "@langchain/core/messages";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// ดึงเฉพาะ text ที่ user ต้องเห็น (ตัด thinking / tool_use blocks ทิ้ง)
function extractText(content: BaseMessage["content"]): string {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content
            .map((c) => {
                if (typeof c === 'string') return c;
                if (c && typeof c === 'object' && 'type' in c && c.type === 'text' && 'text' in c) {
                    return (c as { text: string }).text;
                }
                return '';
            })
            .join('');
    }
    return '';
}

// GET /api/chat-history/[sessionId] — โหลด messages ทั้งหมดของ thread จาก checkpoint
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId } = await params;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const userId = session.user.id;

        // ตรวจ ownership ผ่าน chat_threads
        const owned = await prisma.chatThread.findFirst({
            where: { threadId: sessionId, userId },
            select: { updatedAt: true },
        });

        if (!owned) {
            return NextResponse.json({ error: 'Session not found or forbidden' }, { status: 403 });
        }

        // ดึง checkpoint state ของ thread
        const checkpointer = await getCheckpointer();
        const tuple = await checkpointer.getTuple({ configurable: { thread_id: sessionId } });
        const messages = (tuple?.checkpoint?.channel_values?.messages ?? []) as BaseMessage[];

        const fallbackTs = owned.updatedAt ?? new Date();

        const formatted = messages
            .map((msg, idx) => {
                const id = msg.id ?? `${sessionId}-${idx}`;
                // BaseMessage.getType() returns 'human' | 'ai' | 'tool' | 'system'
                const type = (msg as BaseMessage & { getType?: () => string })
                    .getType?.();

                if (type === 'human') {
                    const text = extractText(msg.content);
                    if (!text) return null;
                    return {
                        id,
                        role: 'user' as const,
                        content: text,
                        createdAt: fallbackTs,
                    };
                }

                if (type === 'ai') {
                    const toolCalls = (msg as BaseMessage & { tool_calls?: unknown[] }).tool_calls ?? [];
                    if (toolCalls.length > 0) return null;
                    const text = extractText(msg.content);
                    if (!text) return null;
                    return {
                        id,
                        role: 'assistant' as const,
                        content: text,
                        createdAt: fallbackTs,
                    };
                }

                // ข้าม ToolMessage / SystemMessage
                return null;
            })
            .filter(Boolean);

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Error fetching session messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}