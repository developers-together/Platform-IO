import { useState, useRef, useEffect, use } from "react";
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
} from "react-icons/fi";
import { HiOutlineGlobeAlt } from "react-icons/hi";
import "./AI.css";
import axios from "axios";

// Reusable Modal component
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

// Title shuffler for the starter page
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

// Rotating AI Icon component
function RotatingAIIcon({ size = 128 }) {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef();
  const prevTimeRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [isFastMode, setIsFastMode] = useState(false);

  useEffect(() => {
    const baseSpeed = 360 / 5000;
    const hoverSpeed = 360 / 2500;
    const clickSpeed = 360 / 1000;

    const animate = (time) => {
      if (!prevTimeRef.current) prevTimeRef.current = time;
      const delta = time - prevTimeRef.current;
      prevTimeRef.current = time;
      const currentSpeed = isFastMode
        ? clickSpeed
        : hovered
        ? hoverSpeed
        : baseSpeed;
      setRotation((prev) => (prev + currentSpeed * delta) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [hovered, isFastMode]);

  return (
    <div
      className="rotating-ai-icon"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setIsFastMode((prev) => !prev)}
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

export default function AIPage({ setLeftSidebarOpen }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const fileInputRef = useRef();
  const [showTooltip, setShowTooltip] = useState(false);

  const token = localStorage.getItem("token");
  const teamId = localStorage.getItem("teamId");
  // State for the right sidebar (chat history)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Remove the “Make a new chat” item from the chat list; we’ll render it separately.
  const [previousChats, setPreviousChats] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingChatName, setEditingChatName] = useState("");
  const [menuOpenChatId, setMenuOpenChatId] = useState(null);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [selectedAction, setSelectedAction] = useState(""); // For action button selection

  // New state for tracking the selected chat and new chat creation
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  useEffect(() => {
    if(previousChats.length>0){
      setSelectedChatId(previousChats[0].id);
      fetchChatContent(previousChats[0].id);
    }
    else if(previousChats.length==0){
      setMessages([]);
    }
  },[previousChats]);
  const fetchChatContent = async (chatId) => {
    setSelectedChatId(chatId);
    try {
      const response = await axios.get(`http://localhost:8000/api/ai_chats/${chatId}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Map response data to match the expected state format
      const chats = response.data?.flatMap(chat => [
        {
          sender: chat.user.name, // User's message
          text: chat.prompt
        },
        {
          sender: "ai", // AI's response
          text: chat.response
        }
      ]);
      setMessages(chats); // Update state with fetched chats
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/ai_chats/${teamId}/index`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
         // Map response data to match the expected state format
        const chats = response.data.map(chat => ({
          id: chat.id,
          name: chat.name
        }));

        setPreviousChats(chats); // Update state with fetched chats
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
  },[teamId, token]); // Add dependencies to prevent unnecessary re-renders
  

  // Toggle sidebar function
  const toggleSidebar = () => {
    if (!sidebarOpen) {
      setLeftSidebarOpen(false);
    }
    setSidebarOpen((prev) => !prev);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
  
    const newMessage = { sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  
    let chatId = selectedChatId;
  
    // If no chat exists, create a new one
    if (!chatId) {
      try {
        const response = await axios.post(
          `http://localhost:8000/api/ai_chats/${teamId}/store`,
          { "name": "New Chat" },
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        if (response.status === 200) {
          const newChat = response.data; // Get newly created chat details
          setPreviousChats((prev) => [...prev, { id: newChat.id, name: newChat.name }]);
          setSelectedChatId(newChat.id);
          chatId = newChat.id; // Update chatId for message sending
        } else {
          console.error("Error creating chat:", response.data);
          setMessages((prev) => [
            ...prev,
            { sender: "ai", text: "Failed to create a new chat." },
          ]);
          return; // Stop execution if chat creation fails
        }
      } catch (error) {
        console.error("Error creating chat:", error);
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: "An error occurred while creating a chat." },
        ]);
        return; // Stop execution
      }
    }
  
    // Send the message now that a chat exists
    try {
      const response = await axios.post(
        `http://localhost:8000/api/ai_chats/${chatId}/send`,
        { "prompt": input.trim() },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
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

  // Toggle action selection:
  const handleAction = (action) => {
    if (selectedAction === action) {
      setSelectedAction("");
      setInput("");
      return;
    }
    setSelectedAction(action);
    switch (action) {
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

  // Handler for saving a new chat from the “Make a new chat” prompt

const handleNewChatSave = async () => {
  if (!newChatName.trim()){ 
    return;
  }
  try {
    const response = await axios.post(`http://localhost:8000/api/ai_chats/${teamId}/store`,
      {"name": newChatName},
      {headers:{
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    const newChat = response.data; // Assuming backend returns the created chat
    setPreviousChats([...previousChats, { id: newChat.id, name: newChat.name }]);
    setSelectedChatId(newChat.id);
    setIsCreatingNewChat(false);
    setNewChatName("");
  } catch (error) {
    console.error("Error creating chat:", error);
  }
};

const handleDeleteChat = async () => {
  try {
    const response = await axios.delete(`http://localhost:8000/api/ai_chats/${chatToDelete}`,
      {headers:{
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    setPreviousChats(previousChats.filter(chat => chat.id !== chatToDelete));
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

      {/* Right Sidebar Toggle Button */}
      <button
        className={`sidebar-toggle-icon ${
          sidebarOpen ? "sidebar-toggle-small" : ""
        }`}
        onClick={toggleSidebar}
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      <div className={`right-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Chat History</h3>
        </div>
        <ul className="previous-chats-list">
          {/* “Make a new chat” item */}
          <li
            key="new-chat"
            className={`previous-chat-item default-chat ${
              selectedChatId === "new-chat" ? "active-chat" : ""
            }`}
            onClick={() =>
              setIsCreatingNewChat(true)}
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
          {/* Existing chats */}
          {previousChats.map((chat) => (
            <li
              key={chat.id}
              className={`previous-chat-item ${
                selectedChatId === chat.id ? "active-chat" : ""
              }`}
              onClick={() => {
                setSelectedChatId(chat.id)
                fetchChatContent(chat.id)
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
                  {/* Wrap the actions button and menu so the menu stays open while hovered */}
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
                      <li className="action-item">Add tasks</li>
                      <li className="action-item">Calendar events</li>
                      <li className="action-item">File management</li>
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
                    <div
                      className="avatar-circle"
                      style={{ background: "#4dabf7" }}
                    >
                      <span style={{ color: "#fff", fontSize: "0.8rem" }}>
                        {msg.sender}
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
            }`}
          >
            <FiCommand className="action-icon" />
            Make Actions
          </button>
        </div>
        <div className="input-container">
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

      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {showDeleteChatModal && (
        <Modal
          title="Delete Chat"
          message="Are you sure you want to delete this chat? This action cannot be undone."
          onConfirm={() => {
            // Handle deletion logic here
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
