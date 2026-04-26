'use client';

import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Dialog } from '@base-ui/react/dialog';

import type { SubmissionDisplayConfig } from '@io/content-api';

import { SubmissionPreview } from '@/components/submission-preview';
import {
  type AdminApplication,
  APPLICATION_STATUS_LABELS,
  applicationStatusColor,
  type ApplicationStatus,
} from '@/mockedBackend/applications-admin';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const label = APPLICATION_STATUS_LABELS[status];
  const color = applicationStatusColor(status);

  const classes: Record<typeof color, string> = {
    green:
      'inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200',
    yellow:
      'inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950/70 dark:text-amber-200',
    red: 'inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-900 dark:bg-red-950/70 dark:text-red-200',
    blue: 'inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-900 dark:bg-blue-950/70 dark:text-blue-200',
    default:
      'inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground',
  };

  return <span className={classes[color]}>{label}</span>;
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' | false }) {
  if (!direction) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="ml-1 h-3.5 w-3.5 opacity-30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="ml-1 h-3.5 w-3.5 text-amber-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={direction === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CSV export (wszystkie pola kandydata)
// ---------------------------------------------------------------------------

function exportToCsv(rows: AdminApplication[], filename: string) {
  const str = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

  const headers = [
    'Imie',
    'Nazwisko',
    'Nazwisko rodowe',
    'Email',
    'Telefon',
    'PESEL',
    'Data urodzenia',
    'Miejsce urodzenia',
    'Obywatelstwo',
    'Kraj zamieszkania',
    'Miasto zamieszkania',
    'Kod pocztowy zamieszkania',
    'Ulica zamieszkania',
    'Nr domu zamieszkania',
    'Adres koresp. taki sam',
    'Kraj koresp.',
    'Miasto koresp.',
    'Kod pocztowy koresp.',
    'Ulica koresp.',
    'Nr domu koresp.',
    'Tytul zawodowy',
    'Nazwa szkoly wyzszej',
    'Rok ukonczenia',
    'Miejsce swiadectwa',
    'Kraj swiadectwa',
    'Kontakt awaryjny - imie i nazwisko',
    'Kontakt awaryjny - email',
    'Kontakt awaryjny - telefon',
    'Status',
    'Data zlozenia',
  ];

  const lines = rows.map((r) => {
    const f = r.formData;
    return [
      f.first_name,
      f.last_name,
      f.family_name,
      r.candidate.email,
      f.phone,
      f.pesel,
      f.birth_date,
      f.birth_place,
      f.citizenship,
      f.residence_country,
      f.residence_city,
      f.residence_postal_code,
      f.residence_street,
      f.residence_house_number,
      f.correspondence_same_as_residence ? 'Tak' : 'Nie',
      f.correspondence_country,
      f.correspondence_city,
      f.correspondence_postal_code,
      f.correspondence_street,
      f.correspondence_house_number,
      f.academic_title,
      f.university_name,
      f.graduation_year,
      f.high_school_diploma_country,
      f.high_school_country_name,
      f.emergency_name,
      f.emergency_email,
      f.emergency_phone,
      APPLICATION_STATUS_LABELS[r.status],
      formatDate(r.submittedAt),
    ]
      .map(str)
      .join(',');
  });

  const csv = [headers.map((h) => `"${h}"`).join(','), ...lines].join('\r\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Candidate detail modal
// ---------------------------------------------------------------------------

function CandidateModal({
  application,
  config,
  onClose,
}: {
  application: AdminApplication | null;
  config: SubmissionDisplayConfig;
  onClose: () => void;
}) {
  return (
    <Dialog.Root
      open={application !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[95vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xl transition-all duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
            <Dialog.Title className="font-semibold text-foreground">
              {application
                ? `${application.candidate.firstName} ${application.candidate.lastName}`
                : ''}
            </Dialog.Title>
            <Dialog.Close
              onClick={onClose}
              aria-label="Zamknij"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {application ? (
              <SubmissionPreview
                values={application.formData}
                config={config}
                files={[]}
              />
            ) : null}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------------------------------------------------------------------------
// Review modal (for payment_confirmed applications)
// ---------------------------------------------------------------------------

type ReviewAction = 'rejected' | 'documents_verified';

function ReviewModal({
  application,
  onAction,
  onClose,
}: {
  application: AdminApplication | null;
  onAction: (id: string, action: ReviewAction) => void;
  onClose: () => void;
}) {
  const actions: {
    action: ReviewAction;
    label: string;
    description: string;
    color: string;
  }[] = [
    {
      action: 'documents_verified',
      label: 'Zatwierdz',
      description:
        'Dokumenty sa kompletne i poprawne — wniosek zostanie zaakceptowany.',
      color:
        'bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:ring-emerald-500',
    },
    {
      action: 'rejected',
      label: 'Odrzuc',
      description: 'Wniosek zostanie trwale odrzucony.',
      color:
        'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500',
    },
  ];

  return (
    <Dialog.Root
      open={application !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-xl transition-all duration-200 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              Zatwierdz wniosek
            </Dialog.Title>
            <Dialog.Close
              onClick={onClose}
              aria-label="Zamknij"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Dialog.Close>
          </div>

          {application ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {application.candidate.firstName} {application.candidate.lastName}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-3">
            {actions.map(({ action, label, description, color }) => (
              <button
                key={action}
                type="button"
                onClick={() => {
                  if (application) onAction(application.id, action);
                  onClose();
                }}
                className={`flex flex-col items-start rounded-lg px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 ${color}`}>
                <span className="font-medium">{label}</span>
                <span className="mt-0.5 text-xs opacity-80">{description}</span>
              </button>
            ))}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------------------------------------------------------------------------
// Main table component
// ---------------------------------------------------------------------------

const ALL_STATUSES = Object.keys(
  APPLICATION_STATUS_LABELS,
) as ApplicationStatus[];
const columnHelper = createColumnHelper<AdminApplication>();

type ApplicationsTableProps = {
  applications: AdminApplication[];
  previewConfig: SubmissionDisplayConfig;
  programName: string;
};

export function ApplicationsTable({
  applications: initialApplications,
  previewConfig,
  programName,
}: ApplicationsTableProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'submittedAt', desc: true },
  ]);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>(
    'all',
  );
  const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null);
  const [reviewApp, setReviewApp] = useState<AdminApplication | null>(null);

  const handleReviewAction = (id: string, action: ReviewAction) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: action } : a)),
    );
  };

  const filtered = useMemo(
    () =>
      statusFilter === 'all'
        ? applications
        : applications.filter((a) => a.status === statusFilter),
    [applications, statusFilter],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.candidate.lastName, {
        id: 'lastName',
        header: 'Nazwisko',
        enableSorting: false,
      }),
      columnHelper.accessor((row) => row.candidate.firstName, {
        id: 'firstName',
        header: 'Imie',
        enableSorting: false,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        enableSorting: true,
        cell: (info) => <StatusBadge status={info.getValue()} />,
        sortingFn: (a, b) =>
          APPLICATION_STATUS_LABELS[a.original.status].localeCompare(
            APPLICATION_STATUS_LABELS[b.original.status],
            'pl',
          ),
      }),
      columnHelper.accessor('submittedAt', {
        header: 'Data zlozenia',
        enableSorting: true,
        cell: (info) => (
          <span className="tabular-nums text-muted-foreground">
            {formatDate(info.getValue())}
          </span>
        ),
        sortingFn: 'datetime',
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedApp(row.original)}
              className="rounded px-2 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:text-amber-400 dark:hover:bg-amber-950/30">
              Szczegoly
            </button>

            {row.original.status === 'payment_confirmed' ? (
              <button
                type="button"
                onClick={() => setReviewApp(row.original)}
                className="rounded bg-amber-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                Zarządzaj wnioskiem
              </button>
            ) : null}
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const visibleRows = table.getRowModel().rows;

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="status-filter"
              className="shrink-0 text-sm text-muted-foreground">
              Status:
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ApplicationStatus | 'all')
              }
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
              <option value="all">Wszystkie ({applications.length})</option>
              {ALL_STATUSES.map((s) => {
                const count = applications.filter((a) => a.status === s).length;
                if (count === 0) return null;
                return (
                  <option key={s} value={s}>
                    {APPLICATION_STATUS_LABELS[s]} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <span className="text-sm text-muted-foreground">
            {visibleRows.length === applications.length
              ? `${applications.length} wnioskow`
              : `${visibleRows.length} z ${applications.length} wnioskow`}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-border bg-amber-50/60 dark:bg-amber-950/20">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-0.5 transition-colors hover:text-foreground focus-visible:outline-none">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            <SortIcon direction={header.column.getIsSorted()} />
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-10 text-center text-sm text-muted-foreground">
                      Brak wnioskow dla wybranego filtru.
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`border-b border-border last:border-0 transition-colors hover:bg-amber-50/40 dark:hover:bg-amber-950/10 ${
                        index % 2 !== 0 ? 'bg-muted/30' : ''
                      }`}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export button */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() =>
              exportToCsv(
                visibleRows.map((r) => r.original),
                `wnioski-${programName.toLowerCase().replace(/\s+/g, '-')}.csv`,
              )
            }
            disabled={visibleRows.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-50 px-6 py-2.5 text-sm font-medium text-amber-800 shadow-sm transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:pointer-events-none disabled:opacity-40 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Eksportuj dane ({visibleRows.length} wnioskow)
          </button>
        </div>
      </div>

      <CandidateModal
        application={selectedApp}
        config={previewConfig}
        onClose={() => setSelectedApp(null)}
      />

      <ReviewModal
        application={reviewApp}
        onAction={handleReviewAction}
        onClose={() => setReviewApp(null)}
      />
    </>
  );
}
