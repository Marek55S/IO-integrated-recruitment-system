import { notFound } from 'next/navigation';

import { getProfileViewConfig } from '@io/content-api/server';

import { getProgramById, getPrograms } from '@/mockedBackend/programs';
import { getApplicationsByProgramId } from '@/mockedBackend/applications-admin';

import { ApplicationsTable } from './applications-table';

type AdminProgramPageProps = {
  params: Promise<{ programId: string }>;
};

export function generateStaticParams() {
  return getPrograms().map((program) => ({
    programId: program.id,
  }));
}

export default async function AdminProgramPage({ params }: AdminProgramPageProps) {
  const { programId } = await params;
  const program = getProgramById(programId);

  if (!program) {
    notFound();
  }

  const applications = getApplicationsByProgramId(programId);
  const profileConfig = getProfileViewConfig();

  const previewConfig = {
    title: 'Dane kandydata',
    subtitle: undefined,
    sections: profileConfig.sections,
  };

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Page header */}
        <div className="rounded-xl border border-amber-500/20 bg-card p-6 shadow-md md:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-amber-700 dark:text-amber-400">
            {program.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Wnioski rekrutacyjne ({applications.length})
          </p>
        </div>

        {/* Table */}
        <ApplicationsTable
          applications={applications}
          previewConfig={previewConfig}
          programName={program.name}
        />
      </div>
    </main>
  );
}
