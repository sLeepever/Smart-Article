import ChatContainer from "@/components/chat/chat-container";

export default async function ChatProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ChatContainer projectId={projectId} />;
}
