import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Controls from '../../components/Controls';
import VideoFeed from '../../components/VideoFeed';
import StatusPanel from '../../components/StatusPanel';
import WorkoutModal from '../../components/WorkoutModal';
import { useWorkoutManager } from '../../hooks/useWorkoutManager';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { speak } from '../../utils/speechUtils';
import './Workout.css';

// --- Data Structures ---
const allExercises = [
    { name: 'Plank', type: 'duration' }, { name: 'Push-up', type: 'reps' }, { name: 'Squat', type: 'reps' },
    { name: 'Bridge', type: 'reps' }, { name: 'Bird-dog', type: 'duration' }, { name: 'High Knees', type: 'reps' },
    { name: 'Lunges', type: 'reps' }, { name: 'Superman', type: 'reps' }, { name: 'Wall-sit', type: 'duration' },
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
            { name: 'Superman', type: 'reps', target: 15, rest: 15 },
            { name: 'Wall-sit', type: 'duration', target: 45, rest: 0 }
        ]
    }
};

function Workout() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [feedback, setFeedback] = useState({ feedback: 'Select an exercise or routine to start.', feedbackColor: 'green' });
    const [isWorkoutActive, setIsWorkoutActive] = useState(false);
    const [currentExercise, setCurrentExercise] = useState(allExercises[0]);
    
    // State for workout routines
    const [showRoutineModal, setShowRoutineModal] = useState(false);
    const [activeRoutine, setActiveRoutine] = useState(null);
    const [exerciseIndex, setExerciseIndex] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [restTimeLeft, setRestTimeLeft] = useState(0);
    
    // State to track if the user's form is correct for the timer
    const [isFormCorrect, setIsFormCorrect] = useState(false);

    // Pass the new state to the hook
    const { repCount, setRepCount, timer, stage, setStage, sessionLog, setSessionLog, logExercise } = useWorkoutManager(isWorkoutActive, currentExercise, isFormCorrect);
    const { isListening, command, startListening, clearCommand } = useSpeechRecognition();
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
        speak(`${routine.name} routine selected. Get ready!`);
    };

    const handlePoseUpdate = (poseFeedback) => {
        if (isWorkoutActive && !isResting) {
            console.log('Pose feedback received:', poseFeedback);
            console.log('Current repCount state:', repCount);
            console.log('Pose feedback repCount:', poseFeedback.repCount);
            console.log('repCount comparison:', poseFeedback.repCount !== repCount);
            
            setFeedback(poseFeedback);
            if (poseFeedback.repCount !== undefined && poseFeedback.repCount !== repCount) {
                console.log(`Rep count changed from ${repCount} to ${poseFeedback.repCount}`);
                setRepCount(poseFeedback.repCount);
                // Force a log to verify the state actually changed
                setTimeout(() => {
                    console.log('RepCount after setState:', repCount);
                }, 100);
            }
            if (poseFeedback.stage && poseFeedback.stage !== stage) {
                console.log(`Stage changed from ${stage} to ${poseFeedback.stage}`);
                setStage(poseFeedback.stage);
            }
            if (poseFeedback.isCorrectForm !== undefined) setIsFormCorrect(poseFeedback.isCorrectForm);
        }
    };

    const handleExerciseChange = useCallback((exerciseName) => {
        const selected = allExercises.find(ex => ex.name === exerciseName);
        if (selected) {
            setCurrentExercise(selected);
            setActiveRoutine(null);
            speak(`${exerciseName} selected.`);
        }
        setIsFormCorrect(false);
        setFeedback({ feedback: 'Ready to start.', feedbackColor: 'white' });
        // Reset stage and rep counter when changing exercise
        setStage(null);
        setRepCount(0);
        console.log(`Exercise changed to ${exerciseName}. Stage and rep count reset.`);
    }, []);
    
    const advanceToNextExercise = useCallback(() => {
        if (!activeRoutine || exerciseIndex >= activeRoutine.exercises.length - 1) {
            setIsWorkoutActive(false);
            setActiveRoutine(null);
            setFeedback({ feedback: 'Routine complete! Amazing work!', feedbackColor: 'green' });
            speak("Routine complete. Amazing work!");
            return;
        }
        const current = activeRoutine.exercises[exerciseIndex];
        const nextRestTime = current.rest;
        setIsResting(true);
        setRestTimeLeft(nextRestTime);
        setIsFormCorrect(false);
    }, [activeRoutine, exerciseIndex]);

    const handleWorkoutToggle = useCallback(() => {
        const newState = !isWorkoutActive;
        setIsWorkoutActive(newState);
        if (newState) {
            speak("Workout started! Let's go!");
        } else {
            speak("Workout stopped. Great effort!");
        }
    }, [isWorkoutActive]);
    
    // Effect to handle workout session logging and state reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      if (!isWorkoutActive && (sessionLog.length > 0 || logExercise(true))) {
          const user = localStorage.getItem('userName') || 'guest';
          const history = JSON.parse(localStorage.getItem(`${user}_history`)) || [];
          const finalLog = logExercise(true); 
          let completeLog = [...sessionLog];
          if(finalLog && !sessionLog.find(l => l.timestamp === finalLog.timestamp)) {
              completeLog.push(finalLog);
          }
          
          if (completeLog.length > 0) {
            const newHistory = [...history, { date: new Date().toISOString(), workout: completeLog }];
            localStorage.setItem(`${user}_history`, JSON.stringify(newHistory));
          }
      } else if (isWorkoutActive) {
        setSessionLog([]);
        setIsFormCorrect(false);
        setFeedback({ feedback: 'Starting workout...', feedbackColor: 'white' });
      }
    }, [isWorkoutActive, logExercise]); // Removed sessionLog and setSessionLog to prevent infinite loop
    
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
                speak("Let's begin.");
            }
        }
    }, [isResting, restTimeLeft, activeRoutine, exerciseIndex, isWorkoutActive]);

    const handleSkipExercise = useCallback(() => {
        if (!isWorkoutActive || !activeRoutine) return;
        speak("Exercise skipped.");
        logExercise();
        advanceToNextExercise();
    }, [isWorkoutActive, activeRoutine, logExercise, advanceToNextExercise]);

    const handleSkipRest = useCallback(() => {
        if (!isResting) return;
        speak("Rest skipped. Let's continue!");
        setRestTimeLeft(0);
    }, [isResting]);

    const handleAddRestTime = useCallback(() => {
        if(isResting) {
            // If already resting, add 15 seconds to current rest
            setRestTimeLeft(prev => prev + 15);
            speak("15 seconds added to rest time.");
        } else {
            // If not resting, start a rest period of 15 seconds
            setIsResting(true);
            setRestTimeLeft(15);
            setFeedback({ feedback: 'Rest time added!', feedbackColor: 'cyan' });
            speak("Rest break started. Take 15 seconds.");
        }
    }, [isResting]);

    useEffect(() => {
        if (command) {
            console.log('Command received:', command);
            if (isListening) {
                setTranscription('Listening...');
            } else {
                setTranscription(command.transcription || 'Could not hear command.');
                console.log('Processing command intent:', command.intent);
                
                // Process the command
                switch(command.intent) {
                    case 'START_WORKOUT': 
                        console.log('START_WORKOUT command detected, isWorkoutActive:', isWorkoutActive);
                        if (!isWorkoutActive) {
                            console.log('Starting workout...');
                            speak("Voice command confirmed. Starting workout!");
                            handleWorkoutToggle();
                        } else {
                            console.log('Workout already active, ignoring start command');
                        }
                        break;
                    case 'STOP_WORKOUT': 
                        console.log('STOP_WORKOUT command detected, isWorkoutActive:', isWorkoutActive);
                        if (isWorkoutActive) {
                            console.log('Stopping workout...');
                            speak("Voice command confirmed. Stopping workout.");
                            handleWorkoutToggle();
                        } else {
                            console.log('Workout not active, ignoring stop command');
                        }
                        break;
                    case 'SKIP_EXERCISE':
                        console.log('SKIP_EXERCISE command detected');
                        speak("Voice command confirmed.");
                        if (isResting) handleSkipRest();
                        else handleSkipExercise();
                        break;
                    case 'ADD_REST': 
                        console.log('ADD_REST command detected');
                        speak("Voice command confirmed.");
                        handleAddRestTime(); // Remove the isResting check since handleAddRestTime now handles both cases
                        break;
                    case 'START_ROUTINE':
                        console.log('START_ROUTINE command detected, entity:', command.entity);
                        if(command.entity && !isWorkoutActive) {
                            speak(`Voice command confirmed. Starting ${command.entity} routine.`);
                            startRoutine(command.entity);
                        }
                        break;
                    case 'SWITCH_EXERCISE':
                        console.log('SWITCH_EXERCISE command detected, entity:', command.entity);
                        if (command.entity && !isWorkoutActive) {
                            console.log('Looking for exercise:', command.entity);
                            console.log('Available exercises:', allExercises.map(ex => ex.name));
                            
                            // Try exact match first
                            let foundExercise = allExercises.find(ex => ex.name === command.entity);
                            
                            // If no exact match, try case-insensitive
                            if (!foundExercise) {
                                foundExercise = allExercises.find(ex => 
                                    ex.name.toLowerCase() === command.entity.toLowerCase()
                                );
                            }
                            
                            // If still no match, try with space/dash variations
                            if (!foundExercise) {
                                foundExercise = allExercises.find(ex => 
                                    ex.name.toLowerCase().replace('-', ' ') === command.entity.toLowerCase().replace('-', ' ')
                                );
                            }
                            
                            console.log('Found exercise:', foundExercise);
                            if (foundExercise) {
                                console.log('Switching to exercise:', foundExercise.name);
                                speak(`Voice command confirmed. Switching to ${foundExercise.name}.`);
                                handleExerciseChange(foundExercise.name);
                            } else {
                                console.log('Exercise not found!');
                                speak("Sorry, I didn't recognize that exercise.");
                            }
                        } else {
                            console.log('Cannot switch exercise - missing entity or workout active');
                        }
                        break;
                    default: 
                        console.log('Unknown command intent:', command.intent);
                        speak("Sorry, I didn't understand that command.");
                        break;
                }
                
                // Clear the command after processing to prevent it from persisting
                console.log('Clearing command after processing');
                clearCommand();
            }
        }
    }, [command, isListening, isWorkoutActive, isResting, handleWorkoutToggle, handleExerciseChange, handleSkipExercise, handleSkipRest, handleAddRestTime, clearCommand]);

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
                    <VideoFeed
                        onPoseUpdate={handlePoseUpdate}
                        isWorkoutActive={isWorkoutActive}
                        currentExercise={currentExercise}
                        feedbackColor={feedback.feedbackColor}
                        currentStage={stage}
                        currentRepCount={repCount}
                    />
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
                        onSkipRest={handleSkipRest}
                        onAddRestTime={handleAddRestTime}
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
                    isFormCorrect={isFormCorrect}
                    isWorkoutActive={isWorkoutActive}
                />
            </main>
        </div>
    );
}

export default Workout;

