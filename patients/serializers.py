from django.utils import timezone
from rest_framework import serializers

from .models import (
    DEPARTMENT_CHOICES,
    DOCTOR_CHOICES,
    WARD_CHOICES,
    Patient,
)


class PatientSerializer(serializers.ModelSerializer):
    """Convert Patient objects to JSON and validate data sent by the frontend."""

    age = serializers.IntegerField(min_value=0, max_value=120)

    class Meta:
        model = Patient
        fields = [
            "id",
            "name",
            "age",
            "gender",
            "ward",
            "department",
            "doctor",
            "admission_date",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, name):
        """Allow names made from letters and spaces only."""
        name = name.strip()
        letters_only = name.replace(" ", "")
        if not letters_only or not letters_only.isalpha():
            raise serializers.ValidationError("Use letters and spaces only.")
        return name

    def validate_admission_date(self, admission_date):
        """Reject admission dates later than today's date."""
        if admission_date > timezone.localdate():
            raise serializers.ValidationError(
                "Admission date cannot be in the future."
            )
        return admission_date


def get_patient_options():
    """Return the values used to fill in the frontend's select boxes."""
    return {
        "genders": [value for value, label in Patient.Gender.choices],
        "wards": [value for value, label in WARD_CHOICES],
        "departments": [value for value, label in DEPARTMENT_CHOICES],
        "doctors": [value for value, label in DOCTOR_CHOICES],
    }
