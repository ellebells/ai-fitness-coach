import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Controls from '../../components/Controls';
import VideoFeed from '../../components/VideoFeed';
import StatusPanel from '../../components/StatusPanel';
import WorkoutModal from '../../components/WorkoutModal';
import { useWorkoutManager } from '../../hooks/useWorkoutManager';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import './Workout.css';

// --- Data Structures ---
const allExercises = [
    { name: 'Plank', type: 'duration' }, { name: 'Push-up', type: 'reps' }, { name: 'Squat', type: 'reps' },
    { name: 'Bridge', type: 'reps' }, { name: 'Bird-dog', type: 'duration' }, { name: 'High Knees', type: 'reps' },
    { name: 'Lunges', type: 'reps' }, { name: 'Superman', type: 'duration' }, { name: 'Wall-sit', type: 'duration' },
];

const workoutTemplates = {
    core_strength: {
        name: 'Core Strength & Stability',
        exercises: [
            { name: 'High Knees', type: 'reps', target: 30, rest: 15 },
            { name: 'Plank', type: 'duration', target: 30, rest: 15 },
            { name: 'Bird-dog', type: 'duration', target: 45, rest: 0 }
        ]
    },
    lower_body: {
        name: 'Lower Body Power',
        exercises: [
            { name: 'Squat', type: 'reps', target: 15, rest: 20 },
            { name: 'Lunges', type: 'reps', target: 20, rest: 20 },
            { name: 'Bridge', type: 'reps', target: 20, rest: 0 }
        ]
    },
    upper_body: {
        name: 'Upper Body & Posture',
        exercises: [
            { name: 'Push-up', type: 'reps', target: 10, rest: 20 },
            { name: 'Superman', type: 'duration', target: 30, rest: 15 },
            { name: 'Wall-sit', type: 'duration', target: 45, rest: 0 }
        ]
    }
};

function Workout() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [feedback, setFeedback] = useState({ feedback: 'Select an exercise or routine to start.', feedbackColor: 'white' });
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [currentExercise, setCurrentExercise] = useState(allExercises[0]);
    
    const [showRoutineModal, setShowRoutineModal] = useState(false);
    const [activeRoutine, setActiveRoutine] = useState(null);
    const [exerciseIndex, setExerciseIndex] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [restTimeLeft, setRestTimeLeft] = useState(0);
    
    const [isFormCorrect, setIsFormCorrect] = useState(false);

    const { repCount, setRepCount, timer, stage, setStage, sessionLog, setSessionLog, logExercise } = useWorkoutManager(isWorkoutActive, currentExercise, isFormCorrect);
    const { isListening, command, startListening } = useSpeechRecognition();
    const [transcription, setTranscription] = useState('Click "Voice Command" to start.');
    
    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        if (storedName) setUserName(storedName);
    }, []);

    const startRoutine = (routineKey) => {
        const routine = workoutTemplates[routineKey];
        setActiveRoutine(routine);
        setExerciseIndex(0);
        setCurrentExercise(routine.exercises[0]);
        setShowRoutineModal(false);
        setFeedback({ feedback: `Starting routine: ${routine.name}`, feedbackColor: 'white' });
    };

    const handlePoseUpdate = (poseFeedback) => {
        if (isWorkoutActive && !isResting) {
            setFeedback(poseFeedback);
            if (poseFeedback.repCount !== undefined) setRepCount(poseFeedback.repCount);
            if (poseFeedback.stage) setStage(poseFeedback.stage);
            if (poseFeedback.isCorrectForm !== undefined) setIsFormCorrect(poseFeedback.isCorrectForm);
        }
    };

    const handleExerciseChange = useCallback((exerciseName) => {
        const selected = allExercises.find(ex => ex.name === exerciseName);
        if (selected) {
            setCurrentExercise(selected);
            setActiveRoutine(null);
        }
        setIsFormCorrect(false);
        setFeedback({ feedback: 'Ready to start.', feedbackColor: 'white' });
    }, []);
    
    const advanceToNextExercise = useCallback(() => {
        if (!activeRoutine || exerciseIndex >= activeRoutine.exercises.length - 1) {
            setIsWorkoutActive(false);
            setActiveRoutine(null);
            setFeedback({ feedback: 'Routine complete! Amazing work!', feedbackColor: 'green' });
            return;
        }
        const current = activeRoutine.exercises[exerciseIndex];
        const nextRestTime = current.rest;
        setIsResting(true);
        setRestTimeLeft(nextRestTime);
        setIsFormCorrect(false);
    }, [activeRoutine, exerciseIndex]);

    const handleWorkoutToggle = useCallback(() => {
        setIsWorkoutActive(prev => !prev);
    }, []);

    useEffect(() => {
      if (!isWorkoutActive) {
          const user = localStorage.getItem('userName') || 'guest';
          const history = JSON.parse(localStorage.getItem(`${user}_history`)) || [];
          const finalLog = logExercise(true); 
          let completeLog = [...sessionLog];
          if(finalLog) completeLog.push(finalLog);
          
          if (completeLog.length > 0) {
            const newHistory = [...history, { date: new Date().toISOString(), workout: completeLog }];
            localStorage.setItem(`${user}_history`, JSON.stringify(newHistory));
          }
      } else {
        setSessionLog([]);
        setIsFormCorrect(false);
        setFeedback({ feedback: 'Starting workout...', feedbackColor: 'white' });
      }
    }, [isWorkoutActive, logExercise, sessionLog, setSessionLog]);
    
    useEffect(() => {
        if (!isWorkoutActive || !activeRoutine || isResting) return;
        const current = activeRoutine.exercises[exerciseIndex];
        const isComplete = (current.type === 'reps' && repCount >= current.target) || (current.type === 'duration' && timer >= current.target);
        if (isComplete) {
            logExercise();
            advanceToNextExercise();
        }
    }, [repCount, timer, isWorkoutActive, activeRoutine, exerciseIndex, isResting, logExercise, advanceToNextExercise]);
    
    useEffect(() => {
        if (isResting && isWorkoutActive) {
            if (restTimeLeft > 0) {
                const restTimer = setTimeout(() => setRestTimeLeft(prev => prev - 1), 1000);
                const nextExerciseName = activeRoutine.exercises[exerciseIndex + 1]?.name || 'the final exercise';
                setFeedback({ feedback: `Rest Time! Next up: ${nextExerciseName}`, feedbackColor: 'cyan' });
                return () => clearTimeout(restTimer);
            } else {
                setIsResting(false);
                const nextIndex = exerciseIndex + 1;
                setExerciseIndex(nextIndex);
                setCurrentExercise(activeRoutine.exercises[nextIndex]);
            }
        }
    }, [isResting, restTimeLeft, activeRoutine, exerciseIndex, isWorkoutActive]);

    const handleSkipExercise = useCallback(() => {
        if (!isWorkoutActive || !activeRoutine) return;
        logExercise();
        advanceToNextExercise();
    }, [isWorkoutActive, activeRoutine, logExercise, advanceToNextExercise]);

    const handleSkipRest = useCallback(() => {
        if (!isResting) return;
        setRestTimeLeft(0);
    }, [isResting]);

    const handleAddRestTime = useCallback(() => {
        if(isResting) {
            setRestTimeLeft(prev => prev + 15);
        }
    }, [isResting]);

    useEffect(() => {
        if (command && !isListening) {
            setTranscription(command.transcription || 'Could not hear command.');
            switch(command.intent) {
                case 'START_WORKOUT': if (!isWorkoutActive) handleWorkoutToggle(); break;
                case 'STOP_WORKOUT': if (isWorkoutActive) handleWorkoutToggle(); break;
                case 'SKIP_EXERCISE':
                    if (isResting) handleSkipRest();
                    else handleSkipExercise();
                    break;
                case 'ADD_REST': if (isResting) handleAddRestTime(); break;
                case 'SWITCH_EXERCISE':
                    if (command.entity && !isWorkoutActive) {
                        const foundExercise = allExercises.find(ex => ex.name.toLowerCase().replace('-', ' ') === command.entity.toLowerCase());
                        if (foundExercise) handleExerciseChange(foundExercise.name);
                    }
                    break;
                default: break;
            }
        }
    }, [command, isListening, isWorkoutActive, isResting, handleWorkoutToggle, handleExerciseChange, handleSkipExercise, handleSkipRest, handleAddRestTime]);

    const handleLogout = () => {
        localStorage.removeItem('userName');
        navigate('/');
    };

    return (
        <div className="workout-container">
            {showRoutineModal && (
                <WorkoutModal 
                    routines={workoutTemplates} 
                    onSelectRoutine={startRoutine}
                    onClose={() => setShowRoutineModal(false)} 
                />
            )}
            <header className="workout-header">
                <h1>AI Fitness Coach</h1>
                <div className="header-buttons">
                    <button className="btn-secondary" onClick={() => navigate('/history')}>View History</button>
                    <button className="btn-secondary" onClick={handleLogout}>Logout</button>
                </div>
                <div className="user-info">Welcome, {userName || 'Guest'}</div>
            </header>
            <main className="workout-main">
                <div className="video-and-controls">
                    {/* --- THIS IS THE FIX --- */}
                    <VideoFeed
                        onPoseUpdate={handlePoseUpdate}
                        isWorkoutActive={isWorkoutActive}
                        currentExercise={currentExercise}
                        repCount={repCount}
                        stage={stage}
                    />
                    {/* ---------------------- */}
                    <Controls
                        exercises={allExercises}
                        onExerciseChange={handleExerciseChange}
                        onWorkoutToggle={handleWorkoutToggle}
                        isWorkoutActive={isWorkoutActive}
                        onVoiceCommand={startListening}
                        onShowRoutines={() => setShowRoutineModal(true)}
                        onSkipExercise={handleSkipExercise}
                        activeRoutine={activeRoutine}
                        isResting={isResting}
                    />
                </div>
                <StatusPanel
                    exercise={currentExercise}
                    nextExercise={activeRoutine && activeRoutine.exercises[exerciseIndex + 1]}
                    feedback={feedback.feedback}
                    feedbackColor={feedback.feedbackColor}
                    repCount={repCount}
                    timer={timer}
                    transcription={transcription}
                    target={activeRoutine ? activeRoutine.exercises[exerciseIndex].target : null}
                    isResting={isResting}
                    restTimeLeft={restTimeLeft}
                    onSkipRest={handleSkipRest}
                    onAddRestTime={handleAddRestTime}
                    isFormCorrect={isFormCorrect}
                    isWorkoutActive={isWorkoutActive}
                />
            </main>
        </div>
    );
}

export default Workout;

