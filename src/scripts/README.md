# ATOME Data Manager

A standalone web interface for managing habits and tasks data in the ATOME database.

## Features

- **Habits Management**: Add multiple habits to the database via JSON input
- **Tasks Management**: Add multiple tasks to the database via JSON input
- **JSON Validation**: Real-time validation of JSON format
- **Bulk Operations**: Add multiple items at once
- **Example Data**: Built-in examples for easy testing
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

### 1. Start the Backend Server

Make sure your ATOME backend server is running:

```bash
cd backend
npm run dev
```

The server should be running on `http://localhost:5000`

### 2. Open the Data Manager

Open the `data-manager.html` file in your web browser:

```bash
# Navigate to the scripts directory
cd backend/src/scripts

# Open the HTML file in your default browser
open data-manager.html
# or
start data-manager.html
# or simply double-click the file
```

### 3. Add Habits

1. Click "Load Example" to see the expected format
2. Modify the JSON data or paste your own
3. Click "Add Habits" to send the data to the database
4. Check the status message for confirmation

### 4. Add Tasks

1. Click "Load Example" to see the expected format
2. Modify the JSON data or paste your own
3. Click "Add Tasks" to send the data to the database
4. Check the status message for confirmation

## JSON Format Examples

### Habit Format

```json
{
  "id": "unique-habit-id",
  "title": "Habit Title",
  "description": "Detailed description of the habit",
  "duration": 21,
  "category": "Custom Category",
  "difficulty": "beginner",
  "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
  "isActive": true,
  "isFeatured": true,
  "sortOrder": 0,
  "prerequisites": [
    "Basic understanding of the habit concept",
    "Commitment to daily practice",
    "Willingness to track progress"
  ]
}
```

**Image Support**: The `image` field supports multiple formats:
- **Local assets**: `"healthy.png"` (must be in the app's assets folder)
- **Public URLs**: `"https://example.com/image.jpg"`
- **Relative URLs**: `"/images/habit.jpg"`
- **Fallback**: If an image fails to load, a default placeholder will be shown

**Category Support**: Both habits and tasks support flexible categories:
- **Custom Categories**: `"My Custom Category"`, `"Work & Productivity"`, `"Personal Growth"`
- **No Restrictions**: Any category name up to 50 characters
- **Dynamic Categories**: Categories are automatically created when habits/tasks are added
- **Task Categories**: Tasks can use any category like `"work"`, `"mindset"`, `"planning"`, `"digital-wellness"`

### Task Format

```json
{
  "habitId": "habit-id-this-task-belongs-to",
  "id": "unique-task-id",
  "title": "Task Title",
  "description": "Detailed task description",
  "day": 1,
  "week": 1,
  "category": "work",
  "estimatedTime": "15 minutes",
  "executionTime": "Morning",
  "notifyTime": "08:00",
  "weekGoal": "Complete all daily tasks"
}
```

### Bulk Operations

You can also send arrays of habits or tasks:

```json
[
  {
    "id": "habit-1",
    "title": "First Habit",
    "description": "Description 1",
    "duration": 21,
    "category": "Health & Fitness",
    "difficulty": "beginner",
    "image": "healthy.png",
    "isActive": true,
    "isFeatured": true,
    "sortOrder": 0
  },
  {
    "id": "habit-2",
    "title": "Second Habit",
    "description": "Description 2",
    "duration": 30,
    "category": "Learning & Growth",
    "difficulty": "intermediate",
    "image": "study.png",
    "isActive": true,
    "isFeatured": false,
    "sortOrder": 1
  }
]
```

## API Endpoints

The data manager uses these backend endpoints:

- `POST /api/habits/bulk` - Create multiple habits
- `POST /api/tasks/bulk` - Create multiple tasks

## Error Handling

The interface provides helpful error messages for:

- Invalid JSON format
- Missing required fields
- Duplicate IDs
- Network connection issues
- Server errors

## Security Note

This tool is designed for development and testing purposes. In production, you should:

- Add authentication to the bulk endpoints
- Implement proper validation
- Add rate limiting
- Use HTTPS

## Troubleshooting

### CORS Errors

If you see CORS errors like "Access to fetch at 'http://localhost:5000/api/habits/bulk' from origin 'http://127.0.0.1:5500' has been blocked by CORS policy":

**Solution 1: Use the included server**
```bash
cd backend/src/scripts
node serve-data-manager.js
```
Then open `http://localhost:3001` in your browser.

**Solution 2: Restart the backend server**
The backend server has been updated to allow CORS from Live Server origins. Restart it:
```bash
cd backend
npm run dev
```

### "Unable to connect to the remote server"

- Make sure the backend server is running on `http://localhost:5000`
- Check if there are any firewall restrictions
- Verify the API_BASE_URL in the HTML file

### "Invalid JSON format"

- Use a JSON validator to check your syntax
- Make sure all strings are properly quoted
- Check for trailing commas (not allowed in JSON)

### "Some habits already exist"

- Each habit and task must have a unique `id`
- Check your existing data to avoid duplicates
- Use different IDs for new items
