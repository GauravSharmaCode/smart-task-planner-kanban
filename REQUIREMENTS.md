🧾 Project Requirement Specification — Smart Task Planner API

1. Overview

A monolithic RESTful backend service for managing tasks, categories, and user profiles.
Supports authentication, role-based features, background categorization jobs, caching, and audit logging.

2. System Goals

Provide secure CRUD APIs for managing personal and categorized tasks.

Maintain logs for activity and premium audit history.

Optimize performance using Redis caching for frequent reads.

Run scheduled background jobs for smart suggestions and cleanup.

Keep codebase modular, testable, and production-ready.

3. User Roles
   Role Description Privileges
   Basic Free users with limited features Can create/edit/delete tasks, categories
   Premium Paid users All basic features + audit log access + task summaries
4. Core Modules
   a. Auth Module

Handles registration, login, JWT issuance and refresh.

Passwords stored securely (bcrypt).

Role assigned at signup (default: basic).

b. Task Module

CRUD for personal tasks with category assignment.

Support for due dates, reminders, and status updates.

Logs all create/update/delete actions.

Integrates with background “Smart Suggestion” job.

c. Category Module

CRUD for task categories (Work, Personal, etc.)

Basic users can have up to 5 custom categories.

Premium users can have unlimited categories.

d. User Profile Module

Fetch and update personal details.

Upgrade to premium (mock endpoint).

Shows user statistics: total tasks, completion rate, etc.

e. Logs Module

Activity Logs: stored for all users.

Audit Logs: only for premium users, tracks all API interactions.

f. Smart Suggestion Module (Async Job)

Runs periodically (via cron/AWS Scheduler).

Reads uncategorized tasks and categorizes them using keywords.

Optional: integrate GenAI for smarter text analysis.

g. Caching Layer

Redis caches GET /tasks responses for 30 seconds per user.

Cache invalidation triggered on create/update/delete.

5. Database Schema (simplified)

Users

Column Type Description
id UUID Primary key
name String
email String (unique)
password String (hashed)
role Enum(basic, premium)
createdAt Timestamp

Tasks

Column Type Description
id UUID Primary key
userId FK (Users)
categoryId FK (Categories) nullable
title String
description Text
dueDate Date
status Enum(todo, in_progress, done)
priority Enum(low, medium, high)
createdAt Timestamp
updatedAt Timestamp

Categories

Column Type Description
id UUID Primary key
userId FK (Users)
name String
color String optional
createdAt Timestamp

ActivityLogs

Column Type Description
id UUID Primary key
userId FK (Users)
action String create, update, delete
entity String task, category
entityId UUID
timestamp Timestamp

AuditLogs (Premium only)

Column Type Description
id UUID
userId FK (Users)
method String
endpoint String
statusCode Integer
requestTime Timestamp 6. API Endpoints
Auth
Method Endpoint Description
POST /api/auth/register Register new user
POST /api/auth/login Login and get JWT
POST /api/auth/refresh Refresh JWT token
User
Method Endpoint Description
GET /api/users/me Get current user profile
PATCH /api/users/me Update profile
POST /api/users/upgrade Upgrade to premium (mock)
Tasks
Method Endpoint Description
GET /api/tasks Get all tasks (cached)
GET /api/tasks/:id Get single task
POST /api/tasks Create task
PATCH /api/tasks/:id Update task
DELETE /api/tasks/:id Delete task
Categories
Method Endpoint Description
GET /api/categories Get all categories
POST /api/categories Create category
PATCH /api/categories/:id Update category
DELETE /api/categories/:id Delete category
Logs
Method Endpoint Description
GET /api/logs/activity Get activity logs (user-specific)
GET /api/logs/audit Get audit logs (premium only)
Smart Suggestions
Method Endpoint Description
POST /api/suggestions/run (Admin/internal) trigger categorization job manually 7. Background Job Flow

Trigger: Every hour (AWS EventBridge or node-cron)

Steps:

Fetch uncategorized tasks.

Analyze keywords or AI tags.

Update categoryId accordingly.

Log results in ActivityLogs.

8. Testing (Jest)

Unit tests for services and controllers

Integration tests for major routes

Mock Redis and DB with in-memory adapters

9. Deployment

Dockerized setup with docker-compose.yml for Postgres + Redis + App.

Environment variables via .env (JWT_SECRET, DB_URL, REDIS_URL).

Deployed on Render or Railway for demonstration.

10. Smart Task Planner — Folder Structure (Monolith, Scalable, TDD-Ready)
smart-task-planner/
│
├── prisma/
│   ├── schema.prisma                  # Database models and relationships
│   └── seed.ts                        # Optional: seed initial data
│
├── src/
│   ├── app.ts                         # Express app instance
│   ├── server.ts                      # Server entry point (starts app)
│   │
│   ├── config/
│   │   ├── env.ts                     # Loads env vars, validates via zod or dotenv-safe
│   │   └── redis.ts                   # Redis client setup
│   │
│   ├── db/
│   │   └── prismaClient.ts            # Prisma instance, single DB connection
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts         # JWT verification
│   │   ├── error.middleware.ts        # Global error handler
│   │   ├── audit.middleware.ts        # Logs requests for premium users
│   │   └── rateLimiter.ts             # Optional, express-rate-limit or Redis-based
│   │
│   ├── modules/                       # Main domain modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.types.ts
│   │   │   └── __tests__/auth.test.ts
│   │   │
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.types.ts
│   │   │   └── __tests__/user.test.ts
│   │   │
│   │   ├── tasks/
│   │   │   ├── task.controller.ts
│   │   │   ├── task.service.ts
│   │   │   ├── task.routes.ts
│   │   │   ├── task.types.ts
│   │   │   ├── task.cache.ts          # Redis cache logic for tasks
│   │   │   └── __tests__/task.test.ts
│   │   │
│   │   ├── categories/
│   │   │   ├── category.controller.ts
│   │   │   ├── category.service.ts
│   │   │   ├── category.routes.ts
│   │   │   └── __tests__/category.test.ts
│   │   │
│   │   ├── logs/
│   │   │   ├── activity.service.ts
│   │   │   ├── audit.service.ts
│   │   │   └── __tests__/logs.test.ts
│   │   │
│   │   └── suggestions/
│   │       ├── suggestion.job.ts      # Background job logic
│   │       └── __tests__/suggestion.test.ts
│   │
│   ├── jobs/
│   │   └── scheduler.ts               # Cron / AWS EventBridge setup for recurring jobs
│   │
│   ├── utils/
│   │   ├── logger.ts                  # Winston or pino logger setup
│   │   ├── response.ts                # Unified success/error response helper
│   │   ├── constants.ts               # Shared enums, strings, etc.
│   │   └── validator.ts               # Request validation helpers
│   │
│   └── tests/
│       ├── setup.ts                   # Global Jest setup (mock Redis, Prisma)
│       └── teardown.ts                # Optional cleanup script
│
├── .env.example                       # Example env vars
├── docker-compose.yml                 # For app + Postgres + Redis
├── Dockerfile
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md