import React, { useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { usePoseNet } from '../hooks/usePoseNet';
import { drawCanvas } from '../utils/drawUtils';
// --- CORRECTED IMPORTS ---
// Import all evaluation functions in a single, clean block
import { 
  evaluatePlank, 
  evaluatePushup, 
  evaluateSquat,
  evaluateBridge,
  evaluateLunge,
  evaluateHighKnees,
  evaluateWallSit,
  evaluateSuperman,
  evaluateBirdDog
} from '../utils/poseEvaluator'; 

function VideoFeed({ onPoseUpdate, isWorkoutActive, currentExercise, repCount, stage }) { 
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const { detector, loading } = usePoseNet();

  const runPoseDetection = useCallback(async () => {
    if (detector && webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const { videoWidth, videoHeight } = video;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      const poses = await detector.estimatePoses(video);
      
      const ctx = canvasRef.current.getContext('2d');
      drawCanvas(poses, videoWidth, videoHeight, ctx, canvasRef);

      if (isWorkoutActive && poses && poses.length > 0) {
        let feedback;
        switch(currentExercise.name) {
          case 'Plank':
            feedback = evaluatePlank(poses[0].keypoints);
            break;
          case 'Superman':
            feedback = evaluateSuperman(poses[0].keypoints);
            break;
          case 'Wall-sit':
            feedback = evaluateWallSit(poses[0].keypoints);
            break;
          case 'Bird-dog':
            feedback = evaluateBirdDog(poses[0].keypoints);
            break;
          case 'Push-up':
            feedback = evaluatePushup(poses[0].keypoints, stage, repCount);
            break;
          case 'Squat':
            feedback = evaluateSquat(poses[0].keypoints, stage, repCount);
            break;
          case 'Bridge':
            feedback = evaluateBridge(poses[0].keypoints, stage, repCount);
            break;
          case 'Lunges':
            feedback = evaluateLunge(poses[0].keypoints, stage, repCount);
            break;
          case 'High Knees':
            feedback = evaluateHighKnees(poses[0].keypoints, stage, repCount);
            break;
          default:
            // --- CORRECTED TYPO ---
            feedback = { feedback: 'Evaluation for this exercise is not yet implemented.', feedbackColor: 'orange' };
        }
        onPoseUpdate(feedback);
      }
    }
  }, [detector, onPoseUpdate, isWorkoutActive, currentExercise, repCount, stage]);

  // --- HOOK MOVED TO CORRECT POSITION ---
  // This useEffect runs the detection loop
  useEffect(() => {
    const interval = setInterval(() => {
      runPoseDetection();
    }, 100);
    return () => clearInterval(interval);
  }, [runPoseDetection]);

  return (
    <div className="video-feed-container">
      {loading && <p>Loading model, please wait...</p>}
      <Webcam
        ref={webcamRef}
        mirrored={true}
      />
      <canvas
        ref={canvasRef}
      />
    </div>
  );
}

export default VideoFeed;
