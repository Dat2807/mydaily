from rest_framework import serializers
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


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'emoji', 'created_at']
        read_only_fields = ['created_at']


class CategoryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'emoji', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ['id', 'name', 'type', 'amount', 'category', 'note', 'emoji', 'created_at']
        read_only_fields = ['created_at']


class TemplateDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Template
        fields = ['id', 'name', 'type', 'amount', 'category', 'category_name', 'note', 'emoji', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']


class SavingGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingGoal
        fields = ['id', 'name', 'target_amount', 'current_amount', 'priority', 'deadline', 'status', 'completed_at', 'created_at', 'updated_at']
        read_only_fields = ['completed_at', 'created_at', 'updated_at']


class SavingGoalDetailSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = SavingGoal
        fields = ['id', 'name', 'target_amount', 'current_amount', 'priority', 'deadline', 'status', 'completed_at', 'progress_percentage', 'user', 'created_at', 'updated_at']
        read_only_fields = ['user', 'completed_at', 'created_at', 'updated_at']
    
    def get_progress_percentage(self, obj):
        if obj.target_amount > 0:
            return round((obj.current_amount / obj.target_amount) * 100, 2)
        return 0


class SavingAllocationSerializer(serializers.ModelSerializer):
    goal_name = serializers.CharField(source='goal.name', read_only=True)
    
    class Meta:
        model = SavingAllocation
        fields = ['id', 'transaction', 'goal', 'goal_name', 'amount', 'date', 'created_at']
        read_only_fields = ['created_at']


class MonthBudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_type = serializers.CharField(source='category.type', read_only=True)
    
    class Meta:
        model = MonthBudget
        fields = ['id', 'month_plan', 'category', 'category_name', 'category_type', 'amount']


class MonthPlanSerializer(serializers.ModelSerializer):
    budgets = MonthBudgetSerializer(many=True, read_only=True)
    
    class Meta:
        model = MonthPlan
        fields = ['id', 'month_key', 'expected_income', 'expected_saving', 'budgets', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_emoji = serializers.CharField(source='category.emoji', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'type', 'amount', 'date', 'category', 'category_name', 'category_emoji', 'note', 'template', 'template_name', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class TransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['type', 'amount', 'date', 'category', 'note', 'template']


class AppSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppSettings
        fields = ['id', 'setup_complete', 'starting_balance', 'starting_date', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AppSettingsDetailSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = AppSettings
        fields = ['id', 'user', 'username', 'setup_complete', 'starting_balance', 'starting_date', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
