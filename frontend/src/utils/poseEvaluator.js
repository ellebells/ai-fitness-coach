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
  let feedback = 'Get into push-up position.';
  let feedbackColor = 'green';
  let newStage = stage;
  let newRepCounter = repCounter;
  
  console.log(`Push-up evaluation - Current stage: ${stage}, Rep count: ${repCounter}`);
  
  try {
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const leftElbow = keypoints.find(kp => kp.name === 'left_elbow');
    const leftWrist = keypoints.find(kp => kp.name === 'left_wrist');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
    
    if (leftShoulder.score > 0.5 && leftElbow.score > 0.5 && leftWrist.score > 0.5) {
      const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      
      // Check body alignment if hip and knee are visible
      let bodyAligned = true;
      if (leftHip.score > 0.5 && leftKnee.score > 0.5) {
        const bodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
        bodyAligned = bodyAngle > 140; // More lenient body alignment
      }
      
      console.log(`Elbow angle: ${elbowAngle.toFixed(1)}°, Body aligned: ${bodyAligned}`);
      
      if (!bodyAligned) {
        feedback = 'Keep your back straight!';
        feedbackColor = 'red';
        return { feedback, feedbackColor, stage: newStage, repCount: newRepCounter };
      }
      
      // Initialize stage based on current position if not set
      if (!newStage || (newStage !== 'up' && newStage !== 'down')) {
        if (elbowAngle > 140) {
          newStage = 'up';
          console.log('Initializing stage to "up" (arms extended)');
        } else if (elbowAngle < 100) {
          newStage = 'down';
          console.log('Initializing stage to "down" (arms bent)');
        }
      }
      
      // More flexible stage transitions with hysteresis
      if (elbowAngle > 140) {  // Arms extended (easier threshold)
        if (newStage === 'down') {
          newStage = 'up';
          newRepCounter++;
          feedback = 'Great push-up! 🎉';
          feedbackColor = 'green';
          console.log(`REP COMPLETED! New count: ${newRepCounter}`);
        } else {
          newStage = 'up';
          feedback = 'Good position! Now lower down.';
          feedbackColor = 'green';
        }
      }
      // Arms bent (coming down)
      else if (elbowAngle < 100) {  // More lenient threshold
        if (newStage === 'up' || elbowAngle < 80) {
          newStage = 'down';
        }
        
        if (elbowAngle < 80) {
          feedback = 'Perfect depth! Now push up.';
          feedbackColor = 'green';
        } else {
          feedback = 'Go lower! Get your chest closer to the ground.';
          feedbackColor = 'yellow';
        }
      }
      // In between positions
      else {
        if (newStage === 'up') {
          feedback = 'Keep going down...';
          feedbackColor = 'blue';
        } else if (newStage === 'down') {
          feedback = 'Push up!';
          feedbackColor = 'blue';
        } else {
          feedback = 'Get into starting position with arms extended.';
          feedbackColor = 'cyan';
        }
      }
    } else {
      feedback = 'Make sure your arms are fully visible.';
      feedbackColor = 'orange';
    }
  } catch (error) {
    feedback = 'Could not see key body points.';
    feedbackColor = 'orange';
  }
  
  console.log(`Push-up result - Stage: ${newStage}, Rep count: ${newRepCounter}, Feedback: ${feedback}`);
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
    let feedback = 'Lie on your back with knees bent.';
    let feedbackColor = 'green';
    let newStage = stage;
    let newRepCounter = repCounter;
    
    console.log(`Bridge evaluation - Current stage: ${stage}, Rep count: ${repCounter}`);
    
    try {
        const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
        const leftHip = keypoints.find(kp => kp.name === 'left_hip');
        const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
        
        if (leftShoulder.score > 0.5 && leftHip.score > 0.5 && leftKnee.score > 0.5) {
            const hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
            
            console.log(`Hip angle: ${hipAngle.toFixed(1)}°`);
            
            // Initialize stage based on current position if not set
            if (!newStage || (newStage !== 'up' && newStage !== 'down')) {
                if (hipAngle > 150) {
                    newStage = 'up';
                    console.log('Initializing stage to "up" (bridge lifted)');
                } else if (hipAngle < 120) {
                    newStage = 'down';
                    console.log('Initializing stage to "down" (lying flat)');
                }
            }
            
            // More flexible stage transitions
            if (hipAngle > 150) {  // Bridge lifted (easier threshold)
                if (newStage === 'down') {
                    newStage = 'up';
                    newRepCounter++;
                    feedback = 'Perfect bridge! 🎉 Now lower down.';
                    feedbackColor = 'green';
                    console.log(`REP COMPLETED! New count: ${newRepCounter}`);
                } else {
                    newStage = 'up';
                    feedback = 'Great bridge position! Hold briefly, then lower.';
                    feedbackColor = 'green';
                }
            }
            // Bridge lowered
            else if (hipAngle < 120) {  // More lenient threshold
                if (newStage === 'up' || hipAngle < 110) {
                    newStage = 'down';
                }
                
                feedback = 'Good starting position. Now lift your hips up!';
                feedbackColor = 'cyan';
            }
            // In between positions
            else {
                if (newStage === 'up') {
                    feedback = 'Keep lowering...';
                    feedbackColor = 'blue';
                } else if (newStage === 'down') {
                    feedback = 'Keep lifting your hips up...';
                    feedbackColor = 'blue';
                } else {
                    feedback = 'Lie flat, then lift your hips to form a bridge.';
                    feedbackColor = 'cyan';
                }
            }
        } else {
            feedback = 'Make sure your side profile is visible.';
            feedbackColor = 'orange';
        }
    } catch (error) {
        feedback = 'Could not see key body points.';
        feedbackColor = 'orange';
    }
    
    console.log(`Bridge result - Stage: ${newStage}, Rep count: ${newRepCounter}, Feedback: ${feedback}`);
    return { feedback, feedbackColor, stage: newStage, repCount: newRepCounter };
}

export function evaluateLunge(keypoints, stage, repCounter) {
    let feedback = 'Stand up straight to begin.';
    let feedbackColor = 'green';
    let newStage = stage;
    let newRepCounter = repCounter;
    
    console.log(`Lunge evaluation - Current stage: ${stage}, Rep count: ${repCounter}`);
    
    try {
        const leftHip = keypoints.find(kp => kp.name === 'left_hip');
        const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
        const leftAnkle = keypoints.find(kp => kp.name === 'left_ankle');
        
        if (leftHip.score > 0.5 && leftKnee.score > 0.5 && leftAnkle.score > 0.5) {
            const kneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
            
            console.log(`Knee angle: ${kneeAngle.toFixed(1)}°`);
            
            // Initialize stage based on current position if not set
            if (!newStage || (newStage !== 'up' && newStage !== 'down')) {
                if (kneeAngle > 140) {
                    newStage = 'up';
                    console.log('Initializing stage to "up" (standing position)');
                } else if (kneeAngle < 110) {
                    newStage = 'down';
                    console.log('Initializing stage to "down" (lunge position)');
                }
            }
            
            // More flexible stage transitions
            if (kneeAngle > 140) {  // Standing position (easier threshold)
                if (newStage === 'down') {
                    newStage = 'up';
                    newRepCounter++;
                    feedback = 'Perfect lunge! 🎉 Step into the next one.';
                    feedbackColor = 'green';
                    console.log(`REP COMPLETED! New count: ${newRepCounter}`);
                } else {
                    newStage = 'up';
                    feedback = 'Good standing position. Now step into a lunge.';
                    feedbackColor = 'green';
                }
            }
            // Lunge position
            else if (kneeAngle < 110) {  // More lenient threshold
                if (newStage === 'up' || kneeAngle < 90) {
                    newStage = 'down';
                }
                
                if (kneeAngle < 90) {
                    feedback = 'Great depth! Now step back up.';
                    feedbackColor = 'green';
                } else {
                    feedback = 'Lower! Get that front thigh parallel to the ground.';
                    feedbackColor = 'yellow';
                }
            }
            // In between positions
            else {
                if (newStage === 'up') {
                    feedback = 'Keep stepping forward and down...';
                    feedbackColor = 'blue';
                } else if (newStage === 'down') {
                    feedback = 'Push back up to standing...';
                    feedbackColor = 'blue';
                } else {
                    feedback = 'Step forward into a lunge position.';
                    feedbackColor = 'cyan';
                }
            }
        } else {
            feedback = 'Make sure your legs are fully visible.';
            feedbackColor = 'orange';
        }
    } catch(error) {
        feedback = 'Could not see key body points.';
        feedbackColor = 'orange';
    }
    
    console.log(`Lunge result - Stage: ${newStage}, Rep count: ${newRepCounter}, Feedback: ${feedback}`);
    return { feedback, feedbackColor, stage: newStage, repCount: newRepCounter };
}

export function evaluateHighKnees(keypoints, stage, repCounter) {
    let feedback = 'Stand up and start marching!';
    let feedbackColor = 'green';
    let newStage = stage;
    let newRepCounter = repCounter;
    
    console.log(`High Knees evaluation - Current stage: ${stage}, Rep count: ${repCounter}`);
    
    try {
        const leftHip = keypoints.find(kp => kp.name === 'left_hip');
        const leftKnee = keypoints.find(kp => kp.name === 'left_knee');
        const rightHip = keypoints.find(kp => kp.name === 'right_hip');
        const rightKnee = keypoints.find(kp => kp.name === 'right_knee');
        
        if (leftHip.score > 0.5 && leftKnee.score > 0.5 && rightHip.score > 0.5 && rightKnee.score > 0.5) {
            // Use the average hip height for reference
            const avgHipY = (leftHip.y + rightHip.y) / 2;
            
            // Check if either knee is raised high (above hip level)
            const leftKneeHigh = leftKnee.y < avgHipY - 20; // 20 pixels above hip
            const rightKneeHigh = rightKnee.y < avgHipY - 20;
            const anyKneeHigh = leftKneeHigh || rightKneeHigh;
            
            console.log(`Left knee high: ${leftKneeHigh}, Right knee high: ${rightKneeHigh}, Any knee high: ${anyKneeHigh}`);
            
            // Initialize stage based on current position if not set
            if (!newStage || (newStage !== 'up' && newStage !== 'down')) {
                if (anyKneeHigh) {
                    newStage = 'up';
                    console.log('Initializing stage to "up" (knee raised)');
                } else {
                    newStage = 'down';
                    console.log('Initializing stage to "down" (both feet down)');
                }
            }
            
            // More flexible stage transitions
            if (anyKneeHigh) {  // At least one knee is high
                if (newStage === 'down') {
                    newStage = 'up';
                    newRepCounter++;
                    feedback = 'Great knee lift! 🎉 Keep marching!';
                    feedbackColor = 'green';
                    console.log(`REP COMPLETED! New count: ${newRepCounter}`);
                } else {
                    newStage = 'up';
                    feedback = 'Perfect! Keep bringing those knees up!';
                    feedbackColor = 'green';
                }
            } else {
                // Both knees are down
                newStage = 'down';
                
                // Check if knees are at least partially lifted
                const leftKneePartial = leftKnee.y < avgHipY + 20;
                const rightKneePartial = rightKnee.y < avgHipY + 20;
                
                if (leftKneePartial || rightKneePartial) {
                    feedback = 'Higher! Bring your knees up to hip level!';
                    feedbackColor = 'yellow';
                } else {
                    feedback = 'March in place! Lift those knees high!';
                    feedbackColor = 'cyan';
                }
            }
        } else {
            feedback = 'Make sure you are fully visible.';
            feedbackColor = 'orange';
        }
    } catch(error) {
        feedback = 'Could not see key body points.';
        feedbackColor = 'orange';
    }
    
    console.log(`High Knees result - Stage: ${newStage}, Rep count: ${newRepCounter}, Feedback: ${feedback}`);
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

export function evaluateSuperman(keypoints, stage, repCounter) {
  let feedback = 'Lie on your stomach to begin.';
  let feedbackColor = 'orange';
  let newStage = stage;
  let newRepCounter = repCounter;
  
  console.log(`Superman evaluation - Current stage: ${stage}, Rep count: ${repCounter}`);
  
  try {
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder');
    const leftHip = keypoints.find(kp => kp.name === 'left_hip');
    const leftAnkle = keypoints.find(kp => kp.name === 'left_ankle');
    const leftWrist = keypoints.find(kp => kp.name === 'left_wrist');
    
    if (leftShoulder.score > 0.5 && leftHip.score > 0.5 && leftAnkle.score > 0.5 && leftWrist.score > 0.5) {
      // Check if arms and legs are lifted (wrists above shoulders, ankles above hips)
      const armsLifted = leftWrist.y < leftShoulder.y - 10; // Arms lifted at least 10 pixels
      const legsLifted = leftAnkle.y < leftHip.y - 10; // Legs lifted at least 10 pixels
      const isLifted = armsLifted && legsLifted;
      
      console.log(`Arms lifted: ${armsLifted}, Legs lifted: ${legsLifted}, Overall lifted: ${isLifted}`);
      
      // Initialize stage based on current position if not set
      if (!newStage || (newStage !== 'up' && newStage !== 'down')) {
        if (isLifted) {
          newStage = 'up';
          console.log('Initializing stage to "up" (lifted position)');
        } else {
          newStage = 'down';
          console.log('Initializing stage to "down" (lying flat position)');
        }
      }
      
      // Transition logic with more lenient thresholds
      if (isLifted) {
        if (newStage === 'down') {
          // Coming up from lying flat position - count a rep
          newStage = 'up';
          newRepCounter++;
          feedback = 'Great lift! 🎉 Now lower back down.';
          feedbackColor = 'green';
          console.log(`REP COMPLETED! New count: ${newRepCounter}`);
        } else {
          newStage = 'up'; // Maintain up state
          feedback = 'Perfect form! Hold briefly, then lower down.';
          feedbackColor = 'green';
        }
      } else {
        // Arms and legs are down
        newStage = 'down';
        if (armsLifted && !legsLifted) {
          feedback = 'Good! Now lift your legs too.';
          feedbackColor = 'blue';
        } else if (!armsLifted && legsLifted) {
          feedback = 'Good! Now lift your arms and chest too.';
          feedbackColor = 'blue';
        } else {
          feedback = 'Ready position. Now lift your arms, chest, and legs together!';
          feedbackColor = 'cyan';
        }
      }
    } else {
      feedback = 'Make sure you are fully visible from the side.';
      feedbackColor = 'orange';
    }
  } catch (error) {
    feedback = 'Could not see key body points.';
    feedbackColor = 'orange';
  }
  
  console.log(`Superman result - Stage: ${newStage}, Rep count: ${newRepCounter}, Feedback: ${feedback}`);
  return { feedback, feedbackColor, stage: newStage, repCount: newRepCounter };
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

