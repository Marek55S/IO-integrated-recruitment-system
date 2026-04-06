'use client';

import type { SubmissionDisplayConfig } from '@io/content-api';

import { shouldRenderField } from '@/lib/conditional-fields';

type FormValues = Record<string, unknown>;

type SubmissionPreviewProps = {
  values: FormValues;
  config: SubmissionDisplayConfig;
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

function SubmissionPreview({ values, config }: SubmissionPreviewProps) {
  return (
    <article className="border-primary/20 mx-auto w-full max-w-4xl rounded-xl border bg-card p-6 text-card-foreground shadow-md md:p-8">
      <header className="border-primary/15 mb-6 border-b pb-4">
        <h2 className="text-primary text-2xl font-semibold tracking-tight">
          {config.title}
        </h2>
        {config.subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{config.subtitle}</p>
        ) : null}
      </header>

      <div className="space-y-6">
        {config.sections.map((section) => (
          <section key={section.id} className="space-y-2">
            <h3 className="text-primary text-xs font-bold uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="overflow-hidden rounded-lg border border-border">
              {section.items
                .filter((item) => shouldRenderField(item.field_id, values))
                .map((item, index) => (
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
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

export { SubmissionPreview };
