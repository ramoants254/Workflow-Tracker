# Workflow Tracker — Application Management System

A full-stack Django + React application for managing workflow applications through multiple states (Draft → Submitted → Under Review → Approved/Rejected/Need More Information).

## Project Structure

```
.
├── backend/                    # Django backend (API)
│   ├── manage.py
│   ├── workflow_tracker/       # Django project settings
│   ├── applications/           # Django app with models and API
│   │   ├── models.py
│   │   ├── api.py
│   │   ├── admin.py
│   │   └── tests.py
│   └── db.sqlite3
├── frontend/                   # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── pages/
│   │   │   ├── ListApplications.jsx
│   │   │   ├── CreateApplication.jsx
│   │   │   ├── ApplicationDetail.jsx
│   │   │   └── EditApplication.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── requirements.txt
├── .gitignore
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- pip, npm

### Backend Setup

1. Create and activate virtual environment:
```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
cd backend
python manage.py migrate
```

4. Run tests (verify everything works):
```bash
python manage.py test applications --verbosity=2
```

5. Start development server:
```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/api/applications/`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Optional: copy `.env.example` to `.env` and adjust `VITE_API_BASE_URL` if your backend runs elsewhere.

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Features Implemented

### Backend API (Django + Django Ninja)

**Endpoints:**

- `POST /api/applications/` — Create a new draft application
- `GET /api/applications/` — List all applications
- `GET /api/applications/{tracking_number}/` — Get application details
- `PATCH /api/applications/{tracking_number}/` — Update draft or need-more-info applications
- `POST /api/applications/{tracking_number}/submit` — Submit draft or resubmit need-more-info applications
- `POST /api/applications/{tracking_number}/start-review` — Move submitted application to under review
- `POST /api/applications/{tracking_number}/decision` — Make reviewer decision (approve/reject/need-more-info)

**Workflow Rules Enforced:**

- Only `Draft` or `Need More Information` applications can be edited
- Only `Draft` or `Need More Information` applications can be submitted
- Only `Submitted` applications can start review
- Only `Under Review` applications can receive a reviewer decision
- Reviewer comments required for `Rejected` and `Need More Information` decisions
- `Approved` and `Rejected` applications are immutable
- `Need More Information` applications can be edited and resubmitted

**Data Model:**

- `tracking_number` — Unique identifier (auto-generated APP-XXXXXXXX format)
- `applicant_name`, `applicant_email`, `company_name` — Basic applicant info
- `application_type` — Recordation, Renewal, Change of Ownership, Change of Name, Discontinuation
- `description` — Additional application details
- `status` — Current workflow state (Draft, Submitted, Under Review, Need More Information, Approved, Rejected)
- `reviewer_comment` — Optional comment from reviewer
- `created_at`, `updated_at`, `submitted_at`, `reviewed_at` — Timestamps

### Frontend UI (React + Vite)

**Pages:**

1. **Applications List** (`/`) — Display all applications with required columns and link to details
2. **Create Application** (`/new`) — Form to create new draft application
3. **Application Detail** (`/applications/:trackingNumber`) — View full application details and take actions based on status
4. **Edit Application** (`/applications/:trackingNumber/edit`) — Edit draft or need-more-info applications

**Features:**

- Responsive dark-mode UI with glassmorphic design
- Real-time API integration
- Status badges with color coding
- Conditional action buttons based on application status
- Reviewer decision form with required comment validation
- Error handling and loading states
- Simple client-side form validation
- Edit-page guard for Submitted / Approved / Rejected applications

## Test Coverage

The backend includes 5 comprehensive test cases:

1. `test_create_and_full_workflow` — Full happy path: create → update → submit → review → approve
2. `test_need_more_info_flow` — Need more information workflow with resubmission
3. `test_reject_flow` — Rejection workflow with required comment
4. `test_invalid_transitions` — Invalid state transitions (should fail with 400)
5. `test_list_and_detail` — List and detail endpoints

The `Need More Information` flow is covered in tests and resubmission is implemented server-side and in the UI.

Run tests:
```bash
cd backend
python manage.py test applications --verbosity=2
```

## Assumptions

1. **No Authentication** — The system is open; no auth/authorization implemented. In production, add Django user authentication and role-based access (applicant vs reviewer).

2. **Single Reviewer Role** — All users can perform reviewer actions (start review, make decisions). In production, implement reviewer-only permissions.

3. **SQLite Database** — Using SQLite for simplicity. For production, migrate to PostgreSQL or MySQL.

4. **CORS Configured for Local Dev** — The backend is configured to allow the Vite origin. Tighten this for production.

5. **No Audit Trail** — State transitions are not logged. For compliance, add an audit log model.

6. **Tracking Number Format** — Using simple UUID-based format (APP-XXXXXXXX). Consider adding prefix or sequential numbering per requirements.

## Improvements with More Time

1. **Authentication & Authorization**
   - Add Django authentication with JWT tokens or sessions
   - Implement role-based access control (applicant, reviewer, admin)
   - Applicants can only view/edit their own applications

2. **Enhanced UX**
   - Add pagination to application list
   - Search and advanced filtering by status, type, date range
   - Bulk operations (export, batch status updates)
   - Mobile-responsive design improvements

3. **Testing & Quality**
   - Add E2E tests with Cypress or Playwright
   - Frontend unit tests with Vitest
   - Integration tests for API workflows
   - Add CI/CD pipeline (GitHub Actions, GitLab CI)

4. **Data & Auditing**
   - Audit log for all state transitions
   - User activity tracking
   - Application history/timeline view
   - Email notifications on status changes

5. **API Enhancements**
   - Pagination with cursor or offset-based
   - Advanced filtering and sorting
   - Bulk import/export (CSV)
   - Webhook support for external integrations

6. **Deployment**
   - Containerize with Docker
   - Add environment configuration management
   - Deploy to cloud (AWS, Heroku, DigitalOcean)
   - Set up monitoring and logging

7. **Documentation**
   - OpenAPI/Swagger documentation for API
   - Postman collection for API testing
   - Video walkthrough / demo

## Running in Production (Quick Notes)

1. Set `DEBUG = False` in `workflow_tracker/settings.py`
2. Add a secure `SECRET_KEY` (use environment variable)
3. Set `ALLOWED_HOSTS` to your domain
4. Use production database (PostgreSQL recommended)
5. Serve static files with nginx or CDN
6. Use Gunicorn or similar for WSGI server
7. Add HTTPS / SSL certificate
8. Configure CORS for frontend domain

## Screenshots

## Screenshots

### 1 — Applications List
![Applications list](ScreenShots/1%20application%20list.png)

### 2 — Draft (detail)
![Draft application detail](ScreenShots/2%20draft-detail.png)

### 3 — Submitted (detail)
![Submitted application detail](ScreenShots/3%20submitted-detail.png)

### 4 — Under Review / Decision
![Reviewer decision form](ScreenShots/4%20under%20review%20decision.png)

### 5 — Approved
![Approved application detail](ScreenShots/5%20approved.png)

### 6 — Need More Information
![Need More Information detail](ScreenShots/6%20Need%20More%20Information.png)

Note: filenames may contain spaces; the links use URL-encoded spaces. Rename files if you prefer simpler names.

## API Example Calls

**Create Application:**
```bash
curl -X POST http://127.0.0.1:8000/api/applications/ \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_name": "John Doe",
    "applicant_email": "john@example.com",
    "company_name": "Acme Corp",
    "application_type": "Recordation",
    "description": "Test application"
  }'
```

**List Applications:**
```bash
curl http://127.0.0.1:8000/api/applications/
```

**Submit Application:**
```bash
curl -X POST http://127.0.0.1:8000/api/applications/APP-XXXXXXXX/submit
```

**Make Decision:**
```bash
curl -X POST http://127.0.0.1:8000/api/applications/APP-XXXXXXXX/decision \
  -H "Content-Type: application/json" \
  -d '{
    "decision": "approved",
    "comment": "Looks good"
  }'
```

## Technologies Used

- **Backend:** Django 4.2, Django Ninja, SQLite
- **Frontend:** React 18, Vite, React Router
- **Testing:** Django TestCase
- **Styling:** Pure CSS (dark mode with glassmorphism)

## License

MIT

---

**Status:** MVP Complete — Core functionality implemented and tested. Ready for deployment and enhancement.
