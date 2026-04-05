'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ResultsSearchBar from '../../components/ResultsSearchBar';
import { Flight } from '../../types';

interface SuggestedDate {
  date: string;
  count: number;
  display: string;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('price');
  const [order, setOrder] = useState('asc');
  const [suggestedDates, setSuggestedDates] = useState<SuggestedDate[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (from && to && date) {
      fetchFlights();
    }
  }, [from, to, date, sortBy, order]);

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    setSuggestedDates([]);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/flights?from=${encodeURIComponent(from!)}&to=${encodeURIComponent(
          to!
        )}&date=${encodeURIComponent(date!)}&sortBy=${sortBy}&order=${order}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }
      const data = await response.json();
      setFlights(data);

      if (data.length === 0) {
        findNearbyDatesWithFlights();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateNearbyDates = (baseDate: Date) => {
    const dates: Date[] = [];
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const formatDateForDisplay = (dateString: string) => {
    const displayDate = new Date(dateString + 'T00:00:00');
    return displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const findNearbyDatesWithFlights = async () => {
    setLoadingSuggestions(true);
    try {
      const baseDate = new Date(date!);
      const nearbyDates = generateNearbyDates(baseDate);

      const results = await Promise.all(
        nearbyDates.map(async (d) => {
          const dateStr = d.toISOString().split('T')[0];
          try {
            const response = await fetch(
              `${API_BASE_URL}/api/flights?from=${encodeURIComponent(
                from!
              )}&to=${encodeURIComponent(to!)}&date=${dateStr}&sortBy=price&order=asc`
            );
            if (response.ok) {
              const data = await response.json();
              return {
                date: dateStr,
                count: data.length,
                display: formatDateForDisplay(dateStr),
              };
            }
          } catch {
            // Silently skip errors
          }
          return null;
        })
      );

      const validDates = results
        .filter((r): r is SuggestedDate => r !== null && r.count > 0)
        .sort((a, b) => {
          const aDiff = Math.abs(new Date(a.date).getTime() - baseDate.getTime());
          const bDiff = Math.abs(new Date(b.date).getTime() - baseDate.getTime());
          return aDiff !== bDiff ? aDiff - bDiff : b.count - a.count;
        })
        .slice(0, 3);

      setSuggestedDates(validDates);
    } catch {
      // Silently fail
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSuggestedDateClick = (suggestionDate: string) => {
    router.push(
      `/results?from=${encodeURIComponent(from!)}&to=${encodeURIComponent(
        to!
      )}&date=${encodeURIComponent(suggestionDate)}&sortBy=${sortBy}&order=${order}`
    );
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

        <ResultsSearchBar
          initialFrom={from}
          initialTo={to}
          initialDate={date}
          sortBy={sortBy}
          order={order}
        />

        {flights.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-8">
            <div className="text-center">
              <p className="mb-6 text-lg text-slate-300">No flights found for the selected date.</p>

              {loadingSuggestions ? (
                <div className="flex justify-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-cyan-500 border-t-transparent"></div>
                  <span className="ml-3 text-slate-300">Checking nearby dates...</span>
                </div>
              ) : suggestedDates.length > 0 ? (
                <div>
                  <p className="mb-4 text-sm text-slate-400">Try searching on nearby dates:</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {suggestedDates.map((suggestedDate) => (
                      <button
                        key={suggestedDate.date}
                        onClick={() => handleSuggestedDateClick(suggestedDate.date)}
                        className="rounded-lg border border-cyan-600 bg-slate-800 px-4 py-3 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-600/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                      >
                        <div className="font-semibold">{suggestedDate.display}</div>
                        <div className="text-xs text-cyan-300">
                          {suggestedDate.count} flights
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No nearby dates have available flights. Try searching for a different date or
                  route.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
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
                          <p className="text-sm text-slate-400">
                            {flight.departureCity} ({flight.departureAirport})
                          </p>
                        </div>
                        <div className="flex-1 text-center">
                          <div className="mx-auto h-px w-16 bg-slate-600"></div>
                          <p className="mt-1 text-sm text-slate-400">
                            {formatDuration(flight.duration)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{formatTime(flight.arrivalTime)}</p>
                          <p className="text-sm text-slate-400">
                            {flight.arrivalCity} ({flight.arrivalAirport})
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-cyan-400">₹{flight.price}</p>
                      <p className="text-sm text-slate-400">
                        {flight.availableSeats} seats available
                      </p>
                      <Link href={`/flights/${flight.id}`}>
                        <button className="mt-2 rounded-md bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                          Select Flight
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-950 text-white">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
              <p className="mt-4 text-slate-300">Loading...</p>
            </div>
          </div>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}