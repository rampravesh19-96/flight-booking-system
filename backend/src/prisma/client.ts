import { PrismaClient } from '@prisma/client';

// Set DATABASE_URL based on environment (fallback for development)
if (process.env.APP_ENV === 'development' && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mysql://root:@localhost:3306/flight_booking_db';
}
// In production, DATABASE_URL should be set via environment variables

const prisma = new PrismaClient();

export default prisma;
