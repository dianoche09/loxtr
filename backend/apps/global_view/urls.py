from django.urls import path
from . import views

app_name = 'global'

urlpatterns = [
    path('', views.homepage, name='homepage'),
    path('market-entry/', views.market_entry, name='market_entry'),
    # path('brand/<slug:slug>/', views.brand_detail, name='brand_detail'), # REMOVED
]
