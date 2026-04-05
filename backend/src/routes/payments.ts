import { Router } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middlewares/auth';
import { createOrder, verifySignature } from '../utils/razorpay';

const router = Router();

// Fare recheck endpoint (protected)
router.post('/fare-recheck', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { flightId, expectedPrice } = req.body;

    if (!flightId || !expectedPrice) {
      return res.status(400).json({ error: 'Missing flightId or expectedPrice' });
    }

    // Get current flight data
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    // Check availability
    if (flight.availableSeats <= 0) {
      return res.json({
        isValid: false,
        message: 'This flight is no longer available. Please select another flight.',
        availableSeats: flight.availableSeats,
      });
    }

    // Check price
    if (Math.abs(flight.price - expectedPrice) > 0.01) {
      return res.json({
        isValid: false,
        message: 'Flight fare has been updated.',
        currentPrice: flight.price,
        priceChanged: true,
        availableSeats: flight.availableSeats,
      });
    }

    // Fare and availability are valid
    res.json({
      isValid: true,
      currentPrice: flight.price,
      availableSeats: flight.availableSeats,
    });
  } catch (error) {
    console.error('Error checking fare:', error);
    res.status(500).json({ error: 'Fare check failed' });
  }
});

// Create Razorpay order and initialize booking (protected)
router.post('/create-order', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { flightId, totalPrice } = req.body;
    const userId = req.userId;

    if (!flightId || !totalPrice) {
      return res.status(400).json({ error: 'Missing flightId or totalPrice' });
    }

    // Verify flight exists and is available
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    if (flight.availableSeats <= 0) {
      return res.status(400).json({ error: 'Flight is no longer available' });
    }

    // Create Razorpay order
    const order = await createOrder(totalPrice);

    // Create booking record with pending status
    const booking = await prisma.booking.create({
      data: {
        userId: userId!,
        flightId,
        firstName: '', // Will be filled after payment
        lastName: '',  // Will be filled after payment
        email: '',     // Will be filled after payment
        phone: '',     // Will be filled after payment
        totalPrice,
        razorpayOrderId: order.id,
        paymentStatus: 'pending',
        status: 'payment_pending',
      },
      include: {
        flight: true,
        user: true,
      },
    });

    res.json({
      bookingId: booking.id,
      razorpayOrderId: order.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify Razorpay payment and finalize booking (protected)
router.post('/verify', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      travellerDetails
    } = req.body;

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !travellerDetails) {
      return res.status(400).json({ error: 'Missing required payment verification data' });
    }

    // Verify signature
    const isValidSignature = verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update booking with payment details and traveller info
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        paymentStatus: 'verified',
        status: 'confirmed',
        firstName: travellerDetails.firstName,
        lastName: travellerDetails.lastName,
        email: travellerDetails.email,
        phone: travellerDetails.phone,
      },
      include: {
        flight: true,
        user: true,
      },
    });

    res.json(booking);
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

export default router;