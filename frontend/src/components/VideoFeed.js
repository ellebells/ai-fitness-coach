import React, { useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { usePoseNet } from '../hooks/usePoseNet';
import { drawCanvas } from '../utils/drawUtils';
import { 
  evaluatePlank, evaluatePushup, evaluateSquat,
  evaluateBridge, evaluateLunge, evaluateHighKnees,
  evaluateWallSit, evaluateSuperman, evaluateBirdDog
} from '../utils/poseEvaluator';

// This component now accepts the feedbackColor prop to dynamically change the skeleton color
function VideoFeed({ onPoseUpdate, isWorkoutActive, currentExercise, feedbackColor, currentStage, currentRepCount }) { 
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const { detector, loading } = usePoseNet();
  
  // Use refs to store the most recent stage and rep count values
  const latestStageRef = useRef(currentStage);
  const latestRepCountRef = useRef(currentRepCount);
  
  // Update refs when props change
  useEffect(() => {
    latestStageRef.current = currentStage;
    latestRepCountRef.current = currentRepCount;
  }, [currentStage, currentRepCount]);

  const runPoseDetection = useCallback(async () => {
    // Ensure the model is loaded and the webcam is ready
    if (detector && webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const { videoWidth, videoHeight } = video;

      // Set the video and canvas dimensions
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      
      // Estimate poses in the current video frame
      const poses = await detector.estimatePoses(video);
      
      const ctx = canvasRef.current.getContext('2d');
      // Draw the skeleton, passing the dynamic color based on form correctness
      drawCanvas(poses, videoWidth, videoHeight, ctx, canvasRef, feedbackColor);

      // Only evaluate the pose if the workout is active and a pose is detected
      if (isWorkoutActive && poses && poses.length > 0) {
        let feedbackResult;
        const keypoints = poses[0].keypoints;
        
        // Use a switch statement to call the correct evaluation function for the current exercise
        switch(currentExercise.name) {
          case 'Plank': feedbackResult = evaluatePlank(keypoints); break;
          case 'Superman': feedbackResult = evaluateSuperman(keypoints); break;
          case 'Wall-sit': feedbackResult = evaluateWallSit(keypoints); break;
          case 'Bird-dog': feedbackResult = evaluateBirdDog(keypoints); break;
          case 'Push-up': feedbackResult = evaluatePushup(keypoints, latestStageRef.current, latestRepCountRef.current); break;
          case 'Squat': feedbackResult = evaluateSquat(keypoints, latestStageRef.current, latestRepCountRef.current); break;
          case 'Bridge': feedbackResult = evaluateBridge(keypoints, latestStageRef.current, latestRepCountRef.current); break;
          case 'Lunges': feedbackResult = evaluateLunge(keypoints, latestStageRef.current, latestRepCountRef.current); break;
          case 'High Knees': feedbackResult = evaluateHighKnees(keypoints, latestStageRef.current, latestRepCountRef.current); break;
          default:
            feedbackResult = { feedback: 'Evaluation for this exercise is not yet implemented.', feedbackColor: 'orange', isCorrectForm: false };
        }
        
        // Update the refs with the new values from the evaluation
        if (feedbackResult.stage !== undefined) {
          latestStageRef.current = feedbackResult.stage;
        }
        if (feedbackResult.repCount !== undefined) {
          latestRepCountRef.current = feedbackResult.repCount;
        }
        
        // Send the complete feedback object up to the parent Workout component
        onPoseUpdate(feedbackResult);
      }
    }
  }, [detector, isWorkoutActive, currentExercise, onPoseUpdate, feedbackColor, currentStage, currentRepCount]);

  // Set up an interval to run the pose detection loop continuously
  useEffect(() => {
    const interval = setInterval(() => {
      runPoseDetection();
    }, 100); // Run roughly 10 times per second for a balance of responsiveness and performance
    return () => clearInterval(interval);
  }, [runPoseDetection]);

  return (
    <div className="video-feed-container">
      {/* Polished loading indicator */}
      {loading && <div className="loading-overlay"><h2>Loading AI Model...</h2></div>}
      <Webcam
        ref={webcamRef}
        mirrored={true}
        // Styles are now handled by Workout.css for better alignment and consistency
      />
      <canvas
        ref={canvasRef}
        // Styles are now handled by Workout.css
      />
    </div>
  );
}

export default VideoFeed;

