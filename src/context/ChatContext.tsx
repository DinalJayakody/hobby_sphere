import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  getConversations,
  getMessages,
  markAsRead,
  openDirectConversation,
  createGroupConversation,
  editMessage as editMessageApi,
  deleteMessage as deleteMessageApi,
  getMyChatProfile,
} from "../api/Chat";
import {
  connectSocket,
  disconnectSocket,
  subscribeConversation,
  sendMessageWS,
  sendTypingWS,
  ConnectionState,
} from "../websocket/Socket";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const TYPING_IDLE_MS = 4000;
const SEND_TIMEOUT_MS = 10000;

interface ChatContextValue {
  conversations: any[];
  activeConv: any;
  messages: any[];
  currentUserId?: number;
  connectionState: ConnectionState;
  typingUserIds: Set<number>;
  selectConversation: (conv: any) => void;
  loadOlder: () => void;
  sendMessage: (content: string) => void;
  retryMessage: (tempId: string) => void;
  notifyTyping: (typing: boolean) => void;
  openNewConversation: (userId: number) => Promise<any>;
  startGroupConversation: (groupName: string, memberIds: number[]) => Promise<any>;
  editMessage: (id: number, content: string) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

let tempIdCounter = 0;

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth() as any;
  const { toast } = useToast();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [typingUserIds, setTypingUserIds] = useState<Set<number>>(new Set());

  const activeConvRef = useRef<any>(null);
  const typingTimeouts = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const sendTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const conversationUnsubRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, []);

  const loadMessages = useCallback(async (convId: number) => {
    try {
      const data = await getMessages(convId);
      setMessages(Array.isArray(data) ? data : []);
      markAsRead(convId).catch(() => {});
      setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c)));
    } catch (err) {
      console.error("Failed to load messages:", err);
      toast("Couldn't load that conversation. Please try again.", "error");
    }
  }, [toast]);

  const loadOlder = useCallback(async () => {
    if (!messages.length || !activeConv) return;
    const firstId = messages[0].id;
    try {
      const older = await getMessages(activeConv.id, firstId);
      setMessages((prev) => [...older, ...prev]);
    } catch (err) {
      console.error("Failed to load older messages:", err);
    }
  }, [messages, activeConv]);

  const selectConversation = useCallback(
    (conv: any) => {
      setActiveConv(conv);
      setMessages([]);
      loadMessages(conv.id);
      conversationUnsubRef.current?.unsubscribe();
      conversationUnsubRef.current = subscribeConversation(conv.id, handleWSMessage) ?? null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadMessages]
  );

  // Reconciles an incoming real message against an optimistic "sending" one
  // from the same sender/conversation/content — the backend doesn't echo a
  // client-generated id, so this best-effort match is what makes the
  // temporary bubble turn into the real one instead of duplicating.
  const reconcileOrAppend = useCallback((message: any) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;

      const pendingIdx = prev.findIndex(
        (m) =>
          m._optimistic &&
          m._status === "sending" &&
          (m.sender?.id ?? m.senderId) === (message.sender?.id ?? message.senderId) &&
          m.content === message.content
      );
      if (pendingIdx !== -1) {
        const next = [...prev];
        const tempId = next[pendingIdx].id;
        const timeout = sendTimeouts.current.get(tempId);
        if (timeout) {
          clearTimeout(timeout);
          sendTimeouts.current.delete(tempId);
        }
        next[pendingIdx] = message;
        return next;
      }
      return [...prev, message];
    });
  }, []);

  const handleWSMessage = useCallback(
    (event: any) => {
      // The REST MessageDto schema has no envelope "type" field, so this
      // backend's actual broadcast shape over STOMP is undocumented — handle
      // both a { type: "...", payload } envelope and a raw MessageDto.
      const type = event?.type;
      const payload = type ? event.payload : event;

      if (type === "MESSAGE_DELETED" || (payload?.deleted && payload?.id)) {
        setMessages((prev) => prev.map((m) => (m.id === payload.id ? { ...m, ...payload, deleted: true } : m)));
        return;
      }
      if (type === "MESSAGE_EDITED") {
        setMessages((prev) => prev.map((m) => (m.id === payload.id ? { ...m, ...payload } : m)));
        return;
      }
      if (type === "TYPING") {
        const actorId = payload?.userId;
        if (!actorId || actorId === user?.id) return;
        setTypingUserIds((prev) => {
          const next = new Set(prev);
          if (payload.typing) next.add(actorId);
          else next.delete(actorId);
          return next;
        });
        const existing = typingTimeouts.current.get(actorId);
        if (existing) clearTimeout(existing);
        if (payload.typing) {
          typingTimeouts.current.set(
            actorId,
            setTimeout(() => {
              setTypingUserIds((prev) => {
                const next = new Set(prev);
                next.delete(actorId);
                return next;
              });
            }, TYPING_IDLE_MS)
          );
        }
        return;
      }

      // Default: a new/real message for the currently-open conversation.
      if (payload?.id && payload?.content !== undefined) {
        reconcileOrAppend(payload);
      }
    },
    [reconcileOrAppend, user?.id]
  );

  // Inbox-level updates for conversations that aren't necessarily open right now.
  const handleInboxUpdate = useCallback((event: any) => {
    const conv = event?.payload ?? event;
    if (!conv?.id) return;
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === conv.id);
      const isActive = activeConvRef.current?.id === conv.id;
      const merged = isActive ? { ...conv, unreadCount: 0 } : conv;
      if (!exists) return [merged, ...prev];
      return prev.map((c) => (c.id === conv.id ? { ...c, ...merged } : c));
    });
  }, []);

  const handlePresenceUpdate = useCallback((event: any) => {
    const { userId, onlineStatus, lastSeen } = event || {};
    if (!userId) return;
    setConversations((prev) =>
      prev.map((c) => ({
        ...c,
        participants: c.participants?.map((p: any) =>
          p.id === userId ? { ...p, onlineStatus: onlineStatus ?? p.onlineStatus, lastSeen: lastSeen ?? p.lastSeen } : p
        ),
      }))
    );
    setActiveConv((prev: any) =>
      prev
        ? {
            ...prev,
            participants: prev.participants?.map((p: any) =>
              p.id === userId ? { ...p, onlineStatus: onlineStatus ?? p.onlineStatus, lastSeen: lastSeen ?? p.lastSeen } : p
            ),
          }
        : prev
    );
  }, []);

  const handleServerError = useCallback(
    (event: any) => {
      const message = event?.message || event?.payload?.message || "Something went wrong sending that message.";
      toast(message, "error");
    },
    [toast]
  );

  const sendMessage = useCallback(
    (content: string) => {
      const conv = activeConvRef.current;
      if (!conv || !content.trim() || !user?.id) return;

      const tempId = `temp-${Date.now()}-${tempIdCounter++}`;
      const optimisticMessage = {
        id: tempId,
        conversationId: conv.id,
        content,
        sender: { id: user.id },
        senderId: user.id,
        createdAt: new Date().toISOString(),
        _optimistic: true,
        _status: "sending",
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      sendMessageWS({ conversationId: conv.id, content });

      const timeout = setTimeout(() => {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, _status: "failed" } : m)));
      }, SEND_TIMEOUT_MS);
      sendTimeouts.current.set(tempId, timeout);
    },
    [user?.id]
  );

  const retryMessage = useCallback(
    (tempId: string) => {
      const conv = activeConvRef.current;
      const msg = messages.find((m) => m.id === tempId);
      if (!conv || !msg) return;
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, _status: "sending" } : m)));
      sendMessageWS({ conversationId: conv.id, content: msg.content });
      const timeout = setTimeout(() => {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, _status: "failed" } : m)));
      }, SEND_TIMEOUT_MS);
      sendTimeouts.current.set(tempId, timeout);
    },
    [messages]
  );

  const notifyTyping = useCallback((typing: boolean) => {
    const conv = activeConvRef.current;
    if (!conv) return;
    sendTypingWS(conv.id, typing);
  }, []);

  const openNewConversation = useCallback(
    async (userId: number) => {
      const conv = await openDirectConversation(userId);
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conv.id);
        return exists ? prev.map((c) => (c.id === conv.id ? conv : c)) : [conv, ...prev];
      });
      selectConversation(conv);
      return conv;
    },
    [selectConversation]
  );

  const startGroupConversation = useCallback(
    async (groupName: string, memberIds: number[]) => {
      const conv = await createGroupConversation({ groupName, memberIds });
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conv.id);
        return exists ? prev.map((c) => (c.id === conv.id ? conv : c)) : [conv, ...prev];
      });
      selectConversation(conv);
      return conv;
    },
    [selectConversation]
  );

  const editMessage = useCallback(async (id: number, content: string) => {
    const updated = await editMessageApi(id, content);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
  }, []);

  const deleteMessage = useCallback(async (id: number) => {
    await deleteMessageApi(id);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, deleted: true, content: "This message was deleted" } : m)));
  }, []);

  // Connect WS once the user is authenticated
  // (AuthContext doesn't expose the raw token, so read it from localStorage
  // where login/register/loginWithGoogleToken already store it)
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    connectSocket(token, handleWSMessage, handlePresenceUpdate, handleInboxUpdate, handleServerError, setConnectionState);
    loadConversations();
    // Ensures this user exists in chat-service's own user mirror (and is
    // therefore findable via chat search / can be messaged) even if the
    // RabbitMQ sync from user-service at registration time didn't fire.
    getMyChatProfile().catch((err) => console.error("Failed to sync chat profile:", err));

    return () => {
      conversationUnsubRef.current?.unsubscribe();
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConv,
        messages,
        currentUserId: user?.id,
        connectionState,
        typingUserIds,
        selectConversation,
        loadOlder,
        sendMessage,
        retryMessage,
        notifyTyping,
        openNewConversation,
        startGroupConversation,
        editMessage,
        deleteMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextValue => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
};
