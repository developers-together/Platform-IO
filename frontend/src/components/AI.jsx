// AI.jsx
import { useState } from "react";
import Avatar from "./Avatar";
import "./AI.css";

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "This is a simulated response. Connect me to a real AI API!",
        },
      ]);
    }, 600);
  };

  const handleAction = (action) => {
    switch (action) {
      case "ask":
        document.querySelector(".input-row input")?.focus();
        break;
      case "search":
        setInput("Search for...");
        break;
      default:
        break;
    }
  };

  return (
    <div className="ai-chat-page">
      <header className="chat-headerr">
        <h2>AI Assistant</h2>
      </header>

      <main className="chat-main">
        {messages.length === 0 ? (
          <div className="starter-page">
            <div className="starter-content">
              <Avatar
                name="AI Assistant"
                options={{
                  size: "128",
                  background: "10a37f",
                  color: "fff",
                  rounded: true,
                  bold: true,
                }}
                className="starter-avatar"
              />
              <h1>What can I help with?</h1>
              <p className="subtitle">Ask anything</p>
            </div>
          </div>
        ) : (
          <div className="chat-container">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message-container ${
                  msg.sender === "ai" ? "ai-container" : "user-container"
                }`}
              >
                {msg.sender === "ai" ? (
                  <Avatar
                    name="AI Assistant"
                    options={{
                      size: "40",
                      background: "10a37f",
                      color: "fff",
                      rounded: true,
                    }}
                    className="chat-avatar"
                  />
                ) : (
                  <Avatar
                    name="You"
                    options={{
                      size: "40",
                      background: "4dabf7",
                      color: "fff",
                      rounded: true,
                    }}
                    className="chat-avatar"
                  />
                )}
                <div
                  className={`chat-message ${
                    msg.sender === "ai" ? "ai-message" : "user-message"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="chat-footer">
        <div className="action-buttons">
          <button onClick={() => handleAction("ask")}>Ask anything</button>
          <button onClick={() => handleAction("search")}>Search</button>
        </div>
        <div className="input-row">
          <input
            type="text"
            placeholder="Message AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} className="send-button">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="1.2em"
              width="1.2em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
