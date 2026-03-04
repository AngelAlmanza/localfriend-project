# Localfriend Project

This application allows users to find products and services in their local area, providing a platform for businesses to connect with potential customers.

## Roles
- **Admin**: The Admin is the owner of the platform. They define categories, see analytics, manage subscriptions, reports, and users.
- **Workers**: Users who have a subscription to the platform to publish their products and/or services.
- **Locals**: Users who search for products and/or services within the platform, using their location preferences.

## Tech Stack

- **Framework**: Next.js 16.1.6
- **Language**: TypeScript 5
- **UI**: React 19, Tailwind CSS 4, shadcn/ui
- **Backend/DB**: Supabase
- **State Management**: Zustand
- **Internationalization**: next-intl
- **Forms & Validation**: React Hook Form, Zod

## Setup

### Prerequisites
- Node.js
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd localfriend-project

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=
```

### Run the project

```bash
npm run dev
```


