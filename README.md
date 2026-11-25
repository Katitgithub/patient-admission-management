# Patient Admission Management

A responsive React application and Django REST API for managing hospital patient admissions. The API is Python/Django; Node.js is used only for React frontend tooling, not as the backend.

## How the code is organized

Backend:

- `patients/models.py` describes the Patient table and its allowed dropdown choices.
- `patients/serializers.py` turns patient data into JSON and checks incoming values.
- `patients/views.py` handles API requests in small, explicit functions.
- `patients/urls.py` connects each API URL to its view function.
- `patient_admissions/settings.py` contains Django setup, database, and CORS settings.

Frontend:

- `frontend/src/App.jsx` holds the page state and connects the form and table.
- `frontend/src/PatientForm.jsx` displays the form and checks it before saving.
- `frontend/src/PatientTable.jsx` displays records, search, filters, and row actions.
- `frontend/src/api.js` contains the functions that call Django.
- `frontend/src/validation.js` contains the browser-side form checks.
- `frontend/src/styles.css` controls the page layout and mobile styles.

The basic request flow is: React form → `api.js` → Django URL → view → serializer → database. The serializer checks the data again on the server before Django saves it.

## Simple interview explanation

You can describe one create request like this:

1. The user fills in the React form. `validation.js` catches simple mistakes before sending anything.
2. `api.js` sends the form as JSON to `POST /api/patients/`.
3. Django matches that URL in `patients/urls.py` and runs `patient_list` in `patients/views.py`.
4. `PatientSerializer` checks the values again. If they are valid, `serializer.save()` stores the row through the `Patient` model; otherwise Django returns field errors as JSON.
5. React refreshes the patient list and shows the saved record.

The backend validates too because browser checks can be bypassed. The database is SQLite on a developer's computer and PostgreSQL on the deployed app.

## Features

- Add, list, edit, and delete patient records (deletion asks for confirmation).
- Search patients by name; filter by ward, department, and doctor.
- Mark a patient as discharged.
- Frontend and backend validation for name, age, required selections, and admission date.
- SQLite locally; PostgreSQL supported for a persistent production database.
- Responsive desktop, tablet, and mobile layout.

## Stack

- Frontend: React, Vite, CSS
- Backend: Python, Django, Django REST Framework
- Database: SQLite locally; PostgreSQL through `DATABASE_URL`

## Live links and screenshots

- Frontend: TODO — add the deployed React URL
- Backend API: TODO — add the deployed Django URL
- Screenshots: add desktop and mobile screenshots to a `screenshots/` folder and link them here

## Run locally (PowerShell)

### Backend

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
Copy-Item .env.example .env
py manage.py migrate
py manage.py runserver
```

API base: `http://127.0.0.1:8000/api/`

- `GET /api/health/` health check
- `GET /api/options/` dropdown choices
- `GET /api/patients/` list; supports `?search=name&ward=ICU&department=Neurology&doctor=Dr.%20Asha%20Rao`
- `POST /api/patients/` create
- `GET`, `PUT`, `PATCH`, `DELETE /api/patients/{id}/` retrieve, update, discharge, delete

### Frontend

In a second PowerShell window:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`). Configure the API base with `VITE_API_URL` in `frontend/.env.local`.

## Dropdown choices

Edit `WARD_CHOICES`, `DEPARTMENT_CHOICES`, and `DOCTOR_CHOICES` in `patients/models.py`. The frontend loads these from `/api/options/`. Run `py manage.py makemigrations patients` and `py manage.py migrate` after changing model fields or choices.

## Deployment checklist

1. Provision persistent PostgreSQL and set `DATABASE_URL` on the backend host.
2. Set private `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS` to the backend hostname, and `DJANGO_CORS_ALLOWED_ORIGINS` to the frontend origin.
3. Run `python manage.py migrate` as the release command; start backend with `gunicorn patient_admissions.wsgi:application`.
4. Build frontend using `npm run build`; set `VITE_API_URL` to the deployed API origin before building.
5. Verify add/search/filter/edit/discharge/delete, then restart backend and confirm data persists.
6. Add the deployed live link and screenshots here before submission.

Never commit `.env`, `.env.local`, database credentials, or Django secret keys. Example variables are in the `.env.example` files.

## Submission checklist from the task brief

- Public GitHub repository link
- Live working frontend and backend links
- README with stack, setup steps, live link, and screenshots
- Email both links to the addresses stated in the supplied task brief, with your full name in the subject
