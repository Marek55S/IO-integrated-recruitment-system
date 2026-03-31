'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { ProfileViewConfig } from '@io/content-api';

import { SubmissionPreview } from '@/components/submission-preview';
import { Button } from '@/components/ui/button';
import { clearAllDemoRecruitmentStorage } from '@/lib/clear-demo-storage';
import { RECRUITMENT_FORM_VALUES_STORAGE_KEY } from '@/lib/recruitment-storage';

type FormValues = Record<string, unknown>;

type ProfilePageClientProps = {
  config: ProfileViewConfig;
};

export function ProfilePageClient({ config }: ProfilePageClientProps) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = localStorage.getItem(RECRUITMENT_FORM_VALUES_STORAGE_KEY);
      if (!raw) {
        setValues(null);
        return;
      }

      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        setValues(parsed as FormValues);
      } else {
        setValues(null);
      }
    } catch {
      setValues(null);
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem(RECRUITMENT_FORM_VALUES_STORAGE_KEY);
    } catch {
      /* ignore */
    }

    router.push('/login');
  };

  const handleClearDemo = () => {
    clearAllDemoRecruitmentStorage();
    setValues(null);
  };

  const displayValues = values ?? {};

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <SubmissionPreview
          values={displayValues}
          config={{
            title: config.title,
            subtitle: config.subtitle,
            sections: config.sections,
          }}
        />

        <div className="flex flex-col items-center gap-3">
          <Button type="button" variant="destructive" onClick={handleLogout}>
            Wyloguj się
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-muted-foreground"
            onClick={handleClearDemo}>
            Wyczyść dane demo (localStorage)
          </Button>
        </div>
      </div>
    </main>
  );
}
