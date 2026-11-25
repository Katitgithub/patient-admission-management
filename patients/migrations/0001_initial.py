import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Patient",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("age", models.PositiveSmallIntegerField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(120)])),
                ("gender", models.CharField(choices=[("Female", "Female"), ("Male", "Male"), ("Other", "Other")], max_length=10)),
                ("ward", models.CharField(choices=[("General", "General"), ("ICU", "ICU"), ("Maternity", "Maternity"), ("Pediatrics", "Pediatrics")], max_length=80)),
                ("department", models.CharField(choices=[("Cardiology", "Cardiology"), ("General Medicine", "General Medicine"), ("Neurology", "Neurology"), ("Orthopedics", "Orthopedics")], max_length=80)),
                ("doctor", models.CharField(choices=[("Dr. Asha Rao", "Dr. Asha Rao"), ("Dr. Kiran Shah", "Dr. Kiran Shah"), ("Dr. Meera Nair", "Dr. Meera Nair")], max_length=100)),
                ("admission_date", models.DateField()),
                ("status", models.CharField(choices=[("Admitted", "Admitted"), ("Discharged", "Discharged")], default="Admitted", max_length=12)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-admission_date", "name"]},
        ),
    ]
