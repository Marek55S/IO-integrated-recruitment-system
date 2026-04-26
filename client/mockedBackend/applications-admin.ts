/**
 * mockedBackend/applications-admin.ts
 *
 * Symuluje odpowiedz backendu dla tabeli program_applications
 * polaczonej z candidate_profiles, users, addresses, education_records.
 * Dane tylko dla kierunku 'informatyka-st'.
 */

export type ApplicationStatus =
  | 'submitted'
  | 'documents_verified'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'accepted'
  | 'waitlisted'
  | 'rejected'
  | 'cancelled';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  submitted: 'Zlozony',
  documents_verified: 'Dokumenty OK',
  awaiting_payment: 'Oczekuje na platnosc',
  payment_confirmed: 'Platnosc potwierdzona',
  accepted: 'Przyjety',
  waitlisted: 'Lista rezerwowa',
  rejected: 'Odrzucony',
  cancelled: 'Anulowany',
};

export type ApplicationStatusColor =
  | 'green'
  | 'yellow'
  | 'red'
  | 'blue'
  | 'default';

export function applicationStatusColor(
  status: ApplicationStatus,
): ApplicationStatusColor {
  switch (status) {
    case 'accepted':
    case 'payment_confirmed':
    case 'documents_verified':
      return 'green';
    case 'submitted':
    case 'awaiting_payment':
    case 'waitlisted':
      return 'yellow';
    case 'rejected':
    case 'cancelled':
      return 'red';
    default:
      return 'default';
  }
}

/** Pelne dane kandydata — odpowiada polom z recruitment-form.yaml */
export type CandidateFormData = Record<string, unknown>;

export type AdminApplication = {
  id: string;
  programId: string;
  status: ApplicationStatus;
  submittedAt: string;
  candidate: {
    firstName: string;
    lastName: string;
    email: string;
  };
  /** Odpowiada dokladnie kluczom z recruitment-form.yaml */
  formData: CandidateFormData;
};

const APPLICATIONS: AdminApplication[] = [
  {
    id: 'app-001',
    programId: 'informatyka-st',
    status: 'accepted',
    submittedAt: '2026-03-10T09:15:00Z',
    candidate: { firstName: 'Anna', lastName: 'Kowalska', email: 'anna.kowalska@gmail.com' },
    formData: {
      first_name: 'Anna', last_name: 'Kowalska', family_name: '',
      pesel: '96052312345', birth_date: '1996-05-23', birth_place: 'Krakow', citizenship: 'polskie',
      residence_country: 'Polska', residence_city: 'Krakow', residence_postal_code: '30-001',
      residence_street: 'Florianska', residence_house_number: '12/3',
      correspondence_same_as_residence: true,
      email: 'anna.kowalska@gmail.com', phone: '+48 601 234 567',
      academic_title: 'licencjat', university_name: 'Akademia Gorniczo-Hutnicza',
      graduation_year: '2021', high_school_diploma_country: 'Polska',
      emergency_name: 'Jan Kowalski', emergency_email: 'jan.kowalski@gmail.com', emergency_phone: '+48 501 111 222',
    },
  },
  {
    id: 'app-002',
    programId: 'informatyka-st',
    status: 'awaiting_payment',
    submittedAt: '2026-03-12T14:30:00Z',
    candidate: { firstName: 'Marek', lastName: 'Nowak', email: 'marek.nowak@wp.pl' },
    formData: {
      first_name: 'Marek', last_name: 'Nowak', family_name: '',
      pesel: '98112598765', birth_date: '1998-11-25', birth_place: 'Warszawa', citizenship: 'polskie',
      residence_country: 'Polska', residence_city: 'Warszawa', residence_postal_code: '00-001',
      residence_street: 'Marszalkowska', residence_house_number: '55',
      correspondence_same_as_residence: false,
      correspondence_country: 'Polska', correspondence_city: 'Krakow',
      correspondence_postal_code: '30-059', correspondence_street: 'Dluga', correspondence_house_number: '8',
      email: 'marek.nowak@wp.pl', phone: '+48 512 345 678',
      academic_title: 'inzynier', university_name: 'Politechnika Warszawska',
      graduation_year: '2022', high_school_diploma_country: 'Polska',
      emergency_name: '', emergency_email: '', emergency_phone: '',
    },
  },
  {
    id: 'app-003',
    programId: 'informatyka-st',
    status: 'submitted',
    submittedAt: '2026-03-15T11:00:00Z',
    candidate: { firstName: 'Katarzyna', lastName: 'Wisniowska', email: 'k.wisniowska@student.agh.edu.pl' },
    formData: {
      first_name: 'Katarzyna', last_name: 'Wisniowska', family_name: 'Malinowska',
      pesel: '00270812398', birth_date: '2000-02-08', birth_place: 'Poznan', citizenship: 'polskie',
      residence_country: 'Polska', residence_city: 'Poznan', residence_postal_code: '61-001',
      residence_street: 'Swiety Marcin', residence_house_number: '66/7',
      correspondence_same_as_residence: true,
      email: 'k.wisniowska@student.agh.edu.pl', phone: '+48 793 456 789',
      academic_title: 'licencjat', university_name: 'Uniwersytet im. Adama Mickiewicza',
      graduation_year: '2023', high_school_diploma_country: 'Polska',
      emergency_name: 'Tomasz Wisniowski', emergency_email: '', emergency_phone: '+48 601 000 111',
    },
  },
  {
    id: 'app-004',
    programId: 'informatyka-st',
    status: 'payment_confirmed',
    submittedAt: '2026-03-18T08:45:00Z',
    candidate: { firstName: 'Piotr', lastName: 'Zielinski', email: 'pzielinski@outlook.com' },
    formData: {
      first_name: 'Piotr', last_name: 'Zielinski', family_name: '',
      pesel: '97080312345', birth_date: '1997-08-03', birth_place: 'Wroclaw', citizenship: 'polskie',
      residence_country: 'Polska', residence_city: 'Wroclaw', residence_postal_code: '50-001',
      residence_street: 'Swidnicka', residence_house_number: '22A',
      correspondence_same_as_residence: true,
      email: 'pzielinski@outlook.com', phone: '+48 668 567 890',
      academic_title: 'magister', university_name: 'Politechnika Wroclawska',
      graduation_year: '2020', high_school_diploma_country: 'Polska',
      emergency_name: 'Maria Zielinska', emergency_email: 'mzielinska@gmail.com', emergency_phone: '+48 502 222 333',
    },
  },
  {
    id: 'app-005',
    programId: 'informatyka-st',
    status: 'rejected',
    submittedAt: '2026-03-20T16:10:00Z',
    candidate: { firstName: 'Ewa', lastName: 'Dabrowska', email: 'ewa.d@proton.me' },
    formData: {
      first_name: 'Ewa', last_name: 'Dabrowska', family_name: '',
      pesel: '95040156789', birth_date: '1995-04-01', birth_place: 'Gdansk', citizenship: 'polskie',
      residence_country: 'Polska', residence_city: 'Gdansk', residence_postal_code: '80-001',
      residence_street: 'Dluga', residence_house_number: '1',
      correspondence_same_as_residence: true,
      email: 'ewa.d@proton.me', phone: '+48 505 678 901',
      academic_title: 'licencjat', university_name: 'Uniwersytet Gdanski',
      graduation_year: '2019', high_school_diploma_country: 'Polska',
      emergency_name: '', emergency_email: '', emergency_phone: '',
    },
  },
  {
    id: 'app-006',
    programId: 'informatyka-st',
    status: 'submitted',
    submittedAt: '2026-03-22T10:20:00Z',
    candidate: { firstName: 'Jakub', lastName: 'Lewandowski', email: 'jlewan@gmail.com' },
    formData: {
      first_name: 'Jakub', last_name: 'Lewandowski', family_name: '',
      pesel: '01051512356', birth_date: '2001-05-15', birth_place: 'Lodz', citizenship: 'polskie',
      residence_country: 'Polska', residence_city: 'Lodz', residence_postal_code: '90-001',
      residence_street: 'Piotrkowska', residence_house_number: '100',
      correspondence_same_as_residence: true,
      email: 'jlewan@gmail.com', phone: '+48 731 234 567',
      academic_title: 'inzynier', university_name: 'Politechnika Lodzka',
      graduation_year: '2024', high_school_diploma_country: 'Polska',
      emergency_name: '', emergency_email: '', emergency_phone: '',
    },
  },
  {
    id: 'app-007',
    programId: 'informatyka-st',
    status: 'waitlisted',
    submittedAt: '2026-03-25T13:00:00Z',
    candidate: { firstName: 'Marta', lastName: 'Wojtyla', email: 'marta.w@agh.edu.pl' },
    formData: {
      first_name: 'Marta', last_name: 'Wojtyla', family_name: 'Szymanska',
      pesel: '99121934567', birth_date: '1999-12-19', birth_place: 'Krakow', citizenship: 'polskie',
      residence_country: 'Polska', residence_city: 'Krakow', residence_postal_code: '31-001',
      residence_street: 'Kazimierza Wielkiego', residence_house_number: '3/5',
      correspondence_same_as_residence: true,
      email: 'marta.w@agh.edu.pl', phone: '+48 604 789 012',
      academic_title: 'licencjat', university_name: 'Akademia Gorniczo-Hutnicza',
      graduation_year: '2022', high_school_diploma_country: 'Polska',
      emergency_name: 'Stanislaw Wojtyla', emergency_email: '', emergency_phone: '+48 600 100 200',
    },
  },
  {
    id: 'app-008',
    programId: 'informatyka-st',
    status: 'documents_verified',
    submittedAt: '2026-03-28T09:05:00Z',
    candidate: { firstName: 'Tomasz', lastName: 'Kaczmarek', email: 'tomasz.kaczmarek@wp.pl' },
    formData: {
      first_name: 'Tomasz', last_name: 'Kaczmarek', family_name: '',
      pesel: '93071898765', birth_date: '1993-07-18', birth_place: 'Bydgoszcz', citizenship: 'polskie',
      residence_country: 'Polska', residence_city: 'Bydgoszcz', residence_postal_code: '85-001',
      residence_street: 'Gdanska', residence_house_number: '40',
      correspondence_same_as_residence: true,
      email: 'tomasz.kaczmarek@wp.pl', phone: '+48 888 901 234',
      academic_title: 'magister', university_name: 'Uniwersytet Technologiczno-Przyrodniczy',
      graduation_year: '2018', high_school_diploma_country: 'Polska',
      emergency_name: 'Zofia Kaczmarek', emergency_email: 'zofia.k@gmail.com', emergency_phone: '+48 601 300 400',
    },
  },
];

export function getApplicationsByProgramId(programId: string): AdminApplication[] {
  return APPLICATIONS.filter((a) => a.programId === programId);
}
