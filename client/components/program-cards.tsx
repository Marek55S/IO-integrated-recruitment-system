'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, GraduationCap } from 'lucide-react';

type Program = {
  id: string;
  name: string;
  description?: string;
  image_src?: string;
};

type ApplicationStatus = {
  [programId: string]: 'applied' | 'cancelled' | null;
};

function ProgramCards({ programs }: { programs: Program[] }) {
  const [appStatus, setAppStatus] = useState<ApplicationStatus>({});

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch('/api/applications', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        const apps: any[] = data.applications ?? [];

        const map: ApplicationStatus = {};
        for (const app of apps) {
          const pid = app.program_id ?? app.edition?.program_id ?? app.form_data?.program_id;
          if (!pid) continue;
          // If any non-cancelled application exists, mark as applied
          if (app.status !== 'cancelled') {
            map[pid] = 'applied';
          } else if (!map[pid]) {
            map[pid] = 'cancelled';
          }
        }
        setAppStatus(map);
      } catch {}
    };
    fetchApplications();
  }, []);

  if (programs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
        Brak dostępnych kierunków
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {programs.map((program) => {
        const status = appStatus[program.id];
        const alreadyApplied = status === 'applied';

        return (
          <li key={program.id}>
            <Link
              href={`/programs/${program.id}`}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
                alreadyApplied
                  ? 'border-green-500/30 bg-green-50 dark:bg-green-950/10'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
              aria-label={`${program.name}${alreadyApplied ? ' — już złożono wniosek' : ''}`}
            >
              {/* Image */}
              {program.image_src ? (
                <div className="aspect-[16/7] w-full overflow-hidden">
                  <img
                    src={program.image_src}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/7] w-full items-center justify-center bg-card/50">
                  <GraduationCap className="size-12 text-foreground/20" />
                </div>
              )}

              {/* "Already applied" badge */}
              {alreadyApplied && (
                <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-md">
                  <CheckCircle className="size-3" />
                  Złożono wniosek
                </span>
              )}

              {/* Text area */}
              <div className="relative flex flex-1 flex-col p-0">
                <div className="rounded-b-2xl bg-card/95 dark:bg-[#0b1220]/85 border-t border-border dark:border-white/10 px-4 py-3 backdrop-blur-sm">
                  <h3 className="font-semibold text-foreground dark:text-white leading-snug text-sm line-clamp-2">
                    {program.name}
                  </h3>
                  {program.description && (
                    <p className="mt-1 text-xs text-muted-foreground dark:text-white/55 line-clamp-2 leading-relaxed">
                      {program.description}
                    </p>
                  )}
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-primary dark:text-blue-400 group-hover:text-primary/70 dark:group-hover:text-blue-300 transition-colors">
                      {alreadyApplied ? 'Zobacz szczegóły →' : 'Aplikuj →'}
                    </span>
                    {alreadyApplied && (
                      <span className="text-[10px] text-green-600 dark:text-green-400">✓ Aplikowano</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export { ProgramCards };
