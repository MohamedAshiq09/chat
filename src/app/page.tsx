"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

let socket: typeof Socket;

type Message = {
  from: string;
  to: string;
  message: string;
};

export default function ChatApp() {
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");

  useEffect(() => {
    socket = io("http://localhost:4000");

    socket.on("user_joined", ({ username }: { username: string }) => {
      setOnlineUsers((prev) => [...prev, username]);
    });

    socket.on("user_left", ({ username }: { username: string }) => {
      setOnlineUsers((prev) => prev.filter((user) => user !== username));
    });

    socket.on("receive_message", ({ message, from }: { message: string; from: string }) => {
      setChatHistory((prev) => [...prev, { from, to: username, message }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [username]);

  const login = () => {
    socket.emit("join", { username });
    setIsLoggedIn(true);
  };

  const sendMessage = () => {
    if (selectedUser && message.trim()) {
      socket.emit("send_message", {
        to: selectedUser,
        message,
        from: username,
      });
      setChatHistory((prev) => [...prev, { from: username, to: selectedUser, message }]);
      setMessage("");
    }
  };

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#0e101c",
        color: "#ffffff",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {!isLoggedIn ? (
        <div style={{ textAlign: "center", maxWidth: "400px", width: "100%" }}>
          <h2 style={{ color: "#4caf50", marginBottom: "20px" }}>Welcome to ChatApp</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #444",
              marginBottom: "20px",
              width: "100%",
              backgroundColor: "#1e1e2e",
              color: "#fff",
            }}
          />
          <button
            onClick={login}
            style={{
              backgroundColor: "#4caf50",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Login
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "20px",
            width: "100%",
            maxWidth: "1200px",
            height: "80vh",
          }}
        >
          <div
            style={{
              flex: "1",
              backgroundColor: "#1e1e2e",
              borderRadius: "10px",
              padding: "20px",
              overflowY: "auto",
            }}
          >
            <h3 style={{ borderBottom: "1px solid #444", paddingBottom: "10px" }}>Online Users</h3>
            {onlineUsers.map((user) => (
              <div
                key={user}
                onClick={() => setSelectedUser(user)}
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  backgroundColor: selectedUser === user ? "#4caf50" : "transparent",
                  cursor: "pointer",
                  marginBottom: "10px",
                  color: selectedUser === user ? "#fff" : "#aaa",
                  fontWeight: selectedUser === user ? "bold" : "normal",
                }}
              >
                {user}
              </div>
            ))}
          </div>

          <div
            style={{
              flex: "3",
              backgroundColor: "#1e1e2e",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              padding: "20px",
            }}
          >
            <h3 style={{ color: "#4caf50", marginBottom: "10px" }}>Chat with {selectedUser || "..."}</h3>
            <div
              style={{
                flex: "1",
                overflowY: "auto",
                padding: "10px",
                border: "1px solid #444",
                borderRadius: "10px",
                backgroundColor: "#0e101c",
                marginBottom: "10px",
              }}
            >
              {chatHistory
                .filter((msg) => msg.from === selectedUser || msg.to === selectedUser)
                .map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: msg.from === username ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "10px 15px",
                        borderRadius: "15px",
                        backgroundColor: msg.from === username ? "#4caf50" : "#444",
                        color: "#fff",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      }}
                    >
                      <strong>{msg.from}</strong>
                      <p style={{ margin: 0 }}>{msg.message}</p>
                    </div>
                  </div>
                ))}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="Type your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  flex: "1",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #444",
                  backgroundColor: "#0e101c",
                  color: "#fff",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  backgroundColor: "#4caf50",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
