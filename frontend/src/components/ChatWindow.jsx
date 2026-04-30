import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import EmojiPicker from "./EmojiPicker";
import "../styles/ChatWindow.css";

export default function ChatWindow({ contact, messages, isTyping, onSend, currentUser }) {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji) => {
    setInput((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  if (!contact) return null;

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="header-avatar" style={{ "--accent": contact.color || 'var(--accent-cyan)' }}>
            {contact.avatar || contact.name?.charAt(0)?.toUpperCase()}
            <div className={`header-status status-dot--${contact.isOnline ? 'online' : 'offline'}`} />
          </div>
          <div className="header-info">
            <h2 className="header-name">{contact.name}</h2>
            <p className="header-sub">
              {contact.isOnline ? "Active now" : "Offline"}
            </p>
          </div>
        </div>
        <div className="chat-header-right">
          <button className="icon-btn" title="Voice call">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="icon-btn" title="Video call">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polygon points="23 7 16 12 23 17 23 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="icon-btn" title="More options">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5" r="1" fill="currentColor"/>
              <circle cx="12" cy="12" r="1" fill="currentColor"/>
              <circle cx="12" cy="19" r="1" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area">
        <div className="messages-date-divider">
          <span>Today</span>
        </div>
        {messages.map((msg, i) => {
          const prevSender = messages[i - 1]?.sender?._id || messages[i - 1]?.sender;
          const currentSender = msg.sender?._id || msg.sender;
          const nextSender = messages[i + 1]?.sender?._id || messages[i + 1]?.sender;
          return (
            <MessageBubble
              key={msg._id || i}
              message={msg}
              contact={contact}
              currentUser={currentUser}
              isFirst={i === 0 || prevSender !== currentSender}
              isLast={i === messages.length - 1 || nextSender !== currentSender}
            />
          );
        })}
        {isTyping && <TypingIndicator contact={contact} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`input-area ${isInputFocused ? "input-area--focused" : ""}`}>
        <div className="input-toolbar">
          <button className="icon-btn" title="Attach file">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="icon-btn" title="Image">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
              <polyline points="21 15 16 10 5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="input-box-wrap">
          <textarea
            ref={inputRef}
            className="message-input"
            placeholder={`Message ${contact.name}…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            rows={1}
          />
          <button
            className="emoji-toggle"
            onClick={() => setShowEmoji((v) => !v)}
            title="Emoji"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 13s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <button
          className={`send-btn ${input.trim() ? "send-btn--active" : ""}`}
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {showEmoji && <EmojiPicker onSelect={addEmoji} />}
      </div>
    </div>
  );
}
