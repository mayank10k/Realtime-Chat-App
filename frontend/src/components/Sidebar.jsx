import { useState } from "react";
import "../styles/Sidebar.css";

export default function Sidebar({ contacts, activeContact, onSelect, searchQuery, onSearch, currentUser, onLogout }) {
  const [hovered, setHovered] = useState(null);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="brand-name">ChatterBox</span>
        </div>
        <div className="header-actions">
          <button className="icon-btn" title="New chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="icon-btn" title="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="search-wrap">
        <div className="search-box">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search conversations…"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="section-label">ACTIVE NOW</div>

      <div className="contacts-list">
        {contacts.map((contact) => (
          <button
            key={contact._id}
            className={`contact-item ${activeContact?._id === contact._id ? "contact-item--active" : ""}`}
            onClick={() => onSelect(contact)}
            onMouseEnter={() => setHovered(contact._id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="avatar-wrap">
              <div
                className="avatar"
                style={{ "--accent": contact.color || 'var(--accent-cyan)' }}
              >
                {contact.avatar || contact.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className={`status-dot status-dot--${contact.isOnline ? 'online' : 'offline'}`} />
            </div>

            <div className="contact-info">
              <div className="contact-top">
                <span className="contact-name">{contact.name}</span>
              </div>
              <div className="contact-bottom">
                <span className="contact-preview">
                  {contact.lastMessage || (contact.username ? `@${contact.username}` : 'Tap to start chatting')}
                </span>
                {contact.unreadCount > 0 && (
                  <span className="unread-badge">{contact.unreadCount}</span>
                )}
              </div>
            </div>

            {activeContact?._id === contact._id && (
              <div className="active-indicator" style={{ background: contact.color || 'var(--accent-cyan)' }} />
            )}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="me-avatar" style={{ "--accent": 'var(--accent-cyan)' }}>
          {currentUser?.avatar || currentUser?.name?.charAt(0)?.toUpperCase() || "ME"}
        </div>
        <div className="me-info">
          <span className="me-name">{currentUser?.name || "You"}</span>
          <span className="me-status">● Online</span>
        </div>
        <button className="icon-btn logout-btn" title="Logout" onClick={onLogout} style={{ marginLeft: 'auto', color: '#ff4757' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  );
}
