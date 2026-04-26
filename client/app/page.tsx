import { getPrograms } from '@/mockedBackend/programs';

import { ProgramsSearch } from '@/components/programs-search';
import { StudyApplicationsCards } from '@/components/study-applications-cards';

export default function HomePage() {
  const programs = getPrograms();

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-3xl space-y-10">
        <ProgramsSearch programs={programs} />
        <StudyApplicationsCards />
      </div>
    </main>
  );
}
