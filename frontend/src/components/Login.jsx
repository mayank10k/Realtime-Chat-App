import { useState } from "react";
import axios from "axios";
import "../styles/Auth.css";

export default function Login({ onToggle }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Backend expects: email, password
      const res = await axios.post("/user/login", formData);
      
      // Store JWT token for socket.io handshake
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      window.location.reload(); // Refresh to initialize App with state
    } catch (err) {
      alert(err.response?.data?.error || "Invalid email or password");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            required
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <div className="password-input-wrap" style={{ position: 'relative', width: '100%' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              required
              onChange={e => setFormData({...formData, password: e.target.value})} 
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted, #999)', cursor: 'pointer', padding: 0, display: 'flex' }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          <button type="submit">Login</button>
        </form>
        <p className="auth-toggle-text">
          Don't have an account? <span onClick={onToggle}>Register</span>
        </p>
      </div>
    </div>
  );
}