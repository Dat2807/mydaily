# Kế hoạch xây dựng ứng dụng quản lý tài chính cá nhân

Xây dựng hệ thống quản lý tài chính cá nhân với backend Django + PostgreSQL và frontend React + CSS Modules, có khả năng mở rộng thêm module lịch hoạt động trong tương lai.

## Tổng quan kiến trúc

```
d:\Studies\ESpend\
├── backend/              # Django REST Framework
│   ├── manage.py
│   ├── config/           # Project settings
│   ├── finance/          # Finance app
│   ├── users/            # User app (để mở rộng sau)
│   └── requirements.txt
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/       # Global styles
│   │   └── ...
│   └── package.json
└── plan/                 # Documentation
```

## Phần 1: Backend Django + PostgreSQL

### 1.1 Setup dự án Django

**Cài đặt:**
- Python 3.11+
- Django 5.x
- Django REST Framework
- psycopg2-binary (PostgreSQL adapter)
- django-cors-headers (cho React frontend)

**Cấu trúc Django:**
```
backend/
├── manage.py
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── finance/
│   ├── __init__.py
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   ├── urls.py
│   └── services/        # Business logic
└── users/                # App cho user (để mở rộng)
    ├── __init__.py
    ├── models.py
    └── ...
```

### 1.2 Database Schema (PostgreSQL)

**Core Models:**

```python
# User Model (để mở rộng module lịch hoạt động)
class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    settings = models.JSONField(default=dict)

# App Settings
class AppSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    setup_complete = models.BooleanField(default=False)
    starting_balance = models.DecimalField(max_digits=15, decimal_places=0)
    starting_date = models.DateField()

# Category
class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10)  # 'income' or 'expense'
    emoji = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

# Transaction
class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=10)  # 'income' or 'expense'
    amount = models.DecimalField(max_digits=15, decimal_places=0)
    date = models.DateField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    note = models.TextField(blank=True)
    template = models.ForeignKey('Template', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Month Plan
class MonthPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    month_key = models.CharField(max_length=7)  # "2026-08"
    expected_income = models.DecimalField(max_digits=15, decimal_places=0)
    expected_saving = models.DecimalField(max_digits=15, decimal_places=0)
    created_at = models.DateTimeField(auto_now_add=True)

# Month Budget Item
class MonthBudget(models.Model):
    month_plan = models.ForeignKey(MonthPlan, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=15, decimal_places=0)

# Saving Goal
class SavingGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=15, decimal_places=0)
    current_amount = models.DecimalField(max_digits=15, decimal_places=0, default=0)
    priority = models.IntegerField()
    deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, default='active')  # 'active' or 'completed'
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

# Saving Allocation
class SavingAllocation(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    goal = models.ForeignKey(SavingGoal, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=15, decimal_places=0)
    date = models.DateField()

# Template
class Template(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=10)
    amount = models.DecimalField(max_digits=15, decimal_places=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    note = models.TextField(blank=True)
    emoji = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Lưu ý mở rộng:**
- User model có thể dùng chung cho module lịch hoạt động
- Settings JSON field flexible cho các cấu hình tương lai
- Có thể thêm app `daily_log` sau với foreign key đến User

### 1.3 Django REST Framework API Endpoints

```
/api/
├── /auth/                    # Authentication (nếu cần sau)
├── /settings/
│   ├── GET    /              # Lấy settings
│   ├── POST   /              # Setup ban đầu
│   └── PUT    /              # Update settings
├── /categories/
│   ├── GET    /              # List categories
│   ├── POST   /              # Tạo category
│   ├── PUT    /{id}/         # Update category
│   └── DELETE /{id}/         # Delete category
├── /transactions/
│   ├── GET    /              # List với filters
│   ├── POST   /              # Tạo transaction
│   ├── GET    /{id}/         # Chi tiết
│   ├── PUT    /{id}/         # Update
│   └── DELETE /{id}/         # Delete
├── /month-plans/
│   ├── GET    /              # List month plans
│   ├── GET    /{month_key}/  # Chi tiết tháng
│   ├── POST   /              # Tạo/update plan
│   └── POST   /{month_key}/copy-from-previous/  # Copy từ tháng trước
├── /saving-goals/
│   ├── GET    /              # List goals
│   ├── POST   /              # Tạo goal
│   ├── PUT    /{id}/         # Update
│   ├── DELETE /{id}/         # Delete
│   └── POST   /reorder/      # Reorder priorities
├── /templates/
│   ├── GET    /              # List templates
│   ├── POST   /              # Tạo template
│   ├── PUT    /{id}/         # Update
│   └── DELETE /{id}/         # Delete
└── /dashboard/
    └── GET    /              # Dashboard summary data
```

### 1.4 Business Logic Services

**File: finance/services/saving.py**
- `allocate_saving(amount, goals)` - Phân bổ tiền tiết kiệm theo priority
- `deallocate_saving(allocation_id)` - Hoàn tác khi edit/delete transaction

**File: finance/services/balance.py**
- `calculate_balance(user_id)` - Tính current balance
- `calculate_month_stats(user_id, month_key)` - Stats tháng hiện tại

### 1.5 Django Settings

```python
# config/settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'rest_framework',
    'corsheaders',
    'finance',
    'users',
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'espend_db',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
]
```

## Phần 2: Frontend React + CSS Modules

### 2.1 Setup React + Vite

**Cài đặt:**
- React 19
- Vite
- TypeScript
- Axios (hoặc fetch)
- React Router v6

**Cấu trúc:**
```
frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Card/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.module.css
│   │   └── TransactionForm/
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Transactions/
│   │   ├── MonthlyPlan/
│   │   ├── Savings/
│   │   ├── Templates/
│   │   ├── Reports/
│   │   ├── Calendar/
│   │   └── Settings/
│   ├── styles/
│   │   ├── global.css       # Global styles
│   │   ├── variables.css    # CSS variables (design tokens)
│   │   └── reset.css
│   ├── api/
│   │   ├── client.ts        # Axios config
│   │   ├── finance.ts       # Finance API calls
│   │   └── types.ts         # TypeScript types
│   ├── hooks/
│   │   ├── useFinance.ts    # Custom hooks
│   │   └── useAuth.ts       # (nếu cần sau)
│   └── utils/
│       └── format.ts        # Format VND, dates
└── package.json
```

### 2.2 Global Design System (CSS Variables)

**File: src/styles/variables.css**
```css
:root {
  /* Colors */
  --color-bg: #0d1117;
  --color-surface: #161b22;
  --color-surface-2: #1c2128;
  --color-surface-3: #21262d;
  
  --color-border: #30363d;
  --color-border-subtle: #21262d;
  
  --color-text: #e6edf3;
  --color-text-secondary: #8b949e;
  --color-text-muted: #6e7681;
  
  --color-primary: #2dd4bf;
  --color-primary-dim: #1a7f74;
  
  --color-income: #4ade80;
  --color-expense: #f87171;
  --color-saving: #fbbf24;
  --color-warning: #fb923c;
  --color-success: #4ade80;
  --color-error: #f87171;
  
  /* Typography */
  --font-sans: 'Outfit', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
}
```

### 2.3 CSS Modules Pattern

**Ví dụ Button component:**

```css
/* components/ui/Button/Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.primary {
  background: var(--color-primary);
  color: var(--color-bg);
}

.secondary {
  background: var(--color-surface-3);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
```

```tsx
// components/ui/Button/Button.tsx
import styles from './Button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export default function Button({ variant = 'primary', children }: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

### 2.4 API Client

**File: src/api/client.ts**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

**File: src/api/finance.ts**
```typescript
import api from './client';

export const financeAPI = {
  // Transactions
  getTransactions: (params?: any) => api.get('/transactions/', { params }),
  createTransaction: (data: any) => api.post('/transactions/', data),
  updateTransaction: (id: string, data: any) => api.put(`/transactions/${id}/`, data),
  deleteTransaction: (id: string) => api.delete(`/transactions/${id}/`),
  
  // Categories
  getCategories: () => api.get('/categories/'),
  createCategory: (data: any) => api.post('/categories/', data),
  
  // Dashboard
  getDashboard: () => api.get('/dashboard/'),
  
  // ... các API khác
};
```

### 2.5 Pages Implementation

**Pages cần implement:**
1. **Dashboard** - Tổng quan tài chính
2. **Transactions** - Lịch sử giao dịch với filters
3. **MonthlyPlan** - Lập kế hoạch tháng
4. **Savings** - Mục tiêu tiết kiệm
5. **Templates** - Mẫu giao dịch
6. **Reports** - Báo cáo lịch sử
7. **Calendar** - View lịch
8. **Settings** - Cài đặt (categories, templates)
9. **Setup** - Setup ban đầu (nhập starting balance)

### 2.6 State Management

**Options:**
- React Context + hooks (đơn giản, đủ cho single user)
- Redux Toolkit (nếu cần complex state)
- Zustand (lightweight alternative)

**Khuyên dùng:** React Context cho single user app.

## Phần 3: Mở rộng cho module lịch hoạt động

### 3.1 Database Schema mở rộng

```python
# App daily_log (sau này)
class DailyLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50)  # 'work', 'personal', 'health', etc.
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

### 3.2 API mở rộng

```
/api/daily-logs/
├── GET    /              # List logs
├── POST   /              # Tạo log
├── PUT    /{id}/         # Update
└── DELETE /{id}/         # Delete
```

## Phần 4: Deployment & Development

### 4.1 Development Workflow

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**PostgreSQL:**
- Cài PostgreSQL trên Windows
- Tạo database `espend_db`
- Update settings.py với credentials

### 4.2 Environment Variables

**Backend (.env):**
```
DATABASE_NAME=espend_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
SECRET_KEY=your-secret-key
DEBUG=True
```

## Phần 5: Thứ tự implementation

### Phase 1: Backend Foundation
1. Setup Django project
2. Configure PostgreSQL connection
3. Create database models
4. Run migrations
5. Setup Django Admin (để test data)

### Phase 2: Backend API
1. Setup Django REST Framework
2. Create serializers
3. Create API views
4. Setup URLs
5. Test API endpoints với Postman/Thunder Client

### Phase 3: Frontend Foundation
1. Setup React + Vite
2. Setup CSS Modules + global styles
3. Create design system (variables.css)
4. Setup API client
5. Create reusable UI components

### Phase 4: Frontend Pages
1. Setup page
2. Dashboard page
3. Transactions page
4. MonthlyPlan page
5. Savings page
6. Templates page
7. Reports page
8. Calendar page
9. Settings page

### Phase 5: Integration & Testing
1. Connect frontend với backend API
2. Test full flow
3. Fix bugs
4. Optimize UX

## Phần 6: Tech Stack Summary

**Backend:**
- Python 3.11+
- Django 5.x
- Django REST Framework
- PostgreSQL 15+
- psycopg2-binary

**Frontend:**
- React 19
- Vite
- TypeScript
- CSS Modules
- Axios
- React Router v6

**Development Tools:**
- Git
- VS Code
- Postman/Thunder Client (API testing)
- pgAdmin (PostgreSQL GUI)
