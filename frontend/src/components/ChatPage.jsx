import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCornerUpLeft,
  FiImage,
  FiMoreHorizontal,
  FiPhone,
  FiSend,
  FiSmile,
  FiTrash2,
  FiVideo,
  FiXCircle,
} from "react-icons/fi";
import Avatar from "./Avatar";
import "./ChatPage.css";

export default function ChatPage() {
  const channels = ["General", "Project X", "Design"];
  const dms = ["Alice", "Bob", "Charlie"];

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [deletingMessageIds, setDeletingMessageIds] = useState([]);
  const [newMessageId, setNewMessageId] = useState(null);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const messageRefs = useRef({});
  const [highlightedMessage, setHighlightedMessage] = useState(null);

  const messageIds = useMemo(
    () => new Set(messages.map((msg) => msg.id)),
    [messages]
  );

  const imageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
    fileInputRef.current.value = "";
  };

  const handleReply = (msg) => {
    setReplyingTo({
      id: msg.id,
      user: msg.user,
      text: msg.text.length > 40 ? msg.text.slice(0, 40) + "..." : msg.text,
    });
  };

  const sendMessage = () => {
    if (!inputText.trim() && !selectedImage) return;

    const messageId = Date.now();
    const newMessage = {
      id: messageId,
      user: "You",
      avatar: "",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: inputText,
      image: selectedImage,
      replyTo: replyingTo,
    };

    setNewMessageId(messageId);
    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      setNewMessageId(null);
    }, 500);

    setInputText("");
    setSelectedImage(null);
    setReplyingTo(null);
  };

  const deleteMessage = (id) => {
    setDeletingMessageIds((prev) => [...prev, id]);
    setTimeout(() => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      setDeletingMessageIds((prev) => prev.filter((msgId) => msgId !== id));
    }, 300);
  };

  const scrollToMessage = (replyingTo) => {
    if (replyingTo && messageIds.has(replyingTo.id)) {
      messageRefs.current[replyingTo.id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setHighlightedMessage(replyingTo.id);
      setTimeout(() => setHighlightedMessage(null), 1000);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-page-container">
      {/* Left Panel */}
      <div className="left-panel">
        <div className="left-card">
          <h4 className="panel-heading">Channels</h4>
          <div className="left-card-content">
            <ul>
              {channels.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="left-card">
          <h4 className="panel-heading">Direct Messages</h4>
          <div className="left-card-content">
            <ul>
              {dms.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Chat Center */}
      <div className="chat-center2">
        <div className="chat-header3">
          <h3>General Chat</h3>
          <div className="header-actions">
            <button>
              <FiPhone />
            </button>
            <button>
              <FiVideo />
            </button>
            <button>
              <FiMoreHorizontal />
            </button>
          </div>
        </div>

        <div className="chat-messages2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              ref={(el) => (messageRefs.current[msg.id] = el)}
              className={`chat-message2 ${
                highlightedMessage === msg.id ? "highlight" : ""
              } ${deletingMessageIds.includes(msg.id) ? "deleting" : ""} ${
                msg.id === newMessageId ? "adding" : ""
              }`}
            >
              {msg.avatar ? (
                <img className="avatar" src={msg.avatar} alt={msg.user} />
              ) : (
                <Avatar
                  name={msg.user}
                  options={{ size: "64", rounded: true }}
                  className="avatar"
                />
              )}
              <div className="msg-body">
                {msg.replyTo && (
                  <div
                    className={`reply-container ${
                      deletingMessageIds.includes(msg.replyTo.id) ||
                      !messageIds.has(msg.replyTo.id)
                        ? "deleted-reply"
                        : ""
                    }`}
                    onClick={() => scrollToMessage(msg.replyTo)}
                  >
                    <span className="reply-user">{msg.replyTo.user}</span>
                    <span className="reply-text">{msg.replyTo.text}</span>
                  </div>
                )}
                <div className="msg-header">
                  <span className="msg-user">{msg.user}</span>
                  <span className="msg-time">{msg.time}</span>
                </div>
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Uploaded"
                    className="uploaded-image"
                  />
                )}
                <div className="msg-text">{msg.text}</div>
                <div className="msg-actions">
                  <button onClick={() => handleReply(msg)}>
                    <FiCornerUpLeft />
                  </button>
                  <button onClick={() => deleteMessage(msg.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        {/* Chat Input */}
        <div className="chat-input">
          {replyingTo && (
            <div className="reply-preview">
              <span>
                Replying to <strong>{replyingTo.user}</strong>:{" "}
                {replyingTo.text}
              </span>
              <button
                className="cancel-reply"
                onClick={() => setReplyingTo(null)}
              >
                <FiXCircle />
              </button>
            </div>
          )}
          {selectedImage && (
            <div className="image-preview-container">
              <img
                className="image-preview"
                src={selectedImage}
                alt="Preview"
              />
              <button
                className="remove-image-btn"
                onClick={() => setSelectedImage(null)}
              >
                <FiXCircle />
              </button>
            </div>
          )}
          <div className="chat-input-row">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={imageUpload}
            />
            <button onClick={() => fileInputRef.current?.click()}>
              <FiImage />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>
              <FiSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
