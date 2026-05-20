#!/bin/bash
# Quick setup script for Workflow Tracker

echo "🚀 Workflow Tracker Setup"
echo "========================"

# Backend setup
echo ""
echo "📦 Setting up backend..."
python -m venv env
source env/bin/activate 2>/dev/null || . env/Scripts/activate

pip install -r requirements.txt -q
cd backend
python manage.py migrate -q
echo "✓ Backend ready"
cd ..

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd frontend
npm install -q
echo "✓ Frontend ready"
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the application:"
echo "  1. Backend:  cd backend && source ../env/bin/activate && python manage.py runserver"
echo "  2. Frontend: cd frontend && npm run dev"
echo ""
echo "Backend API:  http://127.0.0.1:8000/api/applications/"
echo "Frontend:     http://localhost:5173"
echo ""
