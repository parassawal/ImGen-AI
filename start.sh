#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup INT

echo "🚀 Starting ImGen AI..."

# Start Backend
echo ">> Starting Backend on port 8000..."
source venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo ">> Starting Frontend on port 5173..."
cd frontend
npm run dev -- --host &
FRONTEND_PID=$!

# Wait
wait
