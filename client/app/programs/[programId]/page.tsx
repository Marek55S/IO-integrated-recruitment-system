import { notFound } from 'next/navigation';

import { getProgramById, getPrograms } from '@/mockedBackend/programs';

import { ProgramPageClient } from './program-page-client';

type ProgramPageProps = {
  params: Promise<{ programId: string }>;
};

export function generateStaticParams() {
  return getPrograms().map((program) => ({
    programId: program.id,
  }));
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { programId } = await params;
  const program = getProgramById(programId);

  if (!program) {
    notFound();
  }

  return <ProgramPageClient program={program} />;
}
