'use client';

import type { SubmissionConfig } from '@io/content-api';

type FormValues = Record<string, unknown>;

type SubmissionPreviewProps = {
  values: FormValues;
  config: SubmissionConfig;
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

function shouldHideItem(fieldId: string, values: FormValues): boolean {
  const correspondenceDetails = new Set([
    'correspondence_country',
    'correspondence_city',
    'correspondence_postal_code',
    'correspondence_street',
    'correspondence_house_number',
  ]);

  if (!correspondenceDetails.has(fieldId)) {
    return false;
  }

  return Boolean(values.correspondence_same_as_residence);
}

function SubmissionPreview({ values, config }: SubmissionPreviewProps) {
  return (
    <article className="mx-auto w-full max-w-4xl rounded-xl border bg-white p-6 text-black shadow-sm md:p-8">
      <header className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          {config.title}
        </h2>
        {config.subtitle ? (
          <p className="mt-1 text-sm text-neutral-600">{config.subtitle}</p>
        ) : null}
      </header>

      <div className="space-y-6">
        {config.sections.map((section) => (
          <section key={section.id} className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-700">
              {section.title}
            </h3>
            <div className="overflow-hidden rounded-lg border">
              {section.items
                .filter((item) => !shouldHideItem(item.field_id, values))
                .map((item, index) => (
                  <div
                    key={item.field_id}
                    className={`grid grid-cols-2 gap-2 px-3 py-2 text-sm ${
                      index % 2 === 0 ? 'bg-neutral-50' : 'bg-white'
                    }`}>
                    <span className="font-medium text-neutral-700">
                      {item.label}
                    </span>
                    <span className="text-right text-neutral-900">
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
