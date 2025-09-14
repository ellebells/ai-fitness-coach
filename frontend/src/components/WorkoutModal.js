import React from 'react';
import './WorkoutModal.css';

function WorkoutModal({ routines, onSelectRoutine, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Choose a Workout Routine</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="routine-list">
          {Object.entries(routines).map(([key, routine]) => (
            <button 
              key={key} 
              className="routine-button"
              onClick={() => onSelectRoutine(key)}
            >
              {routine.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkoutModal;
