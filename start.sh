#!/bin/bash

echo ""
echo "  ██████╗ ██████╗  █████╗ ███╗   ██╗██████╗  █████╗ ██╗"
echo "  ██╔══██╗██╔══██╗██╔══██╗████╗  ██║██╔══██╗██╔══██╗██║"
echo "  ██████╔╝██████╔╝███████║██╔██╗ ██║██║  ██║███████║██║"
echo "  ██╔══██╗██╔══██╗██╔══██║██║╚██╗██║██║  ██║██╔══██║██║"
echo "  ██████╔╝██║  ██║██║  ██║██║ ╚████║██████╔╝██║  ██║██║"
echo "  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚═╝"
echo ""
echo "  AI Marketing Assistant - Setup Script"
echo "  ======================================="
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
  echo "  ⚠️  backend/.env not found!"
  echo ""
  echo "  Please create backend/.env with your Anthropic API key:"
  echo "  cp backend/.env.example backend/.env"
  echo "  Then edit it and add: ANTHROPIC_API_KEY=your_key_here"
  echo ""
  exit 1
fi

# Check API key is set
if grep -q "your_groq_api_key_here" backend/.env; then
  echo "  ⚠️  Please set your ANTHROPIC_API_KEY in backend/.env"
  echo ""
  exit 1
fi

echo "  ✅ API key found"
echo ""

# Install backend dependencies
echo "  📦 Installing backend dependencies..."
cd backend && npm install --silent
echo "  ✅ Backend ready"
echo ""
cd ..

# Install frontend dependencies
echo "  📦 Installing frontend dependencies..."
cd frontend && npm install --silent
echo "  ✅ Frontend ready"
echo ""
cd ..

echo "  🚀 Starting BrandAI..."
echo ""
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo ""

# Start both in background
cd backend && npm start &
BACKEND_PID=$!
cd ..

sleep 2

cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "  ✨ BrandAI is running!"
echo "  Open: http://localhost:3000"
echo ""
echo "  Press Ctrl+C to stop"
echo ""

# Handle Ctrl+C
trap "echo ''; echo '  Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT

wait
