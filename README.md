# Task Management Dashboard

A modern, full-stack task management application built with React, TypeScript, NestJS, and Ant Design. This application allows users to create, edit, delete, and organize tasks with an intuitive and accessible enterprise-grade interface.

## 🚀 Quick Start

```bash
# Install all dependencies
npm run install:all

# Start both backend and frontend concurrently
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser!

- Backend API: `http://localhost:3001`
- Frontend App: `http://localhost:5173`

## Features

### Core Requirements ✅
- **Task List View**: Display tasks in a clean, organized table layout with Ant Design
- **Task Creation**: Form with validation using Ant Design Form components
- **Task Management**: Edit, delete, and mark tasks as complete
- **Filtering**: Filter by status (All, Pending, Completed) with visual indicators
- **API Integration**: Full RESTful API with NestJS backend
- **Error Handling**: Meaningful feedback using Ant Design message/notification
- **Loading Indicators**: Loading states during all API calls
- **Data Persistence**: Static JSON file storage

### Task Properties
- ✅ Title (required)
- ✅ Description (optional)
- ✅ Priority (High, Medium, Low) with color-coded tags
- ✅ Due date (optional) with date picker
- ✅ Status (Pending or Completed)
- ✅ Created timestamp (automatic)
- ✅ Updated timestamp (automatic)

### Bonus Features Implemented
- ✅ **Real-time Search**: Instant search filtering across title and description
- ✅ **Professional UI**: Enterprise-grade interface with Ant Design components
- ✅ **Advanced Filtering**: Combined search and status filtering
- ✅ **Responsive Table**: Pagination and sorting capabilities

### Additional Features
- Priority-based color coding (Red/Orange/Blue tags)
- Overdue task indicators with red highlighting
- Checkbox-based task completion toggle
- Popconfirm dialogs for destructive actions
- Empty state handling
- Task count badges in filters
- Professional layout with header and content areas
- Success/error notifications

## Technology Stack

### Frontend
- **React 19** - Modern UI framework with TypeScript
- **Ant Design 5.x** - Enterprise-grade UI component library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool with HMR
- **dayjs** - Date manipulation library (used by Ant Design)

### Backend
- **NestJS 10** - Progressive Node.js framework
- **TypeScript** - Type-safe backend development
- **Express** - HTTP server (built into NestJS)
- **class-validator** - DTO validation decorators
- **class-transformer** - Object transformation
- **File-based Storage** - JSON file for data persistence

## Project Structure

```
Task-Management/
├── backend/                         # NestJS Backend
│   ├── src/
│   │   ├── tasks/
│   │   │   ├── dto/
│   │   │   │   ├── create-task.dto.ts    # Create task DTO with validation
│   │   │   │   └── update-task.dto.ts    # Update task DTO with validation
│   │   │   ├── task.entity.ts            # Task interface and enums
│   │   │   ├── tasks.controller.ts       # REST API controller
│   │   │   ├── tasks.service.ts          # Business logic layer
│   │   │   └── tasks.module.ts           # NestJS module
│   │   ├── data/
│   │   │   └── tasks.json                # JSON file storage
│   │   ├── app.module.ts                 # Root module
│   │   └── main.ts                       # Application entry point
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
├── frontend/                        # React + Ant Design Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskForm.tsx              # Task form (Ant Design Form)
│   │   │   ├── TaskList.tsx              # Task table (Ant Design Table)
│   │   │   └── TaskFilters.tsx           # Search & filter controls
│   │   ├── services/
│   │   │   └── api.ts                    # API service layer
│   │   ├── types/
│   │   │   └── task.ts                   # TypeScript interfaces
│   │   ├── App.tsx                       # Main application component
│   │   └── main.tsx                      # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── README.md                        # This file
└── PRODUCT_DECISIONS.md             # Design decisions documentation
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

#### Quick Install (All Dependencies at Once)
```bash
# From the project root directory
npm run install:all
```
This will install dependencies for the root, backend, and frontend in one command.

#### Manual Installation (Alternative)

1. **Clone the repository** (if applicable):
```bash
git clone <repository-url>
cd Task-Management
```

2. **Install root dependencies** (for concurrent running):
```bash
npm install
```

3. **Install backend dependencies**:
```bash
cd backend
npm install
cd ..
```

4. **Install frontend dependencies**:
```bash
cd frontend
npm install
cd ..
```

### Running the Application

You need to run both the backend and frontend servers simultaneously.

#### ⭐ Option 1: Concurrent Mode (Recommended)

**Run both servers with one command:**
```bash
# From the project root directory
npm run dev
```

This will start:
- **Backend** on `http://localhost:3001` (NestJS API)
- **Frontend** on `http://localhost:5173` (React + Vite)

Both servers will run concurrently in the same terminal with color-coded output.

#### Option 2: Manual Mode (Two Terminals)

**Terminal 1 - Backend Server**:
```bash
cd backend
npm run dev
```
The backend server will start on `http://localhost:3001`

**Terminal 2 - Frontend Server**:
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:5173` (or next available port)

#### Option 3: Background Processes (Unix/Mac)
```bash
# From the project root
cd backend && npm run dev &
cd ../frontend && npm run dev
```

### Accessing the Application

Once both servers are running:
1. Open your browser
2. Navigate to `http://localhost:5173` (or the port shown in the frontend terminal)
3. The application should connect to the backend automatically

### Building for Production

**Backend**:
```bash
cd backend
npm run build
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
npm run preview
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Get All Tasks
```
GET /api/tasks
```
**Response**: Array of task objects

#### Get Single Task
```
GET /api/tasks/:id
```
**Response**: Task object or 404 error

#### Create Task
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Task title (required)",
  "description": "Task description (optional)",
  "priority": "high|medium|low (required)",
  "dueDate": "2024-01-15 (optional, ISO date format)"
}
```
**Response**: Created task object with 201 status

#### Update Task
```
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated title (optional)",
  "description": "Updated description (optional)",
  "priority": "high|medium|low (optional)",
  "status": "pending|completed (optional)",
  "dueDate": "2024-01-20 (optional)"
}
```
**Response**: Updated task object

#### Delete Task
```
DELETE /api/tasks/:id
```
**Response**: 204 No Content on success, 404 if not found

### Error Responses
All endpoints return appropriate error responses:
- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

Example error response:
```json
{
  "error": "Error message description"
}
```

## Available Scripts

### Root Scripts (Concurrent Mode)
Run these from the project root directory:

- `npm run install:all` - Install all dependencies (root, backend, and frontend)
- `npm run dev` - **Start both backend and frontend concurrently** ⭐
- `npm run dev:backend` - Start only the backend server
- `npm run dev:frontend` - Start only the frontend server
- `npm run build` - Build both backend and frontend for production
- `npm run build:backend` - Build only the backend
- `npm run build:frontend` - Build only the frontend

### Backend Scripts (NestJS)
Run these from the `backend/` directory:

- `npm run dev` - Start development server with hot reload (watch mode)
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start development server (no watch)
- `npm run start:prod` - Start production server
- `npm run format` - Format code with Prettier

### Frontend Scripts (React + Vite)
Run these from the `frontend/` directory:

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Development Notes

### Backend Architecture (NestJS)
- **Modular Structure**: Feature-based modules (TasksModule)
- **Dependency Injection**: NestJS built-in DI container
- **DTO Validation**: class-validator decorators for automatic validation
- **Service Layer**: Business logic separated from controllers
- **Type Safety**: Full TypeScript coverage with strict mode
- **Error Handling**: Built-in exception filters
- **File-based Storage**: JSON file for simplicity (easily replaceable with database)
- **CORS Enabled**: Frontend can communicate from different origin

### Frontend Architecture (React + Ant Design)
- **Component-based**: Reusable React functional components
- **Ant Design Components**: Enterprise-grade UI components
  - Form with built-in validation
  - Table with pagination, sorting, and filtering
  - Modal/Popconfirm for confirmations
  - Message/Notification for feedback
  - Layout components for structure
- **State Management**: React hooks (useState, useEffect, useMemo)
- **API Integration**: Centralized service layer
- **Type Safety**: TypeScript interfaces matching backend DTOs
- **Performance**: useMemo for expensive filtering operations
- **UX**: Loading states, error handling, success feedback

### Technology Choices & Rationale

**Why NestJS?**
- ✅ Enterprise-grade Node.js framework
- ✅ Built-in TypeScript support
- ✅ Dependency injection and modular architecture
- ✅ Excellent for building scalable APIs
- ✅ Built-in validation with decorators
- ✅ Easy to test and maintain
- ✅ Professional architecture patterns

**Why Ant Design?**
- ✅ Comprehensive component library (100+ components)
- ✅ Professional, enterprise-grade UI
- ✅ Excellent TypeScript support
- ✅ Built-in form validation
- ✅ Responsive and accessible by default
- ✅ Consistent design language
- ✅ Well-documented with examples
- ✅ Battle-tested in production applications

**Why Vite?**
- ✅ Lightning-fast development server with HMR
- ✅ Optimized production builds
- ✅ Native ESM support
- ✅ Great TypeScript support

**Why File-based Storage?**
- ✅ Simplicity for demonstration
- ✅ No database setup required
- ✅ Easy to inspect and modify
- ✅ Can be easily replaced with database in production

## Testing the Application

### Manual Testing Checklist
1. ✅ Create a new task
2. ✅ Edit an existing task
3. ✅ Delete a task
4. ✅ Toggle task completion status
5. ✅ Filter by status (All, Pending, Completed)
6. ✅ Search for tasks
7. ✅ Test form validation (empty title)
8. ✅ Test with due dates
9. ✅ Test all priority levels
10. ✅ Test keyboard navigation

### API Testing with cURL

**Create a task**:
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing the API",
    "priority": "high",
    "dueDate": "2024-02-01"
  }'
```

**Get all tasks**:
```bash
curl http://localhost:3001/api/tasks
```

**Update a task**:
```bash
curl -X PUT http://localhost:3001/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**Delete a task**:
```bash
curl -X DELETE http://localhost:3001/api/tasks/1
```

## Troubleshooting

### Backend won't start
- Ensure port 3001 is not in use
- Check that all dependencies are installed
- Verify Node.js version is 18+

### Frontend can't connect to backend
- Ensure backend server is running
- Check CORS is enabled (it is by default)
- Verify API URL in frontend (defaults to localhost:3001)

### TypeScript errors
- Run `npm run type-check` to see detailed errors
- Ensure all dependencies are installed
- Check tsconfig.json settings

## Future Enhancements

Potential features for future development:
- User authentication and authorization
- Database integration (PostgreSQL, MongoDB)
- Task categories/tags
- Drag-and-drop task reordering
- Data visualization (charts, statistics)
- Export/import functionality
- Dark mode
- Notifications and reminders
- Collaborative features
- Mobile app

## License

MIT

## Contact

For questions or feedback about this project, please reach out to the interviewer.