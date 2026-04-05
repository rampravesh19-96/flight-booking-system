'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { Booking } from '../../../types';

type BookingStatus = 'all' | 'confirmed' | 'pending' | 'cancelled';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<BookingStatus>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push('/login?redirect=/ops/bookings');
        return;
      }

      fetchBookings('all');
    }
  }, [token, authLoading, router]);

  const fetchBookings = async (status: BookingStatus) => {
    setLoading(true);
    setError(null);

    try {
      const query = status === 'all' ? '' : `?status=${status}`;
      const response = await fetch(`http://localhost:4000/api/admin/bookings${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
      setActiveFilter(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    setUpdatingId(bookingId);

    try {
      const response = await fetch(`http://localhost:4000/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      const updatedBooking = await response.json();

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? updatedBooking : booking
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setUpdatingId(null);
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

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'confirmed':
        return 'bg-green-900/30 text-green-400 border-green-600';
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-600';
      case 'cancelled':
        return 'bg-red-900/30 text-red-400 border-red-600';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeFilter === 'all') return true;
    return booking.status.toLowerCase() === activeFilter;
  });

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-300">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold">Bookings Dashboard</h1>
            <p className="mt-2 text-slate-300">Manage all flight bookings</p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <button className="rounded-md border border-slate-600 px-4 py-2 font-medium text-slate-300 hover:border-cyan-600 hover:text-cyan-400">
                Back Home
              </button>
            </Link>
            <Link href="/my-bookings">
              <button className="rounded-md border border-cyan-600 px-4 py-2 font-medium text-cyan-400 hover:bg-slate-800">
                My Bookings
              </button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-600 bg-red-900/30 px-6 py-4 text-red-400">
            <p className="font-semibold">Error</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={() => fetchBookings(activeFilter)}
              className="mt-3 rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Status Filters */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {(['all', 'confirmed', 'pending', 'cancelled'] as BookingStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => fetchBookings(status)}
              className={`rounded-lg px-4 py-2 font-medium transition-all ${
                activeFilter === status
                  ? 'border-cyan-600 bg-cyan-600/20 text-cyan-400'
                  : 'border border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
            >
              {status === 'all' ? 'All Bookings' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Bookings Count */}
        <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2">
          <p className="text-sm text-slate-400">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-300">Fetching bookings...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBookings.length === 0 && (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">No Bookings Found</h3>
            <p className="mt-2 text-slate-400">
              {activeFilter === 'all'
                ? 'No bookings exist yet.'
                : `No ${activeFilter} bookings found.`}
            </p>
          </div>
        )}

        {/* Bookings List */}
        {!loading && filteredBookings.length > 0 && (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-lg border border-slate-700 bg-slate-900 p-6 transition-all hover:border-cyan-600 hover:bg-slate-800"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-cyan-400">
                          Booking #{booking.id}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Traveller: {booking.firstName} {booking.lastName}
                        </p>
                        <p className="text-sm text-slate-400">
                          User: {booking.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-block rounded-full border px-3 py-1 text-sm font-semibold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>
                </div>

                {/* Flight and Booking Details */}
                <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <p className="text-xs text-slate-400">Flight</p>
                    <p className="mt-1 font-semibold">{booking.flight.flightNumber}</p>
                    <p className="text-xs text-slate-400">{booking.flight.airline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Route</p>
                    <p className="mt-1 font-semibold text-sm">
                      {booking.flight.departureAirport} → {booking.flight.arrivalAirport}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Travel Date</p>
                    <p className="mt-1 font-semibold">{formatDate(booking.flight.departureTime)}</p>
                    <p className="text-xs text-slate-400">
                      {formatTime(booking.flight.departureTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Duration</p>
                    <p className="mt-1 font-semibold">
                      {formatDuration(booking.flight.duration)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Fare</p>
                    <p className="mt-1 font-semibold text-cyan-400">${booking.totalPrice}</p>
                  </div>
                </div>

                {/* Booking Metadata */}
                <div className="mb-4 border-t border-slate-700 pt-4">
                  <p className="text-xs text-slate-500">
                    Booked on {formatDate(booking.createdAt)} at{' '}
                    {formatTime(booking.createdAt)}
                  </p>
                </div>

                {/* Status Update Actions */}
                <div className="flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(booking.id, status)}
                      disabled={
                        updatingId === booking.id ||
                        booking.status.toLowerCase() === status.toLowerCase()
                      }
                      className={`rounded-md px-3 py-1 text-sm font-medium transition-all ${
                        booking.status.toLowerCase() === status.toLowerCase()
                          ? 'bg-slate-700 text-slate-400 cursor-default'
                          : status === 'pending'
                            ? 'border border-yellow-600 text-yellow-400 hover:bg-yellow-900/30'
                            : status === 'confirmed'
                              ? 'border border-green-600 text-green-400 hover:bg-green-900/30'
                              : 'border border-red-600 text-red-400 hover:bg-red-900/30'
                      } disabled:opacity-50`}
                    >
                      {updatingId === booking.id ? 'Updating...' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
