// resources/js/components/ChatPage.jsx
import { useEffect, useRef, useState } from 'react';
import { FiCornerUpLeft, FiImage, FiMoreHorizontal, FiPhone, FiSend, FiSmile, FiTrash2, FiVideo, FiXCircle } from 'react-icons/fi';
import Avatar from './Avatar'; // Import the Avatar component
import './ChatPage.css';

export default function ChatPage() {
    // Sample data
    const channels = ['General', 'Project X', 'Design'];
    const dms = ['Alice', 'Bob', 'Charlie'];
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    const imageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const sendMessage = () => {
        if (!inputText.trim() && !selectedImage) return;
        const newMessage = {
            id: messages.length > 0 ? messages[messages.length - 1].id + 1 : 0,
            user: 'You',
            // If no avatar URL is provided, we’ll use the default Avatar component
            avatar: '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: inputText,
            image: selectedImage,
        };
        setMessages([...messages, newMessage]);
        setInputText('');
        setSelectedImage(null);
    };

    const deleteMessage = (id) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="chat-page-container">
            {/* Left Panel: Channels & DMs */}
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

            {/* Center Panel: Chat Area */}
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
                            {/* Use Avatar component if msg.avatar is empty */}
                            {msg.avatar ? (
                                <img className="avatar" src={msg.avatar} alt={msg.user} />
                            ) : (
                                <Avatar name={msg.user} options={{ size: '64', rounded: true }} className="avatar" />
                            )}
                            <div className="msg-body">
                                <div className="msg-header">
                                    <span className="msg-user">{msg.user}</span>
                                    <span className="msg-time">{msg.time}</span>
                                </div>
                                {msg.image && (
                                    <img src={msg.image} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                                )}
                                <div className="msg-text" ref={chatEndRef}>
                                    {msg.text}
                                </div>
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
                    <div ref={chatEndRef}></div>
                </div>

                {/* Chat Input Area */}
                <div className="chat-input">
                    {selectedImage && (
                        <div className="image-preview-container">
                            <img className="image-preview" src={selectedImage} alt="Preview" />
                            <button className="remove-image-btn" onClick={() => setSelectedImage(null)}>
                                <FiXCircle />
                            </button>
                        </div>
                    )}
                    <div className="chat-input-row">
                        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={imageUpload} />
                        <button onClick={() => fileInputRef.current?.click()}>
                            <FiImage />
                        </button>
                        <input
                            id="chatinput"
                            type="text"
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button id="sendbutton" onClick={sendMessage}>
                            <FiSend />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
