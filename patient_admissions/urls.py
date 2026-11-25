from django.urls import include, path
from django.http import JsonResponse
from django.views.decorators.http import require_GET


@require_GET
def health_check(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("api/health/", health_check),
    path("api/", include("patients.urls")),
]
