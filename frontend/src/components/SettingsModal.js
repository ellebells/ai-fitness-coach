import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose, settings, onSettingsChange }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [activeTab, setActiveTab] = useState('accessibility');

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSettingChange = (key, value) => {
        const newSettings = { ...localSettings, [key]: value };
        setLocalSettings(newSettings);
        onSettingsChange(newSettings);
    };

    const handleClose = () => {
        onClose();
    };

    const keyboardShortcuts = [
        { key: 'Space', action: 'Start/Stop workout' },
        { key: 'R', action: 'Reset timer' },
        { key: 'N', action: 'Next exercise' },
        { key: 'P', action: 'Previous exercise' },
        { key: 'V', action: 'Toggle voice commands' },
        { key: 'S', action: 'Open settings' },
        { key: 'Escape', action: 'Close modals' },
        { key: '1-9', action: 'Select routine by number' },
        { key: 'H', action: 'View history' },
        { key: 'L', action: 'Logout' }
    ];

    if (!isOpen) return null;

    return (
        <div className="settings-modal-overlay" onClick={handleClose}>
            <div className="settings-modal-content" onClick={e => e.stopPropagation()}>
                <div className="settings-modal-header">
                    <h2>Settings</h2>
                    <button 
                        className="settings-close-btn" 
                        onClick={handleClose}
                        aria-label="Close settings"
                    >
                        ×
                    </button>
                </div>

                <div className="settings-tabs">
                    <button 
                        className={`settings-tab ${activeTab === 'accessibility' ? 'active' : ''}`}
                        onClick={() => setActiveTab('accessibility')}
                    >
                        Accessibility
                    </button>
                    <button 
                        className={`settings-tab ${activeTab === 'shortcuts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('shortcuts')}
                    >
                        Keyboard Shortcuts
                    </button>
                    <button 
                        className={`settings-tab ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    >
                        About
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === 'accessibility' && (
                        <div className="settings-section">
                            <h3>Accessibility Options</h3>
                            
                            <div className="setting-item">
                                <label htmlFor="voice-mute">
                                    <span className="setting-label">Voice Narration</span>
                                    <span className="setting-description">
                                        Turn off spoken feedback and rep counting
                                    </span>
                                </label>
                                <div className="setting-control">
                                    <button
                                        id="voice-mute"
                                        className={`toggle-btn ${localSettings.voiceMuted ? 'off' : 'on'}`}
                                        onClick={() => handleSettingChange('voiceMuted', !localSettings.voiceMuted)}
                                        aria-pressed={!localSettings.voiceMuted}
                                    >
                                        <span className="toggle-slider"></span>
                                        <span className="toggle-text">
                                            {localSettings.voiceMuted ? 'Off' : 'On'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="setting-item">
                                <label htmlFor="contrast-theme">
                                    <span className="setting-label">Contrast Theme</span>
                                    <span className="setting-description">
                                        Adjust colors for better visibility
                                    </span>
                                </label>
                                <div className="setting-control">
                                    <select
                                        id="contrast-theme"
                                        value={localSettings.contrastMode}
                                        onChange={(e) => handleSettingChange('contrastMode', e.target.value)}
                                        className="settings-select"
                                    >
                                        <option value="normal">Normal Contrast</option>
                                        <option value="high">High Contrast</option>
                                        <option value="low">Low Contrast</option>
                                    </select>
                                </div>
                            </div>

                            <div className="setting-item">
                                <label htmlFor="font-size">
                                    <span className="setting-label">Font Size</span>
                                    <span className="setting-description">
                                        Adjust text size for better readability
                                    </span>
                                </label>
                                <div className="setting-control">
                                    <select
                                        id="font-size"
                                        value={localSettings.fontSize}
                                        onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                                        className="settings-select"
                                    >
                                        <option value="small">Small</option>
                                        <option value="normal">Normal</option>
                                        <option value="large">Large</option>
                                        <option value="extra-large">Extra Large</option>
                                    </select>
                                </div>
                            </div>

                            <div className="setting-item">
                                <label htmlFor="motion-reduce">
                                    <span className="setting-label">Reduce Motion</span>
                                    <span className="setting-description">
                                        Minimize animations and transitions
                                    </span>
                                </label>
                                <div className="setting-control">
                                    <button
                                        id="motion-reduce"
                                        className={`toggle-btn ${localSettings.reduceMotion ? 'on' : 'off'}`}
                                        onClick={() => handleSettingChange('reduceMotion', !localSettings.reduceMotion)}
                                        aria-pressed={localSettings.reduceMotion}
                                    >
                                        <span className="toggle-slider"></span>
                                        <span className="toggle-text">
                                            {localSettings.reduceMotion ? 'On' : 'Off'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shortcuts' && (
                        <div className="settings-section">
                            <h3>Keyboard Shortcuts</h3>
                            <p className="shortcuts-description">
                                Use these keyboard shortcuts to navigate the app efficiently:
                            </p>
                            <div className="shortcuts-list">
                                {keyboardShortcuts.map((shortcut, index) => (
                                    <div key={index} className="shortcut-item">
                                        <kbd className="shortcut-key">{shortcut.key}</kbd>
                                        <span className="shortcut-action">{shortcut.action}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="shortcuts-note">
                                <strong>Note:</strong> Keyboard shortcuts work when the app is in focus and no modal is open.
                            </div>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="settings-section">
                            <h3>About AI Fitness Coach</h3>
                            <div className="about-content">
                                <p>
                                    AI Fitness Coach is an accessible fitness application designed to help you 
                                    maintain your health and fitness through guided workouts and pose detection.
                                </p>
                                <div className="about-features">
                                    <h4>Accessibility Features:</h4>
                                    <ul>
                                        <li>Voice narration for exercises and rep counting</li>
                                        <li>High contrast themes for visual impairments</li>
                                        <li>Keyboard navigation support</li>
                                        <li>Screen reader friendly interface</li>
                                        <li>Adjustable font sizes</li>
                                        <li>Motion reduction options</li>
                                    </ul>
                                </div>
                                <div className="about-version">
                                    <p><strong>Version:</strong> 1.0.0</p>
                                    <p><strong>Accessibility Level:</strong> WCAG 2.1 AA Compatible</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="settings-footer">
                    <button className="btn-secondary" onClick={handleClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;