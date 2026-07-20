import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { ChatProvider, useChat } from "../context/ChatContext";
import Navbar from "../components/layout/Navbar";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";

// ChatProvider (and its sockjs-client/@stomp/stompjs dependencies) is
// provided here rather than in App.tsx, so it ships inside this page's own
// lazy chunk instead of bloating the main bundle for users who never chat.
const ChatPage: React.FC = () => {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  );
};

const ChatPageContent: React.FC = () => {
  const { activeConv } = useChat();
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  return (
    <div className="min-h-screen bg-sky-50">
      <Navbar />

      <div className="max-w-6xl mx-auto h-screen pt-16 pb-20 md:pt-20 md:pb-6 px-0 md:px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white md:rounded-2xl shadow-sm h-full overflow-hidden flex flex-col md:flex-row"
        >
          <div
            className={`w-full md:w-80 md:flex-shrink-0 border-r border-gray-200 ${
              mobileView === "chat" ? "hidden md:block" : ""
            }`}
          >
            <ConversationList onSelect={() => setMobileView("chat")} />
          </div>

          <div
            className={`flex-1 flex flex-col min-h-0 ${
              mobileView === "list" ? "hidden md:flex" : ""
            }`}
          >
            {activeConv ? (
              <ChatWindow onBack={() => setMobileView("list")} />
            ) : (
              <div className="flex-1 hidden md:flex flex-col items-center justify-center text-gray-400 gap-3">
                <MessageSquare className="w-12 h-12 text-sky-300 animate-float" />
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatPage;
