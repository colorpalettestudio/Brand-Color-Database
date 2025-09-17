# Brand Color Database

## Overview

A productivity tool designed for designers and developers to discover, filter, and copy brand colors. The application features a curated database of 600+ colors with advanced filtering capabilities by hue, style keywords, and search functionality. Users can instantly copy hex codes to their clipboard and explore colors through an intuitive grid interface with both light and dark theme support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Component-based architecture using functional components with hooks
- **Vite Build System**: Fast development server with hot module replacement and optimized production builds
- **Routing**: Client-side routing using Wouter for lightweight navigation
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **State Management**: React Query (TanStack Query) for server state management with built-in caching
- **Styling**: Tailwind CSS with custom design system supporting light/dark themes

### Backend Architecture
- **Express.js Server**: RESTful API with TypeScript support
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Data Storage**: PostgreSQL database with Neon serverless infrastructure
- **In-Memory Fallback**: MemStorage class provides fallback when database is unavailable
- **API Design**: RESTful endpoints for color retrieval, filtering, and search operations

### Design System
- **Color Palette**: Utility-focused design with primary blue (#220 91% 50%) and neutral grays
- **Typography**: Inter font family with consistent weight hierarchy (400, 500, 600)
- **Component Library**: Reusable color swatches (120px squares), filter chips, and responsive grid layouts
- **Theme System**: CSS custom properties for seamless light/dark mode switching

### Data Management
- **Color Classification**: Automated hue detection and keyword tagging system
- **Search & Filtering**: Multi-dimensional filtering by hue categories and style keywords
- **Seed Data**: Curated collection of brand colors with synthetic generation for additional variety
- **Performance**: Debounced search queries and optimized rendering for large color datasets

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migrations and schema management
- **WebSocket Support**: Real-time database connections via ws package

### UI and Styling
- **Google Fonts**: Inter and additional font families via CDN
- **Radix UI**: Comprehensive primitive components for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography

### Development Tools
- **Replit Integration**: Development environment plugins and error handling
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins