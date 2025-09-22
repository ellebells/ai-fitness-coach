Orchestrating AI models to achieve a goal.The AI Fitness Coach is a browser-based application that uses multiple pre-trained AI models to provide real-time feedback and guidance for a variety of physical exercises. It acts as a virtual personal trainer, helping users improve their form, count repetitions, and follow structured workout routines, all from the privacy of their own home.

This project was developed based on the "Orchestrating AI models to achieve a goal" template. It is a full-stack web application built with React, Flask, and TensorFlow.js.
=======
The core of the project is the successful orchestration of three distinct AI models operating on different data types, which are vision, audio, and language to create a seamless, interactive, and intelligent coaching experience.
>>>>>>> c0fa5a8 (feat: Enhance workout functionality with new exercise images and speech recognition improvements)

# Core Features
Real-Time Pose Estimation: Utilizes the MoveNet model to track 17 key body points, overlaying a live skeleton on the user's video feed for immediate visual feedback.

AI-Powered Form Correction: A sophisticated rule-based engine, grounded in biomechanical principles, analyzes joint angles in real-time to provide immediate, actionable feedback (e.g., "Hips too low," "Great form!").

Smart Timers & Rep Counting: Automatically counts repetitions for dynamic exercises (e.g., Squats, Push-ups) and tracks hold times for isometric exercises (e.g., Planks).

Intelligent Timer Activation: A key feature where the timer for duration-based exercises will not start until the AI determines the user is holding the correct form.

Advanced Voice Control: A hands-free interface powered by a two-stage AI pipeline. OpenAI's Whisper model provides high-accuracy speech-to-text, and a BART language model interprets the user's intent to control the application.

Structured Workout Routines: Users can select from pre-defined workout routines (e.g., "Core Strength") that guide them through a sequence of exercises with automated rest periods.

Full User Control: Users can skip exercises, skip rest periods, or add more rest time using both UI buttons and natural language voice commands.

Persistent History & Progress Tracking: Workout sessions are saved to the browser's local storage. A dedicated history page displays past sessions and visualizes progress over time with dynamic line charts.

Privacy-First Design: All video processing is done client-side in the browser. Only short, temporary audio clips for voice commands are sent to the backend for processing. No personal video data ever leaves the user's machine.

# Three-Model Orchestration PipelineThe project successfully orchestrates three pre-trained models in a seamless pipeline:

Vision Model (MoveNet): The "Eyes" of the system. It processes video frames to determine the user's body position in real-time.

Speech-to-Text Model (Whisper): The "Ears" of the system. It processes audio waveforms to accurately transcribe the user's spoken words into text, even in noisy environments.

Language Model (BART): The "Brain" of the system. It processes the transcribed text to understand the user's intent (e.g., "start a routine") and extracts key information or entities (e.g., the specific routine name).This pipeline allows a user to speak a natural command like "Start the core strength routine," which is transcribed by Whisper, understood by BART, and then executed by the application, which in turn uses MoveNet to provide coaching.

# Technical StackFrontend: 

React (with Hooks), JavaScript, HTML5, CSS
AI/ML: TensorFlow.js (for MoveNet)
Charting: Chart.js & react-chartjs-2
Web APIs: WebRTC (getUserMedia for camera/mic)

Backend: Python with Flask
AI/ML: Hugging Face Transformers (for Whisper and BART), PyTorch
Audio Processing: PyDub, Librosa, SoundFile
System Dependency: FFmpeg (for server-side audio conversion)

# Setup and Installation
Prerequisites: 
Python 3.11 (Python 3.12+ may cause issues with dependencies)
Node.js (v16 or higher) & npm
Git
FFmpeg

# Step 1: Clone the Repositorygit clone <your-repo-url>
cd ai-fitness-coach

# Step 2: Backend Setup
Navigate to the backend directory:
cd backend

# Create and activate a Python 3.11 virtual environment:
py -3.11 -m venv venv

## Activate the environment
## On Windows (Git Bash)
source venv/Scripts/activate

## On Windows (PowerShell)
.\venv\Scripts\activate

## Install Python dependencies:
pip install -r requirements.txt

# Step 3: Frontend SetupNavigate to the frontend directory:# From the root directory
cd frontend

## Install Node.js dependencies:
npm install

# Step 4: Running the Application
You must have two terminals open to run both the backend and frontend servers simultaneously.

## Start the Backend Server:
In your first terminal, navigate to /backend and activate the virtual environment.
Run the Flask application:
python app.py

The server will start on http://localhost:5000. Wait for the AI models to load. The first time you run this, it will download the Whisper and BART models, which can take several minutes.

# Start the Frontend Server:
In your second terminal, navigate to /frontend.
Run the React application:npm start
Your browser should automatically open to http://localhost:3000.

<<<<<<< HEAD
Frontend Terminal: cd frontend, then npm start

The application will be available at http://localhost:3000.
=======
The application is now running and ready to use!
>>>>>>> c0fa5a8 (feat: Enhance workout functionality with new exercise images and speech recognition improvements)
