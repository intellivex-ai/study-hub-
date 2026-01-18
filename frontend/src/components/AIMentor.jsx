function AIMentor({ message }) {
    return (
        <div className="card mentor-card">
            <div className="mentor-header">
                <span className="mentor-icon">🤖</span>
                <h3>AI Mentor</h3>
            </div>
            <div className="mentor-message">
                <p>{message}</p>
            </div>
        </div>
    );
}

export default AIMentor;
