import React from 'react';

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
  return (
    <div className="controls-container">
      <div className="control-group">
        <label>Single Exercise:</label>
        <select onChange={(e) => onExerciseChange(e.target.value)} disabled={isWorkoutActive}>
          {exercises.map(ex => (
            <option key={ex.name} value={ex.name}>{ex.name}</option>
          ))}
        </select>
      </div>

      <button className="btn-secondary" onClick={onShowRoutines} disabled={isWorkoutActive}>
        Choose Routine
      </button>

      {/* Workout Control Buttons */}
      {isWorkoutActive && activeRoutine && (
        <div className="workout-controls">
          {!isResting ? (
            <>
              <button className="btn-warning" onClick={onSkipExercise}>
                Skip Exercise
              </button>
              <button className="btn-secondary" onClick={onAddRestTime}>
                Add Rest (+15s)
              </button>
            </>
          ) : (
            <>
              <button className="btn-warning" onClick={onSkipRest}>
                Skip Rest
              </button>
              <button className="btn-secondary" onClick={onAddRestTime}>
                +15s Rest
              </button>
            </>
          )}
        </div>
      )}

      <button 
        className={isWorkoutActive ? "btn-secondary" : "btn-primary"}
        onClick={onWorkoutToggle}
      >
        {isWorkoutActive ? 'Stop Workout' : 'Start Workout'}
      </button>
      <button className="btn-voice" onClick={onVoiceCommand}>
        Voice Command
      </button>
    </div>
  );
}

export default Controls;

