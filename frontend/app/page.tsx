export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <div className="mb-10 rounded-3xl border border-white/10 bg-slate-900/80 p-10 shadow-xl shadow-slate-950/30 backdrop-blur-sm">
          <p className="mb-3 uppercase tracking-[0.35em] text-xs text-cyan-300/80">Flight Booking System</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            A clean travel-tech experience for flight search, booking, and confirmation.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Version 1 sets the foundation with a polished landing page, backend API setup, Prisma database configuration, and a responsive frontend shell.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/30">
            <h2 className="text-xl font-semibold text-white">What’s included</h2>
            <ul className="mt-6 space-y-3 text-slate-300">
              <li>• Next.js app with TypeScript and Tailwind CSS</li>
              <li>• Express backend with TypeScript and health route</li>
              <li>• Prisma schema ready for MySQL-compatible database</li>
              <li>• Clean responsive UI and polished dev setup</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/30">
            <h2 className="text-xl font-semibold text-white">Next steps</h2>
            <ol className="mt-6 space-y-3 text-slate-300">
              <li>1. Search and filter flight inventory</li>
              <li>2. Flight detail and booking flow</li>
              <li>3. Authenticated user bookings</li>
              <li>4. Admin bookings dashboard</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
