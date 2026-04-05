'use client';

import { useState, useRef, useEffect } from 'react';
import { City } from '../types';

interface CityComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  cities: City[];
}

export default function CityCombobox({ value, onChange, placeholder, cities }: CityComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter cities based on search term
  const filteredCities = cities.filter(city =>
    city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find selected city for display
  const selectedCity = cities.find(city => city.code === value);

  // Reset search term when value changes externally
  useEffect(() => {
    if (selectedCity) {
      setSearchTerm('');
    }
  }, [value, selectedCity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);

    // If user types an exact match, select it
    const exactMatch = cities.find(city =>
      city.city.toLowerCase() === newValue.toLowerCase() ||
      city.code.toLowerCase() === newValue.toLowerCase()
    );
    if (exactMatch) {
      onChange(exactMatch.code);
      setIsOpen(false);
    }
  };

  const handleSelect = (city: City) => {
    onChange(city.code);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex(prev =>
          prev < filteredCities.length - 1 ? prev + 1 : prev
        );
        e.preventDefault();
        break;
      case 'ArrowUp':
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        e.preventDefault();
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
          handleSelect(filteredCities[highlightedIndex]);
        }
        e.preventDefault();
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleBlur = () => {
    // Delay closing to allow for clicks on options
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
      setSearchTerm('');
    }, 200);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={selectedCity ? `${selectedCity.city} (${selectedCity.code})` : searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        autoComplete="off"
      />

      {/* Dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-600 bg-slate-800 py-1 shadow-lg"
        >
          {filteredCities.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-400">
              No cities found
            </li>
          ) : (
            filteredCities.map((city, index) => (
              <li
                key={city.code}
                onClick={() => handleSelect(city)}
                className={`cursor-pointer px-3 py-2 text-sm hover:bg-slate-700 ${
                  index === highlightedIndex ? 'bg-slate-700' : ''
                } ${city.code === value ? 'bg-cyan-900/30 text-cyan-400' : 'text-white'}`}
              >
                <div className="flex items-center justify-between">
                  <span>{city.city}</span>
                  <span className="text-slate-400">({city.code})</span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}