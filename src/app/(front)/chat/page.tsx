import { Suspense } from "react";
import { connection } from "next/server";
import ChatWindowV19 from "@/components/chat-window-v19";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function ChatContent() {
  await connection();
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session) {
    redirect('/sign-in');
  }
  return <ChatWindowV19 email={session.user.email} id={session.user.id} />;
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}