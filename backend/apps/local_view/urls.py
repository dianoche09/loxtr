from django.urls import path
from . import views

app_name = 'local'

urlpatterns = [
    path('', views.homepage, name='homepage'),
    path('distribution/', views.distribution, name='distribution'),
    # path('marka/<slug:slug>/', views.brand_detail, name='brand_detail'), # REMOVED
]
