export interface Flight {
  id: number;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  duration: number;
  availableSeats: number;
  seatClass: string;
}