import "../styles/EmojiPicker.css";

const EMOJIS = [
  "😀","😂","🥹","😍","🤩","😎","🥳","🤯","🔥","💯",
  "👏","🙌","✅","🚀","💡","⚡","🎉","🎯","💎","🌟",
  "❤️","💙","💜","🖤","🤍","👍","👋","🫡","🤝","💪",
  "😭","😅","🙃","🤔","🫠","😤","🥶","🤓","👀","🫶",
];

export default function EmojiPicker({ onSelect }) {
  return (
    <div className="emoji-picker">
      <div className="emoji-grid">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            className="emoji-btn"
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
