This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# SkillSwap - P2P Skill Exchange Platform

SkillSwap is a modern web application designed to connect people who want to exchange skills and knowledge. The platform enables users to create profiles, list skills they can teach and skills they want to learn, search for complementary skill matches, connect with other users, and communicate in real-time.

## Technology Stack

- **Frontend**: Next.js 15.3.0 (React 19), Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: Sonner for toast notifications

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project setup

### Environment Setup

1. Clone the repository
2. Copy the environment template file:

```bash
cp .env.template .env.local
```

3. Update the `.env.local` file with your Supabase credentials and other configurations

### Database Setup

1. The database schema is defined in `schema.sql`. Execute this in your Supabase SQL editor to create the necessary tables.
2. Additional migration files are available in the root directory:
   - `add_category_column.sql`
   - `add_profile_image_url_to_users.sql`
   - `add_reference_id_to_notifications.sql`
   - and others

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app`: Next.js application routes
- `src/components`: Reusable React components
- `src/utils`: Utility functions including Supabase clients
- `src/types`: TypeScript type definitions
- `src/lib`: Library code and helpers

## Development Workflow

1. Sprint planning based on the product backlog
2. Implementation of user stories
3. Testing and review
4. Deployment

## Contribution Guidelines

1. Create a feature branch from the main branch
2. Implement the feature or fix
3. Submit a pull request for review
4. Ensure tests pass and code quality is maintained

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
