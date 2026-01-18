import { useEffect, useState } from 'react';

function ProgressChart() {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({
        totalMin: 0,
        completionRate: 0,
        currentRank: 'Novice',
        progressToNext: 0,
        nextRank: 'Intermediate',
        targetMin: 300
    });

    useEffect(() => {
        const savedHistory = JSON.parse(localStorage.getItem('studyHistory') || "[]");
        setHistory(savedHistory);

        // 1. Calculate Total Minutes
        const total = savedHistory.reduce((acc, day) => acc + (day.minutes || 0), 0);

        // 2. Completion Rate
        const totalTasks = savedHistory.reduce((acc, day) => acc + (day.total || 0), 0);
        const completedTasks = savedHistory.reduce((acc, day) => acc + (day.completed || 0), 0);
        const rate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // 3. XP-Based Progression (Ranks)
        let rank = 'Scout';
        let next = 'Learner';
        let target = 200;
        let progressToNext = 0;

        if (total > 5000) {
            rank = 'Grandmaster';
            next = 'Legend';
            target = 10000;
            progressToNext = Math.min(Math.round(((total - 5000) / 5000) * 100), 100);
        } else if (total > 2000) {
            rank = 'Sage';
            next = 'Grandmaster';
            target = 5000;
            progressToNext = Math.round(((total - 2000) / 3000) * 100);
        } else if (total > 1200) {
            rank = 'Master';
            next = 'Sage';
            target = 2000;
            progressToNext = Math.round(((total - 1200) / 800) * 100);
        } else if (total > 600) {
            rank = 'Focused';
            next = 'Master';
            target = 1200;
            progressToNext = Math.round(((total - 600) / 600) * 100);
        } else if (total > 200) {
            rank = 'Learner';
            next = 'Focused';
            target = 600;
            progressToNext = Math.round(((total - 200) / 400) * 100);
        } else {
            rank = 'Scout';
            next = 'Learner';
            target = 200;
            progressToNext = Math.round((total / 200) * 100);
        }

        // 4. Weekly Score Calculation
        const score = Math.round((rate * 0.7) + (Math.min(savedHistory.length * 10, 30)));

        // 5. Personal Bests
        const bestStreak = Math.max(...savedHistory.map(day => day.streak || 0), parseInt(localStorage.getItem('studyStreak') || "0"));
        const recordDay = Math.max(...savedHistory.map(day => day.minutes || 0), 0);

        setStats({
            totalMin: total,
            completionRate: rate,
            currentRank: rank,
            progressToNext: progressToNext,
            nextRank: next,
            targetMin: target,
            weeklyScore: score,
            xpToNext: Math.max(0, target - total),
            bestStreak,
            recordDay
        });
    }, []);

    // Helper for bar height (max 100%)
    const maxMinutes = Math.max(...history.map(d => d.minutes), 60);
    const getHeight = (min) => Math.round((min / maxMinutes) * 100);

    return (
        <div className="progress-container">
            <h2 className="title">Progress Analytics</h2>
            <p className="subtitle" style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                Track your journey from Novice to Master. Every minute counts.
            </p>

            <div className="stats-grid">
                <div className="stat-card card">
                    <h3>Lifetime XP</h3>
                    <p className="stat-value">{stats.totalMin}<span className="unit">xp</span></p>
                </div>
                <div className="stat-card card">
                    <h3>Completion Rate</h3>
                    <p className="stat-value">{stats.completionRate}<span className="unit">%</span></p>
                </div>
                <div className="stat-card card">
                    <h3>Weekly Score</h3>
                    <p className="stat-value" style={{ color: '#10b981' }}>{stats.weeklyScore}<span className="unit">pts</span></p>
                </div>
                <div className={`stat-card card ${['Sage', 'Grandmaster', 'Legend'].includes(stats.currentRank) ? 'rank-shimmer' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
                    <h3>Current Rank</h3>
                    <p className="stat-value" style={{ color: 'var(--primary)' }}>{stats.currentRank}</p>
                    <div className="level-badge">{stats.currentRank[0]}</div>
                </div>
                <div className="stat-card card">
                    <h3>Best Streak</h3>
                    <p className="stat-value" style={{ color: '#f59e0b' }}>{stats.bestStreak}<span className="unit">days</span></p>
                </div>
                <div className="stat-card card">
                    <h3>Personal Record</h3>
                    <p className="stat-value" style={{ color: '#a855f7' }}>{stats.recordDay}<span className="unit">xp/day</span></p>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="card badge-section" style={{ marginBottom: '24px' }}>
                <h3>🏆 Achievements</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                    {JSON.parse(localStorage.getItem('earnedBadges') || "[]").map((id, i) => {
                        const badgeData = {
                            'streak_3': { name: '3-Day Heat', icon: '🔥' },
                            'perfect_day': { name: 'Perfectionist', icon: '🎯' },
                            'first_plan': { name: 'Fresh Start', icon: '🌱' }
                        };
                        const b = badgeData[id];
                        if (!b) return null;
                        return (
                            <div key={i} className="earned-badge" title={b.name}>
                                <span style={{ fontSize: '24px' }}>{b.icon}</span>
                                <span style={{ fontSize: '11px', fontWeight: 600 }}>{b.name}</span>
                            </div>
                        );
                    })}
                    {JSON.parse(localStorage.getItem('earnedBadges') || "[]").length === 0 && (
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No badges earned yet. Keep studying!</p>
                    )}
                </div>
            </div>

            {/* Level Progress Section */}
            <div className="card level-progress-section" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-end' }}>
                    <div>
                        <h3 style={{ margin: 0 }}>Next Level: {stats.nextRank}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            {stats.totalMin} / {stats.targetMin} XP completed
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'block' }}>{stats.progressToNext}%</span>
                        {stats.xpToNext > 0 && <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>Only {stats.xpToNext} XP to level up!</span>}
                    </div>
                </div>
                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill"
                        style={{ width: `${stats.progressToNext}%` }}
                    ></div>
                </div>
            </div>

            {/* Activity Chart Section */}
            <div className="card chart-section">
                <h3>Weekly Activity</h3>
                <div className="bar-chart">
                    {history.length === 0 ? (
                        <div className="no-data">
                            <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>📊</span>
                            <p>No study history found yet. Start your first session on the Dashboard!</p>
                        </div>
                    ) : (
                        history.map((day, i) => (
                            <div key={i} className="chart-col">
                                <span className="bar-value">{day.minutes}m</span>
                                <div
                                    className="bar"
                                    style={{ height: `${getHeight(day.minutes)}%` }}
                                    title={`${day.minutes} min`}
                                ></div>
                                <span className="label">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProgressChart;
