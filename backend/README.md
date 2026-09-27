# MyDaily Backend

Backend Django REST Framework cho ứng dụng quản lý tài chính cá nhân.

## Tech Stack

- Python 3.14+
- Django 5.1.2
- Django REST Framework 3.15.2
- PostgreSQL
- psycopg2-binary
- django-cors-headers
- python-decouple

## Setup

### 1. Cài đặt dependencies

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Cấu hình environment variables

Copy file `.env` và cập nhật thông tin:

```
DATABASE_NAME=your_db_name
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Setup database

```bash
python manage.py migrate
```

### 4. Tạo superuser (để truy cập Admin Panel)

```bash
python manage.py createsuperuser
```

Hoặc dùng command nhanh:
```bash
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); u = User.objects.create_superuser('admin', 'admin@example.com', 'mk')"
```

### 5. Chạy server

```bash
python manage.py runserver
```

Server sẽ chạy tại: http://127.0.0.1:8000/

## Admin Panel

- URL: http://127.0.0.1:8000/admin/
- Username: **admin**
- Password: **password**

## Database Models

### Users App
- **User**: Model user tùy chỉnh (để mở rộng module lịch hoạt động sau)

### Finance App
- **AppSettings**: Cài đặt ứng dụng (starting balance, setup status)
- **Category**: Danh mục thu nhập/chi tiêu
- **Transaction**: Giao dịch (income/expense)
- **MonthPlan**: Kế hoạch tháng
- **MonthBudget**: Ngân sách từng danh mục trong tháng
- **SavingGoal**: Mục tiêu tiết kiệm
- **SavingAllocation**: Phân bổ tiền tiết kiệm
- **Template**: Mẫu giao dịch tái sử dụng

## Project Structure

```
backend/
├── manage.py
├── config/              # Django project settings
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── finance/             # Finance app
│   ├── models.py        # Database models
│   ├── admin.py         # Django admin
│   ├── views.py         # API views (chưa có)
│   ├── serializers.py   # DRF serializers (chưa có)
│   ├── urls.py          # App URLs (chưa có)
│   └── services/        # Business logic (chưa có)
├── users/               # Users app
│   ├── models.py
│   ├── admin.py
│   └── ...
├── requirements.txt
└── .env                 # Environment variables
```

## Development Workflow

### Tạo migrations sau khi thay đổi models

```bash
python manage.py makemigrations
python manage.py migrate
```

### Xem SQL của migration (chưa chạy)

```bash
python manage.py sqlmigrate app_name migration_number
```

### Reset database (xóa tất cả data)

```bash
python manage.py flush
```

### Django Shell

```bash
python manage.py shell
```

## API Endpoints (Phase 2 - Chưa implement)

```
/api/
├── /settings/
├── /categories/
├── /transactions/
├── /month-plans/
├── /saving-goals/
├── /templates/
└── /dashboard/
```

## TODO

- [x] Phase 1: Backend Foundation
  - [x] Setup Django project
  - [x] Configure PostgreSQL
  - [x] Create database models
  - [x] Run migrations
  - [x] Setup Django Admin
- [ ] Phase 2: Backend API
  - [ ] Create serializers
  - [ ] Create API views
  - [ ] Setup URLs
  - [ ] Test API endpoints
- [ ] Phase 3: Frontend Foundation
  - [ ] Setup React + Vite
  - [ ] Setup CSS Modules
  - [ ] Create design system
- [ ] Phase 4: Frontend Pages
  - [ ] Implement all pages
- [ ] Phase 5: Integration & Testing

## Notes

- Database: PostgreSQL (mydaily_db)
- Default superuser: admin / mk
- CORS enabled cho frontend tại http://localhost:5173
- Django Admin có thể dùng để test data thủ công
