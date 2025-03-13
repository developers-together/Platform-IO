import { useEffect, useRef, useState } from 'react';
import { FiCornerUpLeft, FiImage, FiMoreHorizontal, FiPhone, FiSend, FiSmile, FiTrash2, FiVideo, FiXCircle } from 'react-icons/fi';
import Avatar from './Avatar';
import './ChatPage.css';

export default function ChatPage() {
    const channels = ['General', 'Project X', 'Design'];
    const dms = ['Alice', 'Bob', 'Charlie'];

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);

    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);
    const messageRefs = useRef({});
    const [highlightedMessage, setHighlightedMessage] = useState(null);

    const imageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
        fileInputRef.current.value = '';
    };

    const handleReply = (msg) => {
        setReplyingTo({
            id: msg.id,
            user: msg.user,
            text: msg.text.length > 40 ? msg.text.slice(0, 40) + '...' : msg.text,
        });
    };

    const sendMessage = () => {
        if (!inputText.trim() && !selectedImage) return;
        const newMessage = {
            id: messages.length > 0 ? messages[messages.length - 1].id + 1 : 0,
            user: 'You',
            avatar: '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: inputText,
            image: selectedImage,
            replyTo: replyingTo,
        };
        setMessages([...messages, newMessage]);
        setInputText('');
        setSelectedImage(null);
        setReplyingTo(null);
    };

    const deleteMessage = (id) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    const scrollToMessage = (replyingTo) => {
        if (replyingTo) {
            messageRefs.current[replyingTo.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedMessage(replyingTo.id);
            setTimeout(() => setHighlightedMessage(null), 1000);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="chat-page-container">
            {/* LEFT PANEL */}
            {/* LEFT PANEL */}
            <div className="left-panel">
                {/* Channels Card */}
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

                {/* Direct Messages Card */}
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
                        <div
                            key={msg.id}
                            ref={(el) => (messageRefs.current[msg.id] = el)}
                            className={`chat-message ${highlightedMessage === msg.id ? 'highlight' : ''}`}
                        >
                            {msg.avatar ? (
                                <img className="avatar" src={msg.avatar} alt={msg.user} />
                            ) : (
                                <Avatar name={msg.user} options={{ size: '64', rounded: true }} className="avatar" />
                            )}

                            <div className="msg-body">
                                {msg.replyTo && (
                                    <div className="reply-container" onClick={() => scrollToMessage(msg.replyTo)}>
                                        <span className="reply-user">{msg.replyTo.user}</span>
                                        <span className="reply-text">{msg.replyTo.text}</span>
                                    </div>
                                )}

                                <div className="msg-header">
                                    <span className="msg-user">{msg.user}</span>
                                    <span className="msg-time">{msg.time}</span>
                                </div>

                                {msg.image && <img src={msg.image} alt="Uploaded" className="uploaded-image" />}

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
                            type="text"
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
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
