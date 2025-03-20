import { useState, useRef, useEffect } from "react";
import "./AI.css";
import axios from "axios";
import ReactMarkdown from "react-markdown"; // For AI markdown
import Avatar from "./Avatar";
import { FaFan } from "react-icons/fa";
import {
  FiCommand,
  FiMoreHorizontal,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMenu,
  FiX,
  FiCheck,
  FiFolder,
  FiClipboard,
  FiCalendar,
} from "react-icons/fi";
import { HiOutlineGlobeAlt } from "react-icons/hi";

// ========== MODAL COMPONENT ==========
const Modal = ({ title, message, onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="modal-actions">
        <button onClick={onConfirm} className="btn confirm-btn">
          Confirm
        </button>
        <button onClick={onCancel} className="btn cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// ========== TITLE SHUFFLER ==========
const TitleShuffler = () => {
  const titles = [
    "How can I help you today?",
    "What's on your mind?",
    "How can I help you?",
  ];
  const [title, setTitle] = useState("");
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * titles.length);
    setTitle(titles[randomIndex]);
  }, []);
  return <h2>{title}</h2>;
};

// ========== ROTATING AI ICON (FIXED) ==========
function RotatingAIIcon({ size = 128 }) {
  const [rotation, setRotation] = useState(0);
  const hoveredRef = useRef(false);
  const isFastModeRef = useRef(false);
  const prevTimeRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    function animate(timestamp) {
      if (!prevTimeRef.current) prevTimeRef.current = timestamp;
      const delta = timestamp - prevTimeRef.current;
      prevTimeRef.current = timestamp;
      const baseSpeed = 360 / 5000;
      const hoverSpeed = 360 / 2500;
      const clickSpeed = 360 / 1000;
      const currentSpeed = isFastModeRef.current
        ? clickSpeed
        : hoveredRef.current
        ? hoverSpeed
        : baseSpeed;
      setRotation((prev) => (prev + currentSpeed * delta) % 360);
      requestRef.current = requestAnimationFrame(animate);
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    hoveredRef.current = true;
  };
  const handleMouseLeave = () => {
    hoveredRef.current = false;
  };
  const handleClick = () => {
    isFastModeRef.current = !isFastModeRef.current;
  };

  return (
    <div
      className="rotating-ai-icon"
      style={{ width: size, height: size }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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

// ========== AI PAGE COMPONENT ==========
export default function AIPage({ setLeftSidebarOpen }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const fileInputRef = useRef();
  const [showTooltip, setShowTooltip] = useState(false);
  const token = localStorage.getItem("token");
  const teamId = localStorage.getItem("teamId");

  // Right sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previousChats, setPreviousChats] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingChatName, setEditingChatName] = useState("");
  const [menuOpenChatId, setMenuOpenChatId] = useState(null);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");

  // Chat selection
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");

  // NEW: State to save the action selected from the dialog
  const [savedAction, setSavedAction] = useState("");

  // Close actions dialog on any click (with a timeout to avoid immediate closure on the opening click)
  useEffect(() => {
    if (selectedAction === "actions") {
      const handleOutsideClick = () => {
        setSelectedAction("");
      };
      const timer = setTimeout(() => {
        document.addEventListener("click", handleOutsideClick);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handleOutsideClick);
      };
    }
  }, [selectedAction]);

  useEffect(() => {
    if (previousChats.length > 0) {
      setSelectedChatId(previousChats[0].id);
      fetchChatContent(previousChats[0].id);
    } else {
      setMessages([]);
    }
  }, [previousChats]);

  // ===== Fetch single chat content =====
  const fetchChatContent = async (chatId) => {
    setSelectedChatId(chatId);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/ai_chats/${chatId}/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const chats = response.data?.flatMap((chat) => [
        {
          sender: chat.user.name,
          text: chat.prompt,
        },
        {
          sender: "ai",
          text: chat.response,
        },
      ]);
      setMessages(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  // ===== Fetch all chats =====
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/ai_chats/${teamId}/index`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const chats = response.data.map((chat) => ({
          id: chat.id,
          name: chat.name,
        }));
        setPreviousChats(chats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
  }, [teamId, token]);

  // ===== Sidebar toggle =====
  const toggleSidebar = () => {
    if (!sidebarOpen) {
      setLeftSidebarOpen(false);
    }
    setSidebarOpen((prev) => !prev);
  };

  // ===== Send message =====
  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage = { sender: "You", text: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    let chatId = selectedChatId;
    if (previousChats.length === 0) {
      try {
        const response = await axios.post(
          `http://localhost:8000/api/ai_chats/${teamId}/store`,
          { name: "New Chat" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200) {
          const newChat = response.data;
          setPreviousChats((prev) => [
            ...prev,
            { id: newChat.id, name: newChat.name },
          ]);
          setSelectedChatId(newChat.id);
          chatId = newChat.id;
        } else {
          console.error("Error creating chat:", response.data);
          setMessages((prev) => [
            ...prev,
            { sender: "ai", text: "Failed to create a new chat." },
          ]);
          return;
        }
      } catch (error) {
        console.error("Error creating chat:", error);
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "An error occurred while creating a chat." },
        ]);
        return;
      }
    }
    if(savedAction=="create-file-folder"){
      console.log(newMessage.text);
      const response = await axios.post(`http://localhost:8000/api/files/${teamId}/aicreate`,
        { prompt: newMessage.text,
          path:"/"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("file created",response);
      return;
    }
    try {
      const endpoint =
        selectedAction === "search"
          ? `http://localhost:8000/api/ai_chats/${chatId}/websearch`
          : `http://localhost:8000/api/ai_chats/${chatId}/send`;
      console.log(endpoint);
      const response = await axios.post(
        endpoint,
        { prompt: newMessage.text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: response.data.response },
        ]);
      } else {
        console.error("Error:", response.data);
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "An error occurred. Please try again." },
        ]);
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Failed to reach the server." },
      ]);
    }
  };

  // ===== File upload =====
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

  // ===== Action buttons (search, actions, upload) =====
  const handleAction = (action) => {
    if (action === "actions") {
      // If an action is already saved, reset to default state
      if (savedAction) {
        setSavedAction("");
        setInput("");
        return;
      }
      // Toggle the actions dialog
      if (selectedAction === "actions") {
        setSelectedAction("");
        setInput("");
        return;
      }
      setSelectedAction("actions");
      return;
    }
    if (selectedAction === action) {
      setSelectedAction("");
      setInput("");
      return;
    }
    setSelectedAction(action);
    if (action === "search") {
      setInput("Search for: ");
    }
    if (action === "upload") {
      fileInputRef.current.click();
    }
  };

  // ===== Handle Action Dialog Option Click =====
  const handleDialogOptionClick = (option) => {
    let command = "";
    switch (option) {
      case "create-file-folder":
        command = "create file/folder: ";
        break;
      case "edit-file":
        command = "edit file: ";
        break;
      default:
        break;
    }
    setInput(command);
    setSavedAction(option); // Save the selected action (driving both text and icon)
    setSelectedAction(""); // Close the dialog
  };

  // ===== Creating a new chat =====
  const handleNewChatSave = async () => {
    if (!newChatName.trim()) return;
    try {
      const response = await axios.post(
        `http://localhost:8000/api/ai_chats/${teamId}/store`,
        { name: newChatName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const newChat = response.data;
      setPreviousChats([
        ...previousChats,
        { id: newChat.id, name: newChat.name },
      ]);
      setSelectedChatId(newChat.id);
      setIsCreatingNewChat(false);
      setNewChatName("");
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  // ===== Deleting a chat =====
  const handleDeleteChat = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/ai_chats/${chatToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setPreviousChats(
        previousChats.filter((chat) => chat.id !== chatToDelete)
      );
    } catch (error) {
      console.error("Error creating chat:", error);
    }
    setChatToDelete(null);
  };

  return (
    <div className="ai-chat-page">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Toggle for Right Sidebar */}
      <button
        className={`sidebar-toggle-icon ${
          sidebarOpen ? "sidebar-toggle-small" : ""
        }`}
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Right Sidebar */}
      <div className={`right-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Chat History</h3>
        </div>
        <ul className="previous-chats-list">
          {/* New Chat */}
          <li
            key="new-chat"
            className={`previous-chat-item default-chat ${
              selectedChatId === "new-chat" ? "active-chat" : ""
            }`}
            onClick={() => setIsCreatingNewChat(true)}
          >
            {isCreatingNewChat ? (
              <div className="channel-edit-container2" tabIndex={0}>
                <input
                  type="text"
                  className="task-create-input2"
                  placeholder="Enter chat name..."
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  autoFocus
                />
                <button className="save-button4" onClick={handleNewChatSave}>
                  <FiCheck />
                </button>
              </div>
            ) : (
              <span className="chat-item-name">Make a new chat</span>
            )}
          </li>

          {/* Existing Chats */}
          {previousChats.map((chat) => (
            <li
              key={chat.id}
              className={`previous-chat-item ${
                selectedChatId === chat.id ? "active-chat" : ""
              }`}
              onClick={() => {
                setSelectedChatId(chat.id);
                fetchChatContent(chat.id);
              }}
            >
              {editingChatId === chat.id ? (
                <div className="channel-edit-container2" tabIndex={0}>
                  <input
                    type="text"
                    className="task-edit-input2"
                    value={editingChatName}
                    onChange={(e) => setEditingChatName(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="save-button3"
                    onClick={() => {
                      setPreviousChats((prev) =>
                        prev.map((c) =>
                          c.id === editingChatId
                            ? { ...c, name: editingChatName }
                            : c
                        )
                      );
                      setEditingChatId(null);
                      setEditingChatName("");
                    }}
                  >
                    <FiCheck />
                  </button>
                </div>
              ) : (
                <>
                  <span className="chat-item-name">{chat.name}</span>
                  <div
                    className="chat-item-actions"
                    onMouseEnter={() => setMenuOpenChatId(chat.id)}
                    onMouseLeave={() => setMenuOpenChatId(null)}
                  >
                    <button
                      className="chat-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenChatId(chat.id);
                      }}
                    >
                      <FiMoreHorizontal />
                    </button>
                    {menuOpenChatId === chat.id && (
                      <div className="chat-item-menu">
                        <button
                          onClick={() => {
                            setEditingChatId(chat.id);
                            setEditingChatName(chat.name);
                            setMenuOpenChatId(null);
                          }}
                        >
                          <FiEdit2 /> Rename
                        </button>
                        <button
                          onClick={() => {
                            setChatToDelete(chat.id);
                            setShowDeleteChatModal(true);
                            setMenuOpenChatId(null);
                          }}
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Header */}
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
                    <li className="main-feature">Generating text</li>
                    <li className="main-feature">Answering questions</li>
                    <li className="main-feature">Analyzing images</li>
                    <li className="main-feature">Web search</li>
                    <li className="main-feature">Research assistance</li>
                  </ul>
                  <div className="custom-actions-section">
                    <div className="actions-heading">Custom Actions</div>
                    <ul className="actions-list">
                      <li className="action-item">Create File</li>
                      <li className="action-item">Create Folder</li>
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

      {/* Main Chat */}
      <main className="chat-main">
        {messages.length === 0 ? (
          <div className="starter-page">
            <div className="starter-content">
              <RotatingAIIcon size={128} />
              <TitleShuffler />
              <p className="subtitle"></p>
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
                    <Avatar
                      name={msg.sender || "User"}
                      options={{
                        size: 48,
                        background: "0041ac",
                        color: "fff",
                        rounded: true,
                      }}
                      alt={msg.sender}
                    />
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
                  ) : msg.sender === "ai" ? (
                    <div className="ai-markdown">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="chat-footer">
        <div className="action-buttons">
          <button
            onClick={() => handleAction("search")}
            className={`action-btn ${
              selectedAction === "search" ? "selected" : ""
            }`}
          >
            <HiOutlineGlobeAlt className="search-icon" />
            Search
          </button>
          <button
            onClick={() => handleAction("actions")}
            className={`action-btn ${
              selectedAction === "actions" ? "selected" : ""
            } ${savedAction ? "enabled" : ""}`}
          >
            {savedAction === "edit-file" ? (
              <FiEdit2 className="action-icon" />
            ) : savedAction === "create-file-folder" ? (
              <FiFolder className="action-icon" />
            ) : (
              <FiCommand className="action-icon" />
            )}
            {savedAction
              ? savedAction === "edit-file"
                ? "Edit File"
                : "Create File/Folder"
              : "Make Actions"}
          </button>
        </div>

        {/* Input container with relative positioning */}
        <div className="input-container" style={{ position: "relative" }}>
          {/* Render the actions dialog when "actions" is selected */}
          {selectedAction === "actions" && (
            <div className="actions-dialog">
              <button
                onClick={() => handleDialogOptionClick("create-file-folder")}
              >
                <FiFolder style={{ marginRight: "0.5rem" }} />
                Create File/Folder
              </button>
              <button onClick={() => handleDialogOptionClick("edit-file")}>
                <FiEdit2 style={{ marginRight: "0.5rem" }} />
                Edit File
              </button>
            </div>
          )}
          <div className="outer-input-bar">
            <button
              className="input-add-button"
              onClick={() => handleAction("upload")}
              type="button"
            >
              <FiPlus />
            </button>
            <input
              type="text"
              placeholder="Ask Anything..."
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

      {/* Hidden file input for "Upload" */}
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {/* Delete Chat Modal */}
      {showDeleteChatModal && (
        <Modal
          title="Delete Chat"
          message="Are you sure you want to delete this chat? This action cannot be undone."
          onConfirm={() => {
            handleDeleteChat();
            setShowDeleteChatModal(false);
            setChatToDelete(null);
          }}
          onCancel={() => {
            setShowDeleteChatModal(false);
            setChatToDelete(null);
          }}
        />
      )}
    </div>
  );
}
