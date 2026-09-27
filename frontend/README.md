# MyDaily Frontend

Frontend React application for MyDaily personal finance tracker.

## Tech Stack

- React 18.3.1
- TypeScript 5.6.2
- Vite 5.4.8
- React Router DOM 6.26.1
- Axios 1.7.7
- CSS Modules

## Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Start development server

```bash
npm run dev
```

The app will be available at http://localhost:5173/

### 3. Build for production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and types
│   │   ├── client.ts     # Axios instance with interceptors
│   │   ├── finance.ts    # API endpoints for finance models
│   │   └── types.ts      # TypeScript interfaces
│   ├── components/       # React components
│   │   ├── layout/       # Layout components
│   │   │   ├── Layout.tsx
│   │   │   └── Layout.module.css
│   │   └── ui/           # Reusable UI components
│   │       ├── Button/
│   │       ├── Card/
│   │       └── Input/
│   ├── pages/            # Page components
│   │   ├── Dashboard/
│   │   ├── Transactions/
│   │   ├── MonthlyPlan/
│   │   ├── Savings/
│   │   ├── Templates/
│   │   └── Settings/
│   ├── styles/           # Global styles
│   │   ├── global.css
│   │   ├── variables.css
│   │   └── reset.css
│   ├── App.tsx           # Main app component with routing
│   └── main.tsx          # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Pages

### Dashboard
- Displays current balance, total income, total expense, net savings
- Shows recent transactions (last 5)
- Real-time stats calculation from transactions

### Transactions
- Full transaction list with filters
- Filter by type (income/expense)
- Filter by date range
- Clear filters button
- Displays category, emoji, note, date, and amount

### Savings
- List of saving goals with progress bars
- Shows target amount, current amount, remaining, deadline, priority
- Status badges (active/completed)
- Progress percentage display

### Templates
- Grid view of transaction templates
- Shows template name, type, amount, category, emoji, note
- Hover effects for interactivity

### Settings
- App settings management
- Setup status indicator
- Starting balance and date configuration
- Locked after setup complete
- About section with app info

## API Integration

The frontend connects to the Django backend at `http://127.0.0.1:8000/api/`

### Available API Endpoints

- `/api/categories/` - CRUD for categories
- `/api/transactions/` - CRUD for transactions with filters
- `/api/month-plans/` - CRUD for month plans
- `/api/saving-goals/` - CRUD for saving goals
- `/api/templates/` - CRUD for templates
- `/api/settings/` - CRUD for app settings

## Design System

### Colors
- Primary: `#2dd4bf` (teal)
- Income: `#4ade80` (green)
- Expense: `#f87171` (red)
- Saving: `#fbbf24` (yellow)
- Background: `#0d1117` (dark)
- Surface: `#161b22` (dark gray)

### Typography
- Sans: 'Outfit', system-ui
- Mono: 'JetBrains Mono', Consolas

### Spacing
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

### Border Radius
- sm: 6px, md: 10px, lg: 14px, xl: 18px

## Development Notes

- CSS Modules are used for component-specific styling
- Global styles are defined in `src/styles/`
- API client uses Axios with interceptors for error handling
- React Router handles client-side routing
- TypeScript provides type safety throughout

## TODO

- [ ] Add create/edit forms for transactions
- [ ] Add create/edit forms for saving goals
- [ ] Add create/edit forms for templates
- [ ] Implement MonthlyPlan page
- [ ] Add authentication
- [ ] Add user-specific data filtering
- [ ] Add charts/graphs for analytics
- [ ] Add Reports page
- [ ] Add Calendar page
- [ ] Add data export functionality
