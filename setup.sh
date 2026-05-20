#!/bin/bash
set -euo pipefail

# Quick setup script for Workflow Tracker

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Workflow Tracker Setup"
echo "========================"

PYTHON_BIN="$(command -v python3 || true)"
if [[ -z "$PYTHON_BIN" ]]; then
	echo "Error: python3 is required but was not found in PATH."
	exit 1
fi

# Backend setup
echo ""
echo "📦 Setting up backend..."
"$PYTHON_BIN" -m venv env
source env/bin/activate

python -m pip install --upgrade pip -q
python -m pip install -r requirements.txt -q
cd backend
python manage.py migrate --noinput
python manage.py shell <<'PY'
from applications.models import Application

Application.objects.update_or_create(
	tracking_number='APP-681F3682',
	defaults={
		'applicant_name': 'Brian Smith',
		'applicant_email': 'brian.smith@example.com',
		'company_name': 'Summit Brands',
		'application_type': Application.ApplicationType.RENEWAL,
		'description': 'Renewal request pending supporting documents.',
		'status': Application.Status.NEED_MORE_INFORMATION,
		'reviewer_comment': 'Need more info',
	},
)
PY
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
echo "Demo detail:   http://127.0.0.1:8000/api/applications/APP-681F3682/"
echo ""
