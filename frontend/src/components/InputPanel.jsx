import { useState, useEffect } from 'react';
import api from '../api/axios';

function InputPanel({ onGenerate, loading }) {
    const [subjects, setSubjects] = useState('');
    const [time, setTime] = useState('');
    const [difficulty, setDifficulty] = useState('average');
    const [focus, setFocus] = useState('');
    const [mood, setMood] = useState('normal');
    const [recommendation, setRecommendation] = useState(null);

    useEffect(() => {
        const fetchRecommendation = async () => {
            const history = JSON.parse(localStorage.getItem('studyHistory') || "[]");
            if (history.length === 0) return;
            try {
                const response = await api.post('/predict-time', { history });
                if (response.data.time_recommendation) {
                    setRecommendation(response.data.time_recommendation);
                }
            } catch (e) {
                console.error("Time prediction failed", e);
            }
        };
        fetchRecommendation();
    }, []);

    const handleSubmit = () => {
        if (!subjects || !time) return;

        const subjectList = subjects.split(',').map(s => {
            const trimmed = s.trim();
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        });

        const subjectDict = {};
        subjectList.forEach(s => {
            subjectDict[s] = difficulty;
        });

        onGenerate(subjectDict, parseInt(time), focus, mood);
    };

    return (
        <div className="card input-panel">
            <h3>Generate New Plan</h3>
            <div className="form-group">
                <label>Subjects (comma separated)</label>
                <input
                    type="text"
                    placeholder="Math, Physics, Coding"
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                />
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                    <label>Difficulty Level</label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <option value="weak">Hard (I'm weak)</option>
                        <option value="average">Medium (Average)</option>
                        <option value="strong">Easy (I'm strong)</option>
                    </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                    <label>Current Mood</label>
                    <select
                        value={mood}
                        onChange={(e) => setMood(e.target.value)}
                    >
                        <option value="tired">😴 Tired</option>
                        <option value="normal">😐 Normal</option>
                        <option value="energetic">🔥 Energetic</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0 }}>Available Time (minutes)</label>
                    {recommendation && (
                        <span
                            className="xp-label"
                            style={{ fontSize: '10px', cursor: 'pointer', backgroundColor: 'var(--primary-dark)' }}
                            onClick={() => setTime(recommendation.recommended.toString())}
                        >
                            ML RECO: {recommendation.min}-{recommendation.max}m
                        </span>
                    )}
                </div>
                <input
                    type="number"
                    placeholder="e.g. 90"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />
                {recommendation && !time && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Based on your fatigue point, we suggest {recommendation.recommended} mins.
                    </p>
                )}
            </div>
            <button
                onClick={handleSubmit}
                disabled={loading || !subjects.trim() || !time}
                style={{ opacity: (loading || !subjects.trim() || !time) ? 0.6 : 1 }}
            >
                {loading ? 'Generating...' : 'Start My Quest'}
            </button>
        </div>
    );
}

export default InputPanel;
