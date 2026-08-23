import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareText, SquarePen } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import Avatar from "../ui/Avatar";
import EmptyState from "../ui/EmptyState";
import NewMessageModal from "./NewMessageModal";
import { parseServerTimestamp } from "../../utils/time";

interface ConversationListProps {
  onSelect?: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelect }) => {
  const { conversations, activeConv, selectConversation, currentUserId } = useChat();
  const [newMessageOpen, setNewMessageOpen] = useState(false);

  return (
    <div className="h-full bg-surface flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-ink">Messages</h2>
        <button
          onClick={() => setNewMessageOpen(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition"
        >
          <SquarePen className="w-4 h-4" /> New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!conversations?.length ? (
          <EmptyState
            icon={MessageSquareText}
            title="No conversations yet"
            subtitle="Start a new message to begin chatting with someone."
            action={
              <button
                onClick={() => setNewMessageOpen(true)}
                className="text-sm font-medium text-white bg-navy-600 dark:bg-sky-600 px-4 py-2 rounded-full hover:opacity-90 transition"
              >
                New Message
              </button>
            }
          />
        ) : (
          conversations.map((conv: any, index: number) => {
            const isGroup = conv.type === "GROUP";
            const otherUser = conv.participants?.find((p: any) => p.id !== currentUserId);
            const isActive = activeConv?.id === conv.id;
            const displayName = isGroup ? (conv.groupName || "Group") : (otherUser?.displayName || "Unknown");

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
                className={`flex items-center gap-3 p-3 sm:p-4 cursor-pointer border-b border-border transition-colors ${
                  isActive ? "bg-sky-50 dark:bg-sky-500/10" : "hover:bg-surface-muted"
                }`}
              >
                <Avatar
                  src={isGroup ? (conv.groupAvatar || "/group-placeholder.svg") : (otherUser?.profilePictureUrl || otherUser?.avatarUrl || "/default-avatar.svg")}
                  alt={displayName}
                  size="md"
                  status={!isGroup && otherUser?.onlineStatus === "ONLINE" ? "online" : "none"}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-ink truncate">{displayName}</p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-navy-600 dark:bg-sky-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-muted truncate">
                    {conv.lastMessage?.content || "No messages yet"}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {isGroup
                      ? `${conv.participants?.length ?? 0} members`
                      : otherUser?.onlineStatus === "ONLINE"
                      ? "Online"
                      : otherUser?.lastSeen
                      ? `Last seen ${parseServerTimestamp(otherUser.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : ""}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <NewMessageModal open={newMessageOpen} onClose={() => setNewMessageOpen(false)} onSelected={onSelect} />
    </div>
  );
};

export default ConversationList;
