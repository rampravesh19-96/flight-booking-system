'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
          <input
            type="text"
            id="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="e.g., JFK"
            className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            required
          />
        </div>
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-slate-300">
            To
          </label>
          <input
            type="text"
            id="to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="e.g., LAX"
            className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            required
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