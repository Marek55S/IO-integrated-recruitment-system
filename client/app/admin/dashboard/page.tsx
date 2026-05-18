import Link from 'next/link';

import { AdminBroadcastForm } from './admin-broadcast-form';
import { AdminLogoutButton } from './admin-logout-button';


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

export default async function AdminDashboardPage() {
  const programs = await getPrograms();

  return (
    <main className="min-h-screen px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* ── Top bar ──────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Shield icon */}
            <div className="size-10 rounded-xl bg-amber-500/20 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-600 dark:text-amber-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Panel administratora
              </p>
              <h1 className="text-lg font-bold text-foreground leading-tight">
                Zintegrowany System Rekrutacyjny
              </h1>
            </div>
          </div>
          <AdminLogoutButton />
        </div>

        {/* ── Broadcast ──────────────────────────────── */}
        <AdminBroadcastForm />

        {/* ── Quick nav ──────────────────────────────── */}
        <section>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Szybka nawigacja
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/surveys"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 dark:bg-blue-500/15 px-4 py-2.5 text-sm font-semibold text-blue-700 dark:text-blue-200 hover:bg-blue-500/20 hover:text-blue-900 dark:hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Ankiety satysfakcji
            </Link>
          </div>
        </section>

        {/* ── Programs grid ──────────────────────────── */}
        <section>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Kierunki studiów — zarządzaj wnioskami
          </p>

          {programs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground text-sm">
              Brak kierunków w systemie.
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {programs.map((program: { id: string; name: string; image_src?: string }) => (
                <li key={program.id}>
                  <Link
                    href={`/admin/programs/${program.id}`}
                    className="group flex flex-col h-full overflow-hidden rounded-xl border border-amber-500/30 bg-card shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
                  >
                    {/* Image */}
                    {program.image_src ? (
                      <div className="aspect-[12/5] w-full overflow-hidden">
                        <img
                          src={program.image_src}
                          alt={program.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                          width={480}
                          height={200}
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[12/5] w-full items-center justify-center bg-amber-50 dark:bg-amber-950/20">
                        <svg xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-amber-400 dark:text-amber-600/60"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                        </svg>
                      </div>
                    )}

                    {/* Text */}
                    <div className="flex-1 px-4 py-3 border-t border-amber-500/20">
                      <p className="line-clamp-2 font-semibold leading-snug text-foreground text-sm group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                        {program.name}
                      </p>
                      <p className="mt-1 text-xs text-amber-600/70 dark:text-amber-500/70 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        Zarządzaj wnioskami →
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </main>
  );
}
