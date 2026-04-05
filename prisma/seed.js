const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Comprehensive city and airport data
const cities = [
  // Major Indian Metros
  { city: 'Delhi', code: 'DEL', tier: 'metro' },
  { city: 'Mumbai', code: 'BOM', tier: 'metro' },
  { city: 'Bangalore', code: 'BLR', tier: 'metro' },
  { city: 'Hyderabad', code: 'HYD', tier: 'metro' },
  { city: 'Chennai', code: 'MAA', tier: 'metro' },
  { city: 'Kolkata', code: 'CCU', tier: 'metro' },
  { city: 'Pune', code: 'PNQ', tier: 'metro' },
  { city: 'Ahmedabad', code: 'AMD', tier: 'metro' },
  // Tier-2 Indian Cities
  { city: 'Goa', code: 'GOI', tier: 'tier2' },
  { city: 'Jaipur', code: 'JAI', tier: 'tier2' },
  { city: 'Kochi', code: 'COK', tier: 'tier2' },
  { city: 'Lucknow', code: 'LKO', tier: 'tier2' },
  { city: 'Chandigarh', code: 'IXC', tier: 'tier2' },
  // International Hubs
  { city: 'Dubai', code: 'DXB', tier: 'intl' },
  { city: 'Singapore', code: 'SIN', tier: 'intl' },
  { city: 'London', code: 'LHR', tier: 'intl' },
  { city: 'Bangkok', code: 'BKK', tier: 'intl' },
  { city: 'New York', code: 'JFK', tier: 'intl' },
];

const airlines = [
  'Air India',
  'Indigo',
  'SpiceJet',
  'Vistara',
  'GoAir',
  'AirAsia India',
  'Alliance Air',
];

// Generate realistic flight durations (in minutes)
const getDuration = (from, to) => {
  const domesticRoutes = {
    'DEL-BOM': 150, 'BOM-DEL': 150, 'DEL-BLR': 180, 'BLR-DEL': 180,
    'DEL-HYD': 160, 'HYD-DEL': 160, 'DEL-MAA': 200, 'MAA-DEL': 200,
    'DEL-CCU': 130, 'CCU-DEL': 130, 'DEL-PNQ': 140, 'PNQ-DEL': 140,
    'DEL-AMD': 120, 'AMD-DEL': 120, 'BOM-BLR': 100, 'BLR-BOM': 100,
    'BOM-HYD': 80, 'HYD-BOM': 80, 'BOM-MAA': 120, 'MAA-BOM': 120,
    'BOM-CCU': 180, 'CCU-BOM': 180, 'BOM-PNQ': 60, 'PNQ-BOM': 60,
    'BLR-HYD': 60, 'HYD-BLR': 60, 'BLR-MAA': 40, 'MAA-BLR': 40,
    'BLR-CCU': 220, 'CCU-BLR': 220, 'HYD-MAA': 80, 'MAA-HYD': 80,
    'HYD-CCU': 180, 'CCU-HYD': 180, 'MAA-CCU': 160, 'CCU-MAA': 160,
    'DEL-GOI': 170, 'GOI-DEL': 170, 'DEL-JAI': 70, 'JAI-DEL': 70,
    'DEL-COK': 210, 'COK-DEL': 210, 'DEL-LKO': 50, 'LKO-DEL': 50,
    'DEL-IXC': 60, 'IXC-DEL': 60, 'BOM-GOI': 70, 'GOI-BOM': 70,
    'BOM-JAI': 130, 'JAI-BOM': 130, 'BOM-COK': 140, 'COK-BOM': 140,
    'BLR-COK': 50, 'COK-BLR': 50, 'BLR-JAI': 180, 'JAI-BLR': 180,
    'HYD-COK': 90, 'COK-HYD': 90, 'MAA-COK': 60, 'COK-MAA': 60,
  };

  const internationalRoutes = {
    'DEL-DXB': 240, 'DXB-DEL': 240, 'DEL-SIN': 360, 'SIN-DEL': 360,
    'DEL-LHR': 480, 'LHR-DEL': 480, 'DEL-BKK': 300, 'BKK-DEL': 300,
    'DEL-JFK': 840, 'JFK-DEL': 840, 'BOM-DXB': 220, 'DXB-BOM': 220,
    'BOM-SIN': 330, 'SIN-BOM': 330, 'BOM-LHR': 480, 'LHR-BOM': 480,
    'BOM-BKK': 270, 'BKK-BOM': 270, 'BOM-JFK': 840, 'JFK-BOM': 840,
  };

  const route = `${from}-${to}`;
  return domesticRoutes[route] || internationalRoutes[route] || 180;
};

// Generate realistic pricing
const getPrice = (from, to) => {
  const intlCodes = ['DXB', 'SIN', 'LHR', 'BKK', 'JFK'];
  const isInternational = intlCodes.includes(from) || intlCodes.includes(to);

  if (isInternational) {
    // Realistic international pricing in INR
    const basePrices = {
      DXB: 22500,   // ₹15K-30K range (Dubai - closest international)
      BKK: 25000,   // ₹17K-33K range (Bangkok)
      SIN: 35000,   // ₹25K-45K range (Singapore)
      LHR: 60000,   // ₹42K-78K range (London)
      JFK: 90000,   // ₹63K-117K range (New York)
    };

    const basePrice = basePrices[to] || basePrices[from] || 35000;

    // Apply ±30% variation with floor to prevent unrealistic lows
    const minPrice = Math.floor(basePrice * 0.6);  // Floor at 60% of base
    const maxPrice = Math.floor(basePrice * 1.3);  // Cap at 130% of base

    return Math.floor(minPrice + Math.random() * (maxPrice - minPrice));
  }

  // Domestic Routes: Keep existing realistic INR pricing
  const distanceFactors = {
    'DEL-BOM': 1.2, 'BOM-DEL': 1.2, 'DEL-BLR': 1.1, 'BLR-DEL': 1.1,
    'DEL-HYD': 1.0, 'HYD-DEL': 1.0, 'DEL-MAA': 1.3, 'MAA-DEL': 1.3,
  };
  const factor = distanceFactors[`${from}-${to}`] || 1.0;
  const basePrice = Math.floor(3000 * factor);
  return Math.floor(basePrice * (0.7 + Math.random() * 0.6));
};

// Generate route network based on connectivity rules
const generateRoutes = () => {
  const routes = [];
  const metros = cities.filter((c) => c.tier === 'metro').map((c) => c.code);
  const tier2 = cities.filter((c) => c.tier === 'tier2').map((c) => c.code);
  const intl = cities.filter((c) => c.tier === 'intl').map((c) => c.code);

  for (let i = 0; i < metros.length; i++) {
    for (let j = i + 1; j < metros.length; j++) {
      routes.push([metros[i], metros[j]]);
      routes.push([metros[j], metros[i]]);
    }
  }

  const majorHubs = ['DEL', 'BOM', 'BLR'];
  for (const hub of majorHubs) {
    for (const city of tier2) {
      if (hub !== city) {
        routes.push([hub, city]);
        routes.push([city, hub]);
      }
    }
  }

  const intlHubs = ['DEL', 'BOM'];
  for (const hub of intlHubs) {
    for (const city of intl) {
      routes.push([hub, city]);
      routes.push([city, hub]);
    }
  }

  return routes;
};

async function safeClearExistingData() {
  try {
    await prisma.booking.deleteMany();
  } catch (error) {
    if (error?.code !== 'P2021') {
      throw error;
    }
    console.log('ℹ️ Booking table not found yet, skipping booking cleanup');
  }

  try {
    await prisma.flight.deleteMany();
  } catch (error) {
    if (error?.code !== 'P2021') {
      throw error;
    }
    console.log('ℹ️ Flight table not found yet, skipping flight cleanup');
  }
}

async function main() {
  console.log('🌍 Seeding comprehensive flight network...');

  await safeClearExistingData();

  const routes = generateRoutes();
  console.log(`📊 Generated ${routes.length} route pairs`);

  const flights = [];
  const flightNumbers = new Set();

  const dates = Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  for (const [fromCode, toCode] of routes) {
    const fromCity = cities.find((c) => c.code === fromCode)?.city;
    const toCity = cities.find((c) => c.code === toCode)?.city;

    const intlCodes = ['DXB', 'SIN', 'LHR', 'BKK', 'JFK'];
    const isInternational = intlCodes.includes(fromCode) || intlCodes.includes(toCode);
    const isMetroToMetro =
      cities.find((c) => c.code === fromCode)?.tier === 'metro' &&
      cities.find((c) => c.code === toCode)?.tier === 'metro';

    let flightsPerDay;
    if (isInternational) {
      flightsPerDay = Math.floor(Math.random() * 2) + 1;
    } else if (isMetroToMetro) {
      flightsPerDay = Math.floor(Math.random() * 4) + 3;
    } else {
      flightsPerDay = Math.floor(Math.random() * 3) + 2;
    }

    for (const baseDate of dates) {
      for (let i = 0; i < flightsPerDay; i++) {
        let departureHour;
        if (isInternational) {
          departureHour =
            Math.random() < 0.5
              ? Math.floor(Math.random() * 4) + 6
              : Math.floor(Math.random() * 4) + 18;
        } else {
          departureHour = Math.floor(Math.random() * 14) + 6;
        }

        const departureMinute = Math.floor(Math.random() * 4) * 15;

        const departureTime = new Date(baseDate);
        departureTime.setHours(departureHour, departureMinute, 0, 0);

        const duration = getDuration(fromCode, toCode);
        const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

        let flightNumber;
        let attempts = 0;
        do {
          const airline = airlines[Math.floor(Math.random() * airlines.length)];
          const number = Math.floor(Math.random() * 9000) + 1000;
          flightNumber = `${airline.substring(0, 2).toUpperCase()}${number}`;
          attempts++;
          if (attempts > 100) break;
        } while (flightNumbers.has(flightNumber) && attempts <= 100);

        flightNumbers.add(flightNumber);

        const price = getPrice(fromCode, toCode);
        const availableSeats = Math.floor(Math.random() * 150) + 100;

        flights.push({
          airline: airlines[Math.floor(Math.random() * airlines.length)],
          flightNumber,
          departureAirport: fromCode,
          departureCity: fromCity,
          arrivalAirport: toCode,
          arrivalCity: toCity,
          departureTime,
          arrivalTime,
          price,
          duration,
          availableSeats,
          seatClass: 'ECONOMY',
        });
      }
    }
  }

  const batchSize = 500;
  for (let i = 0; i < flights.length; i += batchSize) {
    const batch = flights.slice(i, i + batchSize);
    await prisma.flight.createMany({ data: batch });
    console.log(`✈️ Inserted ${Math.min(i + batchSize, flights.length)}/${flights.length} flights`);
  }

  console.log(`✅ Successfully seeded ${flights.length} flights across ${routes.length} routes!`);
  console.log('📅 Coverage: Next 90 days');
  console.log(
    `🏙️ Cities: ${cities.length} (metros: ${cities.filter((c) => c.tier === 'metro').length}, tier-2: ${cities.filter((c) => c.tier === 'tier2').length}, intl: ${cities.filter((c) => c.tier === 'intl').length})`
  );
  console.log(`🛣️ Routes: ${routes.length} bidirectional pairs`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });