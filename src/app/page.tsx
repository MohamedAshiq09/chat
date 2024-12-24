"use client"
import React, { useState } from "react";

type Message = {
  from: string;
  to: string;
  message: string;
  timestamp: Date;
};

const DEMO_USERS = ["Alice", "Bob", "Charlie", "David"];

export default function ChatApp() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  
  const onlineUsers = DEMO_USERS.filter(user => user !== username);

  const login = () => {
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && message.trim()) {
      const newMessage = {
        to: selectedUser,
        message,
        from: username,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, newMessage]);
      
      setTimeout(() => {
        const reply = {
          from: selectedUser,
          to: username,
          message: `This is a simulated reply to: ${message}`,
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, reply]);
      }, 1000);
      
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoggedIn) login();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-green-400 text-center mb-6">Welcome to ChatApp</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
            />
            <button 
              onClick={login}
              disabled={!username.trim()}
              className="w-full px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
            >
              Join Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-7xl mx-auto h-[90vh] flex gap-4">
        <div className="w-72 bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-green-400 mb-4">Online Users</h3>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <button
                key={user}
                onClick={() => setSelectedUser(user)}
                className={`w-full flex items-center gap-2 p-3 rounded-lg transition-colors ${
                  selectedUser === user 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="truncate">{user}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700">
          <div className="h-full p-4 flex flex-col">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              {selectedUser ? `Chat with ${selectedUser}` : 'Select a user to start chatting'}
            </h3>
            
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {chatHistory
                .filter(msg => msg.from === selectedUser || msg.to === selectedUser)
                .map((msg, index) => {
                  const isOwnMessage = msg.from === username;
                  return (
                    <div
                      key={index}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isOwnMessage ? 'bg-green-500' : 'bg-gray-700'} rounded-lg p-3`}>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-white">{msg.from}</span>
                          <span className="text-xs text-gray-300">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-white mt-1">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder={selectedUser ? "Type your message" : "Select a user to start chatting"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!selectedUser}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
              />
              <button 
                type="submit"
                disabled={!selectedUser || !message.trim()}
                className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}