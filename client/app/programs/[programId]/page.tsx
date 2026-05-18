import { notFound } from 'next/navigation';

import { ProgramPageClient } from './program-page-client';

type ProgramPageProps = {
  params: Promise<{ programId: string }>;
};

async function getProgram(id: string) {
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:8000/api/v1';
    const res = await fetch(`${apiUrl}/programs/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Błąd pobierania programu:', error);
    return null;
  }
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { programId } = await params;
  const program = await getProgram(programId);

  if (!program) {
    notFound();
  }

  return <ProgramPageClient program={program} />;
}
