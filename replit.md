# MedsBuddy - Medication Management System

## Overview

MedsBuddy is a full-stack medication management application built with React and Express.js. The system allows patients and caretakers to track medications, monitor adherence, and manage medication schedules effectively. The application features a modern UI built with React and shadcn/ui components, backed by a RESTful API and SQLite database for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: SQLite with Drizzle ORM for type-safe database operations
- **Authentication**: JWT tokens with bcrypt for password hashing
- **API Design**: RESTful API with proper error handling and middleware

### Development Environment
- **Package Manager**: npm
- **TypeScript**: Full TypeScript support across frontend and backend
- **Hot Reload**: Vite development server with HMR
- **Environment**: Replit with auto-scaling deployment configuration

## Key Components

### Authentication System
- JWT-based authentication with secure token storage
- User registration and login with role-based access (patient/caretaker)
- Password hashing using bcrypt with configurable salt rounds
- Middleware for protecting authenticated routes

### Database Schema
- **Users Table**: Stores user credentials, profile information, and roles
- **Medications Table**: Manages medication details including name, dosage, frequency, and timing
- **Medication Logs Table**: Tracks when medications are taken for adherence monitoring
- Type-safe schema definitions using Drizzle ORM with Zod validation

### Medication Management
- CRUD operations for medication management
- Flexible scheduling with JSON-stored time arrays
- Medication adherence tracking and reporting
- Real-time status updates for taken/missed medications

### User Interface
- Responsive design using Tailwind CSS
- Modern component library (shadcn/ui) with Radix UI primitives
- Dark/light theme support with CSS custom properties
- Accessible components following ARIA guidelines

## Data Flow

### Authentication Flow
1. User submits login/signup form with validation
2. Frontend sends credentials to backend API
3. Backend validates credentials and generates JWT token
4. Token stored in localStorage for subsequent requests
5. Protected routes verify token via middleware

### Medication Management Flow
1. User adds medication through validated form
2. API creates medication record with user association
3. Frontend updates UI state via React Query cache invalidation
4. Medication times stored as JSON for flexible scheduling
5. Adherence calculated based on taken vs. scheduled doses

### State Management
- Server state managed by TanStack Query with automatic caching
- Local UI state handled by React hooks
- Form state managed by React Hook Form with Zod schemas
- Authentication state persisted in localStorage with automatic rehydration

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connectivity (configured for SQLite)
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **drizzle-orm**: Type-safe ORM for database operations
- **zod**: Runtime type validation and schema definition

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type checking and compilation
- **tailwindcss**: Utility-first CSS framework
- **eslint**: Code linting and quality checks

### Authentication & Security
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Secure password hashing
- Input sanitization through Zod schema validation
- CORS and security headers via Express middleware

## Deployment Strategy

### Development Environment
- Replit workspace with Node.js 20 runtime
- PostgreSQL 16 module available (currently using SQLite)
- Hot reload development server on port 5000
- Automatic dependency installation and environment setup

### Production Build
- Vite production build with code splitting and optimization
- Static asset bundling with cache-friendly filenames
- Express server bundle using esbuild for Node.js target
- Autoscale deployment configuration for production workloads

### Database Migration
- Drizzle Kit for schema migrations and database management
- Environment-based configuration for different deployment stages
- Schema versioning and rollback capabilities
- Automatic migration on deployment

## Changelog

Changelog:
- June 21, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.