import { useState, useEffect, useRef, useCallback } from 'react';

// The hook now accepts isFormCorrect to control the timer
export const useWorkoutManager = (isWorkoutActive, currentExercise, isFormCorrect) => {
  const [repCount, setRepCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [stage, setStage] = useState('up'); // For rep-counting state machine
  const [sessionLog, setSessionLog] = useState([]);
  
  const timerIntervalRef = useRef(null);

  // This function logs a completed exercise to the session history
  const logExercise = useCallback((isFinalLog = false) => {
    const exerciseToLog = currentExercise;
    const valueToLog = exerciseToLog.type === 'reps' ? repCount : timer;

    if (valueToLog > 0) {
        const logEntry = {
            name: exerciseToLog.name,
            type: exerciseToLog.type,
            completed: valueToLog,
            timestamp: new Date().toISOString()
        };
        // If it's the final log at the end of a session, just return the entry
        if (isFinalLog) return logEntry;

        // Otherwise, add it to the session log state, preventing duplicates
        setSessionLog(prevLog => {
          // Check if entry already exists to prevent duplicates
          if (!prevLog.some(log => log.timestamp === logEntry.timestamp)) {
            return [...prevLog, logEntry];
          }
          return prevLog;
        });
    }
    return null; // Return null if not the final log
  }, [currentExercise, repCount, timer]); // Removed sessionLog from dependencies

  // This effect manages the timer for duration-based exercises
  useEffect(() => {
    // Timer now ONLY runs if the workout is active, it's a duration exercise, AND the form is correct
    if (isWorkoutActive && currentExercise.type === 'duration' && isFormCorrect) {
      // Start the timer if it's not already running
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = setInterval(() => {
          setTimer(prev => prev + 1);
        }, 1000);
      }
    } else {
      // If any condition is false, stop the timer
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Cleanup function to clear the interval when the component unmounts or dependencies change
    return () => clearInterval(timerIntervalRef.current);
  }, [isWorkoutActive, currentExercise.type, isFormCorrect]);

  // This effect handles resetting state when the exercise changes
  useEffect(() => {
    // When a new exercise starts, log the previous one (if the workout is active)
    if (isWorkoutActive) {
      logExercise();
    }
    // Reset counters and stage for the new exercise
    setRepCount(0);
    setStage('up');
    setTimer(0);
  }, [currentExercise, isWorkoutActive]); // Removed logExercise from dependencies to prevent reset loop

  // Return all the state and functions needed by the main Workout component
  return { repCount, setRepCount, timer, stage, setStage, sessionLog, setSessionLog, logExercise };
};

