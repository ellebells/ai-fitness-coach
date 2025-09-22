import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './History.css';

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function History() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState('');
    const [userName, setUserName] = useState('');
    const [settings, setSettings] = useState({
        contrastMode: 'normal',
        fontSize: 'normal',
        reduceMotion: false
    });

    useEffect(() => {
        const user = localStorage.getItem('userName') || 'guest';
        const isGuest = localStorage.getItem('isGuestSession') === 'true';
        // Display "Guest" for guest sessions instead of the long session ID
        setUserName(isGuest ? 'Guest' : user);
        const storedHistory = JSON.parse(localStorage.getItem(`${user}_history`)) || [];
        setHistory(storedHistory.reverse()); // Show most recent first

        // Load accessibility settings
        const defaultSettings = {
            contrastMode: 'normal',
            fontSize: 'normal',
            reduceMotion: false
        };

        const savedSettings = localStorage.getItem('accessibilitySettings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                setSettings({ ...defaultSettings, ...parsedSettings });
            } catch (error) {
                console.error('Error parsing accessibility settings:', error);
                setSettings(defaultSettings);
            }
        } else {
            setSettings(defaultSettings);
        }
    }, []);

    // Effect to apply theme and accessibility settings to the body
    useEffect(() => {
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('theme-normal', 'theme-high-contrast', 'theme-low-contrast');
        body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-extra-large');
        body.classList.remove('reduce-motion');
        
        // Reset any inline styles
        body.style.filter = '';
        
        // Apply new theme classes
        body.classList.add(`theme-${settings.contrastMode === 'high' ? 'high-contrast' : settings.contrastMode === 'low' ? 'low-contrast' : 'normal'}`);
        body.classList.add(`font-size-${settings.fontSize}`);
        
        if (settings.reduceMotion) {
            body.classList.add('reduce-motion');
        }

        // Apply specific contrast filters if needed
        if (settings.contrastMode === 'high') {
            // High contrast styling is handled via CSS classes
            body.style.backgroundColor = '#000000';
            body.style.color = '#ffffff';
        } else if (settings.contrastMode === 'low') {
            // Apply low contrast filter
            body.style.filter = 'contrast(0.6) brightness(1.3)';
        }

        // Cleanup function to reset styles when component unmounts
        return () => {
            body.classList.remove('theme-normal', 'theme-high-contrast', 'theme-low-contrast');
            body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-extra-large');
            body.classList.remove('reduce-motion');
            body.style.filter = '';
            body.style.backgroundColor = '';
            body.style.color = '';
        };
    }, [settings.contrastMode, settings.fontSize, settings.reduceMotion]);

    // Effect to update the chart when the selected exercise changes
    useEffect(() => {
        if (selectedExercise && history.length > 0) {
            const dataPoints = [];
            history.forEach(session => {
                session.workout.forEach(exercise => {
                    if (exercise.name === selectedExercise) {
                        dataPoints.push({
                            x: new Date(session.date),
                            y: exercise.completed,
                        });
                    }
                });
            });

            // Sort data by date just in case
            dataPoints.sort((a, b) => a.x - b.x);

            // Choose colors based on contrast mode
            let lineColor = '#00FF00'; // Default green
            let pointBackgroundColor = '#00FF00';
            let pointBorderColor = '#00FF00';

            if (settings.contrastMode === 'high') {
                lineColor = '#FFFFFF';
                pointBackgroundColor = '#FFFFFF';
                pointBorderColor = '#FFFFFF';
            } else if (settings.contrastMode === 'low') {
                lineColor = '#888888';
                pointBackgroundColor = '#888888';
                pointBorderColor = '#888888';
            }

            setChartData({
                labels: dataPoints.map(d => d.x.toLocaleDateString()),
                datasets: [
                    {
                        label: `${selectedExercise} Progress (${selectedExercise === 'Plank' ? 'seconds' : 'reps'})`,
                        data: dataPoints.map(d => d.y),
                        fill: false,
                        borderColor: lineColor,
                        backgroundColor: pointBackgroundColor,
                        pointBackgroundColor: pointBackgroundColor,
                        pointBorderColor: pointBorderColor,
                        pointBorderWidth: 2,
                        tension: 0.1,
                    },
                ],
            });
        }
    }, [selectedExercise, history, settings.contrastMode]);
    
    // Keyboard shortcuts handler
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Only handle shortcuts when not typing in an input
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || 
                event.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (event.key.toLowerCase()) {
                case 'h': // H - Toggle back to workout
                    navigate('/workout');
                    break;
                case 'escape': // Escape - Go back to workout
                    navigate('/workout');
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [navigate]);
    
    // Get a unique list of exercises the user has performed
    const performedExercises = [...new Set(history.flatMap(session => session.workout.map(ex => ex.name)))];

    return (
        <div className="history-container">
            <header className="history-header">
                <h1>Workout History</h1>
                <p>User: <strong>{userName}</strong></p>
                <button className="btn-primary" onClick={() => navigate('/workout')}>
                    Back to Workout
                </button>
            </header>

            {history.length === 0 ? (
                <p className="no-history">No workout history found. Complete a session to see your progress!</p>
            ) : (
                <div className="history-content">
                    <div className="chart-section">
                        <h2>Progress Chart</h2>
                        <select 
                          onChange={(e) => setSelectedExercise(e.target.value)} 
                          value={selectedExercise}
                          className="exercise-select"
                        >
                            <option value="">Select an exercise to see progress</option>
                            {performedExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                        </select>
                        {chartData ? (
                            <Line 
                                data={chartData} 
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            labels: {
                                                color: settings.contrastMode === 'high' ? '#FFFFFF' : 
                                                       settings.contrastMode === 'low' ? '#666666' : '#e0e0e0'
                                            }
                                        },
                                        title: {
                                            display: true,
                                            text: `${selectedExercise} Progress Over Time`,
                                            color: settings.contrastMode === 'high' ? '#FFFFFF' : 
                                                   settings.contrastMode === 'low' ? '#666666' : '#e0e0e0'
                                        }
                                    },
                                    scales: {
                                        x: {
                                            ticks: {
                                                color: settings.contrastMode === 'high' ? '#FFFFFF' : 
                                                       settings.contrastMode === 'low' ? '#666666' : '#e0e0e0'
                                            },
                                            grid: {
                                                color: settings.contrastMode === 'high' ? '#FFFFFF' : 
                                                       settings.contrastMode === 'low' ? '#CCCCCC' : '#444444'
                                            }
                                        },
                                        y: {
                                            ticks: {
                                                color: settings.contrastMode === 'high' ? '#FFFFFF' : 
                                                       settings.contrastMode === 'low' ? '#666666' : '#e0e0e0'
                                            },
                                            grid: {
                                                color: settings.contrastMode === 'high' ? '#FFFFFF' : 
                                                       settings.contrastMode === 'low' ? '#CCCCCC' : '#444444'
                                            }
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <p>Please select an exercise from the dropdown to view your progress chart.</p>
                        )}
                    </div>
                    <div className="session-list">
                        <h2>Past Sessions</h2>
                        {history.map((session, index) => (
                            <div key={index} className="session-card">
                                <h3>Session on {new Date(session.date).toLocaleString()}</h3>
                                <ul>
                                    {session.workout.map((exercise, i) => (
                                        <li key={i}>
                                            <strong>{exercise.name}:</strong> {exercise.completed} {exercise.type === 'reps' ? 'reps' : 'seconds'}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default History;