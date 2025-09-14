import React from 'react';

// A map of exercise names to their instructions for easy lookup
const instructions = {
  'Plank': 'Keep your body in a straight line.',
  'Push-up': 'Lower your chest to the ground while keeping your back straight.',
  'Squat': 'Keep your back straight and lower your hips as if sitting in a chair.',
  'Bridge': 'Lift your hips off the floor until your knees, hips and shoulders form a straight line.',
  'Bird-dog': 'Extend one arm and the opposite leg, keeping your back straight.',
  'High Knees': 'Run in place, bringing your knees up towards your chest.',
  'Lunges': 'Step forward with one leg and lower your hips until both knees are bent at a 90-degree angle.',
  'Superman': 'Lie on your stomach and lift your arms, chest, and legs off the floor.',
  'Wall-sit': 'Slide your back down a wall until your thighs are parallel to the ground.'
};

// This component now receives many props to display the full workout state
function StatusPanel({ 
  exercise,
  nextExercise, // NEW: Prop for the upcoming exercise
  feedback, 
  feedbackColor, 
  repCount, 
  timer, 
  transcription, 
  target, 
  isResting, 
  restTimeLeft, 
  onSkipRest,
  onAddRestTime // NEW: Prop for adding rest
}) {
  const exerciseName = exercise?.name || 'No Exercise Selected';
  const exerciseType = exercise?.type;

  // Helper function to format seconds into a MM:SS display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="status-panel-container">
      {/* Conditional Rendering: Show the rest screen OR the exercise screen */}
      {isResting ? (
        <div className="rest-display">
          <h2>REST</h2>
          <div className="rest-timer">{formatTime(restTimeLeft)}</div>
          
          {/* NEW: Display the next exercise to prepare the user */}
          <div className="next-exercise-preview">
            <h4>Next Up: {nextExercise?.name}</h4>
            <img 
              src={`/images/exercises/${nextExercise?.name.toLowerCase().replace(/[\s-]/g, '_')}.png`} 
              alt={`${nextExercise?.name} form`}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <div className="rest-controls">
            <button className="btn-secondary" onClick={onSkipRest}>Skip Rest</button>
            <button className="btn-primary" onClick={onAddRestTime}>+15s Rest</button>
          </div>
        </div>
      ) : (
        <>
          <h2>{exerciseName}</h2>
          <div className="counter-display">
            {exerciseType === 'reps' && <h3>Reps: {repCount}{target && ` / ${target}`}</h3>}
            {exerciseType === 'duration' && <h3>Time: {formatTime(timer)}{target && ` / ${formatTime(target)}`}</h3>}
          </div>
          <img 
            src={`/images/exercises/${exerciseName.toLowerCase().replace(/[\s-]/g, '_')}.png`} 
            alt={`${exerciseName} form`}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h4>Instructions:</h4>
          <p>{instructions[exerciseName] || 'Follow the on-screen guide.'}</p>
          <h4>Feedback:</h4>
          <p style={{ color: feedbackColor, fontWeight: 'bold', fontSize: '1.1rem' }}> 
            {feedback}
          </p>
        </>
      )}
      
      <div className="voice-command-display">
          <h4>Voice Command:</h4>
          <p>{transcription || 'Click "Voice Command" to start.'}</p>
      </div>
    </div>
  );
}

export default StatusPanel;

