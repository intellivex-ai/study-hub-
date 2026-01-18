import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AIMentor from '../components/AIMentor';
import InputPanel from '../components/InputPanel';
import StreakCard from '../components/StreakCard';
import CheckInModal from '../components/CheckInModal';
import BadgeModal from '../components/BadgeModal';

function Dashboard() {
    const [plan, setPlan] = useState([]);
    const [mentor, setMentor] = useState('');
    const [loading, setLoading] = useState(false);
    const [streak, setStreak] = useState(0);
    const [newBadge, setNewBadge] = useState(null);
    const [dailyQuest, setDailyQuest] = useState(null);
    const [floatingXPs, setFloatingXPs] = useState([]);
    const [weaknessScores, setWeaknessScores] = useState({});
    const [dropoutRisk, setDropoutRisk] = useState({ level: "Low", rationale: "" });
    const [studyProfile, setStudyProfile] = useState({ value: "Universal Learner", rationale: "", confidence: "Low" });
    const [timeRec, setTimeRec] = useState({ range: [45, 90], rationale: "" });
    const [impactState, setImpactState] = useState(null);

    // Load state from localStorage on mount
    useEffect(() => {
        const fetchImpact = async () => {
            try {
                const res = await api.get('/impact/state');
                setImpactState(res.data);
            } catch (e) { }
        };
        fetchImpact();
        const savedStreak = localStorage.getItem('studyStreak');
        const savedPlan = localStorage.getItem('studyPlan');
        const savedMentor = localStorage.getItem('mentorMessage');
        const lastDate = localStorage.getItem('lastStudyDate');

        if (savedStreak) setStreak(parseInt(savedStreak));
        if (savedPlan) setPlan(JSON.parse(savedPlan));
        if (savedMentor) setMentor(savedMentor);

        const today = new Date().toDateString();

        if (lastDate && lastDate !== today) {
            // New day detected! Archive data first.
            const previousPlan = JSON.parse(savedPlan || "[]");
            if (previousPlan.length > 0) {
                const history = JSON.parse(localStorage.getItem('studyHistory') || "[]");

                const totalMinutes = previousPlan.reduce((acc, curr) => acc + (curr.completed ? curr.minutes : 0), 0);
                const completedCount = previousPlan.filter(t => t.completed).length;

                history.push({
                    date: lastDate,
                    minutes: totalMinutes,
                    completed: completedCount,
                    total: previousPlan.length
                });

                if (history.length > 7) history.shift();
                localStorage.setItem('studyHistory', JSON.stringify(history));
            }

            setPlan([]);
            localStorage.setItem('studyPlan', JSON.stringify([]));

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastDate !== yesterday.toDateString()) {
                updateStreak(0);
            }
        }

        generateDailyQuest();
        fetchWeakness();
    }, []);

    const fetchWeakness = async () => {
        const history = JSON.parse(localStorage.getItem('studyHistory') || "[]");
        if (history.length === 0) return;

        try {
            const response = await api.post('/predict-weakness', { history });
            if (response.data.weakness_scores) {
                setWeaknessScores(response.data.weakness_scores);
            }
        } catch (error) {
            console.error("ML Prediction failed:", error);
        }
    };

    const generateDailyQuest = (risk = "Low") => {
        let quests = [
            { id: 'mission_speed', name: '⚡ MISSION: SPEED RUN', goal: '100m Power Hour', description: 'Study for 100 total minutes. Reward: 1x Shield 🛡️', target: 100, type: 'minutes' },
            { id: 'mission_boss', name: '⚔️ MISSION: BOSS FIGHT', goal: 'No Skips Allowed', description: 'Complete every task in your plan. Reward: 1x Shield 🛡️', type: 'completion' },
            { id: 'mission_morning', name: '🌅 MISSION: EARLY BIRD', goal: '3 Session Strike', description: 'Finish 3 sessions before lunch. Reward: 1x Shield 🛡️', target: 3, type: 'count' }
        ];

        // Level 3 ML Reaction: If High Risk, make missions half-effort for a "Win"
        if (risk === "High") {
            quests = quests.map(q => ({
                ...q,
                name: `🍃 RELAX MISSION: ${q.name.split(': ')[1]}`,
                description: `(Simplified for you) ${q.description}`,
                target: Math.max(1, Math.floor((q.target || 1) / 2))
            }));
        }

        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        setDailyQuest(quests[dayOfYear % quests.length]);
    };

    const updateStreak = (newStreak) => {
        setStreak(newStreak);
        localStorage.setItem('studyStreak', newStreak);
        localStorage.setItem('lastStudyDate', new Date().toDateString());
    };

    const generatePlan = async (subjects, minutes, focus = '', mood = 'normal') => {
        setLoading(true);
        setPlan(null);
        setMentor("Generating your personalized quest... 🔮");

        // Adapt minutes based on mood (Logic only, no AI needed)
        let adaptedMinutes = minutes;
        if (mood === 'tired') adaptedMinutes = Math.max(30, Math.floor(minutes * 0.7));
        if (mood === 'energetic') adaptedMinutes = Math.floor(minutes * 1.2);

        try {
            const response = await api.post('/generate-plan', {
                subjects: subjects,
                daily_time_minutes: adaptedMinutes,
                streak: streak,
                focus_goal: focus,
                last_day_progress: {},
                history: JSON.parse(localStorage.getItem('studyHistory') || "[]")
            });
            const newPlan = response.data.study_plan.map(item => ({ ...item, completed: false }));
            setPlan(newPlan);
            setMentor(response.data.mentor_message || "Stay focused! 🚀");

            if (response.data.weakness_scores) setWeaknessScores(response.data.weakness_scores);
            if (response.data.dropout_risk) {
                setDropoutRisk({
                    level: response.data.dropout_risk,
                    rationale: response.data.dropout_rationale
                });
                generateDailyQuest(response.data.dropout_risk);
            }
            if (response.data.study_profile) {
                setStudyProfile({
                    value: response.data.study_profile,
                    rationale: response.data.study_profile_rationale,
                    confidence: response.data.study_profile_confidence
                });
            }
            if (response.data.recommended_time_range) {
                setTimeRec({
                    range: response.data.recommended_time_range,
                    rationale: response.data.recommended_time_rationale
                });
            }

            checkBadges('first_plan');
            localStorage.setItem('studyPlan', JSON.stringify(newPlan));
        } catch (error) {
            setMentor("Oops! The quest generation failed. Please try again. ⚠️");
        } finally {
            setLoading(false);
        }
    };

    const toggleTask = (index, e) => {
        const item = plan[index];
        const isNowCompleted = !item.completed;

        // Visual Juice: Floating XP
        if (isNowCompleted && e) {
            const newXP = { id: Date.now(), x: e.clientX, y: e.clientY, amount: item.minutes };
            setFloatingXPs(prev => [...prev, newXP]);
            setTimeout(() => {
                setFloatingXPs(prev => prev.filter(xp => xp.id !== newXP.id));
            }, 1000);
        }

        const newPlan = [...plan];
        newPlan[index].completed = isNowCompleted;
        setPlan(newPlan);
        localStorage.setItem('studyPlan', JSON.stringify(newPlan));

        const completedCount = newPlan.filter(t => t.completed).length;
        const totalCount = newPlan.length;

        if (completedCount === totalCount && totalCount > 0) {
            checkBadges('perfect_day');
            celebrate(); // Confetti!
            if (streak < 100) {
                const nextStreak = streak + 1;
                updateStreak(nextStreak);
                setMentor("🎉 QUEST COMPLETE! Perfect run detected. Your elite combo is safe. Max XP earned! 🏆");
                if (nextStreak === 14) checkBadges('streak_14');
            }
        } else if (completedCount === totalCount - 1 && totalCount > 1) {
            setMentor("Boss phase active! One session remains. Finish the level! ⚔️");
        }

        checkQuestProgress(newPlan);

        // ML Maturation: Save to history for behavioral analysis
        if (isNowCompleted) {
            const history = JSON.parse(localStorage.getItem('studyHistory') || "[]");
            history.push({
                subject: item.subject,
                minutes: item.minutes,
                difficulty: item.difficulty || 'average',
                completed: true,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString() // Crucial for Style Profiling
            });
            localStorage.setItem('studyHistory', JSON.stringify(history.slice(-50))); // Keep last 50 for performance
        }
    };

    const celebrate = () => {
        const colors = ['#a855f7', '#7f0df2', '#10b981', '#f59e0b', '#ef4444'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.transform = `scale(${Math.random() * 1.5})`;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
    };

    const getRankedWeaknesses = () => {
        if (!weaknessScores || Object.keys(weaknessScores).length === 0) return [];
        return Object.entries(weaknessScores)
            .sort((a, b) => b[1].score - a[1].score) // High score first
            .map(([sub, data]) => ({
                subject: sub,
                score: data.score,
                rationale: data.rationale,
                confidence: data.confidence,
                isConfusion: data.score > 0.7
            }));
    };

    const rankedSubjects = getRankedWeaknesses();
    const topPriority = rankedSubjects.length > 0 ? rankedSubjects[0] : null;

    const checkQuestProgress = (currentPlan) => {
        if (!dailyQuest) return;
        const totalMin = currentPlan.reduce((acc, curr) => acc + (curr.completed ? curr.minutes : 0), 0);
        const totalDone = currentPlan.filter(t => t.completed).length;
        const allDone = totalDone === currentPlan.length && totalDone > 0;

        let completed = false;
        if (dailyQuest.type === 'minutes' && totalMin >= dailyQuest.target) completed = true;
        if (dailyQuest.type === 'completion' && allDone) completed = true;
        if (dailyQuest.type === 'count' && totalDone >= dailyQuest.target) completed = true;

        if (completed && !dailyQuest.done) {
            setDailyQuest(prev => ({ ...prev, done: true }));
            setMentor(`👑 MISSION ACCOMPLISHED: ${dailyQuest.name}! You just earned legendary momentum and 1x Streak Shield 🛡️.`);

            // Store completion & Reward Shield
            const quests = JSON.parse(localStorage.getItem('completedQuests') || "[]");
            if (!quests.includes(dailyQuest.id)) {
                quests.push(dailyQuest.id);
                localStorage.setItem('completedQuests', JSON.stringify(quests));

                // Grant Shield
                const currentShields = parseInt(localStorage.getItem('streakShields') || "0");
                localStorage.setItem('streakShields', currentShields + 1);
                // Trigger event for Layout to update
                window.dispatchEvent(new Event('storage'));
            }
        }
    };

    const checkBadges = (type) => {
        const earned = JSON.parse(localStorage.getItem('earnedBadges') || "[]");
        const badgeList = {
            'streak_3': { id: 'streak_3', name: '🔥 3-Day Heat', icon: '🔥', description: 'Maintained a streak for 3 days!' },
            'perfect_day': { id: 'perfect_day', name: '🎯 Perfectionist', icon: '🎯', description: 'Completed every single task in a day!' },
            'first_plan': { id: 'first_plan', name: '🌱 Fresh Start', icon: '🌱', description: 'Generated your very first study plan!' }
        };

        if (badgeList[type] && !earned.includes(type)) {
            earned.push(type);
            localStorage.setItem('earnedBadges', JSON.stringify(earned));
            setNewBadge(badgeList[type]);
        }
    };

    // Calculate Progress Stats
    const totalMinutes = plan.reduce((acc, curr) => acc + curr.minutes, 0);
    const completedMinutes = plan.reduce((acc, curr) => acc + (curr.completed ? curr.minutes : 0), 0);
    const completedTasks = plan.filter(t => t.completed).length;
    const totalTasks = plan.length;
    const allTasksDone = totalTasks > 0 && completedTasks === totalTasks;

    const handleCheckIn = (studied) => {
        if (!studied) {
            // If they didn't study, reset streak or motivate
            updateStreak(0);
            setMentor("It's okay to rest! Today is a new chance to build your streak back up. 🌱");
        } else {
            setMentor("Glad to hear it! Let's keep that momentum going today. 🔥");
        }
    };

    return (
        <div className="dashboard-container fade-in">
            <CheckInModal onConfirm={handleCheckIn} />
            <BadgeModal badge={newBadge} onClose={() => setNewBadge(null)} />

            {floatingXPs.map(xp => (
                <div key={xp.id} className="floating-xp" style={{ left: xp.x, top: xp.y }}>
                    +{xp.amount} XP
                </div>
            ))}

            <header className="dashboard-header" style={{ marginBottom: '32px' }}>
                <div className="header-left">
                    <h1 className="title" style={{ fontSize: '32px', marginBottom: '8px' }}>Dashboard</h1>
                    <p style={{ opacity: 0.6, margin: 0 }}>Your academic evolution, tracked in starlight.</p>
                </div>
            </header>

            {allTasksDone && (
                <div className="celebration-banner glass-card" style={{ border: '1px solid var(--secondary)' }}>
                    <div className="celebration-content">
                        <span className="celebration-icon">🏆</span>
                        <div>
                            <strong>Daily Goal Met!</strong>
                            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>You've completed all tasks and protected your {streak} day streak.</p>
                        </div>
                    </div>
                </div>
            )}

            {allTasksDone && (
                <div className="card reflection-card" style={{ marginBottom: '24px', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '2px solid #10b981' }}>
                    <div className="xp-label" style={{ color: '#10b981' }}>END OF DAY REFLECTION</div>
                    <h3 style={{ marginTop: '8px' }}>What went well today? ✍️</h3>
                    <input
                        type="text"
                        placeholder="e.g. Cleared my doubts in Physics!"
                        className="reflection-input"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                localStorage.setItem('lastReflection', e.target.value);
                                setMentor(`" ${e.target.value} " — Beautifully said. Rest up, champion. Tomorrow we fly. 🌌`);
                                e.target.disabled = true;
                                e.target.style.opacity = 0.6;
                            }
                        }}
                    />
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Press Enter to seal your reflection.</p>
                </div>
            )}

            <div className="dashboard-grid">
                <div className="main-col">
                    {/* MISSION FOCUS (Path 1 Consolidation) */}
                    {dailyQuest && (
                        <div className={`card quest-card glass-card ${dailyQuest.done ? 'quest-done' : ''}`} style={{
                            marginBottom: '24px',
                            border: dailyQuest.done ? '1px solid var(--secondary)' : '1px solid var(--primary)',
                            background: dailyQuest.done ? 'rgba(16, 185, 129, 0.05)' : 'rgba(139, 92, 246, 0.05)',
                        }}>
                            <div className="xp-label" style={{ color: dailyQuest.done ? 'var(--secondary)' : 'var(--primary)' }}>YOUR DAILY MISSION</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>{dailyQuest.name}</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.8 }}>{dailyQuest.description}</p>
                                </div>
                                <div style={{ fontSize: '32px' }}>{dailyQuest.done ? '✅' : '🎯'}</div>
                            </div>
                        </div>
                    )}

                    <StreakCard streak={streak} />

                    {plan.length === 0 && <InputPanel onGenerate={generatePlan} loading={loading} />}

                    {plan.length > 0 && (
                        <div className="plan-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3>📅 Today's Plan</h3>
                                {plan.length > 0 && <button onClick={() => setPlan([])} className="btn-secondary btn-small">Reset</button>}
                            </div>

                            <div className="plan-list">
                                {plan.map((item, i) => (
                                    <div
                                        key={i}
                                        className={`plan-item ${item.completed ? 'completed-task' : ''}`}
                                        onClick={(e) => toggleTask(i, e)}
                                    >
                                        <div className="subject-info">
                                            <div className={`checkbox ${item.completed ? 'checked' : ''}`}>
                                                {item.completed && '✓'}
                                            </div>
                                            <span className="subject-name">
                                                {item.subject}
                                                <span className="session-tag">Session {item.session_id || 1}</span>
                                                {item.difficulty && (
                                                    <span className={`diff-badge diff-${item.difficulty}`}>
                                                        {item.difficulty === 'weak' ? 'Hard' : item.difficulty === 'strong' ? 'Easy' : 'Med'}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <span className="time-badge">{item.minutes} min</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="side-col">
                    {/* INTELLIGENCE HUB (Path 1 & 2 Maturity) */}
                    <div className="intelligence-hub" style={{ marginBottom: '24px' }}>
                        <div className="xp-label" style={{ marginBottom: '12px', letterSpacing: '2px', opacity: 0.6 }}>INTELLIGENCE HUB</div>

                        {/* 1. Persona Insight */}
                        <div className="card glass-card persona-widget" style={{ marginBottom: '12px', padding: '20px' }} title={studyProfile.rationale}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ fontSize: '28px' }}>
                                    {studyProfile.value === 'Focus Sprinter' ? '⚡' :
                                        studyProfile.value === 'Marathon Learner' ? '🐢' :
                                            studyProfile.value === 'Morning Starter' ? '🌅' :
                                                studyProfile.value === 'Night Owl' ? '🦉' : '🚀'}
                                </div>
                                <div>
                                    <div className="xp-label" style={{ fontSize: '10px' }}>STUDY PERSONA</div>
                                    <h4 style={{ margin: 0 }}>{studyProfile.value}</h4>
                                    <div style={{ fontSize: '10px', opacity: 0.5 }}>Confidence: {studyProfile.confidence}</div>
                                </div>
                            </div>
                            {studyProfile.rationale && (
                                <p style={{ fontSize: '11px', margin: '10px 0 0 0', opacity: 0.7, fontStyle: 'italic' }}>
                                    {studyProfile.rationale}
                                </p>
                            )}
                            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '10px', opacity: 0.4, fontSize: '10px' }}>
                                <span>Was this helpful?</span>
                                <span style={{ cursor: 'pointer' }} onClick={() => setMentor("Thanks! I'll keep refining your profile based on this. 🎯")}>👍</span>
                                <span style={{ cursor: 'pointer' }} onClick={() => setMentor("Understood. I'll re-analyze your session data. 🛡️")}>👎</span>
                            </div>
                        </div>

                        {/* 2. Priority Insight */}
                        {topPriority && (
                            <div className="card glass-card priority-widget" style={{ marginBottom: '12px', padding: '20px', borderLeft: '3px solid #ef4444' }} title={topPriority.rationale}>
                                <div className="xp-label" style={{ fontSize: '10px', color: '#ef4444' }}>PRIORITY FOCUS</div>
                                <h4 style={{ margin: '4px 0' }}>{topPriority.subject}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                                    <span style={{ opacity: 0.6 }}>Wait Score</span>
                                    <span style={{ fontWeight: 800 }}>{(topPriority.score * 100).toFixed(0)}%</span>
                                </div>
                                <div className="progress-bar-container" style={{ height: '4px' }}>
                                    <div className="progress-bar-fill" style={{ width: `${topPriority.score * 100}%`, backgroundColor: '#ef4444' }}></div>
                                </div>
                                {topPriority.rationale && (
                                    <p style={{ fontSize: '11px', margin: '8px 0 0 0', opacity: 0.7 }}>
                                        {topPriority.rationale}
                                    </p>
                                )}
                                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '10px', opacity: 0.4, fontSize: '10px' }}>
                                    <span style={{ cursor: 'pointer' }} onClick={() => setMentor("Glad to hear! Prioritizing effectively is half the battle. 🏆")}>👍</span>
                                    <span style={{ cursor: 'pointer' }} onClick={() => setMentor("Thanks for the feedback. Reviewing your priority weights now. 🛡️")}>👎</span>
                                </div>
                            </div>
                        )}

                        {/* 3. Impact Insight */}
                        <div className="card glass-card impact-widget" style={{
                            padding: '20px',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(13, 148, 136, 0.05) 100%)'
                        }}>
                            <div className="xp-label" style={{ fontSize: '10px', color: 'var(--secondary)' }}>ENVIRONMENTAL IMPACT</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                                <span style={{ fontSize: '24px' }}>🌳</span>
                                <div>
                                    <h4 style={{ margin: 0 }}>{impactState?.total_impact_points || 0} Trees</h4>
                                    <Link to="/impact" style={{ fontSize: '10px', color: 'var(--secondary)', textDecoration: 'none' }}>View Forest →</Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Widgets */}
                    <div className="card glass-card quick-stats-card" style={{ marginBottom: '16px' }}>
                        <div className="xp-label" style={{ fontSize: '10px', marginBottom: '12px' }}>QUICK STATS</div>
                        <div className="stats-row">
                            <span className="stats-label">Time Done</span>
                            <span className="stats-value">{completedMinutes} / {totalMinutes}m</span>
                        </div>
                        <div className="stats-row">
                            <span className="stats-label">Tasks</span>
                            <span className="stats-value">{completedTasks} / {totalTasks}</span>
                        </div>
                        {dropoutRisk.level !== "Low" && (
                            <div style={{ marginTop: '12px', fontSize: '11px', display: 'flex', gap: '6px', color: dropoutRisk.level === 'High' ? '#ef4444' : '#f59e0b' }}>
                                <span>⚠️</span>
                                <span>{dropoutRisk.rationale || 'Fatigue detected.'}</span>
                            </div>
                        )}
                    </div>

                    {mentor && <AIMentor message={mentor} />}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
