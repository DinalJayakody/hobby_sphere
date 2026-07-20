import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getConversations,
  getMessages,
  markAsRead,
} from "../api/Chat";
import { connectSocket, subscribeConversation, sendMessageWS } from "../websocket/Socket";
import { useAuth } from "./AuthContext";

const ChatContext = createContext<any>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth() as any;

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  // 🔹 Load conversations (LIKE FACEBOOK LEFT PANEL)
  const loadConversations = async () => {
    const data = await getConversations();
    setConversations(data);
  };

  // 🔹 Load messages
  const loadMessages = async (convId: number) => {
    const data = await getMessages(convId);
    setMessages(data);
    markAsRead(convId);
  };

  // 🔹 Infinite scroll (load older)
  const loadOlder = async () => {
    if (!messages.length) return;
    const firstId = messages[0].id;

    const older = await getMessages(activeConv.id, firstId);
    setMessages((prev) => [...older, ...prev]);
  };

  // 🔹 Select conversation
  const selectConversation = (conv: any) => {
    setActiveConv(conv);
    loadMessages(conv.id);
    subscribeConversation(conv.id, handleWSMessage);
  };

  // 🔹 WebSocket message handler
  // The REST MessageDto schema has no envelope "type" field, so this
  // backend's actual broadcast shape over STOMP is undocumented — handle
  // both a { type: "MESSAGE", payload } envelope and a raw MessageDto.
  const handleWSMessage = (event: any) => {
    const message = event?.type === "MESSAGE" ? event.payload : event;
    if (message?.id && message?.content !== undefined) {
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    }
  };

  // 🔹 Send message over the STOMP connection — there is no REST endpoint
  // for creating a message, only the /app/chat.send destination. The sent
  // message is expected to come back through the conversation subscription
  // (handleWSMessage), which is what actually appends it to state.
  const sendMessage = (content: string) => {
    if (!activeConv || !content.trim()) return;
    sendMessageWS({ conversationId: activeConv.id, content });
  };

  // 🔹 Connect WS once the user is authenticated
  // (AuthContext doesn't expose the raw token, so read it from localStorage
  // where login/register/loginWithGoogleToken already store it)
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    connectSocket(token, handleWSMessage, () => {});
    loadConversations();
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConv,
        messages,
        currentUserId: user?.id,
        selectConversation,
        loadOlder,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);