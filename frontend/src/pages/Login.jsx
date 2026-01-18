import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.message === "Login success") {
                // Store the real user object from backend
                const user = response.data.user;
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/dashboard');
            }
        } catch (err) {
            setError("Invalid email or password. Please try again.");
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
                <div className="auth-visual">
                    <div className="visual-content">
                        <div className="brand-icon">🎓</div>
                        <h1 className="auth-title">Welcome<br />Back</h1>
                        <p className="auth-subtitle">
                            Your AI study assistant is ready to help you crush your goals today.
                        </p>

                        <div className="streak-badge">
                            <span>🔥</span>
                            <span style={{ fontWeight: 500, fontSize: '14px' }}>12 Day Streak</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="auth-form-container">
                    <div className="form-header">
                        <h2 className="form-title">Continue Journey</h2>
                        <p className="form-subtitle">Your AI mentor is waiting for you.</p>
                        {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px', fontWeight: 500 }}>⚠️ {error}</p>}
                    </div>

                    <form onSubmit={handleLogin}>
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
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            className="auth-button"
                            type="submit"
                            disabled={loading || !email || !password}
                            style={{ opacity: (loading || !email || !password) ? 0.7 : 1 }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account?
                        <Link to="/signup" className="link-text">Sign Up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
