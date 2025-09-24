# Attendo - Student Attendance Management System

A comprehensive Vue.js single-page application designed to streamline attendance tracking for examination sessions at ESI (École Supérieure d'Informatique).

## Project Overview

Attendo is a web-based attendance management system that allows instructors to efficiently track student presence across multiple evaluation sessions, courses, and examination rooms. The application provides a hierarchical navigation structure from sessions to individual student attendance, making it easy to manage complex examination scenarios.

## Key Features

### Authentication & Authorization
- **Google OAuth Integration**: Secure authentication using Google as the OAuth provider
- **Protected Routes**: Route guards prevent unauthorized access to application features
- **Session Management**: Persistent user sessions with automatic redirects

### Hierarchical Data Management
- **Sessions**: Manage evaluation periods (January, June, etc.)
- **Course Units (UE)**: Associate courses with specific sessions
- **Events**: Define multiple evaluation types per course (exams, projects, assessments)
- **Rooms**: Assign examination rooms to events with capacity management
- **Attendance**: Track individual student presence with real-time updates

### UI Components
- **Reusable Table Component**: Dynamic table with scoped slots for custom content rendering
- **Breadcrumb Navigation**: Context-aware navigation showing current location in hierarchy
- **Event Cards**: Interactive cards displaying examination and room information

### Data Management Features
- **Real-time Updates**: Automatic data refresh after modifications
- **Capacity Management**: Room occupancy tracking with visual indicators
- **Supervisor Assignment**: Assign and update exam supervisors
- **Intelligent Filtering**: Show only available options (rooms, courses) when adding new items

## Component Architecture

### Reusable Components
- **BreadcrumbComponent**: Dynamic navigation breadcrumbs
- **TableComponent**: Flexible data table with slot-based customization
- **EventCard**: Standardized display for events and rooms
- **LoginButton**: Authentication state management

### View Components
- **SessionsView**: Session listing and creation
- **SessionDetailView**: Course management within sessions
- **UeEventView**: Event management for specific courses
- **RoomsView**: Room assignment and capacity tracking
- **PresenceView**: Student attendance interface

## Application Flow

The application follows a hierarchical structure:

1. **Sessions** - Create and manage evaluation periods
2. **Course Units (UE)** - Add courses to sessions
3. **Events** - Define examinations for each course
4. **Rooms** - Assign examination rooms to events
5. **Student Presence** - Track attendance in each room

## Key Implementation Highlights

### Dynamic Route Structure
```javascript
/sessions/:sessionId/ue/:sessionCompoId/event/:eventId/room/:roomId
```

### Attendance Management
- One-click attendance toggling
- Room capacity enforcement
- Visual indicators for present/absent students
- Supervisor assignment with dropdown selection

### User Experience Features
- Contextual breadcrumb navigation
- Real-time occupancy indicators
- Keyboard shortcuts for form submissions

## File Structure
```
src/
├── components/
│   ├── BreadcrumbComponent.vue
│   ├── EventCard.vue
│   ├── LoginButton.vue
│   ├── PresenceView.vue
│   ├── RoomsView.vue
│   ├── SessionDetailView.vue
│   ├── TableComponent.vue
│   └── UeEventView.vue
├── views/
│   ├── HomeView.vue
│   ├── SessionsView.vue
│   └── DetailsView.vue
├── services/
│   ├── authmgr.js
│   ├── eventService.js
│   ├── listSessionService.js
│   ├── presenceService.js
│   ├── roomService.js
│   └── sessionDetailsService.js
├── stores/
│   └── AuthStore.js
├── router/
│   └── index.js
├── assets/
│   └── tailwind.css
└── main.js
```

## Technologies Used

- Vue.js 3 (Options API)
- Vue Router
- Pinia
- Tailwind CSS
- Supabase
- Google OAuth
- ESLint
- Vite

**Warning** : Supabase deleted the database used by the project