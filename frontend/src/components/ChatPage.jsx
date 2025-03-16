import { use, useEffect, useMemo, useRef, useState } from "react";
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
import axios from "axios";

export default function ChatPage() {
  const dms = ["Alice", "Bob", "Charlie"];
  
  const token = localStorage.getItem("token");
  const teamId = localStorage.getItem("teamId");

  const [channels, setChannels] = useState([]);
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

  const [newChannel, setNewChannel] = useState("");
  const [showChannelInput, setShowChannelInput] = useState(false);

  const [selectedChatId, setSelectedChatId] = useState(null);

  const createChannel = async () => {
    if (!newChannel.trim()) return;

    try {
        const response = await axios.post(`http://localhost:8000/api/chats/${teamId}/store`, 
        { name: newChannel

        }, 
        {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
        });
        const newChat = { id: response.data.id, name: response.data.name };
        console.log("New Channel Created:", response.data);
        setChannels((prevChannels) => [...prevChannels, newChat]); // Update UI
        setNewChannel(""); // Reset input
        setShowChannelInput(false); // Hide input
    } catch (error) {
        console.error("Error creating channel:", error.response?.data || error.message);
    }
};

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

  const getTeamChats = async () => {
    try {
        const response = await axios.get(`http://localhost:8000/api/chats/${teamId}/index`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
        });

        // console.log("Chats for team:", response.data);
        return response.data;  // Assuming chats are inside 'chats' key
    } catch (error) {
        console.error("Error fetching chats:", error.response?.data || error.message);
        return [];
    }
};

useEffect(() => {
    getTeamChats().then((chats) => {
        setChannels(chats.map((chat) => ({ id: chat.id, name: chat.name })));
        if (chats.length > 0) {
          setSelectedChatId(chats[0].id); // Select the first chat
          getChatMessages(chats[0].id);  // Load its messages
      }
    });
}, []);

  const handleReply = (msg) => {
    setReplyingTo({
      id: msg.id,
      user: msg.user,
      text: msg.message.length > 40 ? msg.message.slice(0, 40) + "..." : msg.message,
    });
  };

  const sendMessage = async () => {
    console.log("chat id", selectedChatId);
    if (!inputText.trim() && !selectedImage) return;

    if (!selectedChatId) {
        console.error("No chat selected!");
        return;
    }
    console.log(inputText, selectedImage);

    try {
        console.log(inputText, selectedImage, replyingTo); 
        const response = await axios.post(
            `http://localhost:8000/api/chats/${selectedChatId}/sendMessages`,
            {
                "message": inputText,
                "path": selectedImage || null,
                "replyTo": replyingTo?.id || null,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            }
        );

        console.log("Message sent:", response.data);
        const newMessage = {
            id: response.data.message.id, // Use actual ID from backend response
            user: response.data.message.user_name,
            avatar: "",
            time: new Date(response.data.message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            message: inputText,
            image: selectedImage,
            replyTo: replyingTo,
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText("");
        setSelectedImage(null);
        setReplyingTo(null);
    } catch (error) {
        console.error("Error sending message:", error.response?.data || error.message);
    }
};

const deleteMessage = async (id) => {
  setDeletingMessageIds((prev) => [...prev, id]);

  try {
      await axios.delete(`http://localhost:8000/api/chats/${id}/deleteMessage`, {
          headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
          },
      });

      // Remove the deleted message from state
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
  } catch (error) {
      console.error("Error deleting message:", error.response?.data || error.message);
  } finally {
      setDeletingMessageIds((prev) => prev.filter((msgId) => msgId !== id));
  }
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

  const getChatMessages = async (chatId) => {
    console.log("Fetching messages for chat:", chatId);
    try {
        setSelectedChatId(chatId); // Set the selected chat ID
        const response = await axios.get(`http://localhost:8000/api/chats/${chatId}/getMessages`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        console.log("Messages:", response.data.data);

        // Create a map of messages by ID for easy lookup
        const messageMap = {};
        response.data.data.forEach((msg) => {
            messageMap[msg.id] = msg;
        });

        // Map the response data to match your frontend structure
        const formattedMessages = response.data.data.map((msg) => ({
            id: msg.id,
            user: msg.user_name, // Adjust according to the response field
            avatar: "", // Placeholder, modify if needed
            time: new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            message: msg.message,
            image: msg.image_url || null, // Ensure image is handled correctly
            replyTo: msg.replyTo ? {
                id: msg.replyTo,
                user: messageMap[msg.replyTo]?.user_name || "Unknown",
                text: messageMap[msg.replyTo]?.message
                    ? messageMap[msg.replyTo].message.length > 40
                        ? messageMap[msg.replyTo].message.slice(0, 40) + "..."
                        : messageMap[msg.replyTo].message
                    : "Message deleted",
            } : null,
        }));

        setMessages(formattedMessages);
    } catch (error) {
        console.error("Error fetching messages:", error.response?.data || error.message);
    }
};



  const deleteChannel = async (chatId) => {
    if (!window.confirm("Are you sure you want to delete this channel?")) return;

    try {
      await axios.delete(`http://localhost:8000/api/chats/${chatId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        data: { chat_id: chatId }, // Ensure chat_id is sent in the request
    });

        console.log(`Channel ${chatId} deleted successfully.`);
        
        // Remove channel from UI
        setChannels((prevChannels) => prevChannels.filter(chat => chat.id !== chatId));

        // Clear messages if the deleted channel was selected
        if (selectedChatId === chatId) {
            setSelectedChatId(null);
            setMessages([]);
        }

    } catch (error) {
        console.error("Error deleting channel:", error.response?.data || error.message);
    }
};

  
  return (
    <div className="chat-page-container">
      {/* Left Panel */}
      <div className="left-panel">
        <div className="left-card">
          <h4 className="panel-heading">Channels</h4>
          <div className="channel-input">
                <input 
                    type="text" 
                    placeholder="Enter channel name..."
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                />
                <button onClick={createChannel}>Create Channel</button>
            </div>
          <div className="left-card-content">
          <ul>
          {channels.map((chat) => (
            <li key={chat.id} className={selectedChatId === chat.id ? "active-chat" : ""}>
              <span onClick={() => getChatMessages(chat.id)}>{chat.name}</span>
              <button onClick={() => deleteChannel(chat.id)} className="delete-channel-btn">❌</button>
            </li>
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
