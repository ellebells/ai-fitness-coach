import React from 'react';
import { speak } from '../utils/speechUtils';

// Add rest-related props
function Controls({ 
  exercises, 
  onExerciseChange, 
  onWorkoutToggle, 
  isWorkoutActive, 
  onVoiceCommand, 
  onShowRoutines, 
  onSkipExercise, 
  activeRoutine,
  isResting,
  onSkipRest,
  onAddRestTime 
}) {
  
  const handleExerciseChange = (exerciseName) => {
    onExerciseChange(exerciseName);
    // Note: Speech feedback is handled in the parent component
  };

  const handleShowRoutines = () => {
    speak("Choose routine menu opened.");
    onShowRoutines();
  };

  const handleWorkoutToggle = () => {
    // Note: Speech feedback is handled in the parent component
    onWorkoutToggle();
  };

  const handleVoiceCommand = () => {
    onVoiceCommand();
  };

  const handleSkipExercise = () => {
    // Note: Speech feedback is handled in the parent component
    onSkipExercise();
  };

  const handleSkipRest = () => {
    // Note: Speech feedback is handled in the parent component  
    onSkipRest();
  };

  const handleAddRestTime = () => {
    // Note: Speech feedback is handled in the parent component
    onAddRestTime();
  };

  return (
    <div className="controls-container">
      <div className="control-group">
        <label>Single Exercise:</label>
        <select onChange={(e) => handleExerciseChange(e.target.value)} disabled={isWorkoutActive}>
          {exercises.map(ex => (
            <option key={ex.name} value={ex.name}>{ex.name}</option>
          ))}
        </select>
      </div>

      <button className="btn-secondary" onClick={handleShowRoutines} disabled={isWorkoutActive}>
        Choose Routine
      </button>

      {/* Workout Control Buttons - Only show during active routine workouts */}
      {isWorkoutActive && activeRoutine && (
        <div className="workout-controls">
          {isResting ? (
            // Rest period controls
            <>
              <button className="btn-warning" onClick={handleSkipRest}>
                Skip Rest
              </button>
              <button className="btn-secondary" onClick={handleAddRestTime}>
                +15s Rest
              </button>
            </>
          ) : (
            // Active exercise controls
            <button className="btn-warning" onClick={handleSkipExercise}>
              Skip Exercise
            </button>
          )}
        </div>
      )}

      <button 
        className={isWorkoutActive ? "btn-secondary" : "btn-primary"}
        onClick={handleWorkoutToggle}
      >
        {isWorkoutActive ? 'Stop Workout' : 'Start Workout'}
      </button>
      <button className="btn-voice" onClick={handleVoiceCommand}>
        Voice Command
      </button>
    </div>
  );
}

export default Controls;

