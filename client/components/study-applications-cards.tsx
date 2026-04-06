'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  readStudyApplications,
  setStudyApplicationStatus,
  STUDY_APPLICATIONS_CHANGED_EVENT,
  type StudyApplication,
  studyApplicationStatusLabel,
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
            className="flex w-full flex-col rounded-xl border border-border border-l-4 border-l-primary bg-card p-4 shadow-md">
            <div className="flex flex-1 flex-col gap-2">
              <p className="font-semibold leading-snug text-foreground">
                {app.programName}
              </p>
              <p className="text-xs text-muted-foreground">
                Złożono: {formatDate(app.submittedAt)}
              </p>
              <p className="text-xs text-muted-foreground">
                ID: {app.programId}
              </p>
              <span
                className={
                  app.status === 'paid'
                    ? 'mt-1 inline-flex w-fit rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200'
                    : 'mt-1 inline-flex w-fit rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground'
                }>
                {studyApplicationStatusLabel(app.status)}
              </span>
            </div>
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
                  onClick={() => {
                    setStudyApplicationStatus(app.id, 'paid');
                  }}>
                  Symuluj opłatę
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { StudyApplicationsCards };
