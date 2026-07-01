import { NextRequest, NextResponse } from "next/server";
import { getCheckpointer } from "@/db/checkpointer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/chat-history — list ของ user
export async function GET() {
    try {
        const session = await auth.api.getSession({
                headers: await headers()
        });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const histories = await prisma.chatThread.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            select: {
                threadId: true,
                preview: true,
                updatedAt: true,
                messageCount: true,
            },
        });

        const formatted = histories.map(h => ({
            sessionId: h.threadId,
            preview: (h.preview ?? '').slice(0, 100) || 'New chat',
            lastCreatedAt: h.updatedAt,
            messageCount: h.messageCount,
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chat history' },
            { status: 500 }
        );
    }
}

// DELETE /api/chat-history — ลบ thread (ทั้ง index row และ checkpoint blobs)
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
                headers: await headers()
        });
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        // ตรวจ ownership ก่อน — ถ้า thread ไม่ใช่ของ user คนนี้ห้ามลบ
        const owned = await prisma.chatThread.findFirst({
            where: { threadId: sessionId, userId },
            select: { threadId: true },
        });

        if (!owned) {
            return NextResponse.json({ error: 'Session not found or forbidden' }, { status: 403 });
        }

        const checkpointer = await getCheckpointer();
        await checkpointer.deleteThread(sessionId);

        await prisma.chatThread.deleteMany({
            where: { threadId: sessionId, userId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting chat history:', error);
        return NextResponse.json(
            { error: 'Failed to delete chat history' },
            { status: 500 }
        );
    }
}