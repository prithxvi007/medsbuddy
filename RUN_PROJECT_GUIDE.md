# MedsBuddy - Complete Setup and Run Guide

## Prerequisites
- Node.js 20+ installed
- npm package manager
- Terminal/Command prompt access

## Step 1: Project Setup

### 1.1 Clone or Download the Project
```bash
# If using git
git clone <your-repo-url>
cd medsbuddy

# Or if you have the project files already, navigate to the project directory
cd /path/to/your/project
```

### 1.2 Install Dependencies
```bash
# Install all project dependencies
npm install
```

## Step 2: Database Setup

### 2.1 Create Database Tables
The database tables are automatically created when the server starts, but you can verify by running:

```bash
# Run the database query tool to check tables
node db-query.js
```

This will show you:
- All database tables (users, medications, medication_logs)
- Table structures
- Current data (initially empty)

## Step 3: Start the Application

### 3.1 Development Mode (Recommended)
```bash
# Start the development server
npm run dev
```

This command will:
- Start the Express backend server
- Start the Vite frontend development server
- Automatically create database tables
- Enable hot reload for development

### 3.2 Production Mode
```bash
# Build the application
npm run build

# Start in production mode
npm start
```

## Step 4: Access the Application

Once the server is running, you'll see:
```
Database tables created successfully
[TIME] [express] serving on port 5000
```

### 4.1 Open in Browser
- **Main Application**: http://localhost:5000
- **Database Query Tool**: http://localhost:5000/database

### 4.2 Available Routes
- `/` - Landing page
- `/auth` - Login/Signup page
- `/dashboard` - Main medication management interface
- `/database` - Database query tool (for development)

## Step 5: Using the Application

### 5.1 Create an Account
1. Go to http://localhost:5000/auth
2. Click "Create Account" tab
3. Fill in the registration form:
   - Username
   - Email
   - Password
   - First Name
   - Last Name
   - Role (Patient or Caretaker)
4. Click "Sign Up"

### 5.2 Login
1. Go to http://localhost:5000/auth
2. Enter your email and password
3. Click "Sign In"

### 5.3 Manage Medications
1. After logging in, you'll be redirected to the dashboard
2. Click "Add Medication" to create new medications
3. Fill in medication details:
   - Name
   - Dosage
   - Frequency
   - Times to take
   - Notes (optional)

## Step 6: Database Management

### 6.1 View Database Contents
```bash
# Run the query tool to see all data
node db-query.js
```

### 6.2 Custom Database Queries
You can modify the `db-query.js` file to run custom queries:

```javascript
// Example: Add this to db-query.js
executeQuery("SELECT * FROM users WHERE role = 'patient'", "PATIENT USERS");
```

## Step 7: Troubleshooting

### 7.1 Common Issues and Solutions

**Error: "Cannot find module 'better-sqlite3'"**
```bash
npm install better-sqlite3 @types/better-sqlite3
```

**Error: "Database tables not found"**
```bash
# Delete the database file and restart
rm sqlite.db
npm run dev
```

**Error: "Port 5000 already in use"**
```bash
# Find and kill the process using port 5000
lsof -ti:5000 | xargs kill -9
npm run dev
```

**Error: "React component warnings"**
- These are development warnings and don't affect functionality
- The app will still work properly

### 7.2 Checking Application Status

**Server Running Successfully:**
```
Database tables created successfully
[TIME] [express] serving on port 5000
```

**Frontend Connected:**
```
[vite] connecting...
[vite] connected.
```

### 7.3 API Endpoint Testing
```bash
# Test if server is responding
curl http://localhost:5000/api/medications

# Should return: {"message":"Access token required"}
# This confirms the API is working correctly
```

## Step 8: Development Workflow

### 8.1 File Watching
The development server automatically watches for changes in:
- `client/src/**` - Frontend React code
- `server/**` - Backend Express code
- `shared/**` - Shared types and schemas

### 8.2 Database Schema Changes
If you modify the database schema in `shared/schema.ts`:
1. Stop the server (Ctrl+C)
2. Delete the database: `rm sqlite.db`
3. Restart: `npm run dev`

### 8.3 Adding New Features
1. Update schema in `shared/schema.ts` if needed
2. Add backend routes in `server/routes.ts`
3. Create frontend components in `client/src/components/`
4. Add pages in `client/src/pages/`
5. Update navigation in `client/src/App.tsx`

## Step 9: Project Structure

```
medsbuddy/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── routes.ts           # API routes
│   ├── db.ts              # Database connection
│   └── storage.ts         # Data access layer
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and validation
├── db-query.js            # Database query tool
└── package.json           # Dependencies and scripts
```

## Step 10: Success Indicators

✅ **Application is working correctly when you see:**
- Server starts without errors
- Database tables created successfully
- Can access http://localhost:5000
- Can create user accounts
- Can login successfully
- Can add and manage medications
- Database query tool shows proper table structure

## Commands Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# View database contents
node db-query.js

# Check dependencies
npm list

# Install new dependency
npm install <package-name>
```

Your MedsBuddy application is now ready to use! The system provides a complete medication management solution with user authentication, medication tracking, and adherence monitoring.