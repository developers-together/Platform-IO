import { useState, useRef, useEffect } from "react";
import { FaFan } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import { FiCommand } from "react-icons/fi";
import "./AI.css";

/**
 * RotatingAIIcon component:
 * - Continuously rotates.
 * - Speeds up when hovered.
 */
function RotatingAIIcon({ size = 128 }) {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef();
  const prevTimeRef = useRef();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const speedNotHovered = 360 / 5000; // 360° in 5s
    const speedHovered = 360 / 2500; // 360° in 2.5s

    const animate = (time) => {
      if (prevTimeRef.current == null) {
        prevTimeRef.current = time;
      }
      const delta = time - prevTimeRef.current;
      prevTimeRef.current = time;
      const speed = hovered ? speedHovered : speedNotHovered;
      setRotation((prev) => (prev + speed * delta) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [hovered]);

  return (
    <div
      className="rotating-ai-icon"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <FaFan
        style={{
          transform: `rotate(${rotation}deg)`,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const fileInputRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage = { sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate an AI response
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: `Uploaded image: ${file.name}`,
          file: URL.createObjectURL(file),
        },
      ]);
      e.target.value = "";
    }
  };

  const handleAction = (action) => {
    switch (action) {
      case "ask":
        document.querySelector(".input-row input")?.focus();
        break;
      case "search":
        setInput("Search for: ");
        break;
      case "actions":
        setInput("# ");
        break;
      case "upload":
        fileInputRef.current.click();
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
              <RotatingAIIcon size={128} />
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
                  <RotatingAIIcon size={40} />
                ) : (
                  <div className="user-avatar">
                    <div
                      className="avatar-circle"
                      style={{ background: "#4dabf7" }}
                    >
                      <span style={{ color: "#fff", fontSize: "0.8rem" }}>
                        You
                      </span>
                    </div>
                  </div>
                )}
                <div
                  className={`chat-message ${
                    msg.sender === "ai" ? "ai-message" : "user-message"
                  }`}
                >
                  {msg.file ? (
                    <img
                      src={msg.file}
                      alt="Uploaded content"
                      className="uploaded-image"
                    />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="chat-footer">
        <div className="action-buttons">
          <button onClick={() => handleAction("search")}>
            <IoSearch className="search-icon" />
            Search
          </button>
          <button onClick={() => handleAction("actions")}>
            <FiCommand className="action-icon" />
            Make Actions
          </button>
        </div>
        <div className="input-row">
          <button
            className="upload-button"
            onClick={() => handleAction("upload")}
            type="button"
          >
            <FiPlus />
          </button>
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

      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
    </div>
  );
}
