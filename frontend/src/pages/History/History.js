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

    useEffect(() => {
        const user = localStorage.getItem('userName') || 'guest';
        setUserName(user);
        const storedHistory = JSON.parse(localStorage.getItem(`${user}_history`)) || [];
        setHistory(storedHistory.reverse()); // Show most recent first
    }, []);

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

            setChartData({
                labels: dataPoints.map(d => d.x.toLocaleDateString()),
                datasets: [
                    {
                        label: `${selectedExercise} Progress (${selectedExercise === 'Plank' ? 'seconds' : 'reps'})`,
                        data: dataPoints.map(d => d.y),
                        fill: false,
                        borderColor: '#00FF00',
                        tension: 0.1,
                    },
                ],
            });
        }
    }, [selectedExercise, history]);
    
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
                            <Line data={chartData} />
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