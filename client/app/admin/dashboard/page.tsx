import Link from 'next/link';

import { getPrograms } from '@/mockedBackend/programs';

export default function AdminDashboardPage() {
  const programs = getPrograms();

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            Panel administratora
          </span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-amber-700 dark:text-amber-400">
          Kierunki studiów
        </h1>

        <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {programs.map((program) => (
            <li key={program.id}>
              <Link
                href={`/admin/programs/${program.id}`}
                className="group block h-full overflow-hidden rounded-xl border border-amber-500/20 bg-card shadow-md transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 flex flex-col">
                {program.image_src ? (
                  <div className="aspect-[12/5] w-full overflow-hidden bg-muted">
                    <img
                      src={program.image_src}
                      alt={program.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      width={480}
                      height={200}
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[12/5] w-full items-center justify-center bg-amber-50 dark:bg-amber-950/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-amber-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                      />
                    </svg>
                  </div>
                )}

                <div className="min-h-[3.5rem] px-4 py-3">
                  <p className="line-clamp-2 font-semibold leading-snug text-foreground">
                    {program.name}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
