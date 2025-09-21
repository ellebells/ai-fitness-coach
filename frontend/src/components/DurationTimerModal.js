import React, { useState } from 'react';
import './DurationTimerModal.css';

const DurationTimerModal = ({ isOpen, onClose, onConfirm, exerciseName, defaultTarget = 30 }) => {
    const [customDuration, setCustomDuration] = useState(defaultTarget);
    const [timerMode, setTimerMode] = useState('countdown');

    const handleConfirm = () => {
        onConfirm({
            useCountdown: timerMode === 'countdown',
            duration: customDuration
        });
        onClose();
    };

    const handleCancel = () => {
        setCustomDuration(defaultTarget);
        setTimerMode('countdown');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="duration-modal-overlay">
            <div className="duration-modal">
                <div className="duration-modal-header">
                    <h3>Exercise Setup</h3>
                    <p><strong>{exerciseName}</strong> is a duration exercise.</p>
                </div>

                <div className="duration-modal-content">
                    <div className="input-section">
                        <label htmlFor="duration-input">Set your target time</label>
                        <div className="duration-input-group">
                            <button
                                type="button"
                                onClick={() => setCustomDuration(Math.max(10, customDuration - 5))}
                                className="duration-btn"
                                aria-label="Decrease duration"
                            >
                                -
                            </button>
                            <div className="duration-input-wrapper">
                                <input
                                    id="duration-input"
                                    type="number"
                                    value={customDuration}
                                    onChange={(e) => setCustomDuration(Math.max(10, parseInt(e.target.value) || 10))}
                                    min="10"
                                    max="300"
                                    className="duration-input"
                                />
                                <span className="duration-unit">seconds</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCustomDuration(Math.min(300, customDuration + 5))}
                                className="duration-btn"
                                aria-label="Increase duration"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="input-section">
                        <label>Choose timer mode</label>
                        <div className="timer-mode-options">
                            <label className={`timer-option ${timerMode === 'countdown' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="timerMode"
                                    value="countdown"
                                    checked={timerMode === 'countdown'}
                                    onChange={(e) => setTimerMode(e.target.value)}
                                />
                                <div className="timer-option-content">
                                    <strong>Countdown</strong>
                                    <span>Counts down from {customDuration}s to 0</span>
                                </div>
                            </label>
                            <label className={`timer-option ${timerMode === 'countup' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="timerMode"
                                    value="countup"
                                    checked={timerMode === 'countup'}
                                    onChange={(e) => setTimerMode(e.target.value)}
                                />
                                <div className="timer-option-content">
                                    <strong>Count-up</strong>
                                    <span>Counts up from 0 to {customDuration}s</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="timer-note">
                        <p><strong>Note:</strong> Timer only runs when you maintain correct form.</p>
                    </div>
                </div>

                <div className="duration-modal-actions">
                    <button onClick={handleCancel} className="btn-secondary">
                        Cancel
                    </button>
                    <button onClick={handleConfirm} className="btn-primary">
                        Start Exercise
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DurationTimerModal;