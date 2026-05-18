'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { ProfileViewConfig } from '@io/content-api';
import { ApplicationManageModal } from '@/components/application-manage-modal';
import { SubmissionPreview } from '@/components/submission-preview';
import { Button } from '@/components/ui/button';
import { getSubmissionFiles } from '@/lib/file-session-store';
import {
  FileText, UserRound, GraduationCap, ExternalLink, Clock,
  CheckCircle, XCircle, AlertCircle, HourglassIcon, LogOut, Settings2,
} from 'lucide-react';

type FormValues = Record<string, unknown>;

type ProfilePageClientProps = {
  config: ProfileViewConfig;
};

const REQUIRED_FIELDS = [
  'first_name', 'last_name', 'pesel', 'birth_date', 'birth_place', 'citizenship',
  'residence_country', 'residence_city', 'residence_postal_code',
  'residence_street', 'residence_house_number', 'email', 'phone',
  'academic_title', 'university_name', 'graduation_year',
];

type Application = {
  id: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  program_name: string | null;
  program_id: string | null;
  edition_name: string | null;
  form_data: Record<string, unknown>;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
  draft:                   { label: 'Roboczy',             color: 'text-white/50 bg-white/10 border-white/10',           icon: Clock },
  submitted:               { label: 'Złożony',             color: 'text-blue-300 bg-blue-500/15 border-blue-500/20',     icon: FileText },
  documents_incomplete:    { label: 'Brak dokumentów',     color: 'text-amber-300 bg-amber-500/15 border-amber-500/20',  icon: AlertCircle },
  documents_verified:      { label: 'Dokumenty OK',        color: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/20',     icon: CheckCircle },
  awaiting_enrollment_fee: { label: 'Oczekuje na opłatę wpisową', color: 'text-orange-300 bg-orange-500/15 border-orange-500/20', icon: HourglassIcon },
  enrollment_fee_paid:     { label: 'Opłata wpisowa OK',   color: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/20',     icon: CheckCircle },
  awaiting_payment:        { label: 'Oczekuje na płatność', color: 'text-orange-300 bg-orange-500/15 border-orange-500/20', icon: HourglassIcon },
  payment_confirmed:       { label: 'Płatność potwierdzona', color: 'text-green-300 bg-green-500/15 border-green-500/20', icon: CheckCircle },
  accepted:                { label: 'Przyjęty',             color: 'text-green-300 bg-green-500/20 border-green-500/30', icon: CheckCircle },
  waitlisted:              { label: 'Lista rezerwowa',      color: 'text-purple-300 bg-purple-500/15 border-purple-500/20', icon: Clock },
  rejected:                { label: 'Odrzucony',            color: 'text-red-300 bg-red-500/15 border-red-500/20',       icon: XCircle },
  cancelled:               { label: 'Anulowany',            color: 'text-white/40 bg-white/5 border-white/10',           icon: XCircle },
  studies_not_launched:    { label: 'Kierunek nie uruchomiony', color: 'text-white/40 bg-white/5 border-white/10',       icon: XCircle },
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' });
}

function ApplicationCard({ app, onCancel }: { app: Application; onCancel: () => void }) {
  const cfg = STATUS_CONFIG[app.status] ?? { label: app.status, color: 'text-white/50 bg-white/10 border-white/10', icon: Clock };
  const Icon = cfg.icon;
  const isCancellable = !['cancelled', 'rejected', 'studies_not_launched', 'accepted'].includes(app.status);
  const programId = (app.program_id as string | undefined) ?? (app.form_data?.program_id as string | undefined);
  const [showManage, setShowManage] = useState(false);

  const appForModal = {
    ...app,
    program_id: programId ?? null,
  };

  return (
    <>
      <li className={`rounded-xl border p-5 space-y-4 transition-colors ${
        app.status === 'accepted'
          ? 'border-green-500/30 bg-green-950/15'
          : app.status === 'cancelled' || app.status === 'rejected'
          ? 'border-white/10 bg-white/[0.02] opacity-70'
          : 'border-white/10 bg-white/[0.04]'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h3 className="font-semibold text-white text-sm leading-tight">
              {app.program_name ?? 'Nieznany kierunek'}
            </h3>
            {app.edition_name && (
              <p className="text-xs text-white/40">{app.edition_name}</p>
            )}
          </div>
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cfg.color}`}>
            <Icon className="size-3" />
            {cfg.label}
          </span>
        </div>

        {/* Dates */}
        <div className="flex gap-4 text-[11px] text-white/40">
          <span>Złożono: <span className="text-white/60">{formatDate(app.submitted_at ?? app.created_at)}</span></span>
          <span>Aktualizacja: <span className="text-white/60">{formatDate(app.updated_at)}</span></span>
        </div>

        {/* Special info for accepted */}
        {app.status === 'accepted' && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 space-y-2">
            <p className="text-xs font-medium text-green-300">🎉 Gratulacje! Zostałeś przyjęty na studia.</p>
            <div className="flex gap-2 flex-wrap">
              <a
                href="https://upel.agh.edu.pl"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition-colors"
              >
                <ExternalLink className="size-3" /> Platforma uPel
              </a>
              <Link
                href="/materials"
                className="inline-flex items-center gap-1 rounded-lg border border-green-500/30 px-3 py-1.5 text-xs font-medium text-green-300 hover:bg-green-500/10 transition-colors"
              >
                Materiały i zasoby
              </Link>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-white/5 pt-3">
          {/* PRIMARY: Manage button — always visible */}
          <button
            onClick={() => setShowManage(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <Settings2 className="size-3.5" />
            Zarządzaj wnioskiem
          </button>

          {programId && (
            <Link href={`/programs/${programId}`}>
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                <GraduationCap className="size-3.5" />
                Kierunek
              </button>
            </Link>
          )}
          {app.status === 'draft' && (
            <Link href={programId ? `/form?programId=${programId}` : '/form'}>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500 transition-colors">
                Dokończ wniosek
              </button>
            </Link>
          )}
          {app.status === 'documents_incomplete' && (
            <Link href="/form">
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500 transition-colors">
                Uzupełnij dokumenty
              </button>
            </Link>
          )}
        </div>
      </li>

      {/* Manage modal */}
      {showManage && (
        <ApplicationManageModal
          app={appForModal}
          onClose={() => setShowManage(false)}
          onCancel={onCancel}
        />
      )}
    </>
  );
}

export function ProfilePageClient({ config }: ProfilePageClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'profile' | 'applications'>('profile');
  const [values, setValues] = useState<FormValues | null>(null);
  const [submittedFiles, setSubmittedFiles] = useState<File[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await fetch('/api/profile', { cache: 'no-store', credentials: 'include' });
        if (!profileRes.ok) { setValues(null); setSubmittedFiles(getSubmissionFiles()); return; }
        const profile = await profileRes.json();

        const mapped: FormValues = {
          first_name: profile.first_name, last_name: profile.last_name,
          family_name: profile.family_name, pesel: profile.pesel,
          birth_date: profile.birth_date, birth_place: profile.birth_place,
          citizenship: profile.citizenship, phone: profile.phone, email: profile.email,
        };
        const residence = profile.addresses?.find((a: any) => a.type === 'residence');
        if (residence) {
          mapped.residence_country = residence.country; mapped.residence_city = residence.city;
          mapped.residence_postal_code = residence.postal_code; mapped.residence_street = residence.street;
          mapped.residence_house_number = residence.house_number;
        }
        if (profile.education) {
          mapped.academic_title = profile.education.academic_title;
          mapped.university_name = profile.education.university_name;
          mapped.graduation_year = profile.education.graduation_year;
          mapped.high_school_diploma_country = profile.education.diploma_country;
          mapped.high_school_country_name = profile.education.diploma_country_name;
        }
        if (profile.emergency_contact) {
          mapped.emergency_name = profile.emergency_contact.full_name;
          mapped.emergency_email = profile.emergency_contact.email;
          mapped.emergency_phone = profile.emergency_contact.phone;
        }
        setValues(mapped);
        setSubmittedFiles(getSubmissionFiles());
      } catch { setValues(null); setSubmittedFiles(getSubmissionFiles()); }
    };
    fetchProfileData();
  }, []);

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await fetch('/api/applications', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications ?? []);
      }
    } finally { setLoadingApps(false); }
  };

  useEffect(() => {
    if (tab === 'applications') fetchApplications();
  }, [tab]);

  const handleLogout = () => {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  const handleCancelConfirm = async (id: string) => {
    try {
      await fetch(`/api/applications/${id}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });
      await fetchApplications();
    } catch {}
    setCancelConfirm(null);
  };


  const displayValues = values ?? {};
  const missingFields = useMemo(() =>
    REQUIRED_FIELDS.filter((f) => { const v = displayValues[f]; return v == null || v === ''; }),
    [displayValues]
  );
  const hasIncompleteData = missingFields.length > 0;

  const TABS = [
    { id: 'profile' as const, label: 'Profil', icon: UserRound },
    { id: 'applications' as const, label: 'Moje wnioski', icon: FileText },
  ];

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Tab bar */}
        <nav className="flex border-b border-white/10">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === id
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div className="space-y-6">
            {hasIncompleteData && (
              <section className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <h2 className="font-semibold text-amber-300">Twój profil jest niekompletny</h2>
                    <p className="mt-1 text-sm text-amber-400/80">
                      Brakuje {missingFields.length} wymaganych pól. Uzupełnij dane, aby aplikować na kierunki.
                    </p>
                  </div>
                  <Link href="/form">
                    <Button className="bg-amber-600 text-white hover:bg-amber-700 shrink-0">Uzupełnij dane</Button>
                  </Link>
                </div>
              </section>
            )}

            <SubmissionPreview
              values={displayValues}
              config={{ title: config.title, subtitle: config.subtitle, sections: config.sections }}
              files={submittedFiles}
            />

            <div className="flex flex-col items-center gap-3 pt-2">
              {hasIncompleteData && (
                <Link href="/form"><Button variant="outline">Dodaj brakujące dane</Button></Link>
              )}
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="size-4 mr-2" /> Wyloguj się
              </Button>
            </div>
          </div>
        )}

        {/* ── APPLICATIONS TAB ── */}
        {tab === 'applications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Moje wnioski</h2>
              <Link href="/">
                <Button size="sm" variant="outline" className="border-white/20 text-white/70 hover:text-white bg-transparent hover:bg-white/10">
                  + Złóż nowy wniosek
                </Button>
              </Link>
            </div>

            {loadingApps ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-36 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center space-y-3">
                <FileText className="size-12 text-white/20 mx-auto" />
                <p className="text-white/40 text-sm">Nie masz jeszcze żadnych wniosków.</p>
                <Link href="/">
                  <Button size="sm" className="mt-2">Przeglądaj kierunki</Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Cancel confirmation modal */}
                {cancelConfirm && (
                  <div className="dark fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1829] p-6 space-y-4 shadow-2xl">
                      <h3 className="font-semibold text-white">Anulować wniosek?</h3>
                      <p className="text-sm text-white/60">
                        Tej operacji nie można cofnąć. Będziesz mógł złożyć nowy wniosek na ten kierunek dopiero po anulowaniu.
                      </p>
                      <div className="flex gap-3">
                        <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => handleCancelConfirm(cancelConfirm)}>
                          Tak, anuluj
                        </Button>
                        <Button variant="outline" className="flex-1 border-white/20 text-white bg-transparent hover:bg-white/10" onClick={() => setCancelConfirm(null)}>
                          Wróć
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <ul className="space-y-3">
                  {applications.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      app={app}
                      onCancel={() => setCancelConfirm(app.id)}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
