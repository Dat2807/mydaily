from django.db import models
from users.models import User


class AppSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='app_settings')
    setup_complete = models.BooleanField(default=False)
    starting_balance = models.DecimalField(max_digits=15, decimal_places=0)
    starting_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Settings for {self.user.username}"


class Category(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    emoji = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.emoji} {self.name} ({self.type})"

    class Meta:
        ordering = ['type', 'name']


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=0)
    date = models.DateField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='transactions')
    note = models.TextField(blank=True)
    template = models.ForeignKey('Template', on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.type} - {self.amount} VND - {self.date}"

    class Meta:
        ordering = ['-date', '-created_at']


class MonthPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='month_plans')
    month_key = models.CharField(max_length=7)  # "2026-08"
    expected_income = models.DecimalField(max_digits=15, decimal_places=0)
    expected_saving = models.DecimalField(max_digits=15, decimal_places=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Plan for {self.month_key}"

    class Meta:
        unique_together = ['user', 'month_key']
        ordering = ['-month_key']


class MonthBudget(models.Model):
    month_plan = models.ForeignKey(MonthPlan, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    amount = models.DecimalField(max_digits=15, decimal_places=0)

    def __str__(self):
        return f"{self.category.name}: {self.amount} VND"

    class Meta:
        unique_together = ['month_plan', 'category']


class SavingGoal(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saving_goals')
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=15, decimal_places=0)
    current_amount = models.DecimalField(max_digits=15, decimal_places=0, default=0)
    priority = models.IntegerField()
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.current_amount}/{self.target_amount} VND"

    class Meta:
        ordering = ['priority', '-created_at']


class SavingAllocation(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='saving_allocations')
    goal = models.ForeignKey(SavingGoal, on_delete=models.CASCADE, related_name='allocations')
    amount = models.DecimalField(max_digits=15, decimal_places=0)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} VND allocated to {self.goal.name}"

    class Meta:
        ordering = ['-date']


class Template(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='templates')
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='templates')
    note = models.TextField(blank=True)
    emoji = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.amount} VND"

    class Meta:
        ordering = ['name']

