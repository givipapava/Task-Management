# Task Management API

Enterprise-grade NestJS backend for the Task Management Dashboard application.

## Features

### Core Functionality
- ✅ Full CRUD operations for tasks
- ✅ Task categorization (Work, Personal, Shopping, Health, Other)
- ✅ Priority levels (High, Medium, Low)
- ✅ Task status tracking (Pending, In Progress, Completed)
- ✅ Due date management with ISO 8601 validation

### Production-Ready Features
- 🛡️ **Security**
  - Helmet security headers
  - Rate limiting (100 requests/minute per IP)
  - Input validation and sanitization
  - CORS configuration

- ⚡ **Performance**
  - Response compression
  - File write synchronization (mutex-protected)
  - Efficient file-based storage

- 📊 **Monitoring & Observability**
  - Health check endpoints (`/health`, `/health/live`, `/health/ready`)
  - Comprehensive request logging
  - Structured error logging
  - Service operation logging

- 📚 **Documentation**
  - Interactive Swagger/OpenAPI documentation at `/api/docs`
  - JSDoc comments on all methods
  - Type-safe TypeScript

- 🔧 **Configuration**
  - Environment-based configuration with validation
  - Graceful shutdown handling
  - Production build scripts

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20.x
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet + Throttler
- **Health Checks**: @nestjs/terminus

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

\`\`\`bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
\`\`\`

### Development

\`\`\`bash
# Run in development mode with hot reload
npm run dev
\`\`\`

The API will be available at:
- API: \`http://localhost:3001/api/tasks\`
- Swagger Docs: \`http://localhost:3001/api/docs\`
- Health Check: \`http://localhost:3001/health\`

### Production

\`\`\`bash
# Build for production
npm run build:prod

# Start production server
npm run start:prod
\`\`\`

## API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | \`/api/tasks\` | Get all tasks |
| GET    | \`/api/tasks/:id\` | Get task by ID |
| POST   | \`/api/tasks\` | Create new task |
| PUT    | \`/api/tasks/:id\` | Update task |
| DELETE | \`/api/tasks/:id\` | Delete task |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | \`/health\` | Comprehensive health check |
| GET    | \`/health/live\` | Liveness probe |
| GET    | \`/health/ready\` | Readiness probe |

## License

MIT
