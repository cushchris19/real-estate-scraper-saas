import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secretCode, setSecretCode] = useState('');
    const [showAdmin, setShowAdmin] = useState(false);
    const { login } = useAuth();

    // The "Konami Code" listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            setSecretCode(prev => {
                const newCode = (prev + e.key).slice(-5); // Keep last 5 chars
                if (newCode.toLowerCase() === 'admin') {
                    setShowAdmin(true);
                }
                return newCode;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted");
        login(email, password, showAdmin);
    };

    return (
        <div className={`login-container ${showAdmin ? 'admin-mode' : ''}`}>
            <div className="login-card">
                <h1 className={showAdmin ? 'glitch-text' : ''}>
                    {showAdmin ? 'GOD MODE ACCESS' : 'Welcome Back'}
                </h1>
                <p>Sign in to access the Lead Scraper</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {showAdmin && (
                        <div className="admin-badge">
                            <span>⚠️ ADMIN PRIVILEGES ACTIVE</span>
                        </div>
                    )}

                    <button type="submit" className={showAdmin ? 'admin-btn' : ''}>
                        {showAdmin ? 'ENTER SYSTEM' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
