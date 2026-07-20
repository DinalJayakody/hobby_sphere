import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import Avatar from "../ui/Avatar";

interface ChatWindowProps {
  onBack?: () => void;
}

const formatTime = (timestamp?: string) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatWindow: React.FC<ChatWindowProps> = ({ onBack }) => {
  const { activeConv, messages, loadOlder, currentUserId, sendMessage } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");

  const otherUser = activeConv?.participants?.find((p: any) => p.id !== currentUserId);

  const handleScroll = () => {
    if (containerRef.current?.scrollTop === 0) {
      loadOlder();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-200 bg-white">
        <button
          className="md:hidden mr-2 text-gray-500 hover:text-sky-600 transition"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar
          src={otherUser?.profilePictureUrl || otherUser?.avatarUrl || "/default-avatar.png"}
          alt={otherUser?.displayName || "User"}
          size="sm"
          status={otherUser?.onlineStatus === "ONLINE" ? "online" : "none"}
        />
        <div className="ml-3 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">
            {otherUser?.displayName || "Conversation"}
          </h3>
          {otherUser?.onlineStatus === "ONLINE" && (
            <p className="text-xs text-green-500">Online</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gradient-to-br from-sky-50 to-white space-y-2"
      >
        {messages.map((msg: any, index: number) => {
          const isOwn = (msg.sender?.id ?? msg.senderId) === currentUserId;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(index, 5) * 0.02 }}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] px-3 py-2 rounded-2xl shadow-sm ${
                  isOwn
                    ? "bg-navy-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                }`}
              >
                <p className="break-words">{msg.content}</p>
                <span
                  className={`block text-[10px] mt-1 text-right ${
                    isOwn ? "text-sky-100/80" : "text-gray-400"
                  }`}
                >
                  {formatTime(msg.createdAt || msg.timestamp)}
                </span>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="p-2 sm:p-3 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 py-2 px-3 bg-gray-100 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-sky-300 max-h-24"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!draft.trim()}
            className="p-2.5 bg-navy-600 text-white rounded-full disabled:opacity-50 shrink-0"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
