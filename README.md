# Flight Booking and Confirmation System

A portfolio-grade travel tech application scaffold for a flight search and booking experience.

## Milestone 3
- Flight details API endpoint
- Flight details page with traveller form
- Basic fare summary
- Continue-to-booking flow foundation
- Responsive UI with loading/error states

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
- Search: enter JFK to LAX on 2024-04-10, select a flight, fill traveller form, continue to booking
