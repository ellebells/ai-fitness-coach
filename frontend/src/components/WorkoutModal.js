import React, { useState } from 'react';
import './WorkoutModal.css';

function WorkoutModal({ routines, onSelectRoutine, onClose }) {
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [customizedExercises, setCustomizedExercises] = useState({});

  const handleRoutineSelect = (routineKey) => {
    const routine = routines[routineKey];
    setSelectedRoutine({ key: routineKey, ...routine });
    
    // Initialize customized exercises with default values
    const initialCustomization = {};
    routine.exercises.forEach((exercise, index) => {
      initialCustomization[index] = {
        ...exercise,
        target: exercise.target
      };
    });
    setCustomizedExercises(initialCustomization);
  };

  const handleTargetChange = (exerciseIndex, newTarget) => {
    setCustomizedExercises(prev => ({
      ...prev,
      [exerciseIndex]: {
        ...prev[exerciseIndex],
        target: Math.max(1, parseInt(newTarget) || 1) // Ensure minimum value of 1
      }
    }));
  };

  const handleStartRoutine = () => {
    // Convert customized exercises back to array format
    const customizedRoutine = {
      ...selectedRoutine,
      exercises: Object.values(customizedExercises)
    };
    onSelectRoutine(selectedRoutine.key, customizedRoutine);
    setSelectedRoutine(null);
    setCustomizedExercises({});
  };

  const handleBack = () => {
    setSelectedRoutine(null);
    setCustomizedExercises({});
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>
            {selectedRoutine ? `Customize: ${selectedRoutine.name}` : 'Choose a Workout Routine'}
          </h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        {!selectedRoutine ? (
          <div className="routine-list">
            {Object.entries(routines).map(([key, routine]) => (
              <div key={key} className="routine-card">
                <button 
                  className="routine-button"
                  onClick={() => handleRoutineSelect(key)}
                >
                  <div className="routine-name">{routine.name}</div>
                  <div className="routine-preview">
                    {routine.exercises.map((ex, i) => (
                      <span key={i} className="exercise-preview">
                        {ex.name} ({ex.target} {ex.type === 'reps' ? 'reps' : 'sec'})
                        {i < routine.exercises.length - 1 ? ' • ' : ''}
                      </span>
                    ))}
                  </div>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="routine-customization">
            <div className="customization-header">
              <p>Adjust the targets for each exercise. Default values are recommended.</p>
            </div>
            
            <div className="exercise-list">
              {selectedRoutine.exercises.map((exercise, index) => (
                <div key={index} className="exercise-item">
                  <div className="exercise-info">
                    <span className="exercise-name">{exercise.name}</span>
                    <span className="exercise-type">
                      {exercise.type === 'reps' ? 'Reps' : 'Duration (seconds)'}
                    </span>
                  </div>
                  
                  <div className="exercise-controls">
                    <button 
                      className="adjust-btn"
                      onClick={() => handleTargetChange(index, customizedExercises[index]?.target - 1)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="target-input"
                      value={customizedExercises[index]?.target || exercise.target}
                      onChange={(e) => handleTargetChange(index, e.target.value)}
                      min="1"
                      max={exercise.type === 'reps' ? "100" : "300"}
                    />
                    <button 
                      className="adjust-btn"
                      onClick={() => handleTargetChange(index, customizedExercises[index]?.target + 1)}
                    >
                      +
                    </button>
                    <span className="unit">
                      {exercise.type === 'reps' ? 'reps' : 'sec'}
                    </span>
                  </div>
                  
                  {exercise.rest > 0 && (
                    <div className="rest-info">
                      Rest: {exercise.rest}s
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleBack}>
                Back to Routines
              </button>
              <button className="btn-primary" onClick={handleStartRoutine}>
                Start Customized Routine
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkoutModal;
