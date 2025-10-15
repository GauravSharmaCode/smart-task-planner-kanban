# Update Readme

Whenever any change is made to the repo, we need to ensure that the same is updated in the readme file.

# Desired Folder Structure

The structure of the files and folder should remain around the following:
smart-task-planner/
│
├── prisma/
│ ├── schema.prisma # Database models and relationships
│ └── seed.ts # Optional: seed initial data
│
├── src/
│ ├── app.ts # Express app instance
│ ├── server.ts # Server entry point (starts app)
│ │
│ ├── config/
│ │ ├── env.ts # Loads env vars, validates via zod or dotenv-safe
│ │ └── redis.ts # Redis client setup
│ │
│ ├── db/
│ │ └── prismaClient.ts # Prisma instance, single DB connection
│ │
│ ├── middleware/
│ │ ├── auth.middleware.ts # JWT verification
│ │ ├── error.middleware.ts # Global error handler
│ │ ├── audit.middleware.ts # Logs requests for premium users
│ │ └── rateLimiter.ts # Optional, express-rate-limit or Redis-based
│ │
│ ├── modules/ # Main domain modules
│ │ ├── auth/
│ │ │ ├── auth.controller.ts
│ │ │ ├── auth.service.ts
│ │ │ ├── auth.routes.ts
│ │ │ ├── auth.types.ts
│ │ │ └── **tests**/auth.test.ts
│ │ │
│ │ ├── users/
│ │ │ ├── user.controller.ts
│ │ │ ├── user.service.ts
│ │ │ ├── user.routes.ts
│ │ │ ├── user.types.ts
│ │ │ └── **tests**/user.test.ts
│ │ │
│ │ ├── tasks/
│ │ │ ├── task.controller.ts
│ │ │ ├── task.service.ts
│ │ │ ├── task.routes.ts
│ │ │ ├── task.types.ts
│ │ │ ├── task.cache.ts # Redis cache logic for tasks
│ │ │ └── **tests**/task.test.ts
│ │ │
│ │ ├── categories/
│ │ │ ├── category.controller.ts
│ │ │ ├── category.service.ts
│ │ │ ├── category.routes.ts
│ │ │ └── **tests**/category.test.ts
│ │ │
│ │ ├── logs/
│ │ │ ├── activity.service.ts
│ │ │ ├── audit.service.ts
│ │ │ └── **tests**/logs.test.ts
│ │ │
│ │ └── suggestions/
│ │ ├── suggestion.job.ts # Background job logic
│ │ └── **tests**/suggestion.test.ts
│ │
│ ├── jobs/
│ │ └── scheduler.ts # Cron / AWS EventBridge setup for recurring jobs
│ │
│ ├── utils/
│ │ ├── logger.ts # Winston or pino logger setup
│ │ ├── response.ts # Unified success/error response helper
│ │ ├── constants.ts # Shared enums, strings, etc.
│ │ └── validator.ts # Request validation helpers
│ │
│ └── tests/
│ ├── setup.ts # Global Jest setup (mock Redis, Prisma)
│ └── teardown.ts # Optional cleanup script
│
├── .env.example # Example env vars
├── docker-compose.yml # For app + Postgres + Redis
├── Dockerfile
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
