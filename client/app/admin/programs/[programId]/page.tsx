import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { getProfileViewConfig } from '@io/content-api/server';

import { ApplicationsTable } from './applications-table';

type AdminProgramPageProps = {
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

async function getAdminApplications(programId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return [];

    const apiUrl = process.env.API_URL || 'http://localhost:8000/api/v1';
    const res = await fetch(
      `${apiUrl}/admin/programs/${programId}/applications`,
      {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Błąd pobierania wniosków dla programu:', error);
    return [];
  }
}

export default async function AdminProgramPage({
  params,
}: AdminProgramPageProps) {
  const { programId } = await params;
  const program = await getProgram(programId);

  if (!program) {
    notFound();
  }

  const applications = await getAdminApplications(programId);
  const profileConfig = getProfileViewConfig();

  const previewConfig = {
    title: 'Dane kandydata',
    subtitle: undefined,
    sections: profileConfig.sections,
  };

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <a
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Powrót do panelu admina
          </a>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-card p-6 shadow-md md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">
                Zarządzanie kierunkiem
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {program.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Wnioski rekrutacyjne ({applications.length})
              </p>
            </div>
          </div>
        </div>

        <ApplicationsTable
          applications={applications}
          previewConfig={previewConfig}
          programName={program.name}
        />
      </div>
    </main>
  );
}
