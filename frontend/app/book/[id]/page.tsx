'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { Flight } from '../../../types';
import BookingStatusTimeline from '../../../components/BookingStatusTimeline';

interface TravellerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
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

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const flightId = params.id as string;
  const travellerParam = searchParams.get('traveller');

  const [flight, setFlight] = useState<Flight | null>(null);
  const [traveller, setTraveller] = useState<TravellerDetails | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [fareRecheckResult, setFareRecheckResult] = useState<{
    isValid: boolean;
    currentPrice?: number;
    priceChanged?: boolean;
    availableSeats?: number;
    message?: string;
  } | null>(null);
  const [showFareDialog, setShowFareDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push(`/login?redirect=/book/${flightId}?traveller=${encodeURIComponent(travellerParam || '')}`);
        return;
      }

      if (flightId && travellerParam) {
        try {
          const parsedTraveller = JSON.parse(decodeURIComponent(travellerParam));
          setTraveller(parsedTraveller);
          fetchFlight();
        } catch (err) {
          setError('Invalid traveller data');
          setLoading(false);
        }
      } else {
        setError('Missing flight or traveller information');
        setLoading(false);
      }
    }
  }, [flightId, travellerParam, token, authLoading, router]);

  const fetchFlight = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${API_BASE_URL}/api/flights/${flightId}`);
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

  const handleProceedToPayment = async () => {
    if (!flight || !traveller || !token) return;

    setPaymentProcessing(true);
    setPaymentError(null);
    setFareRecheckResult(null);

    try {
      // First, recheck fare and availability
      const recheckResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/fare-recheck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          flightId: flight.id,
          expectedPrice: flight.price,
        }),
      });

      if (!recheckResponse.ok) {
        throw new Error('Fare check failed');
      }

      const recheckData = await recheckResponse.json();
      setFareRecheckResult(recheckData);

      if (!recheckData.isValid) {
        if (recheckData.priceChanged) {
          // Show fare change dialog
          setShowFareDialog(true);
          setPaymentProcessing(false);
          return;
        } else {
          // Show error (no seats available)
          setPaymentError(recheckData.message || 'Flight is no longer available');
          setPaymentProcessing(false);
          return;
        }
      }

      // Fare is valid, proceed with payment
      await proceedWithPayment();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Fare check failed');
      setPaymentProcessing(false);
    }
  };

  const proceedWithPayment = async () => {
    if (!flight || !traveller) return;

    try {
      // Create Razorpay order
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          flightId: flight.id,
          totalPrice: fareRecheckResult?.currentPrice || flight.price,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create payment order');
      }

      const orderData = await response.json();

      // Initialize Razorpay checkout
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Flight Booking',
        description: `Flight ${flight.flightNumber} - ${flight.airline}`,
        order_id: orderData.razorpayOrderId,
        handler: async (response: any) => {
          // Payment successful - verify on backend
          await verifyPayment(orderData.bookingId, response, traveller);
        },
        prefill: {
          name: `${traveller.firstName} ${traveller.lastName}`,
          email: traveller.email,
          contact: traveller.phone,
        },
        theme: {
          color: '#0891b2', // cyan-600
        },
        modal: {
          ondismiss: () => {
            setPaymentError('Payment was cancelled. You can try again.');
            setPaymentProcessing(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment initialization failed');
      setPaymentProcessing(false);
    }
  };

  const handleFareDialogConfirm = () => {
    setShowFareDialog(false);
    proceedWithPayment();
  };

  const handleFareDialogCancel = () => {
    setShowFareDialog(false);
    setPaymentProcessing(false);
  };

  const verifyPayment = async (bookingId: number, razorpayResponse: any, travellerDetails: TravellerDetails) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          razorpayOrderId: razorpayResponse.razorpay_order_id,
          razorpayPaymentId: razorpayResponse.razorpay_payment_id,
          razorpaySignature: razorpayResponse.razorpay_signature,
          travellerDetails,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Payment verification failed');
      }

      const bookingData = await response.json();
      setBooking(bookingData);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment verification failed');
    } finally {
      setPaymentProcessing(false);
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

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-300">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  // Show confirmation page after booking
  if (booking) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-lg border border-green-600 bg-green-900/30 px-6 py-4 text-center">
            <h1 className="text-3xl font-semibold text-green-400">✓ Booking Confirmed!</h1>
            <p className="mt-2 text-green-300">Your booking has been saved successfully.</p>
          </div>

          <div className="mt-8 rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Booking Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400">Booking ID</p>
                <p className="text-lg font-semibold text-cyan-400">#{booking.id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p className="text-lg font-semibold text-green-400">{booking.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Traveller</p>
                <p className="text-lg font-semibold">{booking.firstName} {booking.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Price</p>
                <p className="text-lg font-semibold text-cyan-400">${booking.totalPrice}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Flight Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-semibold">{booking.flight.airline}</p>
                  <p className="text-sm text-slate-400">{booking.flight.flightNumber}</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold">{formatTime(booking.flight.departureTime)}</p>
                  <p className="text-sm text-slate-400">{booking.flight.departureAirport}</p>
                </div>
                <div className="flex-1 text-center">
                  <div className="mx-auto h-px w-12 bg-slate-600"></div>
                  <p className="mt-1 text-sm text-slate-400">{formatDuration(booking.flight.duration)}</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold">{formatTime(booking.flight.arrivalTime)}</p>
                  <p className="text-sm text-slate-400">{booking.flight.arrivalAirport}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Status Timeline */}
          <div className="mt-8 rounded-lg border border-slate-700 bg-slate-900 p-6">
            <BookingStatusTimeline
              status={booking.status}
              createdAt={booking.createdAt}
              cancelledAt={booking.cancelledAt}
            />
          </div>

          <div className="mt-8 flex gap-4">
            <Link href="/my-bookings" className="flex-1">
              <button className="w-full rounded-md bg-cyan-600 px-4 py-3 font-medium text-white hover:bg-cyan-700">
                View My Bookings
              </button>
            </Link>
            <Link href="/" className="flex-1">
              <button className="w-full rounded-md border border-cyan-600 px-4 py-3 font-medium text-cyan-400 hover:bg-slate-800">
                Search More Flights
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-300">Preparing booking...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !flight || !traveller) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="text-center">
            <p className="text-red-400">Error: {error || 'Missing information'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 rounded-md bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8 rounded-lg border border-green-600 bg-green-900/30 px-4 py-3 text-green-400">
          ✓ You are logged in and can proceed with booking.
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Review & Book</h1>
          <p className="mt-2 text-slate-300">
            Please review your booking details before confirming.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Flight Details */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Flight Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-slate-400">Airline:</span> {flight.airline}
              </div>
              <div>
                <span className="text-slate-400">Flight:</span> {flight.flightNumber}
              </div>
              <div>
                <span className="text-slate-400">Route:</span> {flight.departureAirport} → {flight.arrivalAirport}
              </div>
              <div>
                <span className="text-slate-400">Departure:</span> {new Date(flight.departureTime).toLocaleString()}
              </div>
              <div>
                <span className="text-slate-400">Arrival:</span> {new Date(flight.arrivalTime).toLocaleString()}
              </div>
              <div>
                <span className="text-slate-400">Duration:</span> {formatDuration(flight.duration)}
              </div>
              <div>
                <span className="text-slate-400">Class:</span> {flight.seatClass}
              </div>
            </div>
          </div>

          {/* Traveller Details */}
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">Traveller Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-slate-400">Name:</span> {traveller.firstName} {traveller.lastName}
              </div>
              <div>
                <span className="text-slate-400">Email:</span> {traveller.email}
              </div>
              <div>
                <span className="text-slate-400">Phone:</span> {traveller.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Fare Summary */}
        <div className="mt-8 rounded-lg border border-slate-700 bg-slate-900 p-6">
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

          {paymentError && (
            <div className="mt-4 rounded-md border border-red-600 bg-red-900/30 px-4 py-3 text-red-400">
              {paymentError}
            </div>
          )}

          <button
            onClick={handleProceedToPayment}
            disabled={paymentProcessing}
            className="mt-6 w-full rounded-md bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {paymentProcessing ? 'Processing Payment...' : 'Proceed to Payment'}
          </button>
        </div>

        {/* Fare Change Dialog */}
        {showFareDialog && fareRecheckResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6">
              <h3 className="text-lg font-semibold text-yellow-400">Fare Price Update</h3>
              <p className="mt-2 text-slate-300">
                The fare for this flight has been updated from <span className="font-semibold text-red-400">${flight.price}</span> to{' '}
                <span className="font-semibold text-green-400">${fareRecheckResult.currentPrice}</span>.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Would you like to continue with the updated fare?
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleFareDialogConfirm}
                  className="flex-1 rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                >
                  Continue with ${fareRecheckResult.currentPrice}
                </button>
                <button
                  onClick={handleFareDialogCancel}
                  className="flex-1 rounded-md border border-slate-600 px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}