import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import flightsRouter from './routes/flights';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/flights', flightsRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Flight Booking API is ready.' });
});

export default app;
