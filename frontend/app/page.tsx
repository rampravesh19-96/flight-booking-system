import SearchForm from '../components/SearchForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Find Your Flight
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Search for flights between airports and discover the best options for your journey.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/30 backdrop-blur-sm">
          <SearchForm />
        </div>
      </section>
    </main>
  );
}
