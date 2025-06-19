import ConversationClient from "./conversation-client";

interface ConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  // Use await to access params properties as required by Next.js
  const resolvedParams = await params;
  const conversationId = resolvedParams.conversationId;

  return <ConversationClient conversationId={conversationId} />;
}
