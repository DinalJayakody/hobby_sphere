import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Avatar from '../components/ui/Avatar';
import { conversations, messages, users } from '../data/mockData';
import { Send, Smile, Image, Paperclip, Search, MoreVertical, Phone, Video } from 'lucide-react';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState(conversations[0]?.id || '');
  const [messageText, setMessageText] = useState('');
  const [activeMessages, setActiveMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState('conversations'); // 'conversations' or 'messages'

  // Update active messages when active conversation changes
  useEffect(() => {
    if (activeConversation && messages[activeConversation]) {
      setActiveMessages(messages[activeConversation] || []);
    }
  }, [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const sendMessage = () => {
    if (!messageText.trim() || !activeConversation) return;
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || '',
      receiverId: conversations.find(c => c.id === activeConversation)?.userId || '',
      content: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setActiveMessages([...activeMessages, newMessage]);
    setMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  const switchView = (view: string) => {
    setMobileView(view);
  };

  return (
    <div className="min-h-screen bg-sky-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto h-screen pt-16 pb-20 md:pt-20 md:pb-6 px-0 md:px-4">
        <div className="bg-white rounded-lg shadow-sm h-full overflow-hidden flex flex-col md:flex-row">
          {/* Conversations list (hidden on mobile when in message view) */}
          <div 
            className={`w-full md:w-80 md:flex-shrink-0 border-r border-gray-200 ${
              mobileView === 'messages' ? 'hidden md:block' : ''
            }`}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages"
                  className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-navy-300"
                />
                <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
              </div>
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-64px)]">
              {conversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 ${
                    activeConversation === conversation.id ? 'bg-navy-50' : ''
                  }`}
                  onClick={() => {
                    setActiveConversation(conversation.id);
                    switchView('messages');
                  }}
                >
                  <div className="relative mr-3">
                    <Avatar
                      src={conversation.user.profilePicture}
                      alt={conversation.user.name}
                      size="md"
                      status={conversation.unread > 0 ? 'online' : 'none'}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h3 className="font-semibold truncate">{conversation.user.name}</h3>
                      <span className="text-xs text-gray-500">
                        {formatTime(conversation.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage}
                      </p>
                      
                      {conversation.unread > 0 && (
                        <span className="bg-navy-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Conversation/Messages view (hidden on mobile when in conversation list view) */}
          <div 
            className={`flex-1 flex flex-col ${
              mobileView === 'conversations' ? 'hidden md:flex' : ''
            }`}
          >
            {activeConversation ? (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200">
                  <div className="flex items-center">
                    <button 
                      className="md:hidden mr-2 text-gray-500"
                      onClick={() => switchView('conversations')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <Avatar
                      src={conversations.find(c => c.id === activeConversation)?.user.profilePicture || ''}
                      alt={conversations.find(c => c.id === activeConversation)?.user.name || ''}
                      size="sm"
                      status="online"
                    />
                    
                    <div className="ml-3">
                      <h3 className="font-semibold">
                        {conversations.find(c => c.id === activeConversation)?.user.name}
                      </h3>
                      <p className="text-xs text-green-500">Online</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-gray-500">
                    <button className="p-1.5 rounded-full hover:bg-gray-100">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-1.5 rounded-full hover:bg-gray-100">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-1.5 rounded-full hover:bg-gray-100">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Messages area */}
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                  <div className="space-y-3">
                    {activeMessages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === user.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.senderId !== user.id && (
                          <Avatar
                            src={users.find(u => u.id === message.senderId)?.profilePicture || ''}
                            alt="User"
                            size="sm"
                            className="mr-2 mt-1"
                          />
                        )}
                        
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.senderId === user.id
                              ? 'bg-navy-600 text-white rounded-br-none'
                              : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p>{message.content}</p>
                          <span
                            className={`text-xs block text-right mt-1 ${
                              message.senderId === user.id ? 'text-navy-100' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                
                {/* Input area */}
                <div className="p-3 border-t border-gray-200 bg-white">
                  <div className="flex items-center">
                    <button className="text-gray-500 p-2 rounded-full hover:bg-gray-100">
                      <Smile className="w-6 h-6" />
                    </button>
                    <button className="text-gray-500 p-2 rounded-full hover:bg-gray-100">
                      <Image className="w-6 h-6" />
                    </button>
                    <button className="text-gray-500 p-2 rounded-full hover:bg-gray-100">
                      <Paperclip className="w-6 h-6" />
                    </button>
                    
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="flex-1 ml-2 py-2 px-3 bg-gray-100 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-navy-300 max-h-24"
                      rows={1}
                    />
                    
                    <button
                      className="ml-2 p-2 bg-navy-600 text-white rounded-full disabled:opacity-50"
                      disabled={!messageText.trim()}
                      onClick={sendMessage}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-navy-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
                  <p className="text-gray-500 mb-4">
                    Send private messages to friends and connections
                  </p>
                  <button className="bg-navy-600 text-white px-4 py-2 rounded-lg">
                    Start a Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;