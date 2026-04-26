type FormValues = Record<string, unknown>;

const CORRESPONDENCE_FIELD_IDS = new Set([
  'correspondence_country',
  'correspondence_city',
  'correspondence_postal_code',
  'correspondence_street',
  'correspondence_house_number',
]);

export function shouldRenderField(
  fieldId: string,
  values: FormValues,
): boolean {
  if (CORRESPONDENCE_FIELD_IDS.has(fieldId)) {
    return !values.correspondence_same_as_residence;
  }

  if (fieldId === 'high_school_country_name') {
    return values.high_school_diploma_country === 'Poza Polską';
  }

  return true;
}
