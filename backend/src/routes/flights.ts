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

    let where: any = {
      departureAirport: from as string,
      arrivalAirport: to as string,
      departureTime: {
        gte: searchDate,
        lt: nextDay,
      },
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

export default router;