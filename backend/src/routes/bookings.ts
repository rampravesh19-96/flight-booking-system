import { Router } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middlewares/auth';

const router = Router();

// Create a new booking (protected)
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { flightId, firstName, lastName, email, phone, totalPrice } = req.body;
    const userId = req.userId;

    if (!flightId || !firstName || !lastName || !email || !phone || !totalPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify flight exists
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: userId!,
        flightId,
        firstName,
        lastName,
        email,
        phone,
        totalPrice,
        status: 'confirmed',
      },
      include: {
        flight: true,
        user: true,
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bookings for a user (protected)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        flight: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific booking by ID (protected)
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const bookingId = parseInt(id, 10);

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flight: true,
        user: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Ensure user can only access their own bookings
    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel a booking (protected)
router.patch('/:id/cancel', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.userId;
    const bookingId = parseInt(id, 10);

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    // Get booking and verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flight: true,
        user: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if booking can be cancelled
    const cancellableStatuses = ['confirmed'];
    if (!cancellableStatuses.includes(booking.status)) {
      return res.status(400).json({
        error: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    // Cancel the booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
      include: {
        flight: true,
        user: true,
      },
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export default router;