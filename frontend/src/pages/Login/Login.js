import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportProfile, importProfile, getAllProfiles, deleteProfile } from '../../utils/profileManager';
import './Login.css';

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
    <div className="login-container">
      {/* Contrast Toggle Button */}
      <div className="contrast-toggle-container">
        <button 
          className="contrast-toggle-btn"
          onClick={toggleContrast}
          title={`Current: ${contrastMode} contrast. Click to cycle through normal/high/low contrast modes.`}
        >
           {contrastMode.charAt(0).toUpperCase() + contrastMode.slice(1)} Contrast
        </button>
      </div>

      <h1>AI Fitness Coach</h1>
      <p>Real-time pose analysis and voice commands</p>
      <p className="device-notice">
        <em>Profiles are stored on this device only. Using another device starts fresh.</em>
      </p>
      
      <input 
        type="text" 
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleStart()}
      />

      <button className="btn-primary" onClick={handleStart}>
        Start Training
      </button>
      <button className="btn-secondary" onClick={handleGuest}>
        Continue as Guest
      </button>

      {/* Profile Management Section */}
      <div className="profile-management">
        <button 
          className="btn-tertiary" 
          onClick={() => setShowProfileManager(!showProfileManager)}
        >
          {showProfileManager ? 'Hide' : 'Manage'} Profiles
        </button>
        
        {showProfileManager && (
          <div className="profile-manager">
            <div className="profile-actions">
              <label className="btn-import">
                Import Profile
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            
            {profiles.length > 0 && (
              <div className="existing-profiles">
                <h3>Existing Profiles</h3>
                {profiles.map((profile) => (
                  <div key={profile.name} className="profile-item">
                    <div className="profile-info">
                      <span className="profile-name">{profile.name}</span>
                      <span className="profile-stats">
                        {profile.sessionCount} sessions
                        {profile.lastSession && (
                          <span className="last-session">
                            • Last: {new Date(profile.lastSession).toLocaleDateString()}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="profile-actions">
                      <button 
                        className="btn-export-small"
                        onClick={() => handleExport(profile.name)}
                        title={`Export ${profile.name}'s profile`}
                      >
                        Export
                      </button>
                      <button 
                        className="btn-delete-small"
                        onClick={() => handleDelete(profile.name)}
                        title={`Delete ${profile.name}'s profile`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {profiles.length === 0 && (
              <p className="no-profiles">No profiles found. Create a profile by entering your name and starting training.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;

