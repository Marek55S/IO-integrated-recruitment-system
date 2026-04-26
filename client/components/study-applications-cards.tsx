'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  cancelStudyApplication,
  readStudyApplications,
  setStudyApplicationStatus,
  STUDY_APPLICATIONS_CHANGED_EVENT,
  studyApplicationStatusLabel,
  type StudyApplication,
} from '@/lib/study-applications-storage';

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusBadgeClass(status: StudyApplication['status']): string {
  switch (status) {
    case 'paid':
      return 'mt-1 inline-flex w-fit rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200';
    case 'cancelled':
      return 'mt-1 inline-flex w-fit rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-900 dark:bg-red-950/70 dark:text-red-200';
    default:
      return 'mt-1 inline-flex w-fit rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground';
  }
}

const CANCELLATION_POLICY =
  'Polityka anulowania: rezygnacja jest możliwa do 24 godzin przed zakończeniem rekrutacji na kierunek. ' +
  'Jeśli złożysz rezygnację w tym terminie, opłata rekrutacyjna zostanie zwrócona. ' +
  'W przeciwnym razie opłata nie podlega zwrotowi.\n\n' +
  'Po anulowaniu nie będzie możliwości ponownego złożenia wniosku na ten kierunek.';

function handleCancel(app: StudyApplication) {
  if (app.status === 'awaiting_payment') {
    const confirmed = window.confirm(
      `Czy na pewno chcesz anulować wniosek na kierunek "${app.programName}"?\n\nTej operacji nie można cofnąć. Nie będzie możliwości ponownego złożenia wniosku na ten kierunek.`,
    );
    if (confirmed) {
      cancelStudyApplication(app.id);
    }
  } else if (app.status === 'paid') {
    const confirmed = window.confirm(
      `${CANCELLATION_POLICY}\n\nCzy na pewno chcesz anulować wniosek na kierunek "${app.programName}"?`,
    );
    if (confirmed) {
      cancelStudyApplication(app.id);
    }
  }
}

function StudyApplicationsCards() {
  const [applications, setApplications] = useState<StudyApplication[]>([]);

  const sync = useCallback(() => {
    setApplications(readStudyApplications());
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(STUDY_APPLICATIONS_CHANGED_EVENT, sync);
    return () =>
      window.removeEventListener(STUDY_APPLICATIONS_CHANGED_EVENT, sync);
  }, [sync]);

  if (applications.length === 0) {
    return (
      <section className="mx-auto flex w-full max-w-md flex-col items-center space-y-3">
        <h2 className="font-outside-card-title text-center text-xl font-semibold tracking-tight">
          Twoje wnioski o studia
        </h2>
        <p className="border-primary/25 w-full rounded-xl border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
          Nie masz jeszcze złożonych wniosków. Wybierz kierunek z wyszukiwarki
          powyżej i prześlij zgłoszenie — wtedy pojawi się tutaj z statusem.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-md flex-col items-center space-y-4">
      <h2 className="font-outside-card-title text-center text-xl font-semibold tracking-tight">
        Twoje wnioski o studia
      </h2>
      <ul className="flex w-full flex-col items-center gap-4">
        {applications.map((app) => (
          <li
            key={app.id}
            className="relative flex w-full flex-col rounded-xl border border-border border-l-4 border-l-primary bg-card p-4 shadow-md">
            {/* Przycisk anulowania */}
            {app.status !== 'cancelled' ? (
              <button
                type="button"
                onClick={() => handleCancel(app)}
                aria-label={`Anuluj wniosek na ${app.programName}`}
                className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive dark:hover:bg-red-950/40 dark:hover:text-red-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ) : null}

            <div className="flex flex-1 flex-col gap-2 pr-6">
              <p className="font-semibold leading-snug text-foreground">
                {app.programName}
              </p>
              <p className="text-xs text-muted-foreground">
                Złożono: {formatDate(app.submittedAt)}
              </p>
              <span className={statusBadgeClass(app.status)}>
                {studyApplicationStatusLabel(app.status)}
              </span>
            </div>

            {app.status !== 'cancelled' ? (
              <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
                <Link
                  href={`/programs/${app.programId}`}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  Kierunek
                </Link>
                {app.status === 'awaiting_payment' ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setStudyApplicationStatus(app.id, 'paid')}>
                    Symuluj opłatę
                  </Button>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export { StudyApplicationsCards };
