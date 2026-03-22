'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { buildFormDataSchema, type FormConfig } from '@io/content-api';

import { FieldRenderer } from '@/components/field-renderer';
import { Button } from '@/components/ui/button';

type FormValues = Record<string, unknown>;

type FormEngineProps = {
  config: FormConfig;
};

function shouldRenderField(fieldId: string, values: FormValues): boolean {
  const correspondenceFields = new Set([
    'correspondence_country',
    'correspondence_city',
    'correspondence_postal_code',
    'correspondence_street',
    'correspondence_house_number',
  ]);

  if (!correspondenceFields.has(fieldId)) {
    return true;
  }

  return !Boolean(values.correspondence_same_as_residence);
}

function createDefaultValues(config: FormConfig): FormValues {
  return config.screens.reduce<FormValues>((acc, screen) => {
    screen.fields.forEach((field) => {
      if (field.type === 'section_title') {
        return;
      }

      acc[field.id] = field.type === 'checkbox' ? false : '';
    });

    return acc;
  }, {});
}

function FormEngine({ config }: FormEngineProps) {
  const schema = useMemo(() => buildFormDataSchema(config), [config]);

  const initialScreenIndex = useMemo(() => {
    const index = config.screens.findIndex((screen) => screen.id === 1);
    return index >= 0 ? index : 0;
  }, [config.screens]);

  const [currentScreenIndex, setCurrentScreenIndex] =
    useState(initialScreenIndex);

  const {
    register,
    trigger,
    setValue,
    getValues,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: createDefaultValues(config),
    mode: 'onBlur',
  });

  const currentScreen = config.screens[currentScreenIndex];
  const isFirstScreen = currentScreenIndex === 0;
  const isLastScreen = currentScreenIndex === config.screens.length - 1;

  const onSubmit = handleSubmit((values) => {
    console.log('Form submission payload:', values);
  });

  const handleNext = async () => {
    const currentFieldIds = currentScreen.fields
      .filter((field) => field.type !== 'section_title')
      .map((field) => field.id);

    const isCurrentScreenValid = await trigger(currentFieldIds, {
      shouldFocus: true,
    });

    if (!isCurrentScreenValid) {
      return;
    }

    if (isLastScreen) {
      await onSubmit();
      return;
    }

    setCurrentScreenIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (!isFirstScreen) {
      setCurrentScreenIndex((prev) => prev - 1);
    }
  };

  const progressPercent =
    ((currentScreenIndex + 1) / config.screens.length) * 100;

  const watchedValues = watch();

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <header className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Step {currentScreenIndex + 1} of {config.screens.length}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div>
          <h2 className="text-2xl font-semibold">{currentScreen.title}</h2>
          {currentScreen.subtitle ? (
            <p className="text-sm text-muted-foreground">
              {currentScreen.subtitle}
            </p>
          ) : null}
        </div>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleNext();
        }}
        className="space-y-5">
        {currentScreen.fields.map((field) => {
          if (!shouldRenderField(field.id, watchedValues)) {
            return null;
          }

          return (
            <FieldRenderer
              key={field.id}
              field={field}
              register={register}
              setValue={setValue}
              value={watch(field.id)}
              error={errors[field.id] as never}
            />
          );
        })}

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstScreen}>
            Wstecz
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isLastScreen ? currentScreen.button_text : 'Dalej'}
          </Button>
        </div>
      </form>

      <details className="rounded-lg border bg-muted/30 p-3">
        <summary className="cursor-pointer text-sm text-muted-foreground">
          Podglad aktualnych danych formularza
        </summary>
        <pre className="mt-2 overflow-x-auto text-xs">
          {JSON.stringify(getValues(), null, 2)}
        </pre>
      </details>
    </section>
  );
}

export { FormEngine };
