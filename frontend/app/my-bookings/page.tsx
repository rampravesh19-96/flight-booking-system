'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import BookingStatusTimeline from '../../components/BookingStatusTimeline';

interface Flight {
  id: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  price: number;
  seatClass: string;
}

interface Booking {
  id: number;
  userId: number;
  flightId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  flight: Flight;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push('/login?redirect=/my-bookings');
        return;
      }

      fetchBookings();
    }
  }, [token, authLoading, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: number) => {
    setCancellingId(bookingId);
    try {
      const response = await fetch(`http://localhost:4000/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      // Update the booking status in the local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString() }
            : booking
        )
      );
      setShowCancelDialog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-300">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-300">Fetching your bookings...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold">My Bookings</h1>
            <p className="mt-2 text-slate-300">View and manage all your flight bookings</p>
          </div>
          <Link href="/">
            <button className="rounded-md border border-cyan-600 px-4 py-2 font-medium text-cyan-400 hover:bg-slate-800">
              Search Flights
            </button>
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-600 bg-red-900/30 px-6 py-4 text-red-400">
            <p className="font-semibold">Error</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-3 rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-900 px-6 py-12 text-center">
            <div className="mx-auto mb-4 inline-block rounded-full bg-slate-800 p-3">
              <svg
                className="h-8 w-8 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">No Bookings Yet</h3>
            <p className="mt-2 text-slate-400">
              You haven't made any flight bookings. Start searching for flights to make your first booking!
            </p>
            <Link href="/">
              <button className="mt-4 rounded-md bg-cyan-600 px-6 py-2 font-medium text-white hover:bg-cyan-700">
                Search Flights
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-lg border border-slate-700 bg-slate-900 p-6 transition-all hover:border-cyan-600 hover:bg-slate-800"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-400">
                      Booking #{booking.id}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Traveller: {booking.firstName} {booking.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                        booking.status === 'confirmed'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-yellow-900/30 text-yellow-400'
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400">Airline</p>
                    <p className="mt-1 font-semibold">{booking.flight.airline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Flight Number</p>
                    <p className="mt-1 font-semibold">{booking.flight.flightNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Class</p>
                    <p className="mt-1 font-semibold">{booking.flight.seatClass}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Price</p>
                    <p className="mt-1 font-semibold text-cyan-400">${booking.totalPrice}</p>
                  </div>
                </div>

                <div className="mb-4 border-t border-slate-700 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {formatTime(booking.flight.departureTime)}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-300">
                          {booking.flight.departureAirport}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDate(booking.flight.departureTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 px-4 text-center">
                      <p className="text-xs text-slate-400">
                        {formatDuration(booking.flight.duration)}
                      </p>
                      <div className="mt-2 h-px bg-slate-600"></div>
                    </div>

                    <div className="flex-1">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {formatTime(booking.flight.arrivalTime)}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-300">
                          {booking.flight.arrivalAirport}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatDate(booking.flight.arrivalTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4 border-t border-slate-700 pt-4">
                  <BookingStatusTimeline
                    status={booking.status}
                    createdAt={booking.createdAt}
                    cancelledAt={booking.cancelledAt}
                  />
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Booked on {formatDate(booking.createdAt)} at{' '}
                      {new Date(booking.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => setShowCancelDialog(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="rounded-md border border-red-600 px-3 py-1 text-sm font-medium text-red-400 hover:bg-red-900/30 disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Booking Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold text-white">Cancel Booking</h3>
            <p className="mt-2 text-sm text-slate-300">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCancelDialog(null)}
                className="flex-1 rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Keep Booking
              </button>
              <button
                onClick={() => cancelBooking(showCancelDialog)}
                disabled={cancellingId === showCancelDialog}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancellingId === showCancelDialog ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
