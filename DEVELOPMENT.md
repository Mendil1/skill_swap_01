# Development Guide for SkillSwap

This document provides detailed guidelines for developers working on the SkillSwap project.

## Development Environment

### Setup

1. Clone the repository
2. Copy `.env.template` to `.env.local` and update with your credentials
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server

### Database

The project uses Supabase as the backend database service. The schema is defined in `schema.sql` with additional migration files for incremental changes.

To apply database changes:
1. Connect to your Supabase project
2. Go to the SQL Editor
3. Execute the SQL files in the correct order (starting with schema.sql)

### Authentication

Authentication is handled by Supabase Auth. The implementation is in:
- `src/utils/supabase/server.ts` - Server-side authentication
- `src/utils/supabase/client.ts` - Client-side authentication
- `src/app/login/` - Login UI and actions

### Type Safety

Always maintain proper typing using TypeScript. The Supabase types are generated in `src/types/supabase.ts`.

## Project Structure

### Directory Organization

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components
  - `src/components/ui/` - Reusable UI components
  - `src/components/notifications/` - Notification-related components
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions
- `src/lib/` - Library code and helpers

### Key Components

1. **Authentication System**
   - Login/Registration: `src/app/login/`
   - Auth Middleware: `middleware.ts`
   - Auth Utilities: `src/utils/supabase/`

2. **Profile Management**
   - Profile Page: `src/app/profile/`
   - Profile Editing: `src/app/profile/profile-edit-form.tsx`
   - Skill Management: `src/app/profile/skill-form.tsx`

3. **Search Functionality**
   - Search Page: `src/app/skills/`
   - Search Form: `src/app/skills/search-form.tsx`

4. **Connection System**
   - User Profile View: `src/app/users/[id]/`
   - Connection Button: `src/app/users/[id]/components/connection-button.tsx`

5. **Messaging System**
   - Messages Page: `src/app/messages/`
   - Conversation: `src/app/messages/[conversationId]/`
   - Message Components: `src/app/messages/components/`

6. **Notification System**
   - Notification Page: `src/app/notifications/`
   - Notification Bell: `src/components/notifications/notification-bell.tsx`
   - Notification Utils: `src/utils/notifications.ts`

## Development Workflow

### Sprint Planning

The project follows an Agile development approach with sprints. Each sprint has a specific focus:

1. **Sprint 1: Foundations**
   - User Registration/Login
   - Profile Creation
   - Skill Listings

2. **Sprint 2: Core Functionality**
   - Skill Search
   - Profile Viewing
   - Connection Requests

3. **Sprint 3: Enhancements**
   - Chat Functionality
   - Scheduling
   - Reviews and Ratings

4. **Sprint 4: Polishing and Extras**
   - Notifications
   - Credits System
   - Admin Moderation

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Feature branches
- `bugfix/bug-name` - Bug fix branches

### Coding Standards

1. **TypeScript**
   - Use proper typing for all variables and functions
   - Avoid using `any` type
   - Use interfaces for object shapes

2. **React Components**
   - Use functional components with hooks
   - Keep components small and focused
   - Use proper prop validation

3. **CSS/Styling**
   - Use Tailwind CSS classes
   - Follow utility-first approach
   - Use consistent naming conventions

4. **State Management**
   - Use React hooks for local state
   - Use server components where possible
   - Use context API for shared state when needed

## Testing

### Manual Testing

Test all features in the following browsers:
- Chrome
- Firefox
- Safari
- Edge

### Responsive Testing

Test all features on:
- Desktop (1920x1080, 1366x768)
- Tablet (iPad, 768x1024)
- Mobile (iPhone, 375x667)

## Deployment

The application is deployed using Vercel. The deployment process is automated through GitHub integration.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com/)
