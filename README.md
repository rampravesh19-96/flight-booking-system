# Flight Booking and Confirmation System

A portfolio-grade travel tech application scaffold for a flight search and booking experience.

## Milestone 4
- Backend auth APIs for signup and login
- Password hashing with bcryptjs
- JWT-based authentication
- Frontend login and signup pages
- Auth context for managing global auth state
- Storing auth tokens in browser localStorage
- Header with logged-in user display and logout action
- Protected booking review page (requires authentication)
- Loading and error states throughout auth flow

## Repo Structure
- `frontend/` — Next.js app
- `backend/` — Express API
- `prisma/` — Prisma schema and seed setup

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up database:
   ```bash
   npm run --workspace=backend prisma:db:push
   npm run --workspace=backend prisma:seed
   ```
3. Start frontend:
   ```bash
   npm run dev:frontend
   ```
4. Start backend:
   ```bash
   npm run dev:backend
   ```

## Verify
- Frontend: visit `http://localhost:3000`
- Backend: visit `http://localhost:4000/api/health`
- Auth signup: click "Sign Up", create account with test email/password
- Auth login: click "Login", login with created account
- Search: enter JFK to LAX on 2024-04-10
- Select flight and fill traveller form
- Continue to booking (requires authentication - redirects to login if not logged in)
- Verify header shows logged-in user and logout button
- Click logout and verify redirect
