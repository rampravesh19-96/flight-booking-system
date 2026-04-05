'use client';

import { Suspense } from 'react';
import LoginFormContent from './login-form';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginFormContent />
    </Suspense>
  );
}

function LoginPageSkeleton() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-md items-center justify-center px-6 py-32">
        <div className="w-full rounded-lg border border-slate-700 bg-slate-900 p-8">
          <div className="mb-6 h-8 w-24 animate-pulse rounded bg-slate-700"></div>
          <div className="space-y-4">
            <div className="h-10 animate-pulse rounded bg-slate-700"></div>
            <div className="h-10 animate-pulse rounded bg-slate-700"></div>
            <div className="h-10 animate-pulse rounded bg-slate-700"></div>
          </div>
        </div>
      </div>
    </main>
  );
}