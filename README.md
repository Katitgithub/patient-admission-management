# Patient Admissions

A small patient management app. React is the frontend. Django is the backend. Django saves patient records in a database.

## How the code works

1. `PatientForm.jsx` shows the form.
2. `validation.js` checks the form in the browser.
3. `api.js` sends form data to Django as JSON.
4. `patients/urls.py` matches the API URL to a Django view.
5. `patients/views.py` checks the values and saves or reads a patient.
6. `patients/models.py` describes the patient table in the database.
7. Django sends JSON back to React, and React updates the page.

## Run on your computer (PowerShell)

### Start Django

From the project folder:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
Copy-Item .env.example .env
py manage.py migrate
py manage.py runserver
```

Django runs at `http://127.0.0.1:8000`.

### Start React

Open a second PowerShell window:

```powershell
Set-Location D:\OneDrive\Desktop\patient_app\frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open the Vite address shown in the terminal, usually `http://localhost:5173`.

## API URLs

- `GET /api/health/` checks that Django is running.
- `GET /api/options/` returns dropdown options.
- `GET /api/patients/` returns all patients.
- `GET /api/patients/?search=ana&ward=ICU` searches and filters patients.
- `POST /api/patients/` adds a patient.
- `GET /api/patients/1/` gets patient 1.
- `PUT /api/patients/1/` edits patient 1.
- `PATCH /api/patients/1/` changes part of patient 1, such as status.
- `DELETE /api/patients/1/` deletes patient 1.

## Change the dropdown values

Edit `WARD_CHOICES`, `DEPARTMENT_CHOICES`, and `DOCTOR_CHOICES` in `patients/models.py`. The React form gets these choices from `/api/options/`.

## Deploy

The frontend can be hosted on Vercel and the Django API on Render. Use PostgreSQL for the live database.

For the Render backend, set:

- Build command: `pip install -r requirements.txt && python manage.py migrate`
- Start command: `gunicorn patient_admissions.wsgi:application --bind 0.0.0.0:$PORT`
- Environment variables: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CORS_ALLOWED_ORIGINS`, and `DATABASE_URL`

For the Vercel frontend, set the project root to `frontend` and set `VITE_API_URL` to the Render backend URL.

Do not commit `.env` or real passwords. Use fake patient data in the public demo because this app has no login.
