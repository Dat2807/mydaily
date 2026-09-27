from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    TransactionViewSet,
    MonthPlanViewSet,
    SavingGoalViewSet,
    TemplateViewSet,
    AppSettingsViewSet,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'month-plans', MonthPlanViewSet, basename='monthplan')
router.register(r'saving-goals', SavingGoalViewSet, basename='savinggoal')
router.register(r'templates', TemplateViewSet, basename='template')
router.register(r'settings', AppSettingsViewSet, basename='appsettings')

urlpatterns = [
    path('', include(router.urls)),
]
