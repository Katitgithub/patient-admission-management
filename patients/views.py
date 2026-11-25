"""Small API views for the patient list and patient detail actions."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Patient
from .serializers import PatientSerializer, get_patient_options


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def patient_list(request):
    """List patients on GET and create a patient on POST."""
    if request.method == "POST":
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    patients = Patient.objects.all()

    # Search names, for example: /api/patients/?search=asha
    search_text = request.query_params.get("search", "").strip()
    if search_text:
        patients = patients.filter(name__icontains=search_text)

    # Apply a filter only when the request includes that query parameter.
    ward = request.query_params.get("ward")
    department = request.query_params.get("department")
    doctor = request.query_params.get("doctor")

    if ward:
        patients = patients.filter(ward=ward)
    if department:
        patients = patients.filter(department=department)
    if doctor:
        patients = patients.filter(doctor=doctor)

    return Response(PatientSerializer(patients, many=True).data)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def patient_detail(request, patient_id):
    """Read, edit, discharge, or delete one patient."""
    patient = get_object_or_404(Patient, id=patient_id)

    if request.method == "GET":
        return Response(PatientSerializer(patient).data)

    if request.method in ["PUT", "PATCH"]:
        # PATCH changes only the supplied fields (used for discharge).
        partial_update = request.method == "PATCH"
        serializer = PatientSerializer(
            patient, data=request.data, partial=partial_update
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    patient.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([AllowAny])
def options(request):
    """Provide the choices used in the form dropdowns."""
    return Response(get_patient_options())
