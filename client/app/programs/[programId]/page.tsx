import { notFound } from 'next/navigation';

import { getProgramPageById, getProgramsIndex } from '@io/content-api/server';

import { ProgramPageClient } from './program-page-client';

type ProgramPageProps = {
  params: Promise<{ programId: string }>;
};

export function generateStaticParams() {
  const { programs } = getProgramsIndex();

  return programs.map((program) => ({
    programId: program.id,
  }));
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { programId } = await params;
  const page = getProgramPageById(programId);

  if (!page) {
    notFound();
  }

  return <ProgramPageClient page={page} />;
}
