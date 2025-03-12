import { useState } from 'react';
import { FiCornerUpLeft, FiMoreHorizontal, FiPaperclip, FiPhone, FiSend, FiSmile, FiTrash2, FiVideo } from 'react-icons/fi';
import './ChatPage.css';
import { useRef, useState, useEffect} from "react";

export default function ChatPage() {
    // Example data
    const channels = ['General', 'Project X', 'Design'];
    const dms = ['Alice', 'Bob', 'Charlie'];
    const [messages,setMessages] = useState([
       
    ]);
    const [inputText, setInputText] = useState('');
    const sendMessage = () => {
        const newMessage = {
            id: messages.length > 0 ? messages[messages.length - 1].id + 1 : 0, // Unique ID
            user: 'You', // Change this dynamically if needed
            avatar: 'data:image/png;base64,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',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        setInputText(''); // Clear input after sending
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
