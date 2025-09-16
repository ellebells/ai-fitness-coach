// Profile management utilities for export/import functionality

export const exportProfile = (userName) => {
  try {
    // Don't allow export for guest sessions (they have unique IDs starting with "Guest_")
    if (userName.startsWith('Guest_')) {
      throw new Error('Guest sessions cannot be exported. Please create a named profile first.');
    }

    // Check if the profile actually exists
    const sessions = JSON.parse(localStorage.getItem(`${userName}_history`)) || [];
    if (sessions.length === 0) {
      throw new Error(`No workout history found for profile "${userName}".`);
    }

    // Get profile data
    const profile = {
      name: userName,
      createdAt: new Date().toISOString(),
      isGuest: false
    };

    // Create export data
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: profile,
      sessions: sessions
    };

    // Create and download file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `fitness-profile-${userName}-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Cleanup
    URL.revokeObjectURL(link.href);
    
    return { success: true, message: 'Profile exported successfully!' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const importProfile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate import data structure
        if (!importData.version || !importData.profile || !importData.sessions) {
          throw new Error('Invalid profile file format');
        }
        
        if (!importData.profile.name) {
          throw new Error('Profile name is missing from import file');
        }
        
        const { profile, sessions } = importData;
        
        // Check if profile already exists
        const existingHistory = localStorage.getItem(`${profile.name}_history`);
        if (existingHistory) {
          const confirmOverwrite = window.confirm(
            `A profile named "${profile.name}" already exists. Do you want to overwrite it?`
          );
          if (!confirmOverwrite) {
            resolve({ success: false, message: 'Import cancelled by user' });
            return;
          }
        }
        
        // Import the data
        localStorage.setItem(`${profile.name}_history`, JSON.stringify(sessions));
        
        // Set as current user
        localStorage.setItem('userName', profile.name);
        localStorage.removeItem('isGuestSession'); // Make sure it's not marked as guest
        
        resolve({ 
          success: true, 
          message: `Profile "${profile.name}" imported successfully with ${sessions.length} sessions!`,
          profile: profile
        });
        
      } catch (error) {
        reject({ success: false, message: `Import failed: ${error.message}` });
      }
    };
    
    reader.onerror = () => {
      reject({ success: false, message: 'Failed to read file' });
    };
    
    reader.readAsText(file);
  });
};

export const getAllProfiles = () => {
  const profiles = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.endsWith('_history')) {
      const profileName = key.replace('_history', '');
      // Skip guest sessions (they have random IDs)
      if (!profileName.startsWith('Guest_')) {
        const sessions = JSON.parse(localStorage.getItem(key)) || [];
        profiles.push({
          name: profileName,
          sessionCount: sessions.length,
          lastSession: sessions.length > 0 ? sessions[sessions.length - 1].date : null
        });
      }
    }
  }
  
  return profiles.sort((a, b) => {
    if (!a.lastSession) return 1;
    if (!b.lastSession) return -1;
    return new Date(b.lastSession) - new Date(a.lastSession);
  });
};