import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

function Layout() {
    const location = useLocation();
    const [shields, setShields] = useState(parseInt(localStorage.getItem('streakShields') || "0"));

    useEffect(() => {
        const updateShields = () => {
            setShields(parseInt(localStorage.getItem('streakShields') || "0"));
        };
        window.addEventListener('storage', updateShields);
        return () => window.removeEventListener('storage', updateShields);
    }, []);

    const isActive = (path) => {
        return location.pathname === path ? 'active-link' : '';
    };

    return (
        <div className="app-shell stardust-bg fade-in">
            <div className="glow-circle glow-top-left"></div>
            <div className="glow-circle glow-bottom-right"></div>
            <aside className="sidebar glass-card" style={{ margin: '12px', height: 'calc(100vh - 24px)', borderRadius: '24px' }}>
                <div className="logo">
                    <h2 style={{ letterSpacing: '1px', fontSize: '28px' }}>Study<b style={{ color: 'var(--secondary)' }}>Hub</b></h2>
                </div>
                <nav>
                    <Link to="/" className={`nav-item ${isActive('/')}`}>
                        <span>📊</span> Dashboard
                    </Link>
                    <Link to="/planner" className={`nav-item ${isActive('/planner')}`}>
                        <span>📅</span> Planner
                    </Link>
                    <Link to="/progress" className={`nav-item ${isActive('/progress')}`}>
                        <span>📈</span> Progress
                    </Link>
                    <Link to="/impact" className={`nav-item ${isActive('/impact')}`}>
                        <span>🌳</span> Impact Forest
                    </Link>
                    <Link to="/mentor" className={`nav-item ${isActive('/mentor')}`} style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                        <span>👨‍👩‍👧‍👦</span> Mentor Dashboard
                    </Link>

                    <div style={{ flex: 1 }}></div> {/* Spacer to push logout to bottom */}

                    <button
                        onClick={() => {
                            localStorage.removeItem('user');
                            window.location.href = '/login';
                        }}
                        className="nav-item"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            justifyContent: 'flex-start',
                            color: '#ef4444' // Red color for logout
                        }}
                    >
                        <span>🚪</span> Sign Out
                    </button>
                </nav>
            </aside>
            <main className="main-content">
                <header className="top-bar">
                    <h3>{location.pathname === '/mentor' ? 'Parent Intelligence Reporting' : 'Welcome back!'}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="shield-display" title="Streak Shields Protect your combo if you miss a day!">
                            <span style={{ fontSize: '18px' }}>🛡️</span>
                            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{shields}</span>
                        </div>
                        <div className="user-profile">
                            <div className="avatar">U</div>
                        </div>
                    </div>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;
