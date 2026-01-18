import { useState, useEffect } from 'react';
import api from '../api/axios';

function ParentDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/mentor/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch mentor stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading">Analyzing Student Performance...</div>;
    if (!stats) return <div className="error">Failed to load intelligence data.</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header" style={{ marginBottom: '24px' }}>
                <div className="header-left">
                    <h1>Parent/Mentor Dashboard</h1>
                    <p className="subtitle">High-level intelligence & observation</p>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* Column 1: Consistency & Trends */}
                <div className="main-col">
                    <div className="card consistency-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '32px' }}>
                        <div className="gauge-container" style={{ position: 'relative', width: '120px', height: '120px' }}>
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path className="circle-bg"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none" stroke="#eee" strokeWidth="2"
                                />
                                <path className="circle"
                                    strokeDasharray={`${stats.consistency_score}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"
                                />
                                <text x="18" y="20.35" className="percentage" style={{ fontSize: '8px', textAnchor: 'middle', fill: 'white', fontWeight: 800 }}>{stats.consistency_score}%</text>
                            </svg>
                        </div>
                        <div>
                            <div className="xp-label">WEEKLY CONSISTENCY</div>
                            <h2 style={{ fontSize: '24px', margin: '4px 0' }}>{stats.consistency_score > 80 ? 'Elite Performance' : stats.consistency_score > 50 ? 'Steady Growth' : 'Needs Focus'}</h2>
                            <p style={{ opacity: 0.7, fontSize: '14px' }}>Based on daily check-ins and session completion rates.</p>
                        </div>
                    </div>

                    <div className="card trend-card" style={{ marginTop: '24px' }}>
                        <h3>📈 Weekly Effort Trend</h3>
                        <div className="chart-mock" style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '20px 0' }}>
                            {stats.effort_trend.length > 0 ? stats.effort_trend.map((day, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '150px' }}>
                                        {/* Target Ghost Bar */}
                                        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: `${(day.target / 120) * 100}%`, border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '4px' }}></div>
                                        {/* Actual Bar */}
                                        <div style={{
                                            width: '100%',
                                            height: `${(day.actual / 120) * 100}%`,
                                            backgroundColor: day.actual >= day.target ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                            borderRadius: '4px',
                                            transition: 'height 0.5s ease',
                                            zIndex: 1
                                        }}></div>
                                    </div>
                                    <span style={{ fontSize: '10px', opacity: 0.6 }}>{day.date.split('-').slice(1).join('/')}</span>
                                </div>
                            )) : <p style={{ width: '100%', textAlign: 'center', opacity: 0.5 }}>No data for this week yet.</p>}
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <span style={{ fontSize: '12px', opacity: 0.6 }}>Weekly Minutes</span>
                                <div style={{ fontWeight: 700 }}>{stats.weekly_summary.total_minutes}m</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '12px', opacity: 0.6 }}>Avg. Completion</span>
                                <div style={{ fontWeight: 700 }}>{stats.weekly_summary.avg_completion}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Alerts & Priorities */}
                <div className="side-col">
                    <div className="card alert-card" style={{ marginBottom: '24px' }}>
                        <div className="xp-label">PROACTIVE ALERTS</div>
                        <div style={{ marginTop: '12px' }}>
                            {stats.alerts.length > 0 ? stats.alerts.map((alert, i) => (
                                <div key={i} className={`alert-item ${alert.type}`} style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    borderLeft: `4px solid ${alert.type === 'danger' ? '#ef4444' : alert.type === 'warning' ? '#f59e0b' : '#3b82f6'}`,
                                    marginBottom: '8px',
                                    fontSize: '13px'
                                }}>
                                    {alert.message}
                                </div>
                            )) : <p style={{ opacity: 0.5, fontSize: '13px' }}>All systems nominal. No alerts.</p>}
                        </div>
                    </div>

                    <div className="card priority-card">
                        <div className="xp-label">STUDY PERSONALITY</div>
                        <div style={{ marginTop: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px' }}>
                                {stats.study_profile === 'Focus Sprinter' ? '⚡' :
                                    stats.study_profile === 'Marathon Learner' ? '🐢' :
                                        stats.study_profile === 'Morning Starter' ? '🌅' :
                                            stats.study_profile === 'Night Owl' ? '🦉' : '🚀'}
                            </div>
                            <h3 style={{ margin: '8px 0 4px 0' }}>{stats.study_profile || 'Universal Learner'}</h3>
                            <p style={{ fontSize: '12px', opacity: 0.6 }}>How the student learns best</p>
                        </div>
                    </div>

                    <div className="card priority-card" style={{ marginTop: '16px' }}>
                        <div className="xp-label">ML FOCUS RADAR</div>
                        <div style={{ marginTop: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '32px' }}>🧠</div>
                            <h3 style={{ margin: '8px 0 4px 0' }}>{stats.top_priority}</h3>
                            <p style={{ fontSize: '12px', opacity: 0.6 }}>Current Primary Academic Focus</p>
                        </div>
                    </div>

                    <div className="card priority-card" style={{ marginTop: '16px' }}>
                        <div className="xp-label">REAL-WORLD IMPACT</div>
                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '24px' }}>🌳</div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: 700 }}>{Math.floor(stats.weekly_summary.total_minutes / 60)} Trees Earned</div>
                                <p style={{ margin: 0, fontSize: '11px', opacity: 0.6 }}>Direct result of study effort</p>
                            </div>
                        </div>
                    </div>

                    {/* Observer Notice */}
                    <div style={{ marginTop: '24px', padding: '16px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center' }}>
                        <span style={{ fontSize: '11px', opacity: 0.5 }}>
                            OBSERVER MODE ACTIVE: You are viewing an intelligence report. No changes can be made from this view.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ParentDashboard;
