'use client';

import { useState } from 'react';

import type { SubmissionDisplayConfig } from '@io/content-api';

import { PdfPreviewModal } from '@/components/ui/pdf-preview-modal';
import { shouldRenderField } from '@/lib/conditional-fields';

type FormValues = Record<string, unknown>;

type SubmissionPreviewProps = {
  values: FormValues;
  config: SubmissionDisplayConfig;
  files?: File[];
};

function formatValue(value: unknown) {
  if (typeof value === 'boolean') {
    return value ? 'Tak' : 'Nie';
  }

  if (value === null || value === undefined || value === '') {
    return '---';
  }

  return String(value);
}

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded">
        <h3 className="text-primary text-xs font-bold uppercase tracking-wider flex-1">
          {title}
        </h3>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 shrink-0 text-primary/60 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open ? (
        <div className="overflow-hidden rounded-lg border border-border">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function DocumentsSection({ files }: { files: File[] }) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [open, setOpen] = useState(true);

  return (
    <>
      <section className="space-y-2">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded">
          <h3 className="text-primary text-xs font-bold uppercase tracking-wider flex-1">
            Dokumenty
          </h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 shrink-0 text-primary/60 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open ? (
          <div className="overflow-hidden rounded-lg border border-border">
            {files.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                Brak przesłanych dokumentów.
              </p>
            ) : null}
            <ul aria-label="Przesłane dokumenty">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className={`${index % 2 === 0 ? 'bg-muted/50' : 'bg-card'}`}>
                  <button
                    type="button"
                    onClick={() => setPreviewFile(file)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {file.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <PdfPreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </>
  );
}

function SubmissionPreview({ values, config, files }: SubmissionPreviewProps) {
  return (
    <article className="border-primary/20 mx-auto w-full max-w-4xl rounded-xl border bg-card p-6 text-card-foreground shadow-md md:p-8">
      <header className="border-primary/15 mb-6 border-b pb-4">
        <h2 className="text-primary text-2xl font-semibold tracking-tight">
          {config.title}
        </h2>
        {config.subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {config.subtitle}
          </p>
        ) : null}
      </header>

      <div className="space-y-6">
        {config.sections.map((section) => {
          const visibleItems = section.items.filter((item) =>
            shouldRenderField(item.field_id, values),
          );

          return (
            <CollapsibleSection key={section.id} title={section.title}>
              {visibleItems.map((item, index) => (
                <div
                  key={item.field_id}
                  className={`grid grid-cols-2 gap-2 px-3 py-2.5 text-sm ${
                    index % 2 === 0 ? 'bg-muted/50' : 'bg-card'
                  }`}>
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="text-right text-muted-foreground">
                    {formatValue(values[item.field_id])}
                  </span>
                </div>
              ))}
            </CollapsibleSection>
          );
        })}

        {files !== undefined ? <DocumentsSection files={files} /> : null}
      </div>
    </article>
  );
}

export { SubmissionPreview };
