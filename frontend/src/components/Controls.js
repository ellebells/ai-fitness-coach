import React from 'react';

// Add onSkipExercise and activeRoutine props
function Controls({ exercises, onExerciseChange, onWorkoutToggle, isWorkoutActive, onVoiceCommand, onShowRoutines, onSkipExercise, activeRoutine }) {
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

      {/* NEW: Conditionally render Skip button during a routine */}
      {isWorkoutActive && activeRoutine && (
          <button className="btn-warning" onClick={onSkipExercise}>Skip Exercise</button>
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

