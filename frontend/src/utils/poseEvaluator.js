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
  try {
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
    const leftAnkle = keypoints.find(kp => kp.name === 'left_ankle');
    if (leftHip.score > 0.5 && leftKnee.score > 0.5 && leftAnkle.score > 0.5) {
      const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      if (kneeAngle > 160) newStage = 'up';
      if (kneeAngle < 90 && newStage === 'up') {
        if (leftHip.y > leftKnee.y) {
          newStage = 'down';
          newRepCounter++;
          feedback = 'Good Rep!';
        } else {
          feedback = 'Lower your hips!';
          feedbackColor = 'red';
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

