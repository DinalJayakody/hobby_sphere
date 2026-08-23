import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, AlertCircle, RotateCw, Pencil, Trash2, Check, X, WifiOff } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import Avatar from "../ui/Avatar";
import { parseServerTimestamp } from "../../utils/time";

interface ChatWindowProps {
  onBack?: () => void;
}

const formatTime = (timestamp?: string) => {
  if (!timestamp) return "";
  return parseServerTimestamp(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatWindow: React.FC<ChatWindowProps> = ({ onBack }) => {
  const {
    activeConv,
    messages,
    loadOlder,
    currentUserId,
    sendMessage,
    retryMessage,
    notifyTyping,
    typingUserIds,
    editMessage,
    deleteMessage,
    connectionState,
  } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const typingStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isGroup = activeConv?.type === "GROUP";
  const otherUser = activeConv?.participants?.find((p: any) => p.id !== currentUserId);
  const otherIsTyping = otherUser && typingUserIds.has(otherUser.id);
  const typingParticipant = activeConv?.participants?.find((p: any) => p.id !== currentUserId && typingUserIds.has(p.id));

  const handleScroll = () => {
    if (containerRef.current?.scrollTop === 0) {
      loadOlder();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherIsTyping]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
    notifyTyping(false);
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    notifyTyping(value.trim().length > 0);
    if (typingStopTimer.current) clearTimeout(typingStopTimer.current);
    typingStopTimer.current = setTimeout(() => notifyTyping(false), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startEdit = (msg: any) => {
    setEditingId(msg.id);
    setEditDraft(msg.content);
    setMenuFor(null);
  };

  const saveEdit = async () => {
    if (editingId == null || !editDraft.trim()) return;
    try {
      await editMessage(editingId, editDraft);
    } catch (err) {
      console.error("Edit message failed:", err);
    } finally {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setMenuFor(null);
    try {
      await deleteMessage(id);
    } catch (err) {
      console.error("Delete message failed:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-border bg-surface">
        <button
          className="md:hidden mr-2 text-ink-muted hover:text-sky-600 transition"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar
          src={isGroup ? (activeConv?.groupAvatar || "/group-placeholder.svg") : (otherUser?.profilePictureUrl || otherUser?.avatarUrl || "/default-avatar.svg")}
          alt={isGroup ? (activeConv?.groupName || "Group") : (otherUser?.displayName || "User")}
          size="sm"
          status={!isGroup && otherUser?.onlineStatus === "ONLINE" ? "online" : "none"}
        />
        <div className="ml-3 min-w-0 flex-1">
          <h3 className="font-semibold text-ink truncate">
            {isGroup ? (activeConv?.groupName || "Group") : (otherUser?.displayName || "Conversation")}
          </h3>
          <p className="text-xs h-4">
            {isGroup ? (
              typingParticipant ? (
                <span className="text-sky-500 font-medium">{typingParticipant.displayName} typing…</span>
              ) : (
                <span className="text-ink-faint">{activeConv?.participants?.length ?? 0} members</span>
              )
            ) : otherIsTyping ? (
              <span className="text-sky-500 font-medium">typing…</span>
            ) : otherUser?.onlineStatus === "ONLINE" ? (
              <span className="text-emerald-500">Online</span>
            ) : (
              <span className="text-ink-faint">&nbsp;</span>
            )}
          </p>
        </div>
        {connectionState !== "connected" && (
          <div className="flex items-center gap-1 text-xs text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-full">
            <WifiOff className="w-3.5 h-3.5" />
            {connectionState === "connecting" ? "Connecting…" : "Offline"}
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gradient-to-br from-sky-50 to-surface dark:from-navy-900 dark:to-surface space-y-2"
      >
        {messages.map((msg: any, index: number) => {
          const isOwn = (msg.sender?.id ?? msg.senderId) === currentUserId;
          const isDeleted = !!msg.deleted;
          const isSending = msg._status === "sending";
          const isFailed = msg._status === "failed";
          const isEditing = editingId === msg.id;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(index, 5) * 0.02 }}
              className={`group flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex items-end gap-1.5 max-w-[85%] sm:max-w-[75%] ${isOwn ? "flex-row-reverse" : ""}`}>
                <div
                  className={`px-3 py-2 rounded-2xl shadow-sm relative ${
                    isOwn
                      ? `bg-navy-600 dark:bg-sky-600 text-white rounded-br-sm ${isSending ? "opacity-60" : ""} ${isFailed ? "bg-coral-500 dark:bg-coral-600" : ""}`
                      : "bg-surface text-ink rounded-bl-sm border border-border"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 min-w-[160px]">
                      <input
                        autoFocus
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                        className="flex-1 bg-white/10 rounded px-2 py-1 text-sm focus:outline-none"
                      />
                      <button onClick={saveEdit} aria-label="Save edit"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingId(null)} aria-label="Cancel edit"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <p className={`break-words ${isDeleted ? "italic opacity-70" : ""}`}>
                      {isDeleted ? "This message was deleted" : msg.content}
                    </p>
                  )}
                  <span
                    className={`flex items-center gap-1 text-[10px] mt-1 ${isOwn ? "justify-end text-sky-100/80" : "text-ink-faint"}`}
                  >
                    {formatTime(msg.createdAt || msg.timestamp)}
                    {msg.editedAt && !isDeleted && <span>· edited</span>}
                    {isSending && <span className="animate-pulse">· sending…</span>}
                    {isFailed && <span className="flex items-center gap-0.5"><AlertCircle className="w-3 h-3" /> failed</span>}
                  </span>
                </div>

                {isFailed && (
                  <button
                    onClick={() => retryMessage(msg.id)}
                    className="text-coral-500 hover:text-coral-600 transition shrink-0"
                    aria-label="Retry sending"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                )}

                {isOwn && !isDeleted && !isSending && !isFailed && typeof msg.id === "number" && (
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setMenuFor(menuFor === msg.id ? null : msg.id)}
                      className="opacity-0 group-hover:opacity-100 text-ink-faint hover:text-ink transition p-1"
                      aria-label="Message options"
                    >
                      <span className="text-lg leading-none">⋯</span>
                    </button>
                    <AnimatePresence>
                      {menuFor === msg.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute right-0 mt-1 bg-surface-raised border border-border rounded-lg shadow-soft-lg py-1 z-10 w-32"
                        >
                          <button
                            onClick={() => startEdit(msg)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-ink hover:bg-surface-muted w-full text-left"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-coral-500 hover:bg-surface-muted w-full text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="p-2 sm:p-3 border-t border-border bg-surface">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => handleDraftChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 py-2 px-3 bg-surface-muted text-ink placeholder:text-ink-faint rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-500/40 max-h-24"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!draft.trim()}
            className="p-2.5 bg-navy-600 dark:bg-sky-600 text-white rounded-full disabled:opacity-50 shrink-0"
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
