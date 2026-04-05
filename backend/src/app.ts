import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import flightsRouter from './routes/flights';
import authRouter from './routes/auth';
import bookingsRouter from './routes/bookings';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/flights', flightsRouter);
app.use('/api/bookings', bookingsRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Flight Booking API is ready.' });
});

export default app;
