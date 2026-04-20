import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getConversations,
  getMessages,
  markAsRead,
} from "../api/Chat";
import { connectSocket, subscribeConversation } from "../websocket/Socket";
import { useAuth } from "./AuthContext";

const ChatContext = createContext<any>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth() as any;

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
  const handleWSMessage = (event: any) => {
    if (event.type === "MESSAGE") {
      setMessages((prev) => [...prev, event.payload]);
    }
  };

  // 🔹 Connect WS on load
  useEffect(() => {
    if (token) {
      connectSocket(token, handleWSMessage, () => {});
      loadConversations();
    }
  }, [token]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConv,
        messages,
        selectConversation,
        loadOlder,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);