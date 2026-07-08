import { NextRequest, NextResponse } from "next/server";
import { getCheckpointer } from "@/db/checkpointer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET /api/chat-history — list user's threads
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

// DELETE /api/chat-history — delete thread (both index row and checkpoint blobs)
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

        // Verify ownership — deny if thread doesn't belong to this user
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