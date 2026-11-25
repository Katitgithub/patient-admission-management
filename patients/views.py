"""Simple Django views that handle the patient API requests."""

import json
from datetime import date

from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods

from .models import DEPARTMENT_CHOICES, DOCTOR_CHOICES, WARD_CHOICES, Patient


def read_json(request):
    """Turn the JSON request body into a Python dictionary."""
    try:
        data = json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None, {"error": "Send valid JSON data."}

    if not isinstance(data, dict):
        return None, {"error": "Send patient data as a JSON object."}

    return data, None


def patient_to_dict(patient):
    """Turn one database record into a dictionary that can be sent as JSON."""
    return {
        "id": patient.id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "ward": patient.ward,
        "department": patient.department,
        "doctor": patient.doctor,
        "admission_date": patient.admission_date.isoformat(),
        "status": patient.status,
    }


def validate_patient(data):
    """Check patient values and return (clean_data, errors)."""
    clean_data = {}
    errors = {}

    # Check the patient's name.
    name = str(data.get("name", "")).strip()
    if not name:
        errors["name"] = "Name is required."
    elif not name.replace(" ", "").isalpha():
        errors["name"] = "Use letters and spaces only."
    elif len(name) > 100:
        errors["name"] = "Name must be 100 characters or fewer."
    else:
        clean_data["name"] = name

    # Check the patient's age.
    age_value = data.get("age")
    try:
        age = int(age_value)
        if isinstance(age_value, bool):
            raise ValueError
        if isinstance(age_value, float) and not age_value.is_integer():
            raise ValueError
        if age < 0 or age > 120:
            errors["age"] = "Age must be between 0 and 120."
        else:
            clean_data["age"] = age
    except (TypeError, ValueError):
        errors["age"] = "Age must be a whole number from 0 to 120."

    # Check each dropdown value against the options defined in models.py.
    allowed_genders = [value for value, label in Patient.Gender.choices]
    allowed_wards = [value for value, label in WARD_CHOICES]
    allowed_departments = [value for value, label in DEPARTMENT_CHOICES]
    allowed_doctors = [value for value, label in DOCTOR_CHOICES]

    if data.get("gender") not in allowed_genders:
        errors["gender"] = "Choose a valid gender."
    else:
        clean_data["gender"] = data["gender"]

    if data.get("ward") not in allowed_wards:
        errors["ward"] = "Choose a valid ward."
    else:
        clean_data["ward"] = data["ward"]

    if data.get("department") not in allowed_departments:
        errors["department"] = "Choose a valid department."
    else:
        clean_data["department"] = data["department"]

    if data.get("doctor") not in allowed_doctors:
        errors["doctor"] = "Choose a valid doctor."
    else:
        clean_data["doctor"] = data["doctor"]

    # Convert the date string from JSON into a Python date.
    date_value = data.get("admission_date", "")
    try:
        admission_date = date.fromisoformat(date_value)
        if admission_date > timezone.localdate():
            errors["admission_date"] = "Admission date cannot be in the future."
        else:
            clean_data["admission_date"] = admission_date
    except (TypeError, ValueError):
        errors["admission_date"] = "Enter a valid admission date."

    status_value = data.get("status", "Admitted")
    allowed_statuses = [value for value, label in Patient.Status.choices]
    if status_value not in allowed_statuses:
        errors["status"] = "Choose Admitted or Discharged."
    else:
        clean_data["status"] = status_value

    return clean_data, errors


@csrf_exempt
@require_http_methods(["GET", "POST"])
def patient_list(request):
    """GET returns patients. POST creates a patient."""
    if request.method == "GET":
        patients = Patient.objects.all()

        # Search for a name and apply any selected filters.
        search_text = request.GET.get("search", "").strip()
        if search_text:
            patients = patients.filter(name__icontains=search_text)
        if request.GET.get("ward"):
            patients = patients.filter(ward=request.GET["ward"])
        if request.GET.get("department"):
            patients = patients.filter(department=request.GET["department"])
        if request.GET.get("doctor"):
            patients = patients.filter(doctor=request.GET["doctor"])

        patient_list = [patient_to_dict(patient) for patient in patients]
        return JsonResponse(patient_list, safe=False)

    data, error = read_json(request)
    if error:
        return JsonResponse(error, status=400)

    clean_data, errors = validate_patient(data)
    if errors:
        return JsonResponse(errors, status=400)

    patient = Patient.objects.create(**clean_data)
    return JsonResponse(patient_to_dict(patient), status=201)


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH", "DELETE"])
def patient_detail(request, patient_id):
    """Read, edit, discharge, or delete one patient."""
    patient = get_object_or_404(Patient, id=patient_id)

    if request.method == "GET":
        return JsonResponse(patient_to_dict(patient))

    if request.method == "DELETE":
        patient.delete()
        return HttpResponse(status=204)

    data, error = read_json(request)
    if error:
        return JsonResponse(error, status=400)

    # PATCH changes only supplied values; keep the other current values.
    if request.method == "PATCH":
        current_data = patient_to_dict(patient)
        current_data.update(data)
        data = current_data

    clean_data, errors = validate_patient(data)
    if errors:
        return JsonResponse(errors, status=400)

    for field, value in clean_data.items():
        setattr(patient, field, value)
    patient.save()
    return JsonResponse(patient_to_dict(patient))


@require_GET
def options(request):
    """Return the choices used by the form dropdowns."""
    return JsonResponse({
        "genders": [value for value, label in Patient.Gender.choices],
        "wards": [value for value, label in WARD_CHOICES],
        "departments": [value for value, label in DEPARTMENT_CHOICES],
        "doctors": [value for value, label in DOCTOR_CHOICES],
    })
