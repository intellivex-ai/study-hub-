import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/register', { email, password, username });
            alert("Account created! Please login.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container stardust-bg">
            <div className="glow-circle glow-top-left"></div>
            <div className="glow-circle glow-bottom-right"></div>

            <div className="auth-card">
                {/* Left Panel */}
                <div className="auth-visual" style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)' }}>
                    <div className="visual-content">
                        <div className="brand-icon">🤖</div>
                        <h1 className="auth-title">Unlock<br />Potential</h1>
                        <p className="auth-subtitle">
                            Master your studies with the power of AI. Plan smarter, learn faster.
                        </p>

                        <div className="streak-badge">
                            <span>🚀</span>
                            <span style={{ fontWeight: 500, fontSize: '14px' }}>Join 100+ Students</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="auth-form-container">
                    <div className="form-header">
                        <h2 className="form-title">Begin Your Journey</h2>
                        <p className="form-subtitle">Create an account to start tracking progress.</p>
                        {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px', fontWeight: 500 }}>⚠️ {error}</p>}
                    </div>

                    <form onSubmit={handleSignup}>
                        <div className="input-group">
                            <label className="input-label">Username</label>
                            <div className="input-wrapper">
                                <span className="input-icon">👤</span>
                                <input
                                    className="auth-input"
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Email Address</label>
                            <div className="input-wrapper">
                                <span className="input-icon">✉️</span>
                                <input
                                    className="auth-input"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input
                                    className="auth-input"
                                    type="password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            className="auth-button"
                            type="submit"
                            disabled={loading || !email || !password || !username || password.length < 6}
                            style={{ opacity: (loading || !email || !password || !username || password.length < 6) ? 0.7 : 1 }}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                        {password && password.length < 6 && (
                            <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '8px', textAlign: 'center' }}>
                                Password must be at least 6 characters
                            </p>
                        )}
                    </form>

                    <div className="auth-footer">
                        Already have an account?
                        <Link to="/login" className="link-text">Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;
