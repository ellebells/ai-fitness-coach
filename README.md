AI Fitness Coach
A real-time, browser-based personal trainer that uses the orchestration of three distinct AI models to provide live form correction, rep counting, and voice-activated control.

This project was developed as a submission for the CM3070 Project module, based on the "Orchestrating AI models to achieve a goal" template. It is a full-stack web application built with React, Flask, and TensorFlow.js.

Live Demo Features

Real-Time Pose Estimation: Uses the MoveNet model via TensorFlow.js to render a live skeleton over the user's video feed.

AI-Powered Form Correction: Provides immediate, color-coded feedback on user form for 9 different exercises by analyzing joint angles.

Automatic Rep & Duration Counting: Accurately counts repetitions for dynamic exercises (Squats, Push-ups) and tracks time for isometric holds (Plank, Wall Sit).

Three-Model AI Orchestration:

MoveNet (Vision): Analyzes video frames for pose keypoints.

Vosk (Speech): Transcribes user voice commands offline.

BART (Language): A transformer model that performs zero-shot classification to understand the intent behind the user's speech.

Voice Control: Allows for hands-free operation, such as "start workout," "stop," or "switch to squats."

Persistent User History: Supports user login and guest mode, saving workout history to localStorage.

Progress Visualization: Includes a history page with dynamic charts to track performance over time.

Privacy-First Design: All video processing is done client-side in the browser. Only small audio clips are sent to the local backend for transcription.

Technical Stack
Frontend: React, React Router, Chart.js, Axios

Backend: Python, Flask, Flask-CORS

AI / Machine Learning:

TensorFlow.js (MoveNet)

Vosk (Speech-to-Text)

Hugging Face Transformers (Zero-Shot Intent Classification)

Project Structure
/ai-fitness-coach
├── /backend         # Python Flask Server
│   ├── /models      # Pre-trained AI models (Vosk, Transformer)
│   ├── app.py       # Main Flask application
│   └── requirements.txt
│
├── /frontend        # React Client Application
│   ├── /src
│   │   ├── /components
│   │   ├── /hooks   # Custom hooks for PoseNet, Speech Recognition, etc.
│   │   ├── /pages
│   │   └── /utils   # Core evaluation and drawing logic
│   └── package.json
│
└── /scripts         # Helper scripts

Setup and Installation
Prerequisites
Node.js (v16 or later)

Python (v3.11 recommended)

Git

1. Clone the Repository
git clone <your-repo-url>
cd ai-fitness-coach

2. Backend Setup
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the environment
# On Windows (Git Bash)
source venv/Scripts/activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download and place the Vosk model in /backend/models/
# (See Vosk website for the small-en-us model)

3. Frontend Setup
# From the root directory
cd frontend

# Install dependencies
npm install

4. Running the Application
You can start both servers concurrently using the provided script. Use a Git Bash terminal on Windows.

# From the root directory
./scripts/start.sh

Alternatively, you can run them in two separate terminals:

Backend Terminal: cd backend, activate venv, then python app.py

Frontend Terminal: cd frontend, then npm start

The application will be available at http://localhost:3000.