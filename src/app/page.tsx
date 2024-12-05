"use client"
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

let socket: typeof Socket;

type Message = {
  from: string;
  to: string;
  message: string;
};

export default function ChatApp() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');

  useEffect(() => {
    socket = io('http://localhost:4000'); // Backend socket server URL

    socket.on('user_joined', ({ username }: { username: string }) => {
      setOnlineUsers((prev) => [...prev, username]);
    });

    socket.on('user_left', ({ username }: { username: string }) => {
      setOnlineUsers((prev) => prev.filter((user) => user !== username));
    });

    socket.on('receive_message', ({ message, from }: { message: string; from: string }) => {
      setChatHistory((prev) => [...prev, { from, to: username, message }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [username]);

  const login = () => {
    socket.emit('join', { username });
    setIsLoggedIn(true);
  };

  const sendMessage = () => {
    if (selectedUser && message.trim()) {
      socket.emit('send_message', {
        to: selectedUser,
        message,
        from: username,
      });
      setChatHistory((prev) => [...prev, { from: username, to: selectedUser, message }]);
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {!isLoggedIn ? (
        <div>
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {username}</h2>
          <div style={{ display: 'flex' }}>
            {/* Sidebar for Online Users */}
            <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '10px' }}>
              <h3>Online Users</h3>
              {onlineUsers.map((user) => (
                <div
                  key={user}
                  onClick={() => setSelectedUser(user)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedUser === user ? '#ddd' : 'transparent',
                    padding: '5px',
                  }}
                >
                  {user}
                </div>
              ))}
            </div>

            {/* Chat Window */}
            <div style={{ width: '70%', padding: '10px' }}>
              <h3>Chat with {selectedUser || '...'}</h3>
              <div
                style={{
                  border: '1px solid #ccc',
                  height: '300px',
                  overflowY: 'auto',
                  marginBottom: '10px',
                }}
              >
                {chatHistory
                  .filter((msg) => msg.from === selectedUser || msg.to === selectedUser)
                  .map((msg, index) => (
                    <div key={index} style={{ margin: '5px 0' }}>
                      <strong>{msg.from}: </strong>
                      {msg.message}
                    </div>
                  ))}
              </div>
              <input
                type="text"
                placeholder="Type your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
