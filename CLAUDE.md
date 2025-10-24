# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Door Manufacturing System - internal web application for tracking orders in a metal door manufacturing facility. Features a Kanban-style planner, customer management, file attachments, and multi-channel notifications (Email, SMS, Telegram).

## Tech Stack

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL 15+ with TypeORM
- **Cache/Queue**: Redis 7+ with BullMQ
- **Authentication**: JWT with Passport
- **File Generation**: Puppeteer for PDF reports
- **API Docs**: Swagger/OpenAPI

### Frontend (Next.js)
- **Framework**: Next.js 14 (Pages Router)
- **Styling**: Tailwind CSS with dark/light theme support
- **State Management**:
  - Redux Toolkit + Zustand for client state
  - React Query for server state
- **Forms**: React Hook Form + Zod validation
- **Drag & Drop**: DnD Kit for Kanban board
- **Notifications**: react-hot-toast

## Architecture

### Backend Module Structure

The backend follows NestJS modular architecture with distinct business domains:

```
backend/src/
├── modules/
│   ├── auth/           # JWT authentication, login/logout
│   ├── users/          # User management, roles, permissions (RBAC)
│   ├── customers/      # Customer entity and directory
│   ├── orders/         # Order entity with lifecycle management
│   ├── stages/         # Production stages (referenced by order-stages)
│   ├── files/          # File uploads and management
│   ├── comments/       # Order comments (internal & public)
│   ├── notifications/  # Email, SMS, Telegram notifications
│   └── history/        # Audit trail for all entity changes
├── database/           # TypeORM configuration, migrations, seeds
├── common/             # Guards, filters, interceptors, decorators
└── config/             # Environment configuration
```

**Key Entity Relationships**:
- `Order` → has many `OrderStage` (represents progress through production stages)
- `Order` → belongs to `Customer` and is managed by `User` (manager)
- `OrderStage` → references both `Order` and `Stage`, tracks status (pending/in_progress/completed/skipped)
- All entities support soft-delete history tracking via `History` entity

**Order Lifecycle**:
- Orders have dual numbering: `internalNumber` (unique, auto-generated) and optional `mainNumber` (user-defined)
- Status progression: `new` → `in_progress` → `completed` (can be paused/cancelled)
- Progress calculated via `completedStagesCount/stagesCount` ratio
- Virtual getters: `isOverdue`, `completionPercentage`, `isCompleted`, `displayName`

### Frontend Architecture

**Context Providers** (in `_app.tsx`):
- `AuthContext` - manages JWT tokens, user session, protected routes
- `ThemeContext` - light/dark theme with CSS variables
- `Provider` (Redux) - global client state
- `QueryClientProvider` (React Query) - server state caching (5min stale time)

**Pages vs Components**:
- Pages in `src/pages/` follow Next.js file-based routing
- Shared components in `src/components/` (Layout, Sidebar, Header, KanbanBoard, etc.)
- Page-specific components can be co-located or placed in `components/`

**State Management Strategy**:
- Use **React Query** for all API data (orders, customers, users)
- Use **Zustand** for lightweight UI state (sidebar open/close, filters)
- Use **Redux Toolkit** for complex shared state if needed
- Use **AuthContext** for authentication state

## Development Commands

### Backend

```bash
cd backend

# Development
npm run start:dev          # Watch mode with hot reload
npm run start:debug        # Debug mode on port 9229

# Build & Production
npm run build              # Compile TypeScript
npm run start:prod         # Run production build

# Database
npm run migration:generate -- -n MigrationName  # Generate migration from entities
npm run migration:run      # Run pending migrations
npm run migration:revert   # Rollback last migration
npm run seed               # Populate database with initial data

# Testing
npm test                   # Run unit tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report
npm run test:e2e           # End-to-end tests

# Code Quality
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting
```

### Frontend

```bash
cd frontend

# Development
npm run dev                # Start dev server on port 3001

# Build & Production
npm run build              # Next.js production build (with --no-lint)
npm start                  # Serve production build

# Testing
npm test                   # Jest unit tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Code Quality
npm run lint               # Next.js + ESLint
npm run type-check         # TypeScript check without emit
```

### Docker (Recommended)

```bash
# Full stack with PostgreSQL and Redis
docker-compose up -d              # Start all services
docker-compose logs -f backend    # View backend logs
docker-compose logs -f frontend   # View frontend logs
docker-compose down               # Stop all services

# Database setup (after first run)
docker-compose exec backend npm run migration:run
docker-compose exec backend npm run seed
```

## Important Notes

### Database Conventions
- TypeORM uses `synchronize: true` in development (auto-syncs schema changes)
- Production MUST use migrations (`synchronize: false`)
- Entity files must end with `.entity.ts` to be auto-discovered
- All entities use UUID primary keys
- Use indexes on frequently queried fields (status, customer, manager)

### RBAC System
- Three-tier: Users → Roles → Permissions
- Permissions are granular (e.g., `orders:create`, `orders:read`, `customers:update`)
- Guards in `common/guards/` enforce permissions on routes
- Default roles created in seed: Admin (all permissions), Manager (limited)

### File Uploads
- Stored in `UPLOAD_PATH` env variable location
- Max file size: `MAX_FILE_SIZE` (default 10MB)
- Files linked to orders via `File` entity
- Supported types: PDF, images, CAD drawings

### API Structure
- Global prefix: `/api` (configured in `main.ts`)
- All routes require JWT token (Bearer auth) except `/api/auth/login`
- Swagger docs available at `/api/docs` in non-production
- Validation pipe globally enabled (whitelist: true, transform: true)

### Frontend Routing
- Public routes: `/login`
- Protected routes: all others (redirected to `/login` if not authenticated)
- API calls via axios to `NEXT_PUBLIC_API_URL` (default: http://localhost:3000)

### Environment Variables
Backend requires:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL connection
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- `JWT_SECRET`, `JWT_EXPIRES_IN` - Authentication
- Optional: `SMTP_*`, `SMS_*`, `TELEGRAM_BOT_TOKEN` for notifications

Frontend requires:
- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- `NEXT_PUBLIC_APP_ENV` - Environment indicator

Copy `.env.example` to `.env` and configure before running.

## Testing Strategy

### Backend Tests
- Unit tests: `*.spec.ts` files co-located with modules
- E2E tests: `test/*.e2e-spec.ts` using supertest
- Coverage target: Focus on business logic in services

### Frontend Tests
- Component tests: Using React Testing Library
- Snapshot tests for UI components
- Integration tests for forms and user flows

## Common Workflows

### Adding a New Order Field
1. Add column to `Order` entity (`backend/src/modules/orders/entities/order.entity.ts`)
2. Generate migration: `npm run migration:generate -- -n AddOrderField`
3. Update DTOs in `backend/src/modules/orders/dto/`
4. Update frontend types (typically inferred from API responses)
5. Update UI forms and display components

### Creating a New Module
1. Use NestJS CLI: `nest g module moduleName`
2. Generate controller: `nest g controller moduleName`
3. Generate service: `nest g service moduleName`
4. Create entity in `moduleName/entities/`
5. Register entity in DatabaseModule imports if needed
6. Add DTOs in `moduleName/dto/`
7. Add Swagger decorators to controller methods

### Implementing Notifications
- Use `notifications` module which handles Email, SMS, Telegram
- Create notification via NotificationService
- Notifications are queued via BullMQ for async processing
- Configure provider credentials in `.env`

## Access Points

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

Default credentials (after seed):
- Admin: `admin@example.com` / `admin123`
- Manager: `manager@example.com` / `manager123`
