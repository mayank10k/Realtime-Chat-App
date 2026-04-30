import "../styles/MessageBubble.css";

export default function MessageBubble({ message, contact, currentUser, isFirst, isLast }) {
  const senderId = typeof message.sender === 'object' ? message.sender?._id : message.sender;
  const isMe = senderId === currentUser?._id;

  const statusIcon = () => {
    if (!isMe) return null;
    if (message.status === "sent") return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="status-icon">
        <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
    if (message.status === "delivered" || message.status === "read") return (
      <svg width="14" height="12" viewBox="0 0 28 24" fill="none" className={`status-icon ${message.status === 'read' ? 'status-icon--read' : ''}`}>
        <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <polyline points="27 6 16 17 14 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
    return null;
  };

  return (
    <div className={`bubble-row ${isMe ? "bubble-row--me" : "bubble-row--them"} ${isFirst ? "bubble-row--first" : ""}`}>
      {!isMe && isLast && (
        <div className="bubble-avatar" style={{ "--accent": contact.color }}>
          {contact.avatar}
        </div>
      )}
      {!isMe && !isLast && <div className="bubble-avatar-spacer" />}

      <div className={`bubble-wrap ${isMe ? "bubble-wrap--me" : ""}`}>
        <div
          className={`bubble ${isMe ? "bubble--me" : "bubble--them"} ${isFirst ? "bubble--first" : ""} ${isLast ? "bubble--last" : ""}`}
          style={!isMe ? { "--accent": contact.color } : {}}
        >
          <p className="bubble-text">{message.content || message.text}</p>
        </div>
        {isLast && (
          <div className={`bubble-meta ${isMe ? "bubble-meta--me" : ""}`}>
            <span className="bubble-time">{message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}</span>
            {statusIcon()}
          </div>
        )}
      </div>
    </div>
  );
}
