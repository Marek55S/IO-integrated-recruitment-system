'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { buildFormDataSchema, type FormConfig } from '@io/content-api';

import { FieldRenderer } from '@/components/field-renderer';
import { Button } from '@/components/ui/button';

type FormValues = Record<string, unknown>;

type ProgramRecruitmentFormProps = {
  config: FormConfig;
};

function createDefaultValuesFromConfig(formConfig: FormConfig): FormValues {
  return formConfig.screens.reduce<FormValues>((acc, screen) => {
    screen.fields.forEach((field) => {
      if (field.type === 'section_title') {
        return;
      }

      acc[field.id] = field.type === 'checkbox' ? false : '';
    });

    return acc;
  }, {});
}

function ProgramRecruitmentForm({ config }: ProgramRecruitmentFormProps) {
  const schema = useMemo(() => buildFormDataSchema(config), [config]);

  const submitLabel = config.screens.at(-1)?.button_text ?? 'Wyślij zgłoszenie';

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: createDefaultValuesFromConfig(config),
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit((values) => {
    console.log('Program recruitment submission:', values);
  });

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <form onSubmit={onSubmit} className="space-y-8">
        {config.screens.map((screen) => (
          <div key={screen.id} className="space-y-5">
            <header className="space-y-1 border-b border-border pb-4">
              <h2 className="text-2xl font-semibold">{screen.title}</h2>
              {screen.subtitle ? (
                <p className="text-sm text-muted-foreground">
                  {screen.subtitle}
                </p>
              ) : null}
            </header>

            <div className="space-y-5">
              {screen.fields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  register={register}
                  setValue={setValue}
                  value={watch(field.id)}
                  error={errors[field.id] as never}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </section>
  );
}

export { ProgramRecruitmentForm };
