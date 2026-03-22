'use client';

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
          </Label>
        </div>

        {field.link ? (
          <a
            href={field.link}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline underline-offset-4">
            {field.link_text ?? field.label}
          </a>
        ) : null}

        {field.input_info ? (
          <p className="text-xs text-muted-foreground">{field.input_info}</p>
        ) : null}

        {hasError ? (
          <p className="text-xs text-destructive">{errorMessage}</p>
        ) : null}
      </div>
    );
  }

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
          {...register(field.id)}>
          <option value="" disabled>
            Wybierz opcje
          </option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>

        {field.input_info ? (
          <p className="text-xs text-muted-foreground">{field.input_info}</p>
        ) : null}

        {hasError ? (
          <p className="text-xs text-destructive">{errorMessage}</p>
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
        {...register(field.id)}
      />

      {field.input_info ? (
        <p className="text-xs text-muted-foreground">{field.input_info}</p>
      ) : null}

      {hasError ? (
        <p className="text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  );
}

export { FieldRenderer };
