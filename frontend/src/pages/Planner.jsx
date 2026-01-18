import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import InputPanel from '../components/InputPanel';
import AIMentor from '../components/AIMentor';

function Planner() {
    const [loading, setLoading] = useState(false);
    const [mentor, setMentor] = useState('');
    const navigate = useNavigate();

    const generatePlan = async (subjects, minutes) => {
        setLoading(true);
        try {
            // Get streak from localStorage to pass to backend
            const savedStreak = localStorage.getItem('studyStreak') || '0';

            const response = await api.post('/generate-plan', {
                subjects: subjects,
                daily_time_minutes: minutes,
                streak: parseInt(savedStreak),
                last_day_progress: {}
            });

            const newPlan = response.data.study_plan.map(item => ({ ...item, completed: false }));

            // Save to local storage
            localStorage.setItem('studyPlan', JSON.stringify(newPlan));
            localStorage.setItem('mentorMessage', response.data.mentor_message);

            setMentor(response.data.mentor_message);

            // Optional: Redirect to dashboard to see the plan
            alert("New study plan generated successfully!");
            navigate('/dashboard');
        } catch (error) {
            console.error("Error generating plan:", error);
            alert("Failed to generate plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="planner-page-container">
            <h2 className="title">Study Planner</h2>
            <p className="subtitle" style={{ marginBottom: '32px', color: 'var(--text-muted)' }}>
                Tell us what you want to study today and our AI will create the perfect schedule.
            </p>

            <div className="dashboard-grid">
                <div className="main-col">
                    <InputPanel onGenerate={generatePlan} loading={loading} />

                    {mentor && (
                        <div style={{ marginTop: '24px' }}>
                            <AIMentor message={mentor} />
                        </div>
                    )}
                </div>

                <div className="side-col">
                    <div className="card info-card">
                        <h3>💡 Planning Tips</h3>
                        <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.8' }}>
                            <li>Be realistic with your available time.</li>
                            <li>Mark subjects you find "Hard" to get more focus time.</li>
                            <li>The AI automatically adds breaks between long sessions.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Planner;
