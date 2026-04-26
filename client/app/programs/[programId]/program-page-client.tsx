'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { appendStudyApplication } from '@/lib/study-applications-storage';
import { canApplyToProgram } from '@/mockedBackend/applications';
import type { Program } from '@/mockedBackend/programs';

type ProgramPageClientProps = {
  program: Program;
};

export function ProgramPageClient({ program }: ProgramPageClientProps) {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);
  const [showError, setShowError] = useState(false);
  const [canApply, setCanApply] = useState(true);

  useEffect(() => {
    setCanApply(canApplyToProgram(program.id));
  }, [program.id]);

  const handleSubmit = () => {
    if (!accepted) {
      setShowError(true);
      return;
    }

    appendStudyApplication({
      programId: program.id,
      programName: program.name,
      submittedAt: new Date().toISOString(),
      status: 'awaiting_payment',
    });

    router.push('/');
  };

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

        {canApply ? (
          <section className="border-primary/15 w-full space-y-6 rounded-xl border bg-card p-6 shadow-md md:p-8">
            <div className="space-y-1.5">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="accept_terms"
                  checked={accepted}
                  onChange={(event) => {
                    setAccepted(event.currentTarget.checked);
                    if (event.currentTarget.checked) setShowError(false);
                  }}
                  aria-invalid={showError}
                />
                <Label htmlFor="accept_terms" className="leading-5">
                  Akceptuję warunki rekrutacji *
                </Label>
              </div>

              {showError ? (
                <p className="text-xs text-destructive">
                  Akceptacja warunków jest wymagana przed wysłaniem zgłoszenia.
                </p>
              ) : null}
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={handleSubmit}>
                Wyślij zgłoszenie
              </Button>
            </div>
          </section>
        ) : (
          <section className="border-primary/15 w-full flex flex-col items-center gap-4 rounded-xl border bg-card p-6 shadow-md md:p-8 text-center">
            <p className="font-semibold text-foreground">
              Masz już złożony wniosek na ten kierunek.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/')}>
              Wróć do strony głównej
            </Button>
          </section>
        )}
      </article>
    </main>
  );
}
