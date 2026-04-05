'use client';

import { useState, useEffect } from 'react';
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

interface ResultsSearchBarProps {
  initialFrom: string | null;
  initialTo: string | null;
  initialDate: string | null;
  sortBy?: string;
  order?: string;
}

export default function ResultsSearchBar({
  initialFrom,
  initialTo,
  initialDate,
  sortBy = 'price',
  order = 'asc',
}: ResultsSearchBarProps) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const router = useRouter();

  // Initialize with current search params
  useEffect(() => {
    if (initialFrom) setFrom(initialFrom);
    if (initialTo) setTo(initialTo);
    if (initialDate) setDate(initialDate);
  }, [initialFrom, initialTo, initialDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to && date) {
      // Preserve sortBy and order in URL
      router.push(
        `/results?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&sortBy=${sortBy}&order=${order}`
      );
    }
  };

  const swapCities = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <form onSubmit={handleSearch} className="mb-8 rounded-lg border border-slate-700 bg-slate-900 p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="search-from" className="block text-xs font-medium text-slate-400 mb-1">
            From
          </label>
          <CityCombobox
            value={from}
            onChange={setFrom}
            placeholder="Departure"
            cities={cities}
          />
        </div>

        <div className="flex items-center justify-center pt-6">
          <button
            type="button"
            onClick={swapCities}
            className="rounded-md border border-slate-600 bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors"
            title="Swap cities"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        <div>
          <label htmlFor="search-to" className="block text-xs font-medium text-slate-400 mb-1">
            To
          </label>
          <CityCombobox
            value={to}
            onChange={setTo}
            placeholder="Destination"
            cities={cities}
          />
        </div>

        <div>
          <label htmlFor="search-date" className="block text-xs font-medium text-slate-400 mb-1">
            Date
          </label>
          <input
            type="date"
            id="search-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-slate-600 bg-slate-800 px-2 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700 transition-colors"
            title="Search"
          >
            <span className="hidden sm:inline">Search</span>
            <span className="sm:hidden">↻</span>
          </button>
        </div>
      </div>
    </form>
  );
}
