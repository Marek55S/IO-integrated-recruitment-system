'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import type { Program } from '@/mockedBackend/programs';

const REQUIRED_FIELDS = [
  'first_name', 'last_name', 'pesel', 'birth_date', 'birth_place', 'citizenship',
  'residence_country', 'residence_city', 'residence_postal_code',
  'residence_street', 'residence_house_number', 'email', 'phone',
  'academic_title', 'university_name', 'graduation_year',
];

type ProfileStatus = 'loading' | 'complete' | 'incomplete' | 'unauthenticated';
type AppStatus = 'loading' | 'applied' | 'cancelled' | 'none';

type ProgramPageClientProps = {
  program: Program;
};

export function ProgramPageClient({ program }: ProgramPageClientProps) {
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('loading');
  const [missingCount, setMissingCount] = useState(0);
  const [appStatus, setAppStatus] = useState<AppStatus>('loading');

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.status === 401) {
          setProfileStatus('unauthenticated');
          return;
        }
        if (!res.ok) {
          setProfileStatus('incomplete');
          return;
        }
        const profile = await res.json();

        // Zmapuj pola profilu na klucze formularza (tak samo jak w form-engine)
        const mapped: Record<string, unknown> = {
          first_name: profile.first_name,
          last_name: profile.last_name,
          pesel: profile.pesel,
          birth_date: profile.birth_date,
          birth_place: profile.birth_place,
          citizenship: profile.citizenship,
          phone: profile.phone,
          email: profile.email,
        };

        const residence = profile.addresses?.find((a: any) => a.type === 'residence');
        if (residence) {
          mapped.residence_country = residence.country;
          mapped.residence_city = residence.city;
          mapped.residence_postal_code = residence.postal_code;
          mapped.residence_street = residence.street;
          mapped.residence_house_number = residence.house_number;
        }

        if (profile.education) {
          mapped.academic_title = profile.education.academic_title;
          mapped.university_name = profile.education.university_name;
          mapped.graduation_year = profile.education.graduation_year;
        }

        const missing = REQUIRED_FIELDS.filter(
          (f) => mapped[f] == null || mapped[f] === ''
        );

        setMissingCount(missing.length);
        setProfileStatus(missing.length === 0 ? 'complete' : 'incomplete');
      } catch {
        setProfileStatus('incomplete');
      }
    };

    const checkApplication = async () => {
      try {
        const res = await fetch('/api/applications', { credentials: 'include', cache: 'no-store' });
        if (!res.ok) { setAppStatus('none'); return; }
        const data = await res.json();
        const apps: any[] = data.applications ?? [];
        const match = apps.find((a) => {
          const pid = a.form_data?.program_id ?? a.program_id;
          return pid === program.id;
        });
        if (!match) { setAppStatus('none'); return; }
        setAppStatus(match.status === 'cancelled' ? 'cancelled' : 'applied');
      } catch {
        setAppStatus('none');
      }
    };

    checkProfile();
    checkApplication();
  }, [program.id]);

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-4">
          {program.image_src ? (
            <div className="border-primary/20 overflow-hidden rounded-xl border shadow-md">
              <img
                src={program.image_src}
                alt={program.name}
                className="block aspect-[12/5] w-full object-cover align-middle"
                width={960}
                height={400}
              />
            </div>
          ) : null}

          <h1 className="text-primary text-3xl font-bold tracking-tight">
            {program.name}
          </h1>

          {program.description ? (
            <p className="whitespace-pre-line text-base leading-relaxed text-foreground/80">
              {program.description}
            </p>
          ) : null}
        </header>

        <section className="border-primary/15 w-full rounded-xl border bg-card p-6 shadow-md md:p-8 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Rekrutacja</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Aby złożyć wniosek na ten kierunek, Twój profil kandydata musi być w pełni uzupełniony.
            </p>
          </div>

          {profileStatus === 'loading' && (
            <p className="text-sm text-muted-foreground animate-pulse">Sprawdzanie profilu…</p>
          )}

          {profileStatus === 'unauthenticated' && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">Musisz być zalogowany, aby złożyć wniosek.</p>
              <Link href="/login" className="mt-2 inline-block">
                <Button size="sm" variant="outline" className="mt-2">Zaloguj się</Button>
              </Link>
            </div>
          )}

          {/* Already applied and not cancelled */}
          {appStatus === 'applied' && profileStatus !== 'unauthenticated' && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/[0.07] p-4 space-y-2">
              <p className="text-sm font-medium text-green-400">
                ✓ Złożyłeś już wniosek na ten kierunek.
              </p>
              <p className="text-xs text-green-400/70">
                Aby ponownie aplikować, najpierw musisz wycofać istniejący wniosek w zakładce Profil → Moje wnioski.
              </p>
              <Link href="/profile">
                <Button size="sm" className="bg-green-700 hover:bg-green-600 text-white mt-1">
                  Zarządzaj wnioskiem
                </Button>
              </Link>
            </div>
          )}

          {profileStatus === 'incomplete' && appStatus !== 'applied' && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-950/20 space-y-3">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                Twój profil jest niekompletny — brakuje {missingCount}{' '}
                {missingCount === 1 ? 'wymaganego pola' : 'wymaganych pól'}.
              </p>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                Uzupełnij dane w formularzu profilu, a następnie wróć tutaj, aby złożyć wniosek.
              </p>
              <Link href="/form">
                <Button
                  size="sm"
                  className="bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600">
                  Uzupełnij brakujące dane
                </Button>
              </Link>
            </div>
          )}

          {profileStatus === 'complete' && appStatus !== 'applied' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                ✓ Twój profil jest kompletny. Możesz złożyć wniosek.
              </p>
              <Link href={`/form?programId=${program.id}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  Aplikuj na ten kierunek
                </Button>
              </Link>
            </div>
          )}
        </section>
      </article>
    </main>
  );
}
