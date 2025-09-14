#!/bin/bash
echo "--- Starting AI Fitness Coach ---"

# Start Backend Flask Server
echo "Starting Backend Server on port 5000..."
cd backend
source venv/bin/activate
# Using nohup to run in the background and redirect output to a log file
nohup flask run > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ../

# Start Frontend React Server
echo "Starting Frontend Server on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!npx create-react-app frontend

echo "---"
echo "Application is running!"
echo "Frontend available at http://localhost:3000"
echo "Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
echo "To stop the servers, you can use 'kill $BACKEND_PID $FRONTEND_PID'"