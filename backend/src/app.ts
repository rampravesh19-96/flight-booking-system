import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Flight Booking API is ready.' });
});

export default app;
