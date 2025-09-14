import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (name.trim() === '') {
      alert('Please enter your name.');
      return;
    }
    localStorage.setItem('userName', name);
    navigate('/workout');
  };

  const handleGuest = () => {
    // --- THIS IS THE FIX ---
    // Set 'Guest' as the user so the protected route allows access
    localStorage.setItem('userName', 'Guest');
    // ----------------------
    navigate('/workout');
  };

  return (
    <div className="login-container">
      <h1>AI Fitness Coach</h1>
      <p>Real-time pose analysis and voice commands</p>
      
      <input 
        type="text" 
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleStart()}
      />

      <button className="btn-primary" onClick={handleStart}>
        Start Training
      </button>
      <button className="btn-secondary" onClick={handleGuest}>
        Continue as Guest
      </button>
    </div>
  );
}

export default Login;

