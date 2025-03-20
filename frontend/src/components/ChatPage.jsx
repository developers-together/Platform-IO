import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCornerUpLeft,
  FiImage,
  FiMoreHorizontal,
  FiPhone,
  FiSend,
  FiTrash2,
  FiVideo,
  FiXCircle,
  FiPlus,
  FiEdit2,
} from "react-icons/fi";
import { FaFan } from "react-icons/fa"; // <-- Import rotating fan icon
import Avatar from "./Avatar";
import "./ChatPage.css";
import axios from "axios";

// Add a Modal component for delete confirmation
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

export default function ChatPage() {
  const token = localStorage.getItem("token");
  const teamId = localStorage.getItem("teamId");

  const [channels, setChannels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [deletingMessageIds, setDeletingMessageIds] = useState([]);
  const [newMessageId, setNewMessageId] = useState(null);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newChannel, setNewChannel] = useState("");
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingChannel, setEditingChannel] = useState(null);
  const [editChannelName, setEditChannelName] = useState("");

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const messageRefs = useRef({});
  const [highlightedMessage, setHighlightedMessage] = useState(null);

  const messageIds = useMemo(
    () => new Set(messages.map((msg) => msg.id)),
    [messages]
  );

  // New state variables for channel deletion modal
  const [showDeleteChannelModal, setShowDeleteChannelModal] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState(null);

  const createChannel = async () => {
    if (!newChannel.trim()) return;
    try {
      const response = await axios.post(
        `http://144.24.195.74:8000/api/chats/${teamId}/store`,
        { name: newChannel },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const newChat = { id: response.data.id, name: response.data.name };
      setSelectedChatId(newChat.id);
      getChatMessages(newChat.id);
      setChannels((prev) => [...prev, newChat]);
      setNewChannel("");
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  const getTeamChats = async () => {
    try {
      const response = await axios.get(
        `http://144.24.195.74:8000/api/chats/${teamId}/index`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching chats:", error);
      return [];
    }
  };

  const getChatMessages = async (chatId) => {
    try {
      setSelectedChatId(chatId);
      const response = await axios.get(
        `http://144.24.195.74:8000/api/chats/${chatId}/getMessages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (response.data.data.length === 0) {
        setMessages([]);
        return;
      }
      const messageMap = {};
      response.data.data.forEach((msg) => {
        messageMap[msg.id] = msg;
      });

      const formattedMessages = response.data.data.map((msg) => ({
        id: msg.id,
        user: msg.isAi ? "AI" : msg.user_name,
        avatar: "",
        time: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        message: msg.message,
        image: msg.image_url || null,
        replyTo: msg.replyTo
          ? {
              id: msg.replyTo,
              user: messageMap[msg.replyTo]?.user_name || "Unknown",
              text:
                messageMap[msg.replyTo] && messageMap[msg.replyTo].message
                  ? messageMap[msg.replyTo].message.length > 40
                    ? messageMap[msg.replyTo].message.slice(0, 40) + "..."
                    : messageMap[msg.replyTo].message
                  : "Message deleted",
            }
          : null,
      }));
      setMessages(formattedMessages);
    } catch (error) {
      // console.error("Error fetching messages:", error);
    }
  };

  const deleteChannel = async (chatId) => {
    try {
      await axios.delete(`http://144.24.195.74:8000/api/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        data: { chat_id: chatId },
      });
      setChannels((prev) => prev.filter((chat) => chat.id !== chatId));
      if (channels.length > 1) {
        if (channels[0].id === chatId) {
          setSelectedChatId(channels[1]?.id);
          getChatMessages(channels[1]?.id);
        } else {
          setSelectedChatId(channels[0]?.id);
          getChatMessages(channels[0]?.id);
        }
      } else {
        setMessages([]);
        setSelectedChatId(null);
      }
    } catch (error) {
      console.error("Error deleting channel:", error);
    }
  };

  // Save changes only when the Save button is clicked.
  const handleEditChannel = async () => {
    if (!editChannelName.trim()) return;
    try {
      await axios.put(
        `http://144.24.195.74:8000/api/chats/${editingChannel}`,
        { name: editChannelName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setChannels(
        channels.map((channel) =>
          channel.id === editingChannel
            ? { ...channel, name: editChannelName }
            : channel
        )
      );
      setEditingChannel(null);
      setEditChannelName("");
    } catch (error) {
      console.error("Error updating channel:", error);
    }
  };

  // Discard changes if focus leaves the edit container.
  const cancelEditChannel = () => {
    setEditingChannel(null);
    setEditChannelName("");
  };

  const handleReply = (msg) => {
    setReplyingTo({
      id: msg.id,
      user: msg.user,
      text:
        msg.message && msg.message.length > 40
          ? msg.message.slice(0, 40) + "..."
          : msg.message,
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;
    if (!selectedChatId) {
      console.error("No chat selected!");
      return;
    }
    const formData = new FormData();
    formData.append("message", inputText);
    if (imageUrl) {
      formData.append("image", imageUrl || null);
    }
    if (replyingTo) {
      formData.append("replyTo", replyingTo?.id || null);
    }
    try {
      const response = await axios.post(
        `http://144.24.195.74:8000/api/chats/${selectedChatId}/sendMessages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      const newMessage = {
        id: response.data.message.id,
        user: response.data.message.user_name,
        avatar: "",
        time: new Date(response.data.message.created_at).toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
        message: inputText,
        image: selectedImage || null,
        replyTo: replyingTo,
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputText("");
      setImageUrl("");
      setSelectedImage(null);
      setReplyingTo(null);
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response?.data || error.message
      );
    }
  };

  // NEW: Function to ask AI. It sends a request to your AI endpoint,
  // then adds the response to the chat and also saves it via the normal messages endpoint.
  const askAI = async () => {
    if (!inputText.trim() || !selectedChatId) return;
    const prompt = inputText;

    // Append the user's message to the chat
    const userMessage = {
      id: Date.now(), // using timestamp as an example unique id
      user: "You",
      avatar: "",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      message: prompt,
      image: null,
      replyTo: null,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    try {
      // Send the prompt to the AI endpoint
      const response = await axios.post(
        `http://144.24.195.74:8000/api/chats/${selectedChatId}/ask`,
        { prompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const aiResponseText = response.data.messages[1].message;

      // Append the AI response to messages
      const aiMessage = {
        id: Date.now() + 1, // ensure a different id
        user: "AI",
        avatar: "",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        message: aiResponseText,
        image: null,
        replyTo: null,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error asking AI:", error);
    }
  };

  const deleteMessage = async (id) => {
    setDeletingMessageIds((prev) => [...prev, id]);
    try {
      await axios.delete(
        `http://144.24.195.74:8000/api/chats/${id}/deleteMessage`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error(
        "Error deleting message:",
        error.response?.data || error.message
      );
    } finally {
      setDeletingMessageIds((prev) => prev.filter((msgId) => msgId !== id));
    }
  };

  const scrollToMessage = (reply) => {
    if (reply && messageIds.has(reply.id)) {
      messageRefs.current[reply.id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setHighlightedMessage(reply.id);
      setTimeout(() => setHighlightedMessage(null), 1000);
    }
  };

  const imageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageUrl(file);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
    fileInputRef.current.value = "";
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    getTeamChats().then((chats) => {
      setChannels(chats.map((chat) => ({ id: chat.id, name: chat.name })));
      if (chats.length > 0) {
        setSelectedChatId(chats[0].id);
        getChatMessages(chats[0].id);
      }
    });
  }, []);

  return (
    <div className="chat-page-container">
      <div className="left-panel">
        <div className="left-card">
          <div className="panel-heading-container">
            <h4 className="panel-heading">Channels</h4>
            <button
              className="add-channel-btn"
              onClick={() => setShowCreateDialog(true)}
            >
              <FiPlus />
            </button>
          </div>

          {showCreateDialog && (
            <div className="create-channel-dialog">
              <input
                type="text"
                placeholder="Channel name..."
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                autoFocus
              />
              <div className="dialog-actions">
                <button onClick={createChannel}>Create</button>
                <button onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="left-card-content">
            {channels.length === 0 ? (
              <div className="no-channels">No channels created yet</div>
            ) : (
              <ul>
                {channels.map((chat) => (
                  <li
                    key={chat.id}
                    onClick={() => getChatMessages(chat.id)}
                    className={selectedChatId === chat.id ? "active-chat" : ""}
                  >
                    <div className="channel-item">
                      {editingChannel === chat.id ? (
                        <div
                          className="channel-edit-container"
                          tabIndex={0}
                          onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                              cancelEditChannel();
                            }
                          }}
                        >
                          <input
                            type="text"
                            className="task-edit-input"
                            value={editChannelName}
                            onChange={(e) => setEditChannelName(e.target.value)}
                            autoFocus
                          />
                          <button onClick={handleEditChannel}>Save</button>
                        </div>
                      ) : (
                        <>
                          <span>{chat.name}</span>
                          <div
                            className="channel-actions"
                            onMouseLeave={() => setMenuOpen(null)}
                          >
                            <button
                              className="channel-menu-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpen(
                                  menuOpen === chat.id ? null : chat.id
                                );
                              }}
                            >
                              <FiMoreHorizontal />
                            </button>
                            {menuOpen === chat.id && (
                              <div className="channel-menu">
                                <button
                                  onClick={() => {
                                    setEditingChannel(chat.id);
                                    setEditChannelName(chat.name);
                                    setMenuOpen(null);
                                  }}
                                >
                                  <FiEdit2 /> Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setChannelToDelete(chat.id);
                                    setShowDeleteChannelModal(true);
                                    setMenuOpen(null);
                                  }}
                                >
                                  <FiTrash2 /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="chat-center2">
        <div className="chat-header3">
          <h3>General Chat</h3>
          <div className="header-actions">
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
                    onError={(e) =>
                      (e.target.src = `http://144.24.195.74:8000${msg.image}`)
                    }
                  />
                )}
                <div className="msg-text">{msg.message}</div>
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

        <div className="chat-input">
          {replyingTo && (
            <div className="reply-preview">
              <span>
                Replying to <strong>{replyingTo.user}</strong>:{" "}
                {replyingTo.text}
              </span>
              <button
                className="cancel-reply1"
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
                className="remove-image-btn1"
                onClick={() => {
                  setSelectedImage(null);
                  setImageUrl("");
                }}
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
            {/* New rotating-fan icon button on the LEFT, calls askAI */}
            <button onClick={askAI} className="ask-ai-button">
              <FaFan className="rotating-fan-icon" />
            </button>
            <button onClick={sendMessage}>
              <FiSend />
            </button>
          </div>
        </div>
      </div>

      {/* Render the custom delete modal for channels */}
      {showDeleteChannelModal && (
        <Modal
          title="Delete Channel"
          message="Are you sure you want to delete this channel?"
          onConfirm={() => {
            deleteChannel(channelToDelete);
            setShowDeleteChannelModal(false);
            setChannelToDelete(null);
          }}
          onCancel={() => {
            setShowDeleteChannelModal(false);
            setChannelToDelete(null);
          }}
        />
      )}
    </div>
  );
}
