# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ForexMentor is a Next.js 15 application with Convex backend, Clerk authentication, and Tailwind CSS. It's a forex trading mentorship platform built as a micro-SaaS application.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Convex (serverless backend with real-time database)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Themes**: next-themes for dark/light mode support

## Development Commands

### Start Development
```bash
npm run dev
```
This runs both frontend and backend in parallel:
- `next dev` - Next.js development server (port 3000)
- `convex dev` - Convex backend development

### Start Individual Services
```bash
npm run dev:frontend  # Next.js only
npm run dev:backend   # Convex only
```

### Build & Deploy
```bash
npm run build  # Build Next.js for production
npm start      # Start production server
```

### Code Quality
```bash
npm run lint   # Run ESLint
```

### Pre-development Setup
```bash
npm run predev  # Ensures Convex is running and opens dashboard
```

## Architecture

### Directory Structure

```
/app                    # Next.js App Router pages
  /(auth)              # Authentication routes (sign-in, sign-up)
  /(dashboard)         # Protected dashboard routes
  /server              # Server-side demo pages
  layout.tsx           # Root layout with providers
  page.tsx             # Landing page
  globals.css          # Global styles and Tailwind config

/convex                # Convex backend functions
  /_generated          # Auto-generated Convex types and API
  auth.config.ts       # Clerk authentication config (currently commented out)
  myFunctions.ts       # Sample query, mutation, and action
  schema.ts            # Database schema definitions
  tsconfig.json        # Convex-specific TypeScript config

/components            # React components
  /ui                  # shadcn/ui components (button, dropdown-menu)
  mode-toggle.tsx      # Dark/light mode toggle

/context               # React context and planning documents
  forex_micro_saas_plan.md
  forexmentor-structure.md
  forexmentor_prd_v1.md
  Landing-page-spec.md

/lib                   # Utility functions
  utils.ts             # cn() helper for Tailwind class merging

/providers             # React context providers
  ConvexClientProvider.tsx  # Convex + Clerk integration
  theme-provider.tsx        # Theme provider for dark/light mode

middleware.ts          # Next.js middleware for route protection
```

### Route Structure

**Public Routes:**
- `/` - Landing page
- `/sign-in` - Clerk sign-in page
- `/sign-up` - Clerk sign-up page

**Protected Routes (requires authentication):**
- `/dashboard` - Main dashboard (has header with UserButton and ModeToggle)
- `/server` - Server-side example

### Authentication Flow

The app uses Clerk for authentication with custom middleware logic:
- Unauthenticated users accessing protected routes (`/dashboard`, `/server`) are redirected to `/sign-in`
- Authenticated users accessing auth pages are redirected to `/dashboard`
- Root page (`/`) is accessible to all users

### Convex Integration

**Provider Setup:**
- Root layout wraps app in `ClerkProvider` → `ConvexClientProvider` → `ThemeProvider`
- `ConvexClientProvider` uses `ConvexProviderWithClerk` to integrate Clerk auth with Convex
- Convex URL configured via `NEXT_PUBLIC_CONVEX_URL` environment variable

**Convex Functions:**
Follow the strict guidelines in `.cursor/rules/convex_rules.mdc`:
- Always use new function syntax with `args`, `returns`, and `handler`
- Import from `./_generated/server` for query/mutation/action
- Use `v` validators from `convex/values` for all arguments and returns
- Function references through `api` object for public functions, `internal` for private
- File-based routing: `convex/example.ts` exports `f` → `api.example.f`

**Key Convex Patterns:**
- Queries: Read database with `ctx.db.query()`
- Mutations: Write database with `ctx.db.insert()`, `ctx.db.patch()`, `ctx.db.replace()`
- Actions: Call external APIs, use `ctx.runQuery()` and `ctx.runMutation()`
- Authentication: Access user with `await ctx.auth.getUserIdentity()`

### Styling and Theming

**Tailwind CSS v4:**
- Global styles in `app/globals.css`
- Uses CSS variable-based theming for light/dark modes
- Custom properties for colors, border-radius, fonts defined in `@theme` block

**shadcn/ui:**
- Configured in `components.json` with path alias `@/*`
- Components in `components/ui/`
- Uses `class-variance-authority` for component variants
- Utility function `cn()` in `lib/utils.ts` for conditional classes

**Dark Mode:**
- Implemented via `next-themes`
- Toggle component: `components/mode-toggle.tsx`
- System preference detection enabled

### TypeScript Configuration

**Root `tsconfig.json`:**
- Path alias `@/*` points to root directory
- Strict mode enabled
- Module resolution: bundler

**Convex `tsconfig.json`:**
- Separate config in `convex/` directory
- Targets ESNext with Node.js types

## Convex Development Guidelines

**Critical Rules from `.cursor/rules/convex_rules.mdc`:**

1. **Always include validators:**
   - Every function must have `args` and `returns` validators
   - Use `v.null()` for functions that don't return anything

2. **Function registration:**
   - `query`, `mutation`, `action` for public API
   - `internalQuery`, `internalMutation`, `internalAction` for private functions
   - Never expose sensitive functions as public

3. **Database queries:**
   - Do NOT use `.filter()` - create indexes and use `.withIndex()` instead
   - Queries don't support `.delete()` - use `.collect()` then `ctx.db.delete()`
   - Use `.unique()` for single document queries
   - Default order is ascending `_creationTime`

4. **Type safety:**
   - Use `Id<'tableName'>` type from `./_generated/dataModel`
   - Be strict with ID types in function arguments
   - Use `as const` for string literals in discriminated unions

5. **Schema indexes:**
   - Include all index fields in the index name (e.g., "by_field1_and_field2")
   - Query fields in the same order as index definition

6. **Actions:**
   - Add `"use node";` at top of file when using Node.js built-ins
   - Never use `ctx.db` in actions
   - Add `@types/node` to package.json when needed

## Environment Variables

Required environment variables (stored in `.env.local`, not committed):
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer for Convex integration

## Testing and Running Single Tests

This project does not currently have a test suite configured. To add testing:
1. Install test framework (e.g., Jest, Vitest, or Playwright)
2. Add test scripts to `package.json`
3. Create test files alongside components

## Current Development Status

The codebase includes:
- ✅ Basic authentication setup with Clerk
- ✅ Route protection middleware
- ✅ Convex backend integration
- ✅ Dark/light mode theming
- ✅ Dashboard layout with header
- ✅ Sample Convex functions (queries, mutations, actions)
- 📋 Planning documents for forex mentorship features (see `/context` directory)

Next steps are likely focused on implementing the forex mentorship platform features outlined in the PRD documents.
