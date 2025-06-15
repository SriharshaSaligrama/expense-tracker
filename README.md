# Tanstack Expense Tracker

This is a robust, user-specific expense tracker built with TanStack Router, Convex backend, and a modern React/TypeScript UI.

## Features
- User authentication (Convex Auth)
- Add, edit, delete, and list transactions
- Filter/search transactions by type, date, and text
- Analytics dashboard: income, expense, balance, monthly summary, pie chart, recent transactions
- All queries and mutations are user-specific
- Modern, responsive UI with shadcn/ui components

## Tech Stack
- [React](https://react.dev/)
- [TanStack Router](https://tanstack.com/router)
- [Convex](https://convex.dev/) (backend, auth, database)
- [TypeScript](https://www.typescriptlang.org/)
- [shadcn/ui](https://ui.shadcn.com/) (UI components)

## Getting Started

1. **Install dependencies:**
   ```sh
   pnpm install
   # or
   npm install
   ```

2. **Set up Convex:**
   - Install the Convex CLI: `npm install -g convex`
   - Log in: `npx convex login`
   - Deploy schema: `npx convex push`
   - Generate types: `npx convex codegen`

3. **Run the app:**
   ```sh
   pnpm dev
   # or
   npm run dev
   ```

4. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal)

## Project Structure
- `app/` - React app source code
- `convex/` - Convex backend functions and schema
- `app/components/ui/` - UI components (shadcn/ui)
- `app/routes/` - App routes (pages)

## Notes
- All transaction queries are filtered by the logged-in user.
- Analytics dashboard is on the home page (`/`).

## License
MIT
