import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Controls from '../../components/Controls';
import VideoFeed from '../../components/VideoFeed';
import StatusPanel from '../../components/StatusPanel';
import WorkoutModal from '../../components/WorkoutModal';
import DurationTimerModal from '../../components/DurationTimerModal';
import SettingsModal from '../../components/SettingsModal';
import { useWorkoutManager } from '../../hooks/useWorkoutManager';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { speak } from '../../utils/speechUtils';
import { testBackendConnection, debugApiEndpoints } from '../../config/apiUtils';
import './Workout.css';

// --- Data Structures ---
const allExercises = [
    { name: 'Plank', type: 'duration', target: 30 }, { name: 'Push-up', type: 'reps', target: 10 }, { name: 'Squat', type: 'reps', target: 15 },
    { name: 'Bridge', type: 'reps', target: 15 }, { name: 'Bird-dog', type: 'duration', target: 45 }, { name: 'High Knees', type: 'reps', target: 30 },
    { name: 'Lunges', type: 'reps', target: 20 }, { name: 'Superman', type: 'reps', target: 12 }, { name: 'Wall-sit', type: 'duration', target: 30 },
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
    const [currentExercise, setCurrentExercise] = useState(allExercises.find(ex => ex.name === 'Squat') || allExercises[0]);
    
    // State for workout routines
    const [showRoutineModal, setShowRoutineModal] = useState(false);
    const [activeRoutine, setActiveRoutine] = useState(null);
    const [exerciseIndex, setExerciseIndex] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [restTimeLeft, setRestTimeLeft] = useState(0);
    
    // State for duration timer modal
    const [showDurationModal, setShowDurationModal] = useState(false);
    const [selectedDurationExercise, setSelectedDurationExercise] = useState(null);
    const [useCountdownTimer, setUseCountdownTimer] = useState(false);
    
    // State for settings modal and accessibility preferences
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [settings, setSettings] = useState(() => {
        // Load settings from localStorage or use defaults
        try {
            const savedSettings = localStorage.getItem('accessibilitySettings');
            return savedSettings ? JSON.parse(savedSettings) : {
                voiceMuted: false,
                contrastMode: 'normal', // 'normal', 'high', 'low'
                fontSize: 'normal', // 'small', 'normal', 'large', 'extra-large'
                reduceMotion: false
            };
        } catch (error) {
            console.error('Error loading settings from localStorage:', error);
            return {
                voiceMuted: false,
                contrastMode: 'normal',
                fontSize: 'normal',
                reduceMotion: false
            };
        }
    });
    
    // State to track if the user's form is correct for the timer
    const [isFormCorrect, setIsFormCorrect] = useState(false);
    
    // State to track previous rep count for voice feedback
    const [prevRepCount, setPrevRepCount] = useState(0);

    // Pass the new state to the hook
    const { repCount, setRepCount, timer, stage, setStage, sessionLog, setSessionLog, logExercise } = useWorkoutManager(isWorkoutActive, currentExercise, isFormCorrect, useCountdownTimer);
    const { isListening, command, startListening, clearCommand } = useSpeechRecognition();
    const [transcription, setTranscription] = useState('Click "Voice Command" to start.');
    
    // Custom speak function that respects voice mute setting
    const speakIfEnabled = useCallback((text) => {
        if (!settings.voiceMuted) {
            speak(text);
        }
    }, [settings.voiceMuted]);

    // Handle settings changes and persist to localStorage
    const handleSettingsChange = useCallback((newSettings) => {
        setSettings(newSettings);
        try {
            localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
        } catch (error) {
            console.error('Error saving settings to localStorage:', error);
        }
    }, []);
    
    useEffect(() => {
        const storedName = localStorage.getItem('userName');
        const isGuest = localStorage.getItem('isGuestSession') === 'true';
        if (storedName) {
            // Display "Guest" for guest sessions instead of the long session ID
            setUserName(isGuest ? 'Guest' : storedName);
        }
        
        // Test backend connection and debug API endpoints
        debugApiEndpoints();
        testBackendConnection().then(result => {
            if (!result.success) {
                console.error('❌ Backend connection failed:', result.error);
            }
        });
    }, []);

    // Effect to apply theme and accessibility settings to the body
    useEffect(() => {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('theme-normal', 'theme-high', 'theme-low');
        body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-extra-large');
        body.classList.remove('reduce-motion');
        
        // Force reflow to ensure changes take effect
        // eslint-disable-next-line no-unused-expressions
        body.offsetHeight;
        
        // Apply new theme classes
        body.classList.add(`theme-${settings.contrastMode}`);
        body.classList.add(`font-size-${settings.fontSize}`);
        
        if (settings.reduceMotion) {
            body.classList.add('reduce-motion');
        }
        
        // Apply immediate inline styles for testing
        if (settings.contrastMode === 'high') {
            body.style.backgroundColor = '#000000';
            body.style.color = '#ffffff';
            body.style.border = '5px solid red';
        } else if (settings.contrastMode === 'low') {
            body.style.backgroundColor = '#f8f8f8';
            body.style.color = '#666666';
            body.style.border = '5px solid blue';
            body.style.filter = 'contrast(0.6) brightness(1.3)';
        } else {
            body.style.backgroundColor = '#121212';
            body.style.color = '#e0e0e0';
            body.style.border = '5px solid green';
            body.style.filter = '';
        }
        
        return () => {
            // Cleanup on unmount
            body.classList.remove('theme-normal', 'theme-high', 'theme-low');
            body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-extra-large');
            body.classList.remove('reduce-motion');
            body.style.backgroundColor = '';
            body.style.color = '';
            body.style.border = '';
            body.style.filter = '';
        };
    }, [settings.contrastMode, settings.fontSize, settings.reduceMotion]);

    const startRoutine = (routineKey, customizedRoutine = null) => {
        // Use the customized routine if provided, otherwise use the default template
        const routine = customizedRoutine || workoutTemplates[routineKey];
        setActiveRoutine(routine);
        setExerciseIndex(0);
        setCurrentExercise(routine.exercises[0]);
        setShowRoutineModal(false);
        
        const customizationMessage = customizedRoutine ? " with your custom targets" : "";
        setFeedback({ feedback: `Starting routine: ${routine.name}`, feedbackColor: 'white' });
        speakIfEnabled(`${routine.name} routine selected${customizationMessage}. Get ready!`);
    };

    const handlePoseUpdate = (poseFeedback) => {
        if (isWorkoutActive && !isResting) {
            setFeedback(poseFeedback);
            if (poseFeedback.repCount !== undefined && poseFeedback.repCount !== repCount) {
                setRepCount(poseFeedback.repCount);
            }
            if (poseFeedback.stage && poseFeedback.stage !== stage) {
                setStage(poseFeedback.stage);
            }
            if (poseFeedback.isCorrectForm !== undefined) setIsFormCorrect(poseFeedback.isCorrectForm);
        }
    };

    const handleExerciseChange = useCallback((exerciseName) => {
        const selected = allExercises.find(ex => ex.name === exerciseName);
        if (selected) {
            // For duration exercises, show the custom modal
            if (selected.type === 'duration') {
                setSelectedDurationExercise(selected);
                setShowDurationModal(true);
            } else {
                // For rep exercises, directly set the exercise
                setCurrentExercise(selected);
                setActiveRoutine(null);
                setUseCountdownTimer(false);
                speakIfEnabled(`${exerciseName} selected.`);
                // Reset exercise state
                setIsFormCorrect(false);
                setFeedback({ feedback: 'Ready to start.', feedbackColor: 'white' });
                setStage(null);
                setRepCount(0);
                setPrevRepCount(0);
                console.log(`Exercise changed to ${exerciseName}. Stage and rep count reset.`);
            }
        }
    }, [setStage, setRepCount]);

    const handleDurationModalConfirm = useCallback((config) => {
        if (selectedDurationExercise) {
            // Create a copy of the exercise with the custom duration
            const exerciseWithCustomDuration = {
                ...selectedDurationExercise,
                target: config.duration
            };
            
            setCurrentExercise(exerciseWithCustomDuration);
            setActiveRoutine(null);
            setUseCountdownTimer(config.useCountdown);
            
            speakIfEnabled(`${selectedDurationExercise.name} selected with ${config.useCountdown ? 'countdown' : 'count-up'} timer for ${config.duration} seconds.`);
            
            // Reset exercise state
            setIsFormCorrect(false);
            setFeedback({ feedback: 'Ready to start.', feedbackColor: 'white' });
            setStage(null);
            setRepCount(0);
            setPrevRepCount(0);
            
            console.log(`Duration exercise ${selectedDurationExercise.name} configured: ${config.duration}s, countdown: ${config.useCountdown}`);
        }
        setSelectedDurationExercise(null);
    }, [selectedDurationExercise, setStage, setRepCount]);

    const handleDurationModalClose = useCallback(() => {
        setShowDurationModal(false);
        setSelectedDurationExercise(null);
    }, []);
    
    const advanceToNextExercise = useCallback(() => {
        if (!activeRoutine || exerciseIndex >= activeRoutine.exercises.length - 1) {
            setIsWorkoutActive(false);
            setActiveRoutine(null);
            setFeedback({ feedback: 'Routine complete! Amazing work!', feedbackColor: 'green' });
            speakIfEnabled("Routine complete. Amazing work!");
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
            speakIfEnabled("Workout started! Let's go!");
        } else {
            speakIfEnabled("Workout stopped. Great effort!");
        }
    }, [isWorkoutActive, speakIfEnabled]);
    
    // Effect to handle workout session logging and state reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
      if (!isWorkoutActive && (sessionLog.length > 0 || logExercise(true))) {
          const finalLog = logExercise(true); 
          let completeLog = [...sessionLog];
          if(finalLog && !sessionLog.find(l => l.timestamp === finalLog.timestamp)) {
              completeLog.push(finalLog);
          }
          
          // Only log sessions that have meaningful activity 
          // Duration exercises need at least 10 seconds, rep exercises need at least 3 reps
          const hasValidActivity = completeLog.some(log => 
            (log.type === 'duration' && log.completed >= 10) || 
            (log.type === 'reps' && log.completed >= 3)
          );
          
          if (completeLog.length > 0 && hasValidActivity) {
            const user = localStorage.getItem('userName') || 'guest';
            const history = JSON.parse(localStorage.getItem(`${user}_history`)) || [];
            const newHistory = [...history, { date: new Date().toISOString(), workout: completeLog }];
            localStorage.setItem(`${user}_history`, JSON.stringify(newHistory));
          }
      } else if (isWorkoutActive) {
        setSessionLog([]);
        setIsFormCorrect(false);
        setFeedback({ feedback: 'Starting workout...', feedbackColor: 'white' });
      }
    }, [isWorkoutActive, logExercise]); // Removed sessionLog and setSessionLog to prevent infinite loop
    
    // Effect to provide voice feedback when rep count increases
    useEffect(() => {
        if (isWorkoutActive && !isResting && currentExercise.type === 'reps' && repCount > prevRepCount && repCount > 0) {
            speakIfEnabled(`${repCount}`);
            setPrevRepCount(repCount);
        } else if (repCount === 0 && prevRepCount > 0) {
            // Reset when exercise changes or workout stops
            setPrevRepCount(0);
        }
    }, [repCount, isWorkoutActive, isResting, currentExercise.type, prevRepCount, speakIfEnabled]);
    
    useEffect(() => {
        if (!isWorkoutActive || !activeRoutine || isResting) return;
        const current = activeRoutine.exercises[exerciseIndex];
        let isComplete = false;
        
        if (current.type === 'reps') {
            isComplete = repCount >= current.target;
        } else if (current.type === 'duration') {
            // For countdown mode: timer reaches 0
            // For count-up mode: timer reaches target
            isComplete = useCountdownTimer ? timer <= 0 : timer >= current.target;
        }
        
        if (isComplete) {
            logExercise();
            advanceToNextExercise();
        }
    }, [repCount, timer, isWorkoutActive, activeRoutine, exerciseIndex, isResting, logExercise, advanceToNextExercise, useCountdownTimer]);
    
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
                speakIfEnabled("Let's begin.");
            }
        }
    }, [isResting, restTimeLeft, activeRoutine, exerciseIndex, isWorkoutActive]);

    const handleSkipExercise = useCallback(() => {
        if (!isWorkoutActive || !activeRoutine) return;
        speakIfEnabled("Exercise skipped.");
        logExercise();
        advanceToNextExercise();
    }, [isWorkoutActive, activeRoutine, logExercise, advanceToNextExercise, speakIfEnabled]);

    const handleSkipRest = useCallback(() => {
        if (!isResting) return;
        speakIfEnabled("Rest skipped. Let's continue!");
        setRestTimeLeft(0);
    }, [isResting, speakIfEnabled]);

    const handleAddRestTime = useCallback(() => {
        if(isResting) {
            // If already resting, add 15 seconds to current rest
            setRestTimeLeft(prev => prev + 15);
            speakIfEnabled("15 seconds added to rest time.");
        } else {
            // If not resting, start a rest period of 15 seconds
            setIsResting(true);
            setRestTimeLeft(15);
            setFeedback({ feedback: 'Rest time added!', feedbackColor: 'cyan' });
            speakIfEnabled("Rest break started. Take 15 seconds.");
        }
    }, [isResting, speakIfEnabled]);

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
                            speakIfEnabled("Voice command confirmed. Starting workout!");
                            handleWorkoutToggle();
                        } else {
                            console.log('Workout already active, ignoring start command');
                        }
                        break;
                    case 'STOP_WORKOUT': 
                        console.log('STOP_WORKOUT command detected, isWorkoutActive:', isWorkoutActive);
                        if (isWorkoutActive) {
                            console.log('Stopping workout...');
                            speakIfEnabled("Voice command confirmed. Stopping workout.");
                            handleWorkoutToggle();
                        } else {
                            console.log('Workout not active, ignoring stop command');
                        }
                        break;
                    case 'SKIP_EXERCISE':
                        console.log('SKIP_EXERCISE command detected');
                        speakIfEnabled("Voice command confirmed.");
                        if (isResting) handleSkipRest();
                        else handleSkipExercise();
                        break;
                    case 'ADD_REST': 
                        console.log('ADD_REST command detected');
                        console.log('Current state - activeRoutine:', activeRoutine, 'isWorkoutActive:', isWorkoutActive);
                        
                        // If we're doing a single exercise (no active routine), stop the workout
                        if (!activeRoutine && isWorkoutActive) {
                            console.log('Single exercise detected, stopping workout instead of adding rest');
                            speakIfEnabled("Voice command confirmed. Ending workout.");
                            handleWorkoutToggle();
                        } else {
                            // If we're in a routine, add rest time
                            console.log('Routine active, adding rest time');
                            speakIfEnabled("Voice command confirmed. Adding rest time.");
                            handleAddRestTime();
                        }
                        break;
                    case 'START_ROUTINE':
                        console.log('START_ROUTINE command detected, entity:', command.entity);
                        if(command.entity && !isWorkoutActive) {
                            speakIfEnabled(`Voice command confirmed. Starting ${command.entity} routine.`);
                            startRoutine(command.entity);
                        }
                        break;
                    case 'SWITCH_EXERCISE':
                        console.log('SWITCH_EXERCISE command detected, entity:', command.entity);
                        if (command.entity) {
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
                                speakIfEnabled(`Voice command confirmed. Switching to ${foundExercise.name}.`);
                                handleExerciseChange(foundExercise.name);
                            } else {
                                console.log('Exercise not found!');
                                speakIfEnabled("Sorry, I didn't recognize that exercise.");
                            }
                        } else {
                            console.log('Cannot switch exercise - missing entity');
                            speakIfEnabled("Sorry, I didn't recognize which exercise you want to do.");
                        }
                        break;
                    default: 
                        console.log('Unknown command intent:', command.intent);
                        speakIfEnabled("Sorry, I didn't understand that command.");
                        break;
                }
                
                // Clear the command after processing to prevent it from persisting
                console.log('Clearing command after processing');
                clearCommand();
            }
        }
    }, [command, isListening, isWorkoutActive, isResting, handleWorkoutToggle, handleExerciseChange, handleSkipExercise, handleSkipRest, handleAddRestTime, clearCommand, speakIfEnabled]);

    const handleLogout = () => {
        const isGuest = localStorage.getItem('isGuestSession') === 'true';
        const userName = localStorage.getItem('userName');
        
        // Clear guest session data completely
        if (isGuest && userName) {
            localStorage.removeItem(`${userName}_history`);
        }
        
        localStorage.removeItem('userName');
        localStorage.removeItem('isGuestSession');
        navigate('/');
    };

    // Keyboard shortcuts handler - placed after all function definitions
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Only handle shortcuts when no modal is open and not typing in an input
            if (showRoutineModal || showDurationModal || showSettingsModal || 
                event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || 
                event.target.tagName === 'TEXTAREA') {
                return;
            }

            // Handle Escape key
            if (event.key === 'Escape') {
                if (showRoutineModal) setShowRoutineModal(false);
                if (showDurationModal) setShowDurationModal(false);
                if (showSettingsModal) setShowSettingsModal(false);
                return;
            }

            switch (event.key.toLowerCase()) {
                case ' ': // Space - Start/Stop workout
                    event.preventDefault();
                    handleWorkoutToggle();
                    break;
                case 'r': // R - Reset timer
                    if (isWorkoutActive) {
                        // Reset current exercise
                        setRepCount(0);
                        setStage('ready');
                        speakIfEnabled("Exercise reset.");
                    }
                    break;
                case 'n': // N - Next exercise (skip)
                    if (isWorkoutActive) {
                        handleSkipExercise();
                    }
                    break;
                case 'p': // P - Previous exercise (manual rest skip when resting)
                    if (isResting) {
                        handleSkipRest();
                    }
                    break;
                case 'v': // V - Toggle voice commands
                    if (!isListening) {
                        startListening();
                    }
                    break;
                case 's': // S - Toggle settings
                    event.preventDefault();
                    setShowSettingsModal(prev => !prev);
                    break;
                case 'h': // H - Toggle history
                    if (window.location.pathname === '/history') {
                        navigate('/workout');
                    } else {
                        navigate('/history');
                    }
                    break;
                case 'l': // L - Logout
                    handleLogout();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    // Number keys for exercise selection
                    const exerciseNumber = parseInt(event.key);
                    if (exerciseNumber <= allExercises.length) {
                        const selectedExercise = allExercises[exerciseNumber - 1];
                        handleExerciseChange(selectedExercise.name);
                    }
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [
        showRoutineModal, showDurationModal, showSettingsModal, isWorkoutActive, 
        isListening, isResting, handleWorkoutToggle, handleSkipExercise, handleSkipRest, 
        startListening, navigate, handleLogout, setRepCount, setStage, speakIfEnabled
    ]);

    return (
        <div className="workout-container">
            {showRoutineModal && (
                <WorkoutModal 
                    routines={workoutTemplates} 
                    onSelectRoutine={startRoutine}
                    onClose={() => setShowRoutineModal(false)} 
                />
            )}
            <DurationTimerModal
                isOpen={showDurationModal}
                onClose={handleDurationModalClose}
                onConfirm={handleDurationModalConfirm}
                exerciseName={selectedDurationExercise?.name || ''}
                defaultTarget={selectedDurationExercise?.target || 30}
            />
            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                settings={settings}
                onSettingsChange={handleSettingsChange}
            />
            <header className="workout-header">
                <h1>AI Fitness Coach</h1>
                <div className="header-buttons">
                    <button className="btn-secondary" onClick={() => setShowSettingsModal(true)} title="Settings (S)">
                        ⚙️ Settings
                    </button>
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
                        currentExercise={currentExercise}
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
                        speakIfEnabled={speakIfEnabled}
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
                    settings={settings}
                />
            </main>
        </div>
    );
}

export default Workout;

