import { Router } from 'express';
import prisma from '../prisma/client';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { from, to, date, sortBy = 'price', order = 'asc' } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ error: 'Missing required parameters: from, to, date' });
    }

    const searchDate = new Date(date as string);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Search for flights where either airport code or city name matches (case-insensitive)
  const fromInput = (from as string).trim();
    const toInput = (to as string).trim();

    let where: any = {
      AND: [
        {
          OR: [
            { departureAirport: { contains: fromInput } },
            { departureAirport: { contains: fromInput.toUpperCase() } },
            { departureCity: { contains: fromInput } },
            { departureCity: { contains: fromInput.charAt(0).toUpperCase() + fromInput.slice(1).toLowerCase() } }
          ]
        },
        {
          OR: [
            { arrivalAirport: { contains: toInput } },
            { arrivalAirport: { contains: toInput.toUpperCase() } },
            { arrivalCity: { contains: toInput } },
            { arrivalCity: { contains: toInput.charAt(0).toUpperCase() + toInput.slice(1).toLowerCase() } }
          ]
        },
        {
          departureTime: {
            gte: searchDate,
            lt: nextDay,
          },
        },
      ],
    };

    let orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = order === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'duration') {
      orderBy.duration = order === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'departureTime') {
      orderBy.departureTime = order === 'asc' ? 'asc' : 'desc';
    }

    const flights = await prisma.flight.findMany({
      where,
      orderBy,
    });

    res.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const flightId = parseInt(id, 10);

    if (isNaN(flightId)) {
      return res.status(400).json({ error: 'Invalid flight ID' });
    }

    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }

    res.json(flight);
  } catch (error) {
    console.error('Error fetching flight:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;