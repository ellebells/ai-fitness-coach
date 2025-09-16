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

function StatusPanel({ 
  exercise,
  nextExercise,
  feedback, 
  feedbackColor, 
  repCount, 
  timer, 
  transcription, 
  target, 
  isResting, 
  restTimeLeft,
  isFormCorrect,
  isWorkoutActive
}) {
  // Debug log to see if StatusPanel receives updated repCount
  console.log('StatusPanel render - repCount:', repCount);
  const exerciseName = exercise?.name || 'No Exercise Selected';
  const exerciseType = exercise?.type;

  // Helper function to format seconds into a MM:SS display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Helper to generate a clean filename from the exercise name
  const formatImageName = (name) => {
    if (!name) return '';
    
    // Convert to lowercase and replace spaces with hyphens to match actual filenames
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <div className="status-panel-container">
      {isResting ? (
        <div className="rest-display">
          <h2>REST</h2>
          <div className="rest-timer">{formatTime(restTimeLeft)}</div>
          
          <div className="next-exercise-preview">
            <h4>Next Up: {nextExercise?.name}</h4>
            <img 
              className="exercise-image"
              src={`/images/exercises/${formatImageName(nextExercise?.name)}.png`} 
              alt={`${nextExercise?.name} form`}
              onError={(e) => { 
                console.log(`Failed to load rest image: /images/exercises/${formatImageName(nextExercise?.name)}.png`);
                e.target.style.display = 'none'; 
              }}
              onLoad={() => {
                console.log(`Successfully loaded rest image: /images/exercises/${formatImageName(nextExercise?.name)}.png`);
              }}
            />
          </div>
        </div>
      ) : (
        <>
          <h2>{exerciseName}</h2>
          
          {/* --- Counter Display --- */}
          <div className="counter-display">
            {exerciseType === 'reps' && <h3>Reps: {repCount}{target && ` / ${target}`}</h3>}
            {exerciseType === 'duration' && <h3>Time: {formatTime(timer)}{target && ` / ${formatTime(target)}`}</h3>}
          </div>
          
          {/* --- Exercise Image --- */}
          <div className="exercise-image-container">
            <img 
              className="exercise-image"
              src={`/images/exercises/${formatImageName(exerciseName)}.png`} 
              alt={`${exerciseName} form`}
              onError={(e) => { 
                console.log(`Failed to load image: /images/exercises/${formatImageName(exerciseName)}.png`);
                e.target.style.display = 'none'; 
              }}
              onLoad={() => {
                console.log(`Successfully loaded image: /images/exercises/${formatImageName(exerciseName)}.png`);
              }}
            />
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h4>Instructions:</h4>
            <p style={{ marginBottom: '10px' }}>{instructions[exerciseName] || 'Follow the on-screen guide.'}</p>
            
            <h4>Feedback:</h4>
            {isWorkoutActive && exercise.type === 'duration' && !isFormCorrect && (
                <p className="form-prompt">Get into the correct position to start the timer.</p>
            )}
            <p style={{ color: feedbackColor, fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px' }}> 
              {feedback}
            </p>
          </div>
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

