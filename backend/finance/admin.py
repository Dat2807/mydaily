from django.contrib import admin
from .models import (
    AppSettings,
    Category,
    Transaction,
    MonthPlan,
    MonthBudget,
    SavingGoal,
    SavingAllocation,
    Template,
)


@admin.register(AppSettings)
class AppSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'setup_complete', 'starting_balance', 'starting_date']
    list_filter = ['setup_complete']
    search_fields = ['user__username']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'emoji', 'user', 'created_at']
    list_filter = ['type']
    search_fields = ['name', 'user__username']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['type', 'amount', 'date', 'category', 'user', 'created_at']
    list_filter = ['type', 'date', 'category']
    search_fields = ['note', 'category__name']
    date_hierarchy = 'date'


@admin.register(MonthPlan)
class MonthPlanAdmin(admin.ModelAdmin):
    list_display = ['month_key', 'expected_income', 'expected_saving', 'user', 'created_at']
    list_filter = ['month_key']
    search_fields = ['user__username']


@admin.register(MonthBudget)
class MonthBudgetAdmin(admin.ModelAdmin):
    list_display = ['month_plan', 'category', 'amount']
    list_filter = ['category']


@admin.register(SavingGoal)
class SavingGoalAdmin(admin.ModelAdmin):
    list_display = ['name', 'target_amount', 'current_amount', 'priority', 'status', 'user']
    list_filter = ['status']
    search_fields = ['name', 'user__username']


@admin.register(SavingAllocation)
class SavingAllocationAdmin(admin.ModelAdmin):
    list_display = ['transaction', 'goal', 'amount', 'date']
    list_filter = ['date', 'goal']


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'amount', 'category', 'emoji', 'user']
    list_filter = ['type', 'category']
    search_fields = ['name', 'user__username']
