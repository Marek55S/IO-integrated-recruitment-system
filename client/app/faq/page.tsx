import Link from 'next/link';
import { MessageCircle, ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    category: 'Rekrutacja i rejestracja',
    questions: [
      {
        q: 'Jak mogę się zarejestrować w systemie?',
        a: 'Kliknij przycisk "Zarejestruj się" na stronie logowania. Wypełnij formularz rejestracyjny podając swój adres e-mail i hasło. Po rejestracji możesz od razu uzupełnić swój profil kandydata.',
      },
      {
        q: 'Jakie dane są wymagane do złożenia wniosku?',
        a: 'Do złożenia wniosku niezbędne są: dane osobowe (imię, nazwisko, PESEL, data urodzenia), adres zamieszkania, dane kontaktowe, informacje o wykształceniu (tytuł, uczelnia, rok ukończenia) oraz kontakt do osoby bliskiej.',
      },
      {
        q: 'Czy mogę złożyć wniosek na więcej niż jeden kierunek?',
        a: 'Tak, możesz aplikować na kilka kierunków jednocześnie. Każdy wniosek jest rozpatrywany niezależnie. Twoje dane osobowe są automatycznie kopiowane z profilu do nowych wniosków.',
      },
      {
        q: 'Do kiedy trwa rekrutacja?',
        a: 'Termin rekrutacji jest widoczny na stronie każdego kierunku. Różni się on w zależności od edycji i kierunku. Zalecamy złożenie wniosku z odpowiednim wyprzedzeniem.',
      },
    ],
  },
  {
    category: 'Dokumenty',
    questions: [
      {
        q: 'Jakie dokumenty muszę dostarczyć?',
        a: 'Wymagane dokumenty to: kopia dyplomu ukończenia studiów wyższych (co najmniej licencjat), kopia dowodu osobistego lub paszportu oraz ewentualnie inne dokumenty wskazane przez administratora w trakcie procesu rekrutacji.',
      },
      {
        q: 'W jakim formacie mogę przesyłać dokumenty?',
        a: 'Wszystkie dokumenty należy przesyłać w formacie PDF. Maksymalny rozmiar pojedynczego pliku wynosi 5 MB. Możesz przesłać do 5 plików łącznie.',
      },
      {
        q: 'Co się stanie jeśli moje dokumenty będą niekompletne?',
        a: 'Administrator systemu poinformuje Cię o brakach poprzez powiadomienie systemowe (dzwonek w prawym górnym rogu). Twój wniosek otrzyma status "Dokumenty wymagają uzupełnienia" do momentu dostarczenia wszystkich wymaganych materiałów.',
      },
    ],
  },
  {
    category: 'Opłaty i płatności',
    questions: [
      {
        q: 'Ile wynosi opłata wpisowa?',
        a: 'Opłata wpisowa wynosi 100 zł i jest pobierana jednorazowo po przyjęciu na studia. Szczegółowe informacje o opłatach za konkretny kierunek znajdziesz na stronie programu.',
      },
      {
        q: 'Jak mogę dokonać płatności za studia?',
        a: 'Po akceptacji wniosku administrator przekaże Ci numer konta bankowego do dokonania przelewu. W tytule przelewu należy podać swoje imię, nazwisko i numer albumu (jeśli nadany). Potwierdzenie płatności prześlij przez system.',
      },
      {
        q: 'Czy jest możliwość płatności w ratach?',
        a: 'Tak, na większości kierunków istnieje możliwość podziału opłaty na raty semestralnie. Szczegółowy harmonogram płatności zostanie przedstawiony po przyjęciu na studia. Skontaktuj się z dziekanatem w celu ustalenia indywidualnego harmonogramu.',
      },
    ],
  },
  {
    category: 'Status wniosku',
    questions: [
      {
        q: 'Co oznaczają poszczególne statusy wniosku?',
        a: `Statusy wniosku:
• Roboczy (draft) — wniosek nie jest jeszcze wysłany
• Złożony (submitted) — wniosek dotarł do administratora i oczekuje na weryfikację
• Weryfikacja dokumentów — sprawdzamy dostarczonych przez Ciebie materiały
• Oczekuje na opłatę wpisową — wniosek zaakceptowany, prosimy o dokonanie opłaty
• Przyjęty — gratulacje, jesteś studentem!
• Lista rezerwowa — wniosek rozpatrzony pozytywnie, ale brak miejsca w tej chwili`,
      },
      {
        q: 'Jak długo czeka się na odpowiedź?',
        a: 'Czas rozpatrzenia wniosku wynosi zazwyczaj 5–14 dni roboczych od momentu dostarczenia kompletu dokumentów. W sezonach rekrutacyjnych czas ten może się wydłużyć. O każdej zmianie statusu zostaniesz poinformowany powiadomieniem systemowym.',
      },
      {
        q: 'Co mogę zrobić jeśli mój wniosek został odrzucony?',
        a: 'W przypadku odrzucenia wniosku możesz skontaktować się z dziekanatem w celu uzyskania szczegółowych informacji o przyczynach decyzji. Istnieje możliwość złożenia odwołania w terminie 7 dni od daty decyzji.',
      },
    ],
  },
  {
    category: 'Platforma i dostęp',
    questions: [
      {
        q: 'Czym jest platforma uPel?',
        a: 'uPel (upel.agh.edu.pl) to platforma e-learningowa Akademii Górniczo-Hutniczej. Po przyjęciu na studia podyplomowe otrzymasz tam dostęp do materiałów dydaktycznych, możliwość komunikacji z prowadzącymi i harmonogram zajęć.',
      },
      {
        q: 'Jak uzyskać dostęp do uPel?',
        a: 'Po formalnym przyjęciu na studia Dział Informatyki AGH utworzy Twoje konto na platformie uPel. Dane logowania zostaną przesłane na adres e-mail podany w systemie rekrutacyjnym. Cały proces trwa zazwyczaj do 7 dni roboczych.',
      },
      {
        q: 'Co zrobić jeśli zapomniałem hasła?',
        a: 'Na stronie logowania kliknij "Zapomniałem hasła" i podaj swój adres e-mail. Wyślemy Ci link do resetowania hasła ważny przez 24 godziny. Jeśli nie otrzymasz wiadomości, sprawdź folder SPAM.',
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-transparent px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Hero */}
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <MessageCircle className="size-8 text-cyan-400" />
            Najczęstsze pytania (FAQ)
          </h1>
          <p className="text-white/60 text-base max-w-2xl">
            Znajdź odpowiedź na swoje pytanie. Jeśli nie znajdziesz tu potrzebnej informacji,
            skontaktuj się z dziekanatem lub odwiedź stronę{' '}
            <Link href="/materials" className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
              Materiały i zasoby
            </Link>
            .
          </p>
        </header>

        {/* Categories */}
        {FAQ_ITEMS.map((cat) => (
          <section key={cat.category} className="space-y-3">
            <h2 className="text-lg font-semibold text-white/80 border-b border-white/10 pb-2">
              {cat.category}
            </h2>
            <div className="space-y-2">
              {cat.questions.map((item, idx) => (
                <details
                  key={idx}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-white list-none hover:bg-white/5 transition-colors">
                    <span>{item.q}</span>
                    <ChevronDown className="size-4 shrink-0 text-white/40 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-white/5 bg-white/[0.02] px-5 py-4">
                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                      {item.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        {/* Contact CTA */}
        <section className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 p-6 text-center space-y-3">
          <h2 className="text-base font-semibold text-white">Nie znalazłeś odpowiedzi?</h2>
          <p className="text-sm text-white/60">
            Skontaktuj się z nami bezpośrednio — odpowiadamy w ciągu 48 godzin w dni robocze.
          </p>
          <a
            href="mailto:dziekanat@wi.agh.edu.pl"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            <MessageCircle className="size-4" />
            Napisz do dziekanatu
          </a>
        </section>
      </div>
    </main>
  );
}
