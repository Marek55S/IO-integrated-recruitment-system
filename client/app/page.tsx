import { FormEngine } from '@/components/form-engine';
import { getFormConfig } from '@io/content-api/server';

export default function Home() {
  const config = getFormConfig();

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-6 md:py-10">
      <FormEngine config={config} />
    </main>
  );
}
