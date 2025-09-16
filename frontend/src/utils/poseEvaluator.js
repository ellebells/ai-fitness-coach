// --- Angle Calculation Utility ---
// Calculates the angle between three points (p1, p2, p3), where p2 is the vertex.
function calculateAngle(p1, p2, p3) {
  // Check if points are valid
  if (!p1 || !p2 || !p3) {
    return 0;
  }
  const a = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  const b = Math.sqrt((p2.x - p3.x) ** 2 + (p2.y - p3.y) ** 2);
  const c = Math.sqrt((p3.x - p1.x) ** 2 + (p3.y - p1.y) ** 2);
  
  // Using the law of cosines to find the angle at vertex p2
  const angleRad = Math.acos((a ** 2 + b ** 2 - c ** 2) / (2 * a * b));
  const angleDeg = angleRad * (180 / Math.PI);
  
  return angleDeg;
}


// --- Repetition-Based Evaluations ---

export function evaluatePushup(keypoints, stage, repCounter) {
  let feedback = 'Maintain form.';
  let feedbackColor = 'green';
  let newStage = stage;
  let newRepCounter = repCounter;
  try {
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const leftElbow = keypoints.find(kp => kp.name === 'left_elbow');
    const leftWrist = keypoints.find(kp => kp.name === 'left_wrist');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
    if (leftShoulder.score > 0.5 && leftElbow.score > 0.5 && leftWrist.score > 0.5) {
      const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      const bodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
      if (bodyAngle < 150) {
        feedback = 'Keep your back straight!';
        feedbackColor = 'red';
      } else {
        if (elbowAngle > 160) newStage = 'up';
        if (elbowAngle < 90 && newStage === 'up') {
          newStage = 'down';
          newRepCounter++;
          feedback = 'Good Rep!';
        }
      }
    } else {
      feedback = 'Make sure your arm and body are visible.';
      feedbackColor = 'orange';
    }
  } catch (error) {
    feedback = 'Could not see key body points.';
    feedbackColor = 'orange';
  }
  return { feedback, feedbackColor, stage: newStage, repCount: newRepCounter };
}

export function evaluateSquat(keypoints, stage, repCounter) {
  let feedback = 'Maintain form.';
  let feedbackColor = 'green';
  let newStage = stage;
  let newRepCounter = repCounter;
  
  console.log(`Squat evaluation - Current stage: ${stage}, Rep count: ${repCounter}`);
  
  try {
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
    const leftAnkle = keypoints.find(kp => kp.name === 'left_ankle');
    if (leftHip.score > 0.5 && leftKnee.score > 0.5 && leftAnkle.score > 0.5) {
      const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      
      console.log(`Knee angle: ${kneeAngle.toFixed(1)}°, Hip Y: ${leftHip.y.toFixed(1)}, Knee Y: ${leftKnee.y.toFixed(1)}`);
      
      // Initialize stage based on current position if not set
      if (!newStage || (newStage !== 'up' && newStage !== 'down')) {
        if (kneeAngle > 140) {  // More lenient threshold for initialization
          newStage = 'up';
          console.log('Initializing stage to "up" (standing position)');
        } else if (kneeAngle < 120) {  // More lenient threshold for initialization
          newStage = 'down';
          console.log('Initializing stage to "down" (squatting position)');
        }
      }
      
      // More flexible stage transitions with hysteresis to prevent bouncing
      if (kneeAngle > 140) {  // Easier to reach standing position
        if (newStage === 'down') {
          // Only count rep if we were clearly in down position
          newStage = 'up';
          newRepCounter++;
          feedback = 'Good Rep! 🎉';
          feedbackColor = 'green';
          console.log(`REP COMPLETED! New count: ${newRepCounter}`);
        } else {
          newStage = 'up'; // Maintain up state
          if (kneeAngle > 150) {
            feedback = 'Perfect standing position. Now squat down!';
            feedbackColor = 'green';
          } else {
            feedback = 'Good! Keep standing tall.';
            feedbackColor = 'green';
          }
        }
      }
      // Transition to down when clearly squatting
      else if (kneeAngle < 120) {  // Easier to reach squatting position
        // Only transition to down if we're coming from up or if clearly squatting
        if (newStage === 'up' || kneeAngle < 110) {
          newStage = 'down';
        }
        
        // Provide feedback based on depth
        if (leftHip.y >= leftKnee.y) {
          feedback = 'Great depth! Now stand up.';
          feedbackColor = 'green';
        } else {
          feedback = 'Go lower! Get your hips below knee level.';
          feedbackColor = 'yellow';
        }
      }
      // In between positions - maintain current stage but provide guidance
      else {
        // Don't change stage during transitions, just give feedback
        if (newStage === 'up') {
          feedback = 'Keep going down...';
          feedbackColor = 'blue';
        } else if (newStage === 'down') {
          feedback = 'Push up through your heels...';
          feedbackColor = 'blue';
        } else {
          // Still in undefined state, provide guidance
          feedback = 'Stand up straight to begin, then squat down.';
          feedbackColor = 'cyan';
        }
      }
    } else {
      feedback = 'Make sure your legs are fully visible.';
      feedbackColor = 'orange';
    }
  } catch (error) {
    feedback = 'Could not see key body points.';
    feedbackColor = 'orange';
  }
  
  console.log(`Squat result - Stage: ${newStage}, Rep count: ${newRepCounter}, Feedback: ${feedback}`);
  return { feedback, feedbackColor, stage: newStage, repCount: newRepCounter };
}

export function evaluateBridge(keypoints, stage, repCounter) {
    let feedback = 'Maintain form.';
    let feedbackColor = 'green';
    let newStage = stage;
    let newRepCounter = repCounter;
    try {
        const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
        const leftHip = keypoints.find(kp => kp.name === 'left_hip');
        const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
        if (leftShoulder.score > 0.5 && leftHip.score > 0.5 && leftKnee.score > 0.5) {
            const hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
            if (hipAngle < 150) newStage = 'down';
            if (hipAngle > 160 && newStage === 'down') {
                newStage = 'up';
                newRepCounter++;
                feedback = 'Good Rep!';
            }
        } else {
            feedback = 'Make sure your side profile is visible.';
            feedbackColor = 'orange';
        }
    } catch (error) {
        feedback = 'Could not see key body points.';
        feedbackColor = 'orange';
    }
    return { feedback, feedbackColor, stage: newStage, repCount: newRepCounter };
}

export function evaluateLunge(keypoints, stage, repCounter) {
    let feedback = 'Maintain form.';
    let feedbackColor = 'green';
    let newStage = stage;
    let newRepCounter = repCounter;
    try {
        const leftHip = keypoints.find(kp => kp.name === 'left_hip');
        const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
        const leftAnkle = keypoints.find(kp => kp.name === 'left_ankle');
        if (leftHip.score > 0.5 && leftKnee.score > 0.5 && leftAnkle.score > 0.5) {
            const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
            if (kneeAngle > 160) newStage = 'up';
            if (kneeAngle < 100 && newStage === 'up') {
                newStage = 'down';
                newRepCounter++;
                feedback = 'Good Rep!';
            }
        } else {
            feedback = 'Make sure your legs are fully visible.';
            feedbackColor = 'orange';
        }
    } catch(e){
        feedback = 'Could not see key body points.';
        feedbackColor = 'orange';
    }
    return { feedback, feedbackColor, stage: newStage, repCount: newRepCounter };
}

export function evaluateHighKnees(keypoints, stage, repCounter) {
    let feedback = 'Bring your knees higher!';
    let feedbackColor = 'green';
    let newStage = stage;
    let newRepCounter = repCounter;
    try {
        const leftHip = keypoints.find(kp => kp.name === 'left_hip');
        const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
        if (leftHip.score > 0.5 && leftKnee.score > 0.5) {
            if (leftKnee.y > leftHip.y) newStage = 'down';
            if (leftKnee.y < leftHip.y && newStage === 'down') {
                newStage = 'up';
                newRepCounter++;
                feedback = 'Good!';
            }
        } else {
            feedback = 'Make sure you are visible.';
            feedbackColor = 'orange';
        }
    } catch(e) {
        feedback = 'Could not see key body points.';
        feedbackColor = 'orange';
    }
    return { feedback, feedbackColor, stage: newStage, repCount: newRepCounter };
}


// --- Duration-Based Evaluations (UPDATED to return isCorrectForm) ---

export function evaluatePlank(keypoints) {
  let feedback = 'Get into position.';
  let feedbackColor = 'orange';
  let isCorrectForm = false;
  try {
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const leftAnkle = keypoints.find(kp => kp.name === 'left_ankle');
    if (leftShoulder.score > 0.5 && leftHip.score > 0.5 && leftAnkle.score > 0.5) {
      const bodyAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
      if (bodyAngle < 160) {
        feedback = 'Hips too low. Raise your hips!';
        feedbackColor = 'red';
      } else if (bodyAngle > 195) {
        feedback = 'Hips too high. Lower your hips!';
        feedbackColor = 'red';
      } else {
        feedback = 'Great form! Hold it.';
        feedbackColor = 'green';
        isCorrectForm = true;
      }
    } else {
      feedback = 'Make sure your full body is visible.';
    }
  } catch (error) {
    feedback = 'Could not see key body points.';
  }
  return { feedback, feedbackColor, isCorrectForm };
}

export function evaluateWallSit(keypoints) {
  let feedback = 'Get into position against a wall.';
  let feedbackColor = 'orange';
  let isCorrectForm = false;
  try {
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
    const leftAnkle = keypoints.find(kp => kp.name === 'left_ankle');
    if (leftHip.score > 0.5 && leftKnee.score > 0.5 && leftAnkle.score > 0.5) {
      const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      if (kneeAngle > 110) {
        feedback = 'Lower your hips!';
        feedbackColor = 'red';
      } else if (kneeAngle < 70) {
        feedback = 'Raise your hips slightly!';
        feedbackColor = 'red';
      } else {
        feedback = 'Great form, keep holding!';
        feedbackColor = 'green';
        isCorrectForm = true;
      }
    } else {
      feedback = 'Make sure your side profile is visible.';
    }
  } catch (error) {
    feedback = 'Could not see key body points.';
  }
  return { feedback, feedbackColor, isCorrectForm };
}

export function evaluateSuperman(keypoints) {
  let feedback = 'Lie on your stomach to begin.';
  let feedbackColor = 'orange';
  let isCorrectForm = false;
  try {
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const leftAnkle = keypoints.find(kp => kp.name === 'left_ankle');
    const leftWrist = keypoints.find(kp => kp.name === 'left_wrist');
    if (leftShoulder.score > 0.5 && leftHip.score > 0.5 && leftAnkle.score > 0.5 && leftWrist.score > 0.5) {
      const bodyAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
      if (bodyAngle < 160) {
        feedback = 'Try to straighten your back!';
        feedbackColor = 'red';
      } 
      else if (leftWrist.y > leftShoulder.y || leftAnkle.y > leftHip.y) {
        feedback = 'Lift your arms and legs higher!';
        feedbackColor = 'red';
      } else {
        feedback = 'Excellent hold!';
        feedbackColor = 'green';
        isCorrectForm = true;
      }
    } else {
      feedback = 'Make sure you are fully visible.';
    }
  } catch (error) {
    feedback = 'Could not see key body points.';
  }
  return { feedback, feedbackColor, isCorrectForm };
}

export function evaluateBirdDog(keypoints) {
    let feedback = 'Get on all fours to begin.';
    let feedbackColor = 'orange';
    let isCorrectForm = false;
    try {
        const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
        const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder');
        const leftHip = keypoints.find(kp => kp.name === 'left_hip');
        const rightHip = keypoints.find(kp => kp.name === 'right_hip');
        if (leftShoulder.score > 0.5 && rightShoulder.score > 0.5 && leftHip.score > 0.5 && rightHip.score > 0.5) {
            const shoulderYDiff = Math.abs(leftShoulder.y - rightShoulder.y);
            const hipYDiff = Math.abs(leftHip.y - rightHip.y);
            if (shoulderYDiff > 30 || hipYDiff > 30) {
                feedback = 'Keep your hips and shoulders level!';
                feedbackColor = 'red';
            } else {
                feedback = 'Great stability! Hold it.';
                feedbackColor = 'green';
                isCorrectForm = true;
            }
        } else {
            feedback = 'Make sure you are fully visible.';
        }
    } catch (error) {
        feedback = 'Could not see key body points.';
    }
    return { feedback, feedbackColor, isCorrectForm };
}

