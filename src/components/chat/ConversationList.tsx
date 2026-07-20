import React from "react";
import { motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import Avatar from "../ui/Avatar";

interface ConversationListProps {
  onSelect?: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelect }) => {
  const { conversations, activeConv, selectConversation, currentUserId } = useChat();

  if (!conversations?.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
        <MessageSquareText className="w-10 h-10 mb-3 animate-float text-sky-300" />
        <p className="text-sm">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-white overflow-y-auto">
      {conversations.map((conv: any, index: number) => {
        const otherUser = conv.participants.find((p: any) => p.id !== currentUserId);
        const isActive = activeConv?.id === conv.id;

        return (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
            onClick={() => {
              selectConversation(conv);
              onSelect?.();
            }}
            className={`flex items-center gap-3 p-3 sm:p-4 cursor-pointer border-b border-gray-50 transition-colors ${
              isActive ? "bg-sky-50" : "hover:bg-gray-50"
            }`}
          >
            <Avatar
              src={otherUser?.profilePictureUrl || otherUser?.avatarUrl || "/default-avatar.png"}
              alt={otherUser?.displayName || "User"}
              size="md"
              status={otherUser?.onlineStatus === "ONLINE" ? "online" : "none"}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-800 truncate">
                  {otherUser?.displayName || "Unknown"}
                </p>
                {conv.unreadCount > 0 && (
                  <span className="bg-navy-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {conv.lastMessage?.content || "No messages yet"}
              </p>
              <p className="text-xs text-gray-400">
                {otherUser?.onlineStatus === "ONLINE"
                  ? "Online"
                  : otherUser?.lastSeen
                  ? `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : ""}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ConversationList;
