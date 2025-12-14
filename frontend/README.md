# Task Management Frontend (React + Ant Design)

Modern, professional task management interface built with React, TypeScript, and Ant Design.

## Tech Stack

- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Ant Design 5.x** - Enterprise UI component library
- **Vite** - Lightning-fast build tool
- **dayjs** - Date manipulation

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will run on `http://localhost:5173` (or next available port)

**Prerequisites**: Backend server must be running on `http://localhost:3001`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── TaskForm.tsx        # Task create/edit form (Ant Design Form)
│   │   ├── TaskList.tsx        # Task table (Ant Design Table)
│   │   └── TaskFilters.tsx     # Search & filter controls
│   ├── services/
│   │   └── api.ts              # API service layer
│   ├── types/
│   │   └── task.ts             # TypeScript interfaces
│   ├── App.tsx                 # Main application
│   └── main.tsx                # Entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features

### Core Features
- ✅ Create, read, update, delete tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Filter by status (All, Pending, Completed)
- ✅ Real-time search (bonus feature)
- ✅ Professional UI with Ant Design

### UI Components (Ant Design)
- **Form**: Task creation/editing with validation
- **Table**: Tasks display with pagination and sorting
- **Input**: Text inputs with icons and validation
- **Select**: Priority dropdown
- **DatePicker**: Due date selection
- **Tag**: Priority and status indicators
- **Button**: Actions with loading states
- **Popconfirm**: Delete confirmations
- **Message**: Success/error notifications
- **Layout**: Professional page structure
- **Spin**: Loading indicators

### Additional Features
- Priority color coding (Red/Orange/Blue)
- Overdue task indicators
- Task count badges
- Empty states
- Responsive design
- Keyboard accessibility

## Configuration

Create a `.env` file (optional):

```env
VITE_API_URL=http://localhost:3001/api
```

If not provided, defaults to `http://localhost:3001/api`

## Component Architecture

### TaskForm
- Ant Design Form with validation
- Create and edit modes
- Auto-populated fields when editing
- Loading states during submission

### TaskList
- Ant Design Table with sorting and pagination
- Checkbox for status toggle
- Edit and delete actions
- Color-coded priority tags
- Overdue indicators

### TaskFilters
- Search input with icon
- Radio button group for status filter
- Real-time filtering
- Task count badges

### App
- Layout with header and content
- State management with React hooks
- API integration
- Error handling
- Loading states

## Development

The application uses:
- **useState**: Local state management
- **useEffect**: Side effects (data fetching)
- **useMemo**: Performance optimization for filtering

## Build

```bash
npm run build
```

Optimized production build will be in `dist/` directory.

See the main [README.md](../README.md) for complete documentation.
