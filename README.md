smart-task-planner-kanban

A TypeScript-based task planner with Kanban board functionality.

Current Progress
✅ Completed

Project Setup - TypeScript configuration with Jest testing

Middleware Stack - Error handling, validation, authentication, logging

Database Integration - Prisma ORM with connection testing

Security & Performance - Helmet, CORS, compression, rate limiting

Development Tools - Nodemon, comprehensive type definitions

Prisma Models - Users, Tasks, Categories, ActivityLogs, AuditLogs

Authentication - User registration with bcrypt, JWT login, protected routes

API Endpoints - /api/auth/register, /api/auth/login, /api/tasks

🔧 Tech Stack

Runtime: Node.js with TypeScript

Framework: Express.js with security middleware

Database: Prisma ORM with PostgreSQL

Testing: Jest with in-memory databases, Supertest for API testing

Validation: Zod schemas

Authentication: JWT tokens with bcrypt password hashing

Containerization: Docker with docker-compose

Programming Pattern & Architecture

Modular Monolith: Each domain (auth, users, tasks, categories, logs) has its own controller → service → routes → types → tests, allowing clean separation of concerns and easy future extraction to microservices.

TDD-Driven Development: Features are developed test-first using Jest and in-memory databases for predictable, robust behavior.

Service Layer: Business logic resides in service classes; controllers handle request/response flow only.

Middleware-Centric Design: Authentication, validation, logging, and error handling are centralized via Express middleware.

Event-Ready & Background Jobs: Background jobs (task suggestions, activity logs) are isolated and scheduled via a dedicated jobs folder, prepared for async/event-driven workflows.

Caching & Performance: Redis caching is integrated for frequently accessed endpoints.

Testing Setup

Comprehensive testing environment with:

Jest - Testing framework with TypeScript support

In-memory PostgreSQL - Using pg-mem for database testing

In-memory Redis - Using redis-memory-server for cache testing

Prisma Testing - Database connection validation

Running Tests
npm test # Run tests once
npm run test:watch # Run tests in watch mode
npm run test:ci # Run tests with coverage

Docker Setup
Development with Docker Compose

# Start all services (PostgreSQL, Redis, App)

docker-compose up -d

# View logs

docker-compose logs -f app

# Stop all services

docker-compose down

# Rebuild and start

docker-compose up --build

Environment Variables

Copy .env.example to .env and update values:

cp .env.example .env

Project Structure
smart-task-planner-kanban/
│
├── prisma/
│ └── schema.prisma # Database models and relationships
│
├── src/
│ ├── app.ts # Express app instance
│ ├── server.ts # Server entry point (starts app)
│ │
│ ├── config/
│ │ ├── env.ts # Loads env vars, validates via zod
│ │ ├── index.ts
│ │ ├── locals.ts
│ │ └── redis.ts # Redis client setup
│ │
│ ├── db/
│ │ └── prismaclient.ts # Prisma instance, single DB connection
│ │
│ ├── middleware/
│ │ ├── auth.middleware.ts # JWT verification
│ │ ├── error.middleware.ts # Global error handler
│ │ ├── index.ts
│ │ ├── logging.middleware.ts # Request logging
│ │ └── validation.middleware.ts # Request validation
│ │
│ ├── modules/ # Domain modules
│ │ └── auth/
│ │ ├── auth.controller.ts
│ │ ├── auth.service.ts
│ │ ├── auth.routes.ts
│ │ ├── auth.types.ts
│ │ └── **tests**/auth.test.ts
│ │
│ ├── utils/
│ │ └── jwt.utils.ts # JWT token utilities
│ │
│ ├── test/ # Test utilities
│ │ ├── db-helper.ts # Database test helpers
│ │ ├── setup.ts # Global Jest setup
│ │ └── types.d.ts # Test type definitions
│ │
│ └── **tests**/ # Global tests
│ ├── prisma-connection.test.ts
│ └── setup.test.ts
│
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── LICENSE
├── package.json
├── README.md
├── REQUIREMENTS.md
├── smart-task-planner-kanban.csv
└── tsconfig.json
