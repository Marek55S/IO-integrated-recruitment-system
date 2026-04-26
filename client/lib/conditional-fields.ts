/**
 * Logika warunkowego wyswietlania pol formularza.
 *
 * Uzywana zarowno w FormEngine (renderowanie pol) jak i w SubmissionPreview
 * (wyswietlanie wprowadzonych danych). Jedno zrodlo prawdy — zmiany
 * w regulach widocznosci wystarczy wprowadzic tutaj.
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
 * Zwraca `true`, jesli pole o podanym `fieldId` powinno byc widoczne
 * przy aktualnych wartosciach formularza.
 */
export function shouldRenderField(
  fieldId: string,
  values: FormValues,
): boolean {
  // Adres do korespondencji — ukryj gdy zaznaczono "taki sam jak zamieszkania"
  if (CORRESPONDENCE_FIELD_IDS.has(fieldId)) {
    return !Boolean(values.correspondence_same_as_residence);
  }

  // Kraj uzyskania swiadectwa — widoczny tylko gdy wybrano "Poza Polska"
  if (fieldId === 'high_school_country_name') {
    return values.high_school_diploma_country === 'Poza Polską';
  }

  return true;
}
