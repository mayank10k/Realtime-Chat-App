import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import Login from "./components/Login";
import Register from "./components/Register";
import { socket } from "./socket";
import axios from "axios";
import "./styles/globals.css";

const API_BASE = "";

export default function App() {
  // Authentication State
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("token");
    return t && t !== "undefined" && t !== "null" ? t : null;
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  });
  const [showRegister, setShowRegister] = useState(false);

  // Chat Application State
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Fetch Contacts
  useEffect(() => {
    if (!token) return;

    const fetchContacts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/user/contacts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContacts(res.data.contacts || []);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      }
    };

    fetchContacts();
  }, [token]);

  // 1. Socket Connection Management
  useEffect(() => {
    if (!token) return;

    // Connect socket with JWT token
    socket.auth = { token };
    socket.connect();

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("receiveMessage", (data) => {
      // Update contact list order and unread count
      setContacts((prev) => {
        const newContacts = [...prev];
        const contactIndex = newContacts.findIndex((c) => c._id === data.sender || c._id === data.receiver);
        if (contactIndex > -1) {
          const contact = { ...newContacts[contactIndex] };
          contact.lastMessageAt = data.createdAt || new Date().toISOString();
          contact.lastMessage = data.content;
          
          if (data.sender !== currentUser?._id && activeContact?._id !== data.sender) {
             contact.unreadCount = (contact.unreadCount || 0) + 1;
          }
          
          newContacts.splice(contactIndex, 1);
          newContacts.unshift(contact);
        }
        return newContacts;
      });

      // Only add message to view if it's from the active chat
      if (data.sender === activeContact?._id || data.receiver === activeContact?._id) {
        setMessages((prev) => [...prev, data]);
        socket.emit("messageRead", { messageId: data._id, senderId: data.sender });
      } else {
        socket.emit("messageDelivered", { messageId: data._id, senderId: data.sender });
      }
    });

    socket.on("messageStatusUpdate", ({ messageId, status }) => {
      setMessages((prev) => 
        prev.map(msg => msg._id === messageId || msg.tempId === messageId ? { ...msg, status } : msg)
      );
    });

    socket.on("messageSent", (newMessage) => {
      setMessages((prev) => prev.map(msg => msg.tempId === newMessage.tempId ? newMessage : msg));
      
      setContacts((prev) => {
        const newContacts = [...prev];
        const contactIndex = newContacts.findIndex((c) => c._id === newMessage.receiver);
        if (contactIndex > -1) {
          const contact = { ...newContacts[contactIndex] };
          contact.lastMessageAt = newMessage.createdAt || new Date().toISOString();
          contact.lastMessage = newMessage.content;
          newContacts.splice(contactIndex, 1);
          newContacts.unshift(contact);
        }
        return newContacts;
      });
    });

    // Handle typing indicators
    socket.on("typing", ({ senderId }) => {
      setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
    });

    socket.on("stopTyping", ({ senderId }) => {
      setTypingUsers((prev) => ({ ...prev, [senderId]: false }));
    });

    return () => {
      socket.off("onlineUsers");
      socket.off("receiveMessage");
      socket.off("messageStatusUpdate");
      socket.off("messageSent");
      socket.off("typing");
      socket.off("stopTyping");
      socket.disconnect();
    };
  }, [token, activeContact, currentUser]);

  // 2. Fetch Message History when changing contacts
  useEffect(() => {
    if (!activeContact || !token) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE}/messages/${activeContact._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.messages || []);

        // Mark unread messages as read
        if (res.data.messages) {
          res.data.messages.forEach(msg => {
            const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
            if (senderId === activeContact._id && msg.status !== 'read') {
              socket.emit("messageRead", { messageId: msg._id, senderId });
            }
          });
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchHistory();
  }, [activeContact, token]);

  // 3. Send Message logic
  const sendMessage = async (text) => {
    if (!text.trim() || !activeContact) return;

    const tempId = Date.now().toString();
    const messageData = {
      receiverId: activeContact._id,
      message: text,
      tempId
    };

    // Emit via Socket (Real-time)
    socket.emit("sendMessage", messageData);

    // Optimistic UI update
    const tempMsg = {
      _id: tempId,
      tempId,
      sender: currentUser._id,
      content: text,
      createdAt: new Date().toISOString(),
      status: "sent"
    };
    setMessages((prev) => [...prev, tempMsg]);
  };

  // 4. Handle Search Filter
  const filteredContacts = (contacts || [])
    .map(c => ({
      ...c,
      isOnline: c._id ? onlineUsers.includes(c._id.toString()) : false
    }))
    .filter((c) =>
      c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  // Render Login/Register if not authenticated
  if (!token) {
    return showRegister ? (
      <Register onToggle={() => setShowRegister(false)} />
    ) : (
      <Login onToggle={() => setShowRegister(true)} />
    );
  }

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
            setContacts(prev => prev.map(contact => 
              contact._id === c._id ? { ...contact, unreadCount: 0 } : contact
            ));
          }}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <ChatWindow
          contact={activeContact}
          messages={messages}
          isTyping={typingUsers[activeContact?._id] || false}
          onSend={sendMessage}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}