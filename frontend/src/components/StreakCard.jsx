function StreakCard({ streak = 3 }) {
    return (
        <div className="card streak-card">
            <div className="streak-icon">🔥</div>
            <div className="streak-info">
                <h3>{streak} Day Streak</h3>
                <p>You're on fire! Keep it up to earn existing rewards.</p>
            </div>
        </div>
    );
}

export default StreakCard;
