from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

# Replace these examples with the actual options you want in your demo.
WARD_CHOICES = [(v, v) for v in ["General", "ICU", "Maternity", "Pediatrics"]]
DEPARTMENT_CHOICES = [(v, v) for v in ["Cardiology", "General Medicine", "Neurology", "Orthopedics"]]
DOCTOR_CHOICES = [(v, v) for v in ["Dr. Asha Rao", "Dr. Kiran Shah", "Dr. Meera Nair"]]


class Patient(models.Model):
    class Gender(models.TextChoices):
        FEMALE = "Female", "Female"
        MALE = "Male", "Male"
        OTHER = "Other", "Other"

    class Status(models.TextChoices):
        ADMITTED = "Admitted", "Admitted"
        DISCHARGED = "Discharged", "Discharged"

    name = models.CharField(max_length=100)
    age = models.PositiveSmallIntegerField(validators=[MinValueValidator(0), MaxValueValidator(120)])
    gender = models.CharField(max_length=10, choices=Gender.choices)
    ward = models.CharField(max_length=80, choices=WARD_CHOICES)
    department = models.CharField(max_length=80, choices=DEPARTMENT_CHOICES)
    doctor = models.CharField(max_length=100, choices=DOCTOR_CHOICES)
    admission_date = models.DateField()
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.ADMITTED)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-admission_date", "name"]

    def __str__(self):
        return self.name
