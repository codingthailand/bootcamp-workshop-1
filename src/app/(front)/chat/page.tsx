import ChatWindowV19 from "@/components/chat-window-v19";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session) {
    redirect('/sign-in');
  }

  return (
    <>
      <ChatWindowV19 email={session.user.email} id={Number(session.user.id)} />
    </>
  );
}