import { BookOpen, ExternalLink, MessageCircle, MonitorPlay, FileText, Users } from 'lucide-react';

const RESOURCES = [
  {
    category: 'Platformy i komunikacja',
    icon: MonitorPlay,
    items: [
      {
        id: 'upel',
        name: 'Platforma uPel',
        description:
          'Główna platforma e-learningowa AGH. Po przyjęciu na studia otrzymasz tam dostęp do materiałów dydaktycznych, harmonogramów i komunikatów prowadzących.',
        url: 'https://upel.agh.edu.pl',
        label: 'Otwórz uPel',
        accent: '#3b82f6',
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        pill: 'bg-blue-600 hover:bg-blue-500',
        pillText: 'text-white',
        iconColor: 'text-blue-400',
      },
      {
        id: 'whatsapp',
        name: 'Grupa WhatsApp',
        description:
          'Nieformalna grupa kandydatów i studentów. Tutaj możesz poznać przyszłych kolegów, wymieniać się informacjami i pytać o szczegóły rekrutacji.',
        url: 'https://chat.whatsapp.com/example',
        label: 'Dołącz do grupy',
        border: 'border-green-500/30',
        bg: 'bg-green-500/10',
        pill: 'bg-green-600 hover:bg-green-500',
        pillText: 'text-white',
        iconColor: 'text-green-400',
      },
    ],
  },
  {
    category: 'Dokumenty i regulaminy',
    icon: FileText,
    items: [
      {
        id: 'regulations',
        name: 'Regulamin studiów podyplomowych',
        description:
          'Oficjalny regulamin określający zasady rekrutacji, praw i obowiązków studenta, zasad zaliczania i skreślenia z listy studentów.',
        url: 'https://www.agh.edu.pl/regulamin',
        label: 'Pobierz regulamin',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        pill: 'bg-amber-600 hover:bg-amber-500',
        pillText: 'text-white',
        iconColor: 'text-amber-400',
      },
      {
        id: 'program',
        name: 'Program nauczania',
        description:
          'Szczegółowy opis przedmiotów, liczby godzin, metod nauczania i systemu oceniania dla poszczególnych kierunków studiów podyplomowych.',
        url: 'https://www.informatyka.agh.edu.pl/programy',
        label: 'Zobacz programy',
        border: 'border-purple-500/30',
        bg: 'bg-purple-500/10',
        pill: 'bg-purple-600 hover:bg-purple-500',
        pillText: 'text-white',
        iconColor: 'text-purple-400',
      },
    ],
  },
  {
    category: 'Pomoc i kontakt',
    icon: Users,
    items: [
      {
        id: 'faq',
        name: 'FAQ — Najczęstsze pytania',
        description:
          'Odpowiedzi na najczęstsze pytania dotyczące rekrutacji, opłat, dokumentów i przebiegu studiów. Sprawdź zanim napiszesz do nas wiadomość.',
        url: '/faq',
        label: 'Przejdź do FAQ',
        border: 'border-cyan-500/30',
        bg: 'bg-cyan-500/10',
        pill: 'bg-cyan-600 hover:bg-cyan-500',
        pillText: 'text-white',
        iconColor: 'text-cyan-400',
        internal: true,
      },
      {
        id: 'contact',
        name: 'Kontakt z dziekanatem',
        description:
          'Masz pytanie, którego nie ma w FAQ? Skontaktuj się z dziekanatem Wydziału Informatyki AGH. Odpowiadamy w dni robocze do 48 godzin.',
        url: 'mailto:dziekanat@wi.agh.edu.pl',
        label: 'Napisz do nas',
        border: 'border-rose-500/30',
        bg: 'bg-rose-500/10',
        pill: 'bg-rose-600 hover:bg-rose-500',
        pillText: 'text-white',
        iconColor: 'text-rose-400',
      },
    ],
  },
];

export default function MaterialsPage() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Hero */}
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <BookOpen className="size-8 text-purple-400" />
            Materiały i zasoby
          </h1>
          <p className="text-white/60 text-base max-w-2xl">
            Wszystkie ważne linki, platformy i dokumenty w jednym miejscu. Kliknij kafelek, aby
            przejść do danego zasobu.
          </p>
        </header>

        {/* Categories */}
        {RESOURCES.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <section key={category.category} className="space-y-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white/70 uppercase tracking-widest text-xs">
                <CategoryIcon className="size-4 text-white/40" />
                {category.category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {category.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target={item.internal ? '_self' : '_blank'}
                    rel="noreferrer"
                    className={`group flex flex-col gap-4 rounded-2xl border ${item.border} ${item.bg} p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20 bg-card`}
                    style={{ backdropFilter: 'blur(8px)' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-white text-base leading-snug">
                        {item.name}
                      </h3>
                      <ExternalLink
                        className={`size-4 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${item.iconColor}`}
                      />
                    </div>
                    <p className="text-sm text-white/65 leading-relaxed flex-1">
                      {item.description}
                    </p>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${item.pill} ${item.pillText}`}
                      >
                        {item.label}
                        <ExternalLink className="size-3" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
