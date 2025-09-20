// Clean Controls component with popup selectors
import React, { useEffect, useRef, useState } from 'react';

function AccessibleControls({ 
  exercises = [],
  onExerciseChange,
  onWorkoutToggle,
  onSkipExercise,
  onVoiceCommand,
  onAddRestTime,
  isWorkoutActive,
  currentExercise,
  routines = [],
  onStartRoutine,
  accessibilitySettings = {},
  onAccessibilityChange
}) {
  const controlsRef = useRef(null);
  const [showExercisePopup, setShowExercisePopup] = useState(false);
  const [showRoutinePopup, setShowRoutinePopup] = useState(false);
  const [showAccessibilityPopup, setShowAccessibilityPopup] = useState(false);

  // Keyboard shortcuts - only when not typing in inputs
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle if no input/select/popup is focused
      const activeElement = document.activeElement;
      if (activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'SELECT' || 
          activeElement.tagName === 'TEXTAREA' ||
          showExercisePopup || showRoutinePopup || showAccessibilityPopup) {
        return;
      }
      
      if (e.key === 'Escape') {
        controlsRef.current?.focus();
        e.preventDefault();
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          if (onWorkoutToggle) onWorkoutToggle();
          break;
        case 'x':
          e.preventDefault();
          if (isWorkoutActive && onWorkoutToggle) onWorkoutToggle();
          break;
        case 'n':
          e.preventDefault();
          if (isWorkoutActive && onSkipExercise) onSkipExercise();
          break;
        case 'r':
          e.preventDefault();
          if (isWorkoutActive && onAddRestTime) onAddRestTime();
          break;
        case 'v':
        case ' ':
          e.preventDefault();
          if (onVoiceCommand) onVoiceCommand();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isWorkoutActive, onSkipExercise, onVoiceCommand, onAddRestTime, onWorkoutToggle, showExercisePopup, showRoutinePopup, showAccessibilityPopup]);

  // Handle exercise selection without auto-starting or speaking
  const handleExerciseSelect = (exerciseName) => {
    if (!isWorkoutActive && exerciseName && onExerciseChange) {
      onExerciseChange(exerciseName);
      setShowExercisePopup(false);
    }
  };

  // Handle routine selection without auto-starting or speaking  
  const handleRoutineSelect = (routineKey) => {
    if (!isWorkoutActive && routineKey && onStartRoutine) {
      onStartRoutine(routineKey);
      setShowRoutinePopup(false);
    }
  };

  // Accessibility setting toggles without speaking
  const toggleAccessibilitySetting = (setting) => {
    if (onAccessibilityChange) {
      onAccessibilityChange(setting, !accessibilitySettings[setting]);
    }
  };

  const buttonStyle = {
    padding: '12px 24px',
    margin: '8px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  };

  const popupStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    border: '2px solid #dee2e6',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    zIndex: 1000,
    maxHeight: '80vh',
    overflowY: 'auto',
    minWidth: '300px'
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999
  };

  return (
    <div className="controls-container" ref={controlsRef} tabIndex={-1}>
      
      {/* Main Control Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Exercise Button */}
        {!isWorkoutActive && (
          <button 
            onClick={() => setShowExercisePopup(true)}
            style={{
              ...buttonStyle,
              backgroundColor: '#007bff',
              color: 'white'
            }}
            aria-label="Select exercise"
          >
            🏃 {currentExercise ? currentExercise.name : 'Select Exercise'}
          </button>
        )}

        {/* Routine Button */}
        {!isWorkoutActive && (
          <button 
            onClick={() => setShowRoutinePopup(true)}
            style={{
              ...buttonStyle,
              backgroundColor: '#28a745',
              color: 'white'
            }}
            aria-label="Select routine"
          >
            📋 Routines
          </button>
        )}

        {/* Start/Stop Button */}
        <button 
          onClick={onWorkoutToggle}
          style={{
            ...buttonStyle,
            backgroundColor: isWorkoutActive ? '#dc3545' : '#28a745',
            color: 'white'
          }}
          aria-label={isWorkoutActive ? 'Stop workout' : 'Start workout'}
        >
          {isWorkoutActive ? '⏹️ Stop' : '▶️ Start'}
        </button>
        
        {/* Active Workout Controls */}
        {isWorkoutActive && (
          <>
            <button 
              onClick={onSkipExercise}
              style={{
                ...buttonStyle,
                backgroundColor: '#ffc107',
                color: 'black'
              }}
              aria-label="Skip exercise"
            >
              ⏭️ Skip
            </button>
            
            <button 
              onClick={onAddRestTime}
              style={{
                ...buttonStyle,
                backgroundColor: '#17a2b8',
                color: 'white'
              }}
              aria-label="Add rest"
            >
              ⏸️ Rest
            </button>
          </>
        )}
        
        {/* Voice Command Button */}
        <button 
          onClick={onVoiceCommand}
          style={{
            ...buttonStyle,
            backgroundColor: '#6f42c1',
            color: 'white'
          }}
          aria-label="Voice command"
        >
          🎤 Voice
        </button>

        {/* Accessibility Button */}
        <button 
          onClick={() => setShowAccessibilityPopup(true)}
          style={{
            ...buttonStyle,
            backgroundColor: '#6c757d',
            color: 'white'
          }}
          aria-label="Accessibility settings"
        >
          ♿ Settings
        </button>
      </div>

      {/* Exercise Popup */}
      {showExercisePopup && (
        <>
          <div style={overlayStyle} onClick={() => setShowExercisePopup(false)} />
          <div style={popupStyle}>
            <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Select Exercise</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '12px'
            }}>
              {exercises.map(exercise => (
                <button
                  key={exercise.name}
                  onClick={() => handleExerciseSelect(exercise.name)}
                  style={{
                    backgroundColor: currentExercise?.name === exercise.name ? '#007bff' : '#f8f9fa',
                    color: currentExercise?.name === exercise.name ? 'white' : 'black',
                    border: '2px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{exercise.icon || '🏃'}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{exercise.name}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowExercisePopup(false)}
              style={{
                ...buttonStyle,
                backgroundColor: '#6c757d',
                color: 'white',
                marginTop: '20px',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* Routine Popup */}
      {showRoutinePopup && (
        <>
          <div style={overlayStyle} onClick={() => setShowRoutinePopup(false)} />
          <div style={popupStyle}>
            <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Select Routine</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(routines).map(([key, routine]) => (
                <button
                  key={key}
                  onClick={() => handleRoutineSelect(key)}
                  style={{
                    backgroundColor: '#f8f9fa',
                    border: '2px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>📋</span>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{routine.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {routine.exercises.length} exercises • {routine.exercises.reduce((total, ex) => total + (ex.duration || 30), 0)} seconds
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowRoutinePopup(false)}
              style={{
                ...buttonStyle,
                backgroundColor: '#6c757d',
                color: 'white',
                marginTop: '20px',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* Accessibility Popup */}
      {showAccessibilityPopup && (
        <>
          <div style={overlayStyle} onClick={() => setShowAccessibilityPopup(false)} />
          <div style={popupStyle}>
            <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Accessibility Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <button
                onClick={() => toggleAccessibilitySetting('ttsEnabled')}
                style={{
                  backgroundColor: accessibilitySettings.ttsEnabled ? '#28a745' : '#dc3545',
                  color: 'white',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '16px'
                }}
              >
                🔊 Voice Announcements: {accessibilitySettings.ttsEnabled ? 'ON' : 'OFF'}
              </button>
              
              <button
                onClick={() => toggleAccessibilitySetting('highContrast')}
                style={{
                  backgroundColor: accessibilitySettings.highContrast ? '#28a745' : '#6c757d',
                  color: 'white',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '16px'
                }}
              >
                🔲 High Contrast: {accessibilitySettings.highContrast ? 'ON' : 'OFF'}
              </button>
              
              <button
                onClick={() => toggleAccessibilitySetting('reduceMotion')}
                style={{
                  backgroundColor: accessibilitySettings.reduceMotion ? '#28a745' : '#6c757d',
                  color: 'white',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '16px'
                }}
              >
                🎬 Reduce Motion: {accessibilitySettings.reduceMotion ? 'ON' : 'OFF'}
              </button>
              
              <button
                onClick={() => toggleAccessibilitySetting('showVisualIndicators')}
                style={{
                  backgroundColor: accessibilitySettings.showVisualIndicators ? '#28a745' : '#6c757d',
                  color: 'white',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '16px'
                }}
              >
                👁️ Visual Indicators: {accessibilitySettings.showVisualIndicators ? 'ON' : 'OFF'}
              </button>

              {/* Keyboard Shortcuts Info */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '6px',
                marginTop: '12px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Keyboard Shortcuts:</h4>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <strong>S</strong> - Start/Stop • <strong>N</strong> - Skip • <strong>R</strong> - Rest • <strong>V/Space</strong> - Voice
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowAccessibilityPopup(false)}
              style={{
                ...buttonStyle,
                backgroundColor: '#6c757d',
                color: 'white',
                marginTop: '20px',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AccessibleControls;