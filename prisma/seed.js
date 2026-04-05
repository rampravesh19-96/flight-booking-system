const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.flight.deleteMany();

  // Seed flights
  const flights = [
    {
      airline: 'American Airlines',
      flightNumber: 'AA101',
      departureAirport: 'JFK',
      arrivalAirport: 'LAX',
      departureTime: new Date('2024-04-10T08:00:00Z'),
      arrivalTime: new Date('2024-04-10T11:30:00Z'),
      price: 299.99,
      duration: 330,
      availableSeats: 150,
      seatClass: 'ECONOMY',
    },
    {
      airline: 'Delta Airlines',
      flightNumber: 'DL202',
      departureAirport: 'JFK',
      arrivalAirport: 'LAX',
      departureTime: new Date('2024-04-10T10:00:00Z'),
      arrivalTime: new Date('2024-04-10T13:45:00Z'),
      price: 349.99,
      duration: 345,
      availableSeats: 120,
      seatClass: 'ECONOMY',
    },
    {
      airline: 'United Airlines',
      flightNumber: 'UA303',
      departureAirport: 'JFK',
      arrivalAirport: 'SFO',
      departureTime: new Date('2024-04-10T09:00:00Z'),
      arrivalTime: new Date('2024-04-10T12:30:00Z'),
      price: 399.99,
      duration: 330,
      availableSeats: 100,
      seatClass: 'ECONOMY',
    },
    {
      airline: 'JetBlue',
      flightNumber: 'B6404',
      departureAirport: 'JFK',
      arrivalAirport: 'LAX',
      departureTime: new Date('2024-04-10T12:00:00Z'),
      arrivalTime: new Date('2024-04-10T15:30:00Z'),
      price: 279.99,
      duration: 330,
      availableSeats: 80,
      seatClass: 'ECONOMY',
    },
    {
      airline: 'American Airlines',
      flightNumber: 'AA505',
      departureAirport: 'LAX',
      arrivalAirport: 'JFK',
      departureTime: new Date('2024-04-11T14:00:00Z'),
      arrivalTime: new Date('2024-04-11T22:30:00Z'),
      price: 329.99,
      duration: 330,
      availableSeats: 140,
      seatClass: 'ECONOMY',
    },
    {
      airline: 'Delta Airlines',
      flightNumber: 'DL606',
      departureAirport: 'LAX',
      arrivalAirport: 'SFO',
      departureTime: new Date('2024-04-10T16:00:00Z'),
      arrivalTime: new Date('2024-04-10T17:30:00Z'),
      price: 149.99,
      duration: 90,
      availableSeats: 200,
      seatClass: 'ECONOMY',
    },
  ];

  for (const flight of flights) {
    await prisma.flight.create({ data: flight });
  }

  console.log('Seeded flights successfully');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
