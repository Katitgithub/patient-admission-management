import re

from django.utils import timezone
from rest_framework import serializers
from .models import DEPARTMENT_CHOICES, DOCTOR_CHOICES, WARD_CHOICES, Patient


class PatientSerializer(serializers.ModelSerializer):
    age = serializers.IntegerField(min_value=0, max_value=120)

    class Meta:
        model = Patient
        fields = ["id", "name", "age", "gender", "ward", "department", "doctor", "admission_date", "status", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        value = value.strip()
        if not re.fullmatch(r"[^\W\d_]+(?: [^\W\d_]+)*", value, flags=re.UNICODE):
            raise serializers.ValidationError("Use letters and spaces only.")
        return value

    def validate_admission_date(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError("Admission date cannot be in the future.")
        return value


def get_patient_options():
    return {
        "genders": [value for value, _ in Patient.Gender.choices],
        "wards": [value for value, _ in WARD_CHOICES],
        "departments": [value for value, _ in DEPARTMENT_CHOICES],
        "doctors": [value for value, _ in DOCTOR_CHOICES],
    }
