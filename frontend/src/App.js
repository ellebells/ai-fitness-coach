import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import '@tensorflow/tfjs-backend-webgl';

import Login from './pages/Login/Login';
import Workout from './pages/Workout/Workout';
import History from './pages/History/History';
import './index.css'; 

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;