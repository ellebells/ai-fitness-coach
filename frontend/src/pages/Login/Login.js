import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportProfile, importProfile, getAllProfiles, deleteProfile } from '../../utils/profileManager';
import './Login.css';



// Simple SVG icons for clarity
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>;


function Login() {
  const [name, setName] = useState('');
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [contrastMode, setContrastMode] = useState('normal');
  const navigate = useNavigate();

  // Load contrast preference from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setContrastMode(settings.contrastMode || 'normal');
    }
  }, []);

  // Apply contrast theme to body element
  useEffect(() => {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-normal', 'theme-high', 'theme-low');
    
    // Add current theme class
    body.classList.add(`theme-${contrastMode}`);
    
    return () => {
      // Cleanup on unmount
      body.classList.remove('theme-normal', 'theme-high', 'theme-low');
    };
  }, [contrastMode]);

  const toggleContrast = () => {
    const modes = ['normal', 'high', 'low'];
    const currentIndex = modes.indexOf(contrastMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const newMode = modes[nextIndex];
    
    setContrastMode(newMode);
    
    // Save to localStorage
    const savedSettings = localStorage.getItem('accessibilitySettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.contrastMode = newMode;
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  };

  const handleStart = () => {
    if (name.trim() === '') {
      alert('Please enter your name.');
      return;
    }
    localStorage.setItem('userName', name);
    navigate('/workout');
  };

  const handleGuest = () => {
    // Create a unique guest session ID for each guest session
    const guestSessionId = `Guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userName', guestSessionId);
    localStorage.setItem('isGuestSession', 'true');
    navigate('/workout');
  };

  const handleExport = async (profileName = null) => {
    // If no profile name provided, try to get current user or show error
    const targetProfile = profileName || localStorage.getItem('userName');
    
    if (!targetProfile) {
      alert('No profile selected to export. Please specify a profile or log in first.');
      return;
    }
    
    const result = exportProfile(targetProfile);
    alert(result.message);
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const result = await importProfile(file);
      if (result.success) {
        alert(result.message);
        navigate('/workout');
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert(error.message);
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleDelete = (profileName) => {
    // Double confirmation for delete action
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the profile "${profileName}"?\n\nThis will permanently remove all workout history for this profile. This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    const result = deleteProfile(profileName);
    if (result.success) {
      alert(result.message);
      // Force component re-render to update the profiles list
      setShowProfileManager(false);
      setTimeout(() => setShowProfileManager(true), 100);
    } else {
      alert(result.message);
    }
  };

  const profiles = getAllProfiles();

    return (
        <div 
            className="login-container"
            style={{
                backgroundImage: 'url(/images/fit-bg.jpg)'
            }}
        >
            <div className="contrast-toggle-container">
                <button 
                    className="contrast-toggle-btn"
                    onClick={toggleContrast}
                    title={`Current: ${contrastMode} contrast`}
                >
                   {contrastMode.charAt(0).toUpperCase()}
                </button>
            </div>

            <div className="login-card">
                <div className="login-header">
                    <h1>AI Fitness Coach</h1>
                    <p>Real-time pose analysis and voice commands</p>
                </div>

                <div className="login-form">
                    <input
                        type="text"
                        className="login-input"
                        placeholder="Enter your name to begin"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                    />
                    <button className="btn btn-primary" onClick={handleStart}>
                        Start Training
                    </button>
                    <button className="btn btn-secondary" onClick={handleGuest}>
                        Continue as Guest
                    </button>
                </div>

                <div className="profile-management">
                    <button
                        className="btn btn-tertiary"
                        onClick={() => setShowProfileManager(!showProfileManager)}
                    >
                        {showProfileManager ? 'Hide' : 'Manage'} Profiles
                    </button>

                    {showProfileManager && (
                        <div className="profile-manager-content">
                            <label className="btn btn-import">
                                <UploadIcon /> Import Profile
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            
                            <hr className="divider" />

                            {profiles.length > 0 ? (
                                <div className="profile-list">
                                    {profiles.map((profile) => (
                                        <div key={profile.name} className="profile-item">
                                            <div className="profile-info">
                                                <span className="profile-name">{profile.name}</span>
                                                <span className="profile-stats">
                                                    {profile.sessionCount} sessions
                                                    {profile.lastSession && ` • Last: ${new Date(profile.lastSession).toLocaleDateString()}`}
                                                </span>
                                            </div>
                                            <div className="profile-item-actions">
                                                <button className="btn-icon" onClick={() => handleExport(profile.name)} title="Export Profile">
                                                    <DownloadIcon />
                                                </button>
                                                <button className="btn-icon btn-danger" onClick={() => handleDelete(profile.name)} title="Delete Profile">
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-profiles-message">No local profiles found.</p>
                            )}
                        </div>
                    )}
                </div>
                
                <p className="device-notice">
                    Profiles are stored on this device only.
                </p>
            </div>
        </div>
    );
}

export default Login;