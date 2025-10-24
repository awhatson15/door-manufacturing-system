# Project Overview

This is a full-stack application for a door manufacturing system. It includes a backend API built with NestJS and a frontend web application built with Next.js. The system is designed to manage orders, customers, files, and notifications.

**Backend:**

*   **Framework:** NestJS
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **Caching:** Redis
*   **Authentication:** JWT
*   **Key Libraries:** TypeORM, BullMQ, Puppeteer

**Frontend:**

*   **Framework:** Next.js 14
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** React Query, Zustand
*   **Key Libraries:** React Hook Form, DnD Kit

**DevOps:**

*   **Containerization:** Docker
*   **Orchestration:** Docker Compose

# Building and Running

## Docker (Recommended)

The project is set up to run with Docker and Docker Compose.

1.  **Environment Variables:**
    *   Copy `.env.example` to `.env` and update the variables as needed.

2.  **Run the application:**
    ```bash
    docker-compose up -d
    ```

3.  **Initialize the database (first time only):**
    ```bash
    docker-compose exec backend npm run migration:run
    docker-compose exec backend npm run seed
    ```

4.  **Access the application:**
    *   **Frontend:** http://localhost:3001
    *   **Backend API:** http://localhost:3000
    *   **API Documentation:** http://localhost:3000/api/docs

## Local Development

You can also run the frontend and backend services locally without Docker.

**Backend:**

```bash
cd backend
npm install
npm run start:dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

# Development Conventions

*   **Code Style:** The project uses Prettier for code formatting and ESLint for linting. There are `.prettierrc` and `.eslintrc.js` files in both the `frontend` and `backend` directories.
*   **Testing:** Both the frontend and backend have their own test suites using Jest.
    *   Run backend tests: `cd backend && npm test`
    *   Run frontend tests: `cd frontend && npm test`
*   **Commits:** No specific commit message convention is enforced, but the `README.md` suggests a conventional commit style.
*   **Branching:** The `README.md` suggests a `feature/` branching strategy.
