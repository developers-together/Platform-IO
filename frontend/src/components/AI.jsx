import { useState, useRef, useEffect } from "react";
import { FaFan } from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { IoSearch } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import { FiCommand } from "react-icons/fi";
import { HiOutlineGlobeAlt } from "react-icons/hi";

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
  const [isFastMode, setIsFastMode] = useState(false);

  useEffect(() => {
    const baseSpeed = 360 / 5000; // Normal speed: 5 seconds per rotation
    const hoverSpeed = 360 / 2500; // Hover speed: 2.5 seconds per rotation
    const clickSpeed = 360 / 1000; // Fast mode: 1 second per rotation

    const animate = (time) => {
      if (!prevTimeRef.current) prevTimeRef.current = time;
      const delta = time - prevTimeRef.current;
      prevTimeRef.current = time;

      let currentSpeed;
      if (isFastMode) {
        currentSpeed = clickSpeed;
      } else {
        currentSpeed = hovered ? hoverSpeed : baseSpeed;
      }

      setRotation((prev) => (prev + currentSpeed * delta) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [hovered, isFastMode]);

  const handleClick = () => {
    setIsFastMode((prev) => !prev);
  };

  return (
    <div
      className="rotating-ai-icon"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      <FaFan
        style={{
          transform: `rotate(${rotation}deg)`,
          width: "100%",
          height: "100%",
          cursor: "pointer",
        }}
      />
    </div>
  );
}

export default function AIChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const fileInputRef = useRef();
  const [showTooltip, setShowTooltip] = useState(false);

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
          text: "This is a simulated response.",
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
      <header className="chat-header2">
        <div className="header-content">
          <h2>AI Assistant</h2>
          <button
            className="info-button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            aria-label="AI Capabilities"
          >
            ?
            {showTooltip && (
              <div className="tooltip">
                <div className="tooltip-header">
                  <span className="tooltip-title">Capabilities</span>
                  <span className="tooltip-subtitle">I can help with:</span>
                </div>

                <div className="tooltip-content">
                  <ul className="capabilities-list">
                    <li className="main-feature">
                      <span className="feature-icon">◦</span>
                      Generating text
                    </li>
                    <li className="main-feature">
                      <span className="feature-icon">◦</span>
                      Answering questions
                    </li>
                    <li className="main-feature">
                      <span className="feature-icon">◦</span>
                      Analyzing images
                    </li>
                    <li className="main-feature">
                      <span className="feature-icon">◦</span>
                      Web search
                    </li>
                    <li className="main-feature">
                      <span className="feature-icon">◦</span>
                      Research assistance
                    </li>
                  </ul>

                  <div className="custom-actions-section">
                    <div className="actions-heading">Custom Actions</div>
                    <ul className="actions-list">
                      <li className="action-item">
                        <span className="action-icon2">◦</span>
                        Add tasks
                      </li>
                      <li className="action-item">
                        <span className="action-icon2">◦</span>
                        Calendar events
                      </li>
                      <li className="action-item">
                        <span className="action-icon2">◦</span>
                        File management
                      </li>
                    </ul>
                  </div>

                  <div className="additional-capabilities">
                    <span className="sparkle-icon">✨</span>
                    And much more...
                    <span className="sparkle-icon">✨</span>
                  </div>
                </div>
              </div>
            )}
          </button>
        </div>
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
            <HiOutlineGlobeAlt className="search-icon" />
            Search
          </button>
          <button onClick={() => handleAction("actions")}>
            <FiCommand className="action-icon" />
            Make Actions
          </button>
        </div>

        <div className="input-container">
          <div className="outer-input-bar">
            <button
              className="add-button input-add-button"
              onClick={() => handleAction("upload")}
              type="button"
            >
              <FiPlus />
            </button>
            <input
              type="text"
              placeholder="Add a new task..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="task-input"
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
