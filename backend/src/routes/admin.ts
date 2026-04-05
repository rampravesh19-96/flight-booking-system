import { Router } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middlewares/auth';

const router = Router();

// Get all bookings with optional status filter (protected)
router.get('/bookings', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = String(status).toLowerCase();
    }

    const bookings = await prisma.booking.findMany({
      where,
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

// Update booking status (protected)
router.patch('/bookings/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const bookingId = parseInt(id, 10);

    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(String(status).toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid status. Must be one of: pending, confirmed, cancelled',
      });
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: String(status).toLowerCase(),
      },
      include: {
        flight: true,
        user: true,
      },
    });

    res.json(booking);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Booking not found' });
    }
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
