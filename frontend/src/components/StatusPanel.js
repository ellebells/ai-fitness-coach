import React from 'react';

// A map of exercise names to their detailed instructions for easy lookup
const instructions = {
  'Plank': 'Start in a push-up position. Keep your body in a straight line from head to heels. Engage your core and hold the position. Avoid letting your hips sag or rise.',
  'Push-up': 'Start in a plank position with hands slightly wider than shoulders. Lower your chest to the ground while keeping your back straight. Push back up to starting position. Keep your core engaged throughout.',
  'Squat': 'Stand with feet shoulder-width apart. Keep your back straight and lower your hips as if sitting back into a chair. Go down until your thighs are parallel to the ground, then stand back up. Keep your knees behind your toes.',
  'Bridge': 'Lie on your back with knees bent and feet flat on the floor. Lift your hips off the floor until your knees, hips and shoulders form a straight line. Squeeze your glutes at the top, then lower back down.',
  'Bird-dog': 'Start on hands and knees. Extend one arm forward and the opposite leg back, keeping your back straight and hips level. Hold briefly, then return to start. Switch sides. Focus on balance and core stability.',
  'High Knees': 'Run in place while bringing your knees up towards your chest as high as possible. Keep your upper body straight and pump your arms. Land softly on the balls of your feet. Maintain a quick, rhythmic pace.',
  'Lunges': 'Step forward with one leg and lower your hips until both knees are bent at 90-degree angles. Your front knee should be directly above your ankle. Push back to starting position and switch legs. Keep your torso upright.',
  'Superman': 'Lie face down with arms extended forward. Simultaneously lift your arms, chest, and legs off the floor as high as comfortable. Hold briefly, focusing on squeezing your back muscles. Lower back down with control.',
  'Wall-sit': 'Stand with your back against a wall. Slide down until your thighs are parallel to the ground and knees are at 90 degrees. Keep your back flat against the wall and hold the position. Your feet should be about shoulder-width apart.'
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
  isWorkoutActive,
  settings
}) {
  const exerciseName = exercise?.name || 'No Exercise Selected';
  const exerciseType = exercise?.type;

  // Helper function to get the appropriate color based on contrast mode
  const getDisplayColor = (feedbackColor) => {
    if (!settings || settings.contrastMode !== 'high') {
      // Normal mode - use the original feedback color
      return feedbackColor;
    }
    
    // High contrast mode - map feedback colors to high contrast variants
    const highContrastColors = {
      'green': '#00FF00',    // Bright green
      'red': '#FF0000',      // Bright red
      'orange': '#FF6600',   // Bright orange
      'yellow': '#FFFF00',   // Bright yellow
      'blue': '#0066FF',     // Bright blue
      'cyan': '#00FFFF',     // Bright cyan
      'white': '#FFFFFF'     // White
    };
    
    return highContrastColors[feedbackColor] || '#FF00FF'; // Magenta as fallback
  };

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
      <div className="status-panel-content">
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
                  e.target.style.display = 'none'; 
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
                  e.target.style.display = 'none'; 
                }}
              />
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <h4>Instructions:</h4>
              <p style={{ marginBottom: '10px' }}>{instructions[exerciseName] || 'Follow the on-screen guide.'}</p>
              
              <h4>Feedback:</h4>
              {isWorkoutActive && exercise.type === 'duration' && !isFormCorrect && (
                  <p className="form-prompt">Get into the correct position to start the timer.</p>
              )}
              <p 
                className="feedback-text" 
                style={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem', 
                  marginBottom: '10px',
                  color: getDisplayColor(feedbackColor),
                  textShadow: settings?.contrastMode === 'high' ? '2px 2px 4px #000' : 'none'
                }}
                ref={(el) => {
                  if (el && settings?.contrastMode === 'high') {
                    el.style.setProperty('color', getDisplayColor(feedbackColor), 'important');
                  }
                }}
              > 
                {feedback}
              </p>
            </div>
          </>
        )}
      </div>
      
      <div className="voice-command-display">
          <h4>Voice Command:</h4>
          <p>{transcription || 'Click "Voice Command" to start.'}</p>
      </div>
    </div>
  );
}

export default StatusPanel;

