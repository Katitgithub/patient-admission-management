from django.urls import path

from . import views

urlpatterns = [
    path("options/", views.options, name="patient-options"),
    path("patients/", views.patient_list, name="patient-list"),
    path("patients/<int:patient_id>/", views.patient_detail, name="patient-detail"),
]
