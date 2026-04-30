import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { initialContacts, generateMessage } from "./data/mockData";
import "./styles/globals.css";

export default function App() {
  const [contacts, setContacts] = useState(initialContacts);
  const [activeContact, setActiveContact] = useState(initialContacts[0]);
  const [messages, setMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const init = {};
    initialContacts.forEach((c) => {
      init[c.id] = c.messages || [];
    });
    setMessages(init);
  }, []);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const msg = {
      id: Date.now(),
      text,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setMessages((prev) => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), msg],
    }));

    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContact.id ? { ...c, lastMessage: text, lastTime: "now" } : c
      )
    );

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeContact.id]: (prev[activeContact.id] || []).map((m) =>
          m.id === msg.id ? { ...m, status: "delivered" } : m
        ),
      }));
    }, 800);

    setTypingUsers((prev) => ({ ...prev, [activeContact.id]: true }));

    const replyDelay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      setTypingUsers((prev) => ({ ...prev, [activeContact.id]: false }));
      const reply = generateMessage(activeContact.id);
      setMessages((prev) => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), reply],
      }));
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeContact.id
            ? { ...c, lastMessage: reply.text, lastTime: "now", unread: 0 }
            : c
        )
      );
    }, replyDelay);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-shell">
      <div className="noise-overlay" />
      <div className="glow-orb glow-orb--1" />
      <div className="glow-orb glow-orb--2" />
      <div className="glow-orb glow-orb--3" />
      <div className="chat-container">
        <Sidebar
          contacts={filteredContacts}
          activeContact={activeContact}
          onSelect={(c) => {
            setActiveContact(c);
            setContacts((prev) =>
              prev.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x))
            );
          }}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
        />
        <ChatWindow
          contact={activeContact}
          messages={messages[activeContact?.id] || []}
          isTyping={typingUsers[activeContact?.id] || false}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
}
