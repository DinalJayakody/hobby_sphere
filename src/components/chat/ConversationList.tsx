import React from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

const ConversationList = () => {
  const { conversations, selectConversation } = useChat();
  const { user } = useAuth();

  return (
    <div className="w-80 bg-white border-r overflow-y-auto">
      {conversations.map((conv) => {
        const otherUser = conv.participants.find((p: any) => p.id !== user.id);

        return (
          <div
            key={conv.id}
            onClick={() => selectConversation(conv)}
            className="p-4 hover:bg-gray-100 cursor-pointer"
          >
            <p className="font-semibold">{otherUser.displayName}</p>

            <p className="text-sm text-gray-500 truncate">
              {conv.lastMessage?.content || "No messages yet"}
            </p>

            <p className="text-xs text-gray-400">
              {otherUser.onlineStatus === "ONLINE"
                ? "Online"
                : `Last seen: ${new Date(otherUser.lastSeen).toLocaleTimeString()}`}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;