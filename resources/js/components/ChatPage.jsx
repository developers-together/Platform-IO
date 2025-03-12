// resources/js/components/ChatPage.jsx
import { useEffect, useRef, useState } from 'react';
import { FiCornerUpLeft, FiImage, FiMoreHorizontal, FiPhone, FiSend, FiSmile, FiTrash2, FiVideo, FiXCircle } from 'react-icons/fi';
import Avatar from './Avatar'; // Optional avatar component, or remove if you don't use it
import './ChatPage.css';

export default function ChatPage() {
    // Sample data
    const channels = ['General', 'Project X', 'Design'];
    const dms = ['Alice', 'Bob', 'Charlie'];

    // Chat state
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    // The message we are currently replying to (if any)
    const [replyingTo, setReplyingTo] = useState(null);

    // File input + chat scroll references
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    // Called when user selects an image
    const imageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
        // Clear file input so user can select the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Called when user clicks "Reply" on a message
    const handleReply = (msg) => {
        // We'll store the user + snippet of text for the reply
        setReplyingTo({
            id: msg.id,
            user: msg.user,
            text: msg.text.length > 40 ? msg.text.slice(0, 40) + '...' : msg.text,
        });
    };

    // Called when user clicks "Send"
    const sendMessage = () => {
        if (!inputText.trim() && !selectedImage) return;

        // Build new message object
        const newMessage = {
            id: messages.length > 0 ? messages[messages.length - 1].id + 1 : 0,
            user: 'You',
            avatar: '', // or a real avatar URL
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: inputText,
            image: selectedImage,
            replyTo: replyingTo, // store the reply info if we have it
        };

        // Add to messages
        setMessages([...messages, newMessage]);

        // Clear input, image, and reply
        setInputText('');
        setSelectedImage(null);
        setReplyingTo(null);
    };

    // Delete a message by ID
    const deleteMessage = (id) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const messageRefs = useRef({});
    const [highlightedMessage, setHighlightedMessage] = useState(null);
    const scrollToMessage = (replyingTo) => {
        console.log(replyingTo);
        if (replyingTo) {
            messageRefs.current[replyingTo.id].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setHighlightedMessage(replyingTo.id);
        setTimeout(() => setHighlightedMessage(null), 1000);  // change second arguement to change highlight duration default(1000)
    };

    return (
        <div className="chat-page-container">
            {/* LEFT PANEL */}
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

            {/* CENTER CHAT */}
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
                        <div key={msg.id} 
                        ref={(el) => (messageRefs.current[msg.id] = el)}
                        className="chat-message">
                            {/* If avatar is empty, fallback to default avatar (optional) */}
                            {msg.avatar ? (
                                <img className="avatar" src={msg.avatar} alt={msg.user} />
                            ) : (
                                <Avatar name={msg.user} options={{ size: '64', rounded: true }} className="avatar" />
                            )}

                            <div
                            key={msg.id}
                            className={`msg-body ${highlightedMessage === msg.id ? 'highlight' : ''}`}
                            >
                                {/* If this message is replying to another, show the reply container */}
                                {msg.replyTo && (
                                    <div className="reply-container" onClick={() => scrollToMessage(msg.replyTo)} style={{ cursor: 'pointer', color: 'blue' }}>
                                        <div className="reply-arrow">
                                            {/* small arrow icon or inline svg */}
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                <path
                                                    d="M14 7l-5 5 5 5"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <div className="reply-info">
                                            <span className="reply-user">{msg.replyTo.user}</span>
                                            <span className="reply-text">{msg.replyTo.text}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="msg-header">
                                    <span className="msg-user">{msg.user}</span>
                                    <span className="msg-time">{msg.time}</span>
                                </div>

                                {/* If there's an image, show it */}
                                {msg.image && (
                                    <img src={msg.image} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                                )}

                                <div className="msg-text">{msg.text}</div>
                                <div className="msg-actions">
                                    <button onClick={() => handleReply(msg)}>
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

                {/* CHAT INPUT */}
                <div className="chat-input">
                    {/* If user is replying to something, show a small snippet above input */}
                    {replyingTo && (
                        <div className="reply-preview">
                            <span>
                                Replying to <strong>{replyingTo.user}</strong>: {replyingTo.text}
                            </span>
                            <button className="cancel-reply" onClick={() => setReplyingTo(null)}>
                                <FiXCircle />
                            </button>
                        </div>
                    )}

                    {/* If user selected an image, show preview */}
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
