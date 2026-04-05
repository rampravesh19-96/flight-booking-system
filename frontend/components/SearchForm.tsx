'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CityCombobox from './CityCombobox';
import { City } from '../types';

const cities: City[] = [
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

export default function SearchForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to && date) {
      router.push(`/results?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="from" className="block text-sm font-medium text-slate-300">
            From
          </label>
          <CityCombobox
            value={from}
            onChange={setFrom}
            placeholder="Select departure city"
            cities={cities}
          />
        </div>
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-slate-300">
            To
          </label>
          <CityCombobox
            value={to}
            onChange={setTo}
            placeholder="Select destination city"
            cities={cities}
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-300">
            Departure Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full rounded-md bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        Search Flights
      </button>
    </form>
  );
}