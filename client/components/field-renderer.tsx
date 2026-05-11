'use client';

import { useRef, useState } from 'react';
import { FieldError, UseFormRegister, UseFormSetValue } from 'react-hook-form';

import type { FormField } from '@io/content-api';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

type FormValues = Record<string, unknown>;

type FieldRendererProps = {
  field: FormField;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  value: unknown;
  error?: FieldError;
};

function FileUploadField({
  field,
  setValue,
  value,
}: {
  field: Extract<FormField, { type: 'file_upload' }>;
  setValue: UseFormSetValue<FormValues>;
  value: unknown;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const files = Array.isArray(value) ? (value as File[]) : [];
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const maxFiles = field.max_files ?? 5;
  const maxSizeMb = field.max_size_mb ?? 5;
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;

    const errors: string[] = [];
    const valid: File[] = [];

    Array.from(incoming).forEach((file) => {
      if (file.type !== 'application/pdf') {
        errors.push(`${file.name}: tylko pliki PDF są akceptowane.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        errors.push(`${file.name}: przekracza limit ${maxSizeMb} MB.`);
        return;
      }
      valid.push(file);
    });

    const remaining = maxFiles - files.length;
    const toAdd = valid.slice(0, remaining);

    if (valid.length > remaining) {
      errors.push(
        `Można dodać jeszcze tylko ${remaining} plik(i). Reszta została pominięta.`,
      );
    }

    setUploadErrors(errors);

    if (toAdd.length > 0) {
      setValue(field.id, [...files, ...toAdd], { shouldDirty: true });
    }

    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setValue(
      field.id,
      files.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  };

  const canAddMore = files.length < maxFiles;

  return (
    <div className="space-y-3">
      <Label>
        {field.label}
        {field.required ? ' *' : ''}
      </Label>

      {field.description_text ? (
        <p className="text-sm text-muted-foreground">
          {field.description_text}
        </p>
      ) : null}

      {canAddMore ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/30 bg-muted/30 px-4 py-8 text-center transition-colors hover:border-primary/60 hover:bg-muted/50"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Dodaj pliki PDF">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-primary/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 12l-4-4m0 0L8 12m4-4v12"
            />
          </svg>
          <span className="text-sm font-medium text-foreground">
            Kliknij lub przeciągnij pliki tutaj
          </span>
          <span className="text-xs text-muted-foreground">
            PDF &middot; maks. {maxSizeMb} MB / plik &middot; maks. {maxFiles}{' '}
            {maxFiles === 1 ? 'plik' : 'pliki/plików'}
          </span>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-primary/30 bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
          Osiągnięto limit {maxFiles} pliki/plików.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => addFiles(e.target.files)}
      />

      {uploadErrors.length > 0 ? (
        <ul className="space-y-1" aria-live="polite">
          {uploadErrors.map((message, idx) => (
            <li key={idx} className="text-xs text-destructive">
              {message}
            </li>
          ))}
        </ul>
      ) : null}

      {files.length > 0 ? (
        <ul className="space-y-2" aria-label="Dodane dokumenty">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 text-sm">
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

              <span className="min-w-0 flex-1 truncate font-medium">
                {file.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>

              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={`Usuń ${file.name}`}
                className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive">
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
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function FieldRenderer({
  field,
  register,
  setValue,
  value,
  error,
}: FieldRendererProps) {
  if (field.type === 'section_title') {
    return <h3 className="pt-2 text-base font-semibold">{field.label}</h3>;
  }

  if (field.type === 'file_upload') {
    return <FileUploadField field={field} setValue={setValue} value={value} />;
  }

  const hasError = Boolean(error);
  const errorMessage = error?.message;

  if (field.type === 'checkbox') {
    const checked = Boolean(value);

    return (
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id={field.id}
            checked={checked}
            onChange={(event) =>
              setValue(field.id, event.currentTarget.checked, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            aria-invalid={hasError}
          />
          <Label htmlFor={field.id} className="leading-5">
            {field.label}
            {field.required ? ' *' : ''}
            {field.link ? (
              <>
                {' '}
                <a
                  href={field.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline underline-offset-4">
                  {field.link_text ?? field.label}
                </a>
              </>
            ) : null}
          </Label>
        </div>

        {field.input_info ? (
          <p id={`${field.id}-info`} className="text-xs text-muted-foreground">
            {field.input_info}
          </p>
        ) : null}

        {hasError ? (
          <p id={`${field.id}-error`} className="text-xs text-destructive">
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  }

  const infoId = field.input_info ? `${field.id}-info` : undefined;
  const errorId = hasError ? `${field.id}-error` : undefined;
  const describedBy = [infoId, errorId].filter(Boolean).join(' ') || undefined;

  if (field.type === 'select') {
    return (
      <div className="space-y-2">
        <Label htmlFor={field.id}>
          {field.label}
          {field.required ? ' *' : ''}
        </Label>

        <Select
          id={field.id}
          defaultValue=""
          aria-invalid={hasError}
          aria-describedby={describedBy}
          {...register(field.id)}>
          <option value="" disabled>
            Wybierz opcję
          </option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>

        {field.input_info ? (
          <p id={infoId} className="text-xs text-muted-foreground">
            {field.input_info}
          </p>
        ) : null}

        {hasError ? (
          <p id={errorId} className="text-xs text-destructive">
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  }

  const inputType = field.type === 'date' ? 'date' : field.type;

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required ? ' *' : ''}
      </Label>

      <Input
        id={field.id}
        type={inputType}
        placeholder={field.placeholder}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        {...register(field.id)}
      />

      {field.input_info ? (
        <p id={infoId} className="text-xs text-muted-foreground">
          {field.input_info}
        </p>
      ) : null}

      {hasError ? (
        <p id={errorId} className="text-xs text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export { FieldRenderer };
