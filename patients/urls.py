from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, options

router = DefaultRouter()
router.register("patients", PatientViewSet, basename="patient")
urlpatterns = [path("options/", options, name="options"), path("", include(router.urls))]
