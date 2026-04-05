'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Flight } from '../../types';

function ResultsContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('price');
  const [order, setOrder] = useState('asc');

  useEffect(() => {
    if (from && to && date) {
      fetchFlights();
    }
  }, [from, to, date, sortBy, order]);

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/flights?from=${encodeURIComponent(from!)}&to=${encodeURIComponent(to!)}&date=${encodeURIComponent(date!)}&sortBy=${sortBy}&order=${order}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }
      const data = await response.json();
      setFlights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-300">Searching for flights...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="text-center">
            <p className="text-red-400">Error: {error}</p>
            <button
              onClick={fetchFlights}
              className="mt-4 rounded-md bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">
            Flights from {from} to {to}
          </h1>
          <p className="mt-2 text-slate-300">
            Departure date: {new Date(date!).toLocaleDateString()}
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-slate-300">
              Sort by
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="price">Price</option>
              <option value="duration">Duration</option>
              <option value="departureTime">Departure Time</option>
            </select>
          </div>
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-slate-300">
              Order
            </label>
            <select
              id="order"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="mt-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {flights.length === 0 ? (
          <div className="text-center">
            <p className="text-slate-300">No flights found for the selected criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {flights.map((flight) => (
              <div
                key={flight.id}
                className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-lg"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{flight.airline}</h3>
                        <p className="text-sm text-slate-400">{flight.flightNumber}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{formatTime(flight.departureTime)}</p>
                        <p className="text-sm text-slate-400">{flight.departureAirport}</p>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="mx-auto h-px w-16 bg-slate-600"></div>
                        <p className="mt-1 text-sm text-slate-400">{formatDuration(flight.duration)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{formatTime(flight.arrivalTime)}</p>
                        <p className="text-sm text-slate-400">{flight.arrivalAirport}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-400">${flight.price}</p>
                    <p className="text-sm text-slate-400">{flight.availableSeats} seats available</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-300">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <ResultsContent />
    </Suspense>
  );
}