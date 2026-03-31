/**
 * Logika warunkowego wyświetlania pól formularza.
 *
 * Używana zarówno w FormEngine (renderowanie pól) jak i w SubmissionPreview
 * (wyświetlanie wprowadzonych danych). Jedno źródło prawdy — zmiany
 * w regułach widoczności wystarczy wprowadzić tutaj.
 */

type FormValues = Record<string, unknown>;

const CORRESPONDENCE_FIELD_IDS = new Set([
  'correspondence_country',
  'correspondence_city',
  'correspondence_postal_code',
  'correspondence_street',
  'correspondence_house_number',
]);

/**
 * Zwraca `true`, jeśli pole o podanym `fieldId` powinno być widoczne
 * przy aktualnych wartościach formularza.
 */
export function shouldRenderField(
  fieldId: string,
  values: FormValues,
): boolean {
  if (!CORRESPONDENCE_FIELD_IDS.has(fieldId)) {
    return true;
  }

  return !Boolean(values.correspondence_same_as_residence);
}
