import React from "react";
import { useChat } from "../context/ChatContext";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";

const ChatPage = () => {
  const { activeConv } = useChat();

  return (
    <div className="flex h-screen bg-gray-100">
      <ConversationList />
      {activeConv ? (
        <ChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Select a chat
        </div>
      )}
    </div>
  );
};

export default ChatPage;