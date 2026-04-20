import React, { useRef } from "react";
import { useChat } from "../../context/ChatContext";

const ChatWindow = () => {
  const { messages, loadOlder } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll
  const handleScroll = () => {
    if (containerRef.current?.scrollTop === 0) {
      loadOlder();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
      >
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <p className="bg-sky-100 inline-block px-3 py-2 rounded-lg">
              {msg.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatWindow;