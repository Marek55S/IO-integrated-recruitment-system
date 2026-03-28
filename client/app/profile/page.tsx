'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { ProfileViewConfig } from '@io/content-api';

import { BrandedPageLoader } from '@/components/branded-page-loader';
import { SubmissionPreview } from '@/components/submission-preview';
import { Button } from '@/components/ui/button';
import { clearAllDemoRecruitmentStorage } from '@/lib/clear-demo-storage';
import { RECRUITMENT_FORM_VALUES_STORAGE_KEY } from '@/lib/recruitment-storage';

type FormValues = Record<string, unknown>;

export default function ProfilePage() {
  const router = useRouter();
  const [config, setConfig] = useState<ProfileViewConfig | null>(null);
  const [values, setValues] = useState<FormValues | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/profile-view')
      .then((response) => {
        if (!response.ok) {
          throw new Error('request failed');
        }

        return response.json() as Promise<ProfileViewConfig>;
      })
      .then((data) => {
        if (!cancelled) {
          setConfig(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Nie udało się wczytać profilu.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

  if (loadError) {
    return (
      <main className="min-h-screen bg-transparent px-4 py-10 md:px-6 md:py-14">
        <p className="text-center text-sm text-destructive">{loadError}</p>
        <p className="mt-4 text-center text-sm">
          <Link
            href="/"
            className="text-primary cursor-pointer font-medium underline-offset-4 hover:underline">
            Strona główna
          </Link>
        </p>
      </main>
    );
  }

  if (!config) {
    return (
      <main className="min-h-screen bg-transparent px-4 py-10 md:px-6 md:py-14">
        <BrandedPageLoader label="Wczytywanie profilu…" />
      </main>
    );
  }

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
          <Button
            type="button"
            className="border-transparent bg-[#a71930] text-white hover:bg-[#8f1526] hover:text-white focus-visible:border-[#a71930]/40 focus-visible:ring-[#a71930]/25"
            onClick={handleLogout}>
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
