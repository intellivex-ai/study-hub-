import { useState, useEffect } from 'react';

function BadgeModal({ badge, onClose }) {
    if (!badge) return null;

    return (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.9)' }}>
            <div className="card modal-card badge-popup">
                <div className="confetti-container">🎉</div>
                <div className="badge-icon-large">{badge.icon}</div>
                <h2>Achievement Unlocked!</h2>
                <h3 style={{ color: 'var(--primary)', marginTop: '8px' }}>{badge.name}</h3>
                <p style={{ margin: '16px 0', opacity: 0.8 }}>{badge.description}</p>
                <button onClick={onClose} className="btn-primary" style={{ width: 'auto', padding: '12px 32px' }}>Awesome! 🚀</button>
            </div>
        </div>
    );
}

export default BadgeModal;
