import { useState, useEffect } from 'react';

function CheckInModal({ onConfirm }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const lastCheckIn = localStorage.getItem('lastCheckInDate');
        const today = new Date().toDateString();

        if (lastCheckIn !== today) {
            setShow(true);
        }
    }, []);

    const handleAnswer = (studied) => {
        localStorage.setItem('lastCheckInDate', new Date().toDateString());
        onConfirm(studied);
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="card modal-card check-in-modal">
                <div className="modal-icon">⭐</div>
                <h2>Daily Check-in</h2>
                <p>Did you manage to study yesterday? honesty keeps your streak meaningful! 🧠</p>
                <div className="modal-actions">
                    <button onClick={() => handleAnswer(true)} className="btn-primary">Yes, I studied! ✅</button>
                    <button onClick={() => handleAnswer(false)} className="btn-secondary">No, I rested. 💤</button>
                </div>
            </div>
        </div>
    );
}

export default CheckInModal;
