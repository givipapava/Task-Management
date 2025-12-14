# Screenshots Directory

This directory contains screenshots of the Task Management application for the README.

## Required Screenshots

Please add the following screenshots to this directory:

### Light Mode Screenshots:
1. `dashboard-light.png` - Dashboard view showing stats and recent activity
2. `task-list-light.png` - Task list view with filters and search
3. `kanban-board-light.png` - Kanban board with drag-and-drop
4. `analytics-light.png` - Analytics view with charts

### Dark Mode Screenshots:
5. `dashboard-dark.png` - Dashboard in dark mode
6. `task-list-dark.png` - Task list in dark mode
7. `kanban-board-dark.png` - Kanban board in dark mode

### Feature Screenshots:
8. `create-task.png` - Task creation modal
9. `edit-task.png` - Task editing modal

## Screenshot Guidelines

### Recommended Settings:
- **Browser**: Chrome or Firefox (latest version)
- **Window Size**: 1920x1080 or 1440x900
- **Zoom Level**: 100%
- **Sample Data**: Include at least 5-10 tasks with variety of:
  - Different priorities (High, Medium, Low)
  - Different statuses (Pending, In Progress, Completed)
  - Different categories (Work, Personal, Shopping, Health)
  - Some with due dates (including overdue)
  - Mix of tasks with and without descriptions

### How to Take Screenshots:

#### Option 1: macOS Built-in (Recommended)
1. Open the application at http://localhost:5173
2. Press `Cmd + Shift + 4` then `Space`
3. Click on the browser window
4. Screenshot will be saved to Desktop
5. Rename and move to this `images/` folder

#### Option 2: Browser DevTools
1. Open Chrome DevTools (F12)
2. Press `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows)
3. Type "Capture screenshot"
4. Choose "Capture full size screenshot"
5. Save to this `images/` folder

#### Option 3: Browser Extensions
- **Awesome Screenshot** (Chrome/Firefox)
- **Lightshot** (Cross-platform)
- **Nimbus Screenshot** (Chrome)

### After Adding Screenshots:

Once all screenshots are added, they will automatically appear in the README.md file on GitHub.

The README already has the proper markdown image references configured:
```markdown
![Dashboard](./images/dashboard-light.png)
```

Simply commit and push:
```bash
git add images/
git commit -m "Add application screenshots"
git push
```

## Tips for Great Screenshots

1. **Clean Browser**: Close unnecessary tabs, hide bookmarks bar
2. **Full Features**: Show the app with real data, not empty states
3. **Highlight Features**: Capture screenshots that showcase key features
4. **Consistency**: Use same browser and zoom level for all screenshots
5. **No Personal Data**: Don't include real personal information
6. **Good Contrast**: Ensure text is readable in both light and dark modes

## Current Status

- [ ] dashboard-light.png
- [ ] dashboard-dark.png
- [ ] task-list-light.png
- [ ] task-list-dark.png
- [ ] kanban-board-light.png
- [ ] kanban-board-dark.png
- [ ] analytics-light.png
- [ ] create-task.png
- [ ] edit-task.png

Check off items as you add them!
