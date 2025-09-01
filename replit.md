# FitTrack Pro

## Overview

FitTrack Pro is a mobile-first fitness tracking application built as a progressive web app (PWA). The application allows users to log workouts, track exercise progress, and visualize fitness trends over time. It features an intuitive mobile interface with workout category selection, exercise logging with customizable weight/reps/sets, and comprehensive progress analytics. The app is designed to help users monitor their fitness journey with detailed metrics and visual progress charts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component system for accessible, customizable components
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Mobile-First Design**: Responsive layout optimized for mobile devices with fixed bottom navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Schema Validation**: Zod for runtime type checking and API validation
- **Storage Layer**: Abstracted storage interface supporting both in-memory (development) and PostgreSQL (production)
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Design**: Four main tables (users, exercises, workouts, workout_sets) with proper foreign key relationships
- **Migration Management**: Drizzle Kit for database schema migrations
- **Data Validation**: Strong typing throughout the stack with Drizzle schemas and Zod validation

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Security**: Basic username/password authentication (ready for expansion to OAuth/JWT)
- **User Context**: Mock user system for demo purposes, easily replaceable with real auth

### Development and Build Tools
- **Build System**: Vite for fast development and optimized production builds
- **TypeScript**: Strict configuration with path aliases for clean imports
- **Development**: Hot module replacement and error overlay for efficient development
- **Production**: Optimized builds with static asset serving

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight React router
- **drizzle-orm**: Type-safe SQL toolkit and ORM
- **chart.js**: Data visualization for progress charts
- **date-fns**: Date formatting and manipulation

### Database and Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **connect-pg-simple**: PostgreSQL session store for Express
- **drizzle-kit**: Database migration and introspection tools

### Development Tools
- **vite**: Build tool and development server
- **tailwindcss**: Utility-first CSS framework
- **typescript**: Static type checking
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development tools

### UI and Styling
- **tailwindcss**: Utility-first CSS with custom design system
- **class-variance-authority**: Component variant management
- **clsx**: Conditional CSS class composition
- **lucide-react**: Icon library for consistent iconography

### Form Handling and Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Runtime type validation and parsing