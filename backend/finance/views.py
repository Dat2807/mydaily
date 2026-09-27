from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
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
from .serializers import (
    AppSettingsSerializer,
    AppSettingsDetailSerializer,
    CategorySerializer,
    CategoryDetailSerializer,
    TransactionSerializer,
    TransactionCreateSerializer,
    MonthPlanSerializer,
    MonthBudgetSerializer,
    SavingGoalSerializer,
    SavingGoalDetailSerializer,
    SavingAllocationSerializer,
    TemplateSerializer,
    TemplateDetailSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return CategoryDetailSerializer
        return CategorySerializer
    
    def get_queryset(self):
        # For now, return all categories (will add user filtering later)
        return Category.objects.all()
    
    def perform_create(self, serializer):
        # Will add user from request later
        serializer.save()


class TransactionViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TransactionCreateSerializer
        return TransactionSerializer
    
    def get_queryset(self):
        queryset = Transaction.objects.select_related('category', 'template')
        
        # Filters
        transaction_type = self.request.query_params.get('type', None)
        if transaction_type:
            queryset = queryset.filter(type=transaction_type)
        
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset
    
    def perform_create(self, serializer):
        # Will add user from request later
        serializer.save()


class MonthPlanViewSet(viewsets.ModelViewSet):
    serializer_class = MonthPlanSerializer
    
    def get_queryset(self):
        return MonthPlan.objects.select_related('user').prefetch_related('budgets__category')
    
    @action(detail=False, methods=['post'])
    def copy_from_previous(self, request):
        """Copy month plan from previous month"""
        month_key = request.data.get('month_key')
        if not month_key:
            return Response({'error': 'month_key is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse month_key (format: YYYY-MM)
        try:
            year, month = map(int, month_key.split('-'))
        except:
            return Response({'error': 'Invalid month_key format. Use YYYY-MM'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate previous month
        if month == 1:
            prev_year = year - 1
            prev_month = 12
        else:
            prev_year = year
            prev_month = month - 1
        
        prev_month_key = f"{prev_year:04d}-{prev_month:02d}"
        
        # Get previous month plan
        try:
            prev_plan = MonthPlan.objects.get(month_key=prev_month_key)
        except MonthPlan.DoesNotExist:
            return Response({'error': 'No previous month plan found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Create new plan
        new_plan = MonthPlan.objects.create(
            user=prev_plan.user,
            month_key=month_key,
            expected_income=prev_plan.expected_income,
            expected_saving=prev_plan.expected_saving,
        )
        
        # Copy budgets
        for budget in prev_plan.budgets.all():
            MonthBudget.objects.create(
                month_plan=new_plan,
                category=budget.category,
                amount=budget.amount,
            )
        
        serializer = self.get_serializer(new_plan)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SavingGoalViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return SavingGoalDetailSerializer
        return SavingGoalSerializer
    
    def get_queryset(self):
        return SavingGoal.objects.select_related('user')
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder saving goals by priority"""
        goal_ids = request.data.get('goal_ids', [])
        if not goal_ids:
            return Response({'error': 'goal_ids is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        for index, goal_id in enumerate(goal_ids):
            try:
                goal = SavingGoal.objects.get(id=goal_id)
                goal.priority = index
                goal.save()
            except SavingGoal.DoesNotExist:
                continue
        
        return Response({'message': 'Goals reordered successfully'})


class TemplateViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return TemplateDetailSerializer
        return TemplateSerializer
    
    def get_queryset(self):
        return Template.objects.select_related('category', 'user')
    
    def perform_create(self, serializer):
        # Will add user from request later
        serializer.save()


class AppSettingsViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        if self.action in ['retrieve', 'list']:
            return AppSettingsDetailSerializer
        return AppSettingsSerializer
    
    def get_queryset(self):
        return AppSettings.objects.select_related('user')

