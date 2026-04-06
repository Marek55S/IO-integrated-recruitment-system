'use client';

import Link from 'next/link';

import type { ProgramPage } from '@io/content-api';

import { ProgramRecruitmentForm } from '@/components/program-recruitment-form';

type ProgramPageClientProps = {
  page: ProgramPage;
};

export function ProgramPageClient({ page }: ProgramPageClientProps) {
  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <article className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-4">
          <div className="border-primary/20 overflow-hidden rounded-xl border shadow-md">
            <img
              src={page.image_src}
              alt={page.title}
              className="block aspect-[12/5] w-full object-cover align-middle"
              width={960}
              height={400}
            />
          </div>

          {page.description ? (
            <p className="font-outside-card-body whitespace-pre-line text-base leading-relaxed">
              {page.description}
            </p>
          ) : null}
        </header>

        <ProgramRecruitmentForm
          config={page.form}
          programId={page.program_id}
          programName={page.title}
        />
      </article>
    </main>
  );
}
