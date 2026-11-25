from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Patient
from .serializers import PatientSerializer, get_patient_options


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["ward", "department", "doctor"]
    search_fields = ["name"]


@api_view(["GET"])
@permission_classes([AllowAny])
def options(request):
    return Response(get_patient_options())
