import "../styles/TypingIndicator.css";

export default function TypingIndicator({ contact }) {
  return (
    <div className="typing-row">
      <div className="typing-avatar" style={{ "--accent": contact.color }}>
        {contact.avatar}
      </div>
      <div className="typing-bubble">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
