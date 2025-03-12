import { FiCornerUpLeft, FiMoreHorizontal, FiPaperclip, FiPhone, FiSend, FiSmile, FiTrash2, FiVideo } from 'react-icons/fi';
import './ChatPage.css';
import { useRef, useState, useEffect} from "react";

export default function ChatPage() {
    // Example data
    const channels = ['General', 'Project X', 'Design'];
    const dms = ['Alice', 'Bob', 'Charlie'];
    const [messages,setMessages] = useState([
       
    ]);
    const [inputText, setInputText] = useState("");
    const sendMessage = () => {
        const newMessage = {
            id: messages.length > 0 ? messages[messages.length - 1].id+1 : 0 , // Unique ID
            user: "You", // Change this dynamically if needed
            avatar: "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            text: inputText,
            image:selectedImage,
            replied:-1
        };
        if (inputText.trim() === "" && newMessage.image==null) return; // Don't send empty messages
        setSelectedImage(null); // Clear image preview
        // Reset file input so the same file can be uploaded again
        if (fileInputRef.current) fileInputRef.current.value = "";
        // Update state with new message
        setMessages([...messages, newMessage]);
        setInputText(""); // Clear input after sending
    };
    const deleteMessage = (id) => {
        setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
    };
const fileInputRef = useRef(null);
const [selectedImage, setSelectedImage] = useState(null);
const imageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return; // No file selected

    const reader = new FileReader();
    reader.onload = () => {
        const newMessage = {
            id: messages.length + 1,
            user: "You",
            avatar: "your-avatar.png", // Change as needed
            text: "", // No text, only an image
            image: reader.result, // Base64 image URL
            time: new Date().toLocaleTimeString(),
        };
        reader.onloadend = () => {
            setSelectedImage(reader.result); // Store image preview
        };
        // setMessages([...messages, newMessage]); // Append new image message
    };
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    reader.readAsDataURL(file); // Convert image to Base64
};
const chatEndRef = useRef(null);
useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("scrolling");
}, [messages]);
    return (
        <div className="chat-page-container">
            {/* Left: channels & DMs (static width, no collapse) */}
            <div className="left-panel">
                <div className="channel-section">
                    <h4>Channels</h4>
                    <ul>
                        {channels.map((c, i) => (
                            <li key={i}>{c}</li>
                        ))}
                    </ul>
                </div>
                <hr className="separator" />
                <div className="dm-section">
                    <h4>Direct Messages</h4>
                    <ul>
                        {dms.map((d, i) => (
                            <li key={i}>{d}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Center: chat area */}
            <div className="chat-center">
                <div className="chat-header">
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

                <div className="chat-messages">
                    {messages.map((msg) => (
                        <div key={msg.id} className="chat-message">
                            <img className="avatar" src={msg.avatar} alt={msg.user} />
                            <div className="msg-body">
                                <div className="msg-header">
                                    <span className="msg-user">{msg.user}</span>
                                    <span className="msg-time">{msg.time}</span>
                                </div>
                                <div className="msg-text">{msg.text}</div>
                                {msg.image && <img src={msg.image} alt="Uploaded" ref={chatEndRef} style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }}/>}
                                <div className="msg-actions">
                                    <button>
                                        <FiCornerUpLeft />
                                    </button>
                                    <button>
                                        <FiSmile />
                                    </button>
                                    <button onClick={() => deleteMessage(msg.id)}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="chat-input">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={imageUpload}
                />
                <button onClick={() => fileInputRef.current.click()}>
                    <FiPaperclip />
                </button>
                <input id="chatinput" 
                type="text" 
                placeholder="Type a message..." 
                onChange={(e) => setInputText(e.target.value)} 
                value={inputText}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}/>
                <button id="sendbutton" 
                onClick={sendMessage}>
                    <FiSend />
                </button>
            </div>
            </div>
        </div>
    );
}
