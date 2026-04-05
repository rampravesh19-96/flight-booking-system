'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Suspense } from 'react';

function HeaderContent() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="border-b border-slate-700 bg-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-cyan-400">
          ✈️ Flight Booking
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-slate-300 hover:text-white">
            Home
          </Link>
          {token && user ? (
            <>
              <span className="text-slate-300">
                Welcome, {user.firstName}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md border border-cyan-600 px-4 py-2 font-medium text-cyan-400 hover:bg-slate-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <Suspense>
      <HeaderContent />
    </Suspense>
  );
}