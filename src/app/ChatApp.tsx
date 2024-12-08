"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

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
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    socket.on("user_joined", ({ username }: { username: string }) => {
      setOnlineUsers((prev) => [...prev, username]);
    });

    socket.on("user_left", ({ username }: { username: string }) => {
      setOnlineUsers((prev) => prev.filter((user) => user !== username));
    });

    socket.on("receive_message", ({ from, message }: { from: string; message: string }) => {
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
      socket.emit("send_message", { to: selectedUser, message, from: username });
      setChatHistory((prev) => [...prev, { from: username, to: selectedUser, message }]);
      setMessage("");
    }
  };

  return (
    <div>
      {/* UI code */}
    </div>
  );
}
