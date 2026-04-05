'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Flight } from '../../../types';

interface TravellerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function FlightDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const flightId = params.id as string;

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [traveller, setTraveller] = useState<TravellerDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (flightId) {
      fetchFlight();
    }
  }, [flightId]);

  const fetchFlight = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4000/api/flights/${flightId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch flight details');
      }
      const data = await response.json();
      setFlight(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTraveller(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For milestone 3, just navigate to booking foundation
    router.push(`/book/${flightId}?traveller=${encodeURIComponent(JSON.stringify(traveller))}`);
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
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-300">Loading flight details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !flight) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="text-center">
            <p className="text-red-400">Error: {error || 'Flight not found'}</p>
            <button
              onClick={fetchFlight}
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
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Flight Details</h1>
          <p className="mt-2 text-slate-300">
            Review your selected flight and enter traveller information.
          </p>
        </div>

        {/* Flight Summary */}
        <div className="mb-8 rounded-lg border border-slate-700 bg-slate-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Flight Summary</h2>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
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
              <p className="text-sm text-slate-400">{flight.seatClass} class</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2">
          {/* Traveller Details */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Traveller Details</h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-slate-300">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={traveller.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-slate-300">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={traveller.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={traveller.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={traveller.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Fare Summary */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Fare Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Base Fare</span>
                <span className="text-white">${flight.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Taxes & Fees</span>
                <span className="text-white">$0.00</span>
              </div>
              <hr className="border-slate-600" />
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-white">Total</span>
                <span className="text-cyan-400">${flight.price}</span>
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full rounded-md bg-cyan-600 px-4 py-3 font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Continue to Booking
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}