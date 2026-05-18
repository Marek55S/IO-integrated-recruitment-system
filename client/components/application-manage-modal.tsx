'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X, FileDown, ExternalLink, Settings2, XCircle, Clock, CheckCircle,
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  draft:                   { label: 'Roboczy',                    bg: 'bg-slate-700',   text: 'text-slate-200' },
  submitted:               { label: 'Złożony',                    bg: 'bg-blue-700',    text: 'text-blue-100' },
  documents_incomplete:    { label: 'Brak dokumentów',            bg: 'bg-amber-700',   text: 'text-amber-100' },
  documents_verified:      { label: 'Dokumenty OK',               bg: 'bg-cyan-700',    text: 'text-cyan-100' },
  awaiting_enrollment_fee: { label: 'Oczekuje na opłatę wpisową', bg: 'bg-orange-700',  text: 'text-orange-100' },
  enrollment_fee_paid:     { label: 'Opłata wpisowa OK',          bg: 'bg-cyan-700',    text: 'text-cyan-100' },
  awaiting_payment:        { label: 'Oczekuje na płatność',       bg: 'bg-orange-700',  text: 'text-orange-100' },
  payment_confirmed:       { label: 'Płatność potwierdzona',      bg: 'bg-green-700',   text: 'text-green-100' },
  accepted:                { label: 'Przyjęty',                   bg: 'bg-green-600',   text: 'text-green-50' },
  waitlisted:              { label: 'Lista rezerwowa',             bg: 'bg-purple-700',  text: 'text-purple-100' },
  rejected:                { label: 'Odrzucony',                  bg: 'bg-red-700',     text: 'text-red-100' },
  cancelled:               { label: 'Anulowany',                  bg: 'bg-slate-600',   text: 'text-slate-200' },
  studies_not_launched:    { label: 'Kierunek nie uruchomiony',   bg: 'bg-slate-600',   text: 'text-slate-200' },
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pl-PL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

type HistoryEntry = {
  id: string;
  old_status: string | null;
  new_status: string;
  note: string | null;
  changed_at: string;
};

type Application = {
  id: string;
  status: string;
  program_name: string | null;
  program_id: string | null;
  edition_name: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  app: Application;
  onClose: () => void;
  onCancel: () => void;
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_LABELS[status] ?? { label: status, bg: 'bg-slate-600', text: 'text-slate-200' };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function downloadDocument(applicationId: string, type: string, label: string) {
  const link = document.createElement('a');
  link.href = `/api/applications/${applicationId}/document?type=${type}`;
  link.download = `${label}_${applicationId.slice(0, 8).toUpperCase()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ApplicationManageModal({ app, onClose, onCancel }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/applications/${app.id}/history`, { credentials: 'include' });
        if (res.ok) setHistory(await res.json());
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [app.id]);

  const isCancellable = !['cancelled', 'rejected', 'studies_not_launched'].includes(app.status);
  const canDownloadAcceptance = app.status === 'accepted';

  return (
    <div
      className="dark fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────── */}
        <div
          className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-4"
          style={{ background: '#111827', borderBottom: '1px solid rgba(255,255,255,0.10)' }}
        >
          <div className="min-w-0 flex items-start gap-3">
            <Settings2 className="size-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-white text-base leading-tight">Zarządzanie wnioskiem</h2>
              <p className="text-sm text-slate-400 mt-0.5 truncate">{app.program_name ?? '—'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors mt-0.5"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-7">

          {/* ── Status + details ───────────────── */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dane wniosku</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-1">Status</p>
                <StatusPill status={app.status} />
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Edycja</p>
                <p className="text-white font-medium">{app.edition_name ?? '—'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Data złożenia</p>
                <p className="text-white font-medium">{fmtDate(app.submitted_at ?? app.created_at)}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Ostatnia zmiana</p>
                <p className="text-white font-medium">{fmtDate(app.updated_at)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 text-xs mb-1">ID wniosku</p>
                <code className="text-slate-300 text-xs font-mono">{app.id}</code>
              </div>
            </div>
          </section>

          {/* ── Documents ──────────────────────── */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dokumenty do pobrania</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => downloadDocument(app.id, 'student_status', 'zaswiadczenie_status')}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/15 px-3 py-2 text-sm font-medium text-blue-200 hover:bg-blue-500/25 hover:text-white transition-colors"
              >
                <FileDown className="size-4" />
                Zaświadczenie o statusie studenta
              </button>
              {canDownloadAcceptance && (
                <button
                  onClick={() => downloadDocument(app.id, 'acceptance', 'zaswiadczenie_przyjecie')}
                  className="inline-flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/15 px-3 py-2 text-sm font-medium text-green-200 hover:bg-green-500/25 hover:text-white transition-colors"
                >
                  <FileDown className="size-4" />
                  Zaświadczenie o przyjęciu na studia
                </button>
              )}
            </div>
            {!canDownloadAcceptance && (
              <p className="mt-2 text-xs text-slate-500">
                Zaświadczenie o przyjęciu dostępne po uzyskaniu statusu „Przyjęty".
              </p>
            )}
          </section>

          {/* ── History timeline ───────────────── */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Historia statusów</h3>
            {loadingHistory ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-400">Brak historii zmian.</p>
            ) : (
              <ol className="relative pl-5" style={{ borderLeft: '2px solid rgba(255,255,255,0.10)' }}>
                {history.map((entry) => {
                  const cfg = STATUS_LABELS[entry.new_status] ?? { label: entry.new_status, bg: 'bg-slate-600', text: 'text-slate-200' };
                  const oldCfg = entry.old_status ? (STATUS_LABELS[entry.old_status] ?? { label: entry.old_status }) : null;
                  return (
                    <li key={entry.id} className="relative mb-5 last:mb-0">
                      {/* Dot */}
                      <div
                        className="absolute -left-[1.45rem] top-1 size-3 rounded-full ring-2 ring-[#111827]"
                        style={{ background: '#3b82f6' }}
                      />
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                          {oldCfg && (
                            <span className="text-xs text-slate-500">
                              ← {oldCfg.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{fmtDate(entry.changed_at)}</p>
                        {entry.note && (
                          <div
                            className="mt-1 rounded-lg px-3 py-2"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            <p className="text-xs text-slate-300 italic">💬 {entry.note}</p>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {/* ── Quick links ────────────────────── */}
          {app.program_id && (
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Szybkie linki</h3>
              <Link href={`/programs/${app.program_id}`} onClick={onClose}>
                <button className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  <ExternalLink className="size-4" />
                  Strona kierunku
                </button>
              </Link>
            </section>
          )}

          {/* ── Actions ────────────────────────── */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 pt-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            {isCancellable ? (
              <button
                onClick={() => { onClose(); onCancel(); }}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
              >
                <XCircle className="size-4" />
                Anuluj wniosek
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              Zamknij
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
