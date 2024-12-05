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
    <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#181818", color: "#ffffff", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!isLoggedIn ? (
        <div style={{ textAlign: "center" }}>
          <h2>Login</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginBottom: "10px",
              width: "100%",
              maxWidth: "300px",
            }}
          />
          <button
            onClick={login}
            style={{
              backgroundColor: "#ff3b3b",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </div>
      ) : (
        <div style={{ width: "90%", maxWidth: "900px", display: "flex", gap: "20px" }}>
         
          <div style={{ flex: "1", backgroundColor: "#2e2e2e", borderRadius: "10px", padding: "10px" }}>
            <h3 style={{ borderBottom: "1px solid #444", paddingBottom: "10px" }}>Online Users</h3>
            {onlineUsers.map((user) => (
              <div
                key={user}
                onClick={() => setSelectedUser(user)}
                style={{
                  padding: "10px",
                  borderRadius: "5px",
                  backgroundColor: selectedUser === user ? "#ff3b3b" : "transparent",
                  cursor: "pointer",
                  marginBottom: "5px",
                }}
              >
                {user}
              </div>
            ))}
          </div>

          
          <div style={{ flex: "2", backgroundColor: "#2e2e2e", borderRadius: "10px", padding: "10px", display: "flex", flexDirection: "column" }}>
            <h3>Chat with {selectedUser || "..."}</h3>
            <div style={{ flex: "1", overflowY: "auto", marginBottom: "10px", padding: "10px", border: "1px solid #444", borderRadius: "5px", backgroundColor: "#181818" }}>
              {chatHistory
                .filter((msg) => msg.from === selectedUser || msg.to === selectedUser)
                .map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "10px",
                      textAlign: msg.from === username ? "right" : "left",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "10px",
                        borderRadius: "10px",
                        backgroundColor: msg.from === username ? "#ff3b3b" : "#444",
                        color: "#fff",
                      }}
                    >
                      {msg.message}
                    </span>
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
                  border: "1px solid #ccc",
                  backgroundColor: "#181818",
                  color: "#fff",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  backgroundColor: "#ff3b3b",
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
