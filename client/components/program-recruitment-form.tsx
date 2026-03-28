'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { buildFormDataSchema, type FormConfig } from '@io/content-api';

import { FieldRenderer } from '@/components/field-renderer';
import { Button } from '@/components/ui/button';
import {
  PROGRAM_DEFAULT_SUBMIT,
  runProgramFormAction,
} from '@/lib/content-form-actions';
import { appendStudyApplication } from '@/lib/study-applications-storage';

type FormValues = Record<string, unknown>;

type ProgramRecruitmentFormProps = {
  config: FormConfig;
  programId: string;
  programName: string;
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

function ProgramRecruitmentForm({
  config,
  programId,
  programName,
}: ProgramRecruitmentFormProps) {
  const router = useRouter();
  const schema = useMemo(() => buildFormDataSchema(config), [config]);

  const lastScreen = config.screens.at(-1);
  const submitLabel = lastScreen?.button_text ?? 'Wyślij zgłoszenie';
  const submitActionId = lastScreen?.primary_action ?? PROGRAM_DEFAULT_SUBMIT;

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

  const submitValidated = handleSubmit((values) => {
    console.log('Program recruitment submission:', values);
    appendStudyApplication({
      programId,
      programName,
      submittedAt: new Date().toISOString(),
      status: 'awaiting_payment',
    });
    router.push('/');
  });

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void runProgramFormAction(submitActionId, {
            submitValidated: () => submitValidated(),
          });
        }}
        className="space-y-8">
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
