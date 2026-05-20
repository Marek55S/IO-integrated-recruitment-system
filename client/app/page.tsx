import { ProgramsSearch } from '@/components/programs-search';
import { ProgramCards } from '@/components/program-cards';

async function getPrograms() {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8000/api/v1';
    const res = await fetch(`${apiUrl}/programs`, { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const programs = await getPrograms();

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Hero */}
        <header className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Rekrutacja na studia podyplomowe
          </h1>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            Przeglądaj dostępne kierunki i złóż wniosek online. Twoje wnioski znajdziesz w zakładce{' '}
            <a href="/profile" className="text-blue-400 hover:underline">Profil → Moje wnioski</a>.
          </p>
        </header>

        {/* Search */}
        <ProgramsSearch programs={programs} />

        {/* Program cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white/80">Dostępne kierunki</h2>
          <ProgramCards programs={programs} />
        </section>
      </div>
    </main>
  );
}
