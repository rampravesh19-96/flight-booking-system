export interface Flight {
  id: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  departureCity: string;
  arrivalAirport: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  duration: number;
  availableSeats: number;
  seatClass: string;
}

export interface City {
  city: string;
  code: string;
  tier: 'metro' | 'tier2' | 'intl';
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  userId: number;
  flightId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalPrice: number;
  status: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentStatus: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
  flight: Flight;
  user: User;
}