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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { shouldRenderField } from '@/lib/conditional-fields';
import {
  RECRUITMENT_DEFAULT_BACK,
  RECRUITMENT_DEFAULT_FORWARD,
  RECRUITMENT_DEFAULT_SUBMIT,
  runRecruitmentFormAction,
} from '@/lib/content-form-actions';
import { saveSubmissionFiles } from '@/lib/file-session-store';
import { clearFormDraft, loadFormDraft, saveFormDraft } from '@/lib/recruitment-storage';

type FormValues = Record<string, unknown>;

type FormEngineProps = {
  config: FormConfig;
  submissionConfig: SubmissionConfig;
  programId?: string | null;
  onSuccessfulSubmit?: () => void;
};

function collectFiles(config: FormConfig, values: FormValues): File[] {
  const files: File[] = [];
  config.screens.forEach((screen) => {
    screen.fields.forEach((field) => {
      if (field.type !== 'file_upload') {
        return;
      }

      const fieldValue = values[field.id];
      if (!Array.isArray(fieldValue)) {
        return;
      }

      fieldValue.forEach((entry) => {
        if (entry instanceof File) {
          files.push(entry);
        }
      });
    });
  });
  return files;
}

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

  // Przywracamy zapisany szkic formularza (jeśli istnieje)
  const draft = loadFormDraft();
  if (draft) {
    Object.entries(draft.values).forEach(([key, value]) => {
      if (key in defaults) {
        defaults[key] = value;
      }
    });
  }

  return defaults;
}

function FormEngine({
  config,
  submissionConfig,
  programId,
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
    // Przywracamy zapisany krok (jeśli istnieje)
    const draft = loadFormDraft();
    if (draft && draft.stepIndex >= 0 && draft.stepIndex < config.screens.length) {
      return draft.stepIndex;
    }
    const index = config.screens.findIndex((screen) => screen.id === 1);
    return index >= 0 ? index : 0;
  }, [config.screens]);

  const [currentScreenIndex, setCurrentScreenIndex] =
    useState(initialScreenIndex);
  const [isSummaryScreen, setIsSummaryScreen] = useState(false);
  const [backendDataKeys, setBackendDataKeys] = useState<Set<string>>(new Set());

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
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: createDefaultValues(config, submissionConfig),
    mode: 'onBlur',
  });

  // Wczytaj dane profilu z backendu i uzupełnij formularz
  useEffect(() => {
    const fetchAndFill = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) return;
        const profile = await res.json();

        const mapped: FormValues = {};
        if (profile.first_name) mapped.first_name = profile.first_name;
        if (profile.last_name) mapped.last_name = profile.last_name;
        if (profile.family_name) mapped.family_name = profile.family_name;
        if (profile.pesel) mapped.pesel = profile.pesel;
        if (profile.birth_date) mapped.birth_date = profile.birth_date;
        if (profile.birth_place) mapped.birth_place = profile.birth_place;
        if (profile.citizenship) mapped.citizenship = profile.citizenship;
        if (profile.phone) mapped.phone = profile.phone;
        if (profile.email) mapped.email = profile.email;

        const residence = profile.addresses?.find((a: any) => a.type === 'residence');
        if (residence) {
          if (residence.country) mapped.residence_country = residence.country;
          if (residence.city) mapped.residence_city = residence.city;
          if (residence.postal_code) mapped.residence_postal_code = residence.postal_code;
          if (residence.street) mapped.residence_street = residence.street;
          if (residence.house_number) mapped.residence_house_number = residence.house_number;
        }

        const corr = profile.addresses?.find((a: any) => a.type === 'correspondence');
        if (corr) {
          if (corr.country) mapped.correspondence_country = corr.country;
          if (corr.city) mapped.correspondence_city = corr.city;
          if (corr.postal_code) mapped.correspondence_postal_code = corr.postal_code;
          if (corr.street) mapped.correspondence_street = corr.street;
          if (corr.house_number) mapped.correspondence_house_number = corr.house_number;
        }

        if (profile.education) {
          if (profile.education.academic_title) mapped.academic_title = profile.education.academic_title;
          if (profile.education.university_name) mapped.university_name = profile.education.university_name;
          if (profile.education.graduation_year) mapped.graduation_year = String(profile.education.graduation_year);
          if (profile.education.diploma_country) mapped.high_school_diploma_country = profile.education.diploma_country;
          if (profile.education.diploma_country_name) mapped.high_school_country_name = profile.education.diploma_country_name;
        }

        if (profile.emergency_contact) {
          if (profile.emergency_contact.full_name) mapped.emergency_name = profile.emergency_contact.full_name;
          if (profile.emergency_contact.email) mapped.emergency_email = profile.emergency_contact.email;
          if (profile.emergency_contact.phone) mapped.emergency_phone = profile.emergency_contact.phone;
        }

        if (Object.keys(mapped).length > 0) {
          // Merge: zachowaj istniejące wartości (np. z draftu), nadpisz backendem
          const current = getValues();
          const merged = { ...current };
          Object.entries(mapped).forEach(([key, val]) => {
            if (val != null && val !== '') {
              merged[key] = val;
            }
          });
          setBackendDataKeys(new Set(Object.keys(mapped)));
          reset(merged);
        }
      } catch {
        // Brak profilu w bazie — kontynuujemy z wartościami domyślnymi/draftem
      }
    };
    fetchAndFill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentScreen = config.screens[currentScreenIndex];
  const isFirstScreen = currentScreenIndex === 0;
  const isLastScreen = currentScreenIndex === config.screens.length - 1;

  // Auto-save: zapisuj postęp formularza przy każdej zmianie kroku
  useEffect(() => {
    if (!isSummaryScreen) {
      saveFormDraft(getValues(), currentScreenIndex);
    }
  }, [currentScreenIndex, isSummaryScreen, getValues]);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const persistAndFinish = async (values: FormValues) => {
    // Zachowujemy stare zapisywanie plików do FileList na poczet demo lub jakby upload się wywalił
    const filesToUpload = collectFiles(config, values);
    saveSubmissionFiles(filesToUpload);

    try {
      const serialisable = Object.fromEntries(
        Object.entries(values).filter(
          ([, v]) => !Array.isArray(v) && !(v instanceof File),
        ),
      );

      // Zawsze zapisujemy dane osobowe do profilu kandydata w bazie
      const profilePayload: Record<string, unknown> = {
        first_name: serialisable.first_name || undefined,
        last_name: serialisable.last_name || undefined,
        family_name: serialisable.family_name || undefined,
        pesel: serialisable.pesel || undefined,
        birth_date: serialisable.birth_date || undefined,
        birth_place: serialisable.birth_place || undefined,
        citizenship: serialisable.citizenship || undefined,
        phone: serialisable.phone || undefined,
        residence_address: {
          type: 'residence',
          country: serialisable.residence_country || undefined,
          city: serialisable.residence_city || undefined,
          postal_code: serialisable.residence_postal_code || undefined,
          street: serialisable.residence_street || undefined,
          house_number: serialisable.residence_house_number || undefined,
        },
        education: {
          academic_title: serialisable.academic_title || undefined,
          university_name: serialisable.university_name || undefined,
          graduation_year: serialisable.graduation_year ? Number(serialisable.graduation_year) : undefined,
          diploma_country: serialisable.high_school_diploma_country || undefined,
          diploma_country_name: serialisable.high_school_country_name || undefined,
        },
        emergency_contact: {
          full_name: serialisable.emergency_name || undefined,
          email: serialisable.emergency_email || undefined,
          phone: serialisable.emergency_phone || undefined,
        },
      };

      // Adres korespondencji (jeśli inny niż zamieszkania)
      if (!serialisable.correspondence_same_as_residence) {
        profilePayload.correspondence_address = {
          type: 'correspondence',
          country: serialisable.correspondence_country || undefined,
          city: serialisable.correspondence_city || undefined,
          postal_code: serialisable.correspondence_postal_code || undefined,
          street: serialisable.correspondence_street || undefined,
          house_number: serialisable.correspondence_house_number || undefined,
        };
      }

      const profileRes = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      });

      if (!profileRes.ok) {
        console.error('Błąd zapisu profilu:', await profileRes.text());
        // Nie przerywamy — dane mogą trafić później
      }

      if (programId) {
        // Mamy wybrany kierunek — wysyłamy pełny wniosek do bazy
        const programRes = await fetch(`/api/programs/${programId}`);
        if (!programRes.ok)
          throw new Error('Nie udało się pobrać edycji kierunku.');
        const programData = await programRes.json();

        const editionId = programData?.editions?.[0]?.id;
        if (!editionId) {
          throw new Error('Wybrany kierunek nie posiada aktywnej edycji.');
        }

        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            edition_id: editionId,
            form_data: serialisable,
          }),
        });
        
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            responseData.error || 'Wystąpił błąd podczas wysyłania wniosku.',
          );
        }
        
        const applicationId = responseData.id || responseData.application_id;
        
        if (applicationId) {
          for (const file of filesToUpload) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('applicationId', applicationId);
            formData.append('docType', 'other');
  
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
  
            if (!uploadRes.ok) {
              console.error('Błąd wgrywania pliku:', await uploadRes.text());
            }
          }
        }
      }

      // Czyścimy szkic po zapisie
      clearFormDraft();

      setSubmitError(null);
      onSuccessfulSubmit?.();
    } catch (error: any) {
      console.error(error);
      setSubmitError(error.message || 'Wystąpił nieoczekiwany błąd.');
    }
  };

  const handleNext = async () => {
    const allValues = getValues();
    const currentFieldIds = currentScreen.fields
      .filter(
        (field) =>
          field.type !== 'section_title' &&
          shouldRenderField(field.id, allValues),
      )
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

    const nextIndex = currentScreenIndex + 1;
    saveFormDraft(getValues(), nextIndex);
    setCurrentScreenIndex(nextIndex);
  };

  const handlePrevious = () => {
    if (isSummaryScreen) {
      setIsSummaryScreen(false);
      return;
    }

    if (!isFirstScreen) {
      const prevIndex = currentScreenIndex - 1;
      saveFormDraft(getValues(), prevIndex);
      setCurrentScreenIndex(prevIndex);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitError(null);
    const agreementIds = submissionConfig.agreements.map(
      (agreement) => agreement.id,
    );

    const isAgreementsValid = await trigger(agreementIds, {
      shouldFocus: true,
    });
    if (!isAgreementsValid) {
      return;
    }

    await persistAndFinish(getValues());
  };

  const totalSteps = config.screens.length + 1;
  const currentStep = isSummaryScreen ? totalSteps : currentScreenIndex + 1;
  const progressPercent = (currentStep / totalSteps) * 100;

  const currentFieldIds = currentScreen.fields
    .filter((field) => field.type !== 'section_title')
    .map((field) => field.id);
  const watchedValues = watch(currentFieldIds) as unknown as unknown[];
  const watchedByFieldId = currentFieldIds.reduce<Record<string, unknown>>(
    (acc, id, index) => {
      acc[id] = watchedValues[index];
      return acc;
    },
    {},
  );

  const previewFiles = useMemo(() => {
    if (!isSummaryScreen) {
      return [];
    }
    return collectFiles(config, getValues());
  }, [isSummaryScreen, config, getValues]);

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
            <SubmissionPreview
              values={getValues()}
              config={submissionConfig}
              files={previewFiles}
            />

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
                readOnly={backendDataKeys.has(field.id)}
              />
            );
          })
        )}

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
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
              ? 'Potwierdź i wyślij'
              : isLastScreen
                ? currentScreen.button_text
                : 'Dalej'}
          </Button>
        </div>
      </form>
    </section>
  );
}

export { FormEngine };
