'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { type FieldError, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  buildFormDataSchema,
  buildSubmissionAgreementSchema,
  type FormConfig,
  type SubmissionConfig,
} from '@io/content-api';

import { FieldRenderer } from '@/components/field-renderer';
import { SubmissionPreview } from '@/components/submission-preview';
import { Button } from '@/components/ui/button';
import {
  RECRUITMENT_DEFAULT_BACK,
  RECRUITMENT_DEFAULT_FORWARD,
  RECRUITMENT_DEFAULT_SUBMIT,
  runRecruitmentFormAction,
} from '@/lib/content-form-actions';
import { shouldRenderField } from '@/lib/conditional-fields';
import { RECRUITMENT_FORM_VALUES_STORAGE_KEY } from '@/lib/recruitment-storage';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type FormValues = Record<string, unknown>;

type FormEngineProps = {
  config: FormConfig;
  submissionConfig: SubmissionConfig;
  onSuccessfulSubmit?: () => void;
};

function createDefaultValues(
  config: FormConfig,
  submissionConfig: SubmissionConfig,
): FormValues {
  const defaults = config.screens.reduce<FormValues>((acc, screen) => {
    screen.fields.forEach((field) => {
      if (field.type === 'section_title') {
        return;
      }

      acc[field.id] = field.type === 'checkbox' ? false : '';
    });

    return acc;
  }, {});

  submissionConfig.agreements.forEach((agreement) => {
    defaults[agreement.id] = false;
  });

  return defaults;
}

function FormEngine({
  config,
  submissionConfig,
  onSuccessfulSubmit,
}: FormEngineProps) {
  const schema = useMemo(
    () =>
      buildFormDataSchema(config).merge(
        buildSubmissionAgreementSchema(submissionConfig),
      ),
    [config, submissionConfig],
  );

  const initialScreenIndex = useMemo(() => {
    const index = config.screens.findIndex((screen) => screen.id === 1);
    return index >= 0 ? index : 0;
  }, [config.screens]);

  const [currentScreenIndex, setCurrentScreenIndex] =
    useState(initialScreenIndex);
  const [isSummaryScreen, setIsSummaryScreen] = useState(false);

  const stepKey = `${currentScreenIndex}-${isSummaryScreen ? '1' : '0'}`;
  const prevStepKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevStepKeyRef.current === null) {
      prevStepKeyRef.current = stepKey;
      return;
    }

    if (prevStepKeyRef.current !== stepKey) {
      prevStepKeyRef.current = stepKey;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [stepKey]);

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
    defaultValues: createDefaultValues(config, submissionConfig),
    mode: 'onBlur',
  });

  const currentScreen = config.screens[currentScreenIndex];
  const isFirstScreen = currentScreenIndex === 0;
  const isLastScreen = currentScreenIndex === config.screens.length - 1;

  const onSubmit = handleSubmit((values) => {
    console.log('Form submission payload:', values);
    try {
      localStorage.setItem(
        RECRUITMENT_FORM_VALUES_STORAGE_KEY,
        JSON.stringify(values),
      );
    } catch {
      /* quota / private mode */
    }

    onSuccessfulSubmit?.();
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
      setIsSummaryScreen(true);
      return;
    }

    setCurrentScreenIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (isSummaryScreen) {
      setIsSummaryScreen(false);
      return;
    }

    if (!isFirstScreen) {
      setCurrentScreenIndex((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    const agreementIds = submissionConfig.agreements.map(
      (agreement) => agreement.id,
    );

    const isAgreementsValid = await trigger(agreementIds, {
      shouldFocus: true,
    });
    if (!isAgreementsValid) {
      return;
    }

    await onSubmit();
  };

  const totalSteps = config.screens.length + 1;
  const currentStep = isSummaryScreen ? totalSteps : currentScreenIndex + 1;
  const progressPercent = (currentStep / totalSteps) * 100;

  const currentFieldIds = currentScreen.fields
    .filter((field) => field.type !== 'section_title')
    .map((field) => field.id);
  const watchedValues = watch(currentFieldIds) as unknown as Record<
    string,
    unknown
  >;
  const watchedByFieldId = currentFieldIds.reduce<Record<string, unknown>>(
    (acc, id, index) => {
      acc[id] = (watchedValues as unknown as unknown[])[index];
      return acc;
    },
    {},
  );

  const primaryActionId = isSummaryScreen
    ? (submissionConfig.submit_action ?? RECRUITMENT_DEFAULT_SUBMIT)
    : (currentScreen.primary_action ?? RECRUITMENT_DEFAULT_FORWARD);

  const backActionId = isSummaryScreen
    ? (submissionConfig.back_action ?? RECRUITMENT_DEFAULT_BACK)
    : (currentScreen.back_action ?? RECRUITMENT_DEFAULT_BACK);

  return (
    <section className="border-primary/15 mx-auto w-full max-w-3xl space-y-6 rounded-xl border bg-card p-6 shadow-md md:p-8">
      <header className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Krok {currentStep} z {totalSteps}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>

        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Postęp formularza: krok ${currentStep} z ${totalSteps}`}>
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div>
          <h2 className="text-primary text-2xl font-semibold tracking-tight">
            {isSummaryScreen ? submissionConfig.title : currentScreen.title}
          </h2>
          {(
            isSummaryScreen ? submissionConfig.subtitle : currentScreen.subtitle
          ) ? (
            <p className="text-sm text-muted-foreground">
              {isSummaryScreen
                ? submissionConfig.subtitle
                : currentScreen.subtitle}
            </p>
          ) : null}
        </div>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void runRecruitmentFormAction(primaryActionId, {
            goNext: handleNext,
            goBack: handlePrevious,
            submitFinal: handleFinalSubmit,
          });
        }}
        className="space-y-5">
        {isSummaryScreen ? (
          <>
            <SubmissionPreview values={getValues()} config={submissionConfig} />

            <section className="border-primary/10 space-y-3 rounded-xl border bg-muted/40 p-4">
              <h3 className="text-primary text-xs font-bold uppercase tracking-wider">
                Zgody
              </h3>

              {submissionConfig.agreements.map((agreement) => {
                const hasError = Boolean(errors[agreement.id]);
                const checked = Boolean(watch(agreement.id));
                const agreementError = errors[agreement.id] as
                  | FieldError
                  | undefined;

                return (
                  <div key={agreement.id} className="space-y-1.5">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={agreement.id}
                        checked={checked}
                        onChange={(event) =>
                          setValue(agreement.id, event.currentTarget.checked, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        aria-invalid={hasError}
                      />
                      <Label htmlFor={agreement.id} className="leading-5">
                        {agreement.label}
                        {agreement.required ? ' *' : ''}
                        {agreement.link ? (
                          <>
                            {' '}
                            <a
                              href={agreement.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-primary underline underline-offset-4">
                              {agreement.link_text ?? agreement.label}
                            </a>
                          </>
                        ) : null}
                      </Label>
                    </div>

                    {hasError ? (
                      <p className="text-xs text-destructive">
                        {agreementError?.message}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </section>
          </>
        ) : (
          currentScreen.fields.map((field) => {
            if (!shouldRenderField(field.id, watchedByFieldId)) {
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
          })
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void runRecruitmentFormAction(backActionId, {
                goNext: handleNext,
                goBack: handlePrevious,
                submitFinal: handleFinalSubmit,
              })
            }
            disabled={isFirstScreen && !isSummaryScreen}>
            Wstecz
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSummaryScreen
              ? 'Potwierdz i wyślij'
              : isLastScreen
                ? currentScreen.button_text
                : 'Dalej'}
          </Button>
        </div>
      </form>

      <details className="border-primary/10 rounded-lg border bg-muted/40 p-3">
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
