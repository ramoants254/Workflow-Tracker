from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI

from applications.api import api_router

api = NinjaAPI()
api.add_router('/applications/', api_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
]
