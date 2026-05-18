'use client';

import { useEffect, useState } from 'react';
import { Star, Send, CheckCircle, Loader2 } from 'lucide-react';

type Question = {
  id: string;
  text: string;
  type: 'scale' | 'text';
  required: boolean;
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
};

type Answer = { question_id: string; value: number | string };

function ScaleQuestion({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: number | null;
  onChange: (v: number) => void;
}) {
  const labels = ['', 'Zdecydowanie nie', 'Raczej nie', 'Neutralnie', 'Raczej tak', 'Zdecydowanie tak'];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-white">
        {question.text}
        {question.required && <span className="ml-1 text-red-400">*</span>}
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className="group flex flex-col items-center gap-1"
            title={labels[v]}
          >
            <Star
              className={`size-8 transition-all duration-150 ${
                value !== null && v <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-white/20 group-hover:text-amber-300'
              }`}
            />
            <span className={`text-[10px] transition-colors ${
              value === v ? 'text-amber-300' : 'text-white/30 group-hover:text-white/50'
            }`}>{v}</span>
          </button>
        ))}
      </div>
      {value !== null && (
        <p className="text-xs text-amber-300/70">{labels[value]}</p>
      )}
    </div>
  );
}

function TextQuestion({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">
        {question.text}
        {question.required && <span className="ml-1 text-red-400">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Twoja odpowiedź (opcjonalnie)…"
        rows={3}
        className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.07] transition-colors"
      />
    </div>
  );
}

export default function SurveyPage() {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/surveys')
      .then((r) => r.json())
      .then((data) => setSurvey(data))
      .finally(() => setLoading(false));
  }, []);

  function setAnswer(questionId: string, value: number | string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!survey) return;

    // Validate required
    const missing = survey.questions.filter(
      (q) => q.required && (answers[q.id] === undefined || answers[q.id] === ''),
    );
    if (missing.length > 0) {
      setError(`Wypełnij wymagane pola: ${missing.map((q) => q.text).join(', ')}`);
      return;
    }
    setError(null);
    setSubmitting(true);

    const payload = {
      answers: Object.entries(answers).map(([question_id, value]) => ({ question_id, value })),
    };

    const res = await fetch(`/api/surveys/${survey.id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
    } else {
      const d = await res.json();
      setError(d?.detail ?? 'Błąd wysyłania ankiety');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-400" />
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <CheckCircle className="size-16 text-green-400 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Dziękujemy!</h1>
          <p className="text-white/60">
            Twoja odpowiedź została zapisana anonimowo. Twoja opinia pomaga nam udoskonalać system rekrutacji.
          </p>
        </div>
      </main>
    );
  }

  if (!survey) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-3">
          <h1 className="text-xl font-semibold text-white">Brak aktywnej ankiety</h1>
          <p className="text-white/50 text-sm">
            Aktualnie nie ma aktywnej ankiety. Sprawdź ponownie później.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            🔒 Ankieta anonimowa
          </div>
          <h1 className="text-2xl font-bold text-white">{survey.title}</h1>
          {survey.description && (
            <p className="text-white/60 text-sm leading-relaxed">{survey.description}</p>
          )}
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-3"
            >
              <p className="text-xs text-white/30 uppercase tracking-wider">
                Pytanie {idx + 1} z {survey.questions.length}
              </p>
              {q.type === 'scale' ? (
                <ScaleQuestion
                  question={q}
                  value={(answers[q.id] as number) ?? null}
                  onChange={(v) => setAnswer(q.id, v)}
                />
              ) : (
                <TextQuestion
                  question={q}
                  value={(answers[q.id] as string) ?? ''}
                  onChange={(v) => setAnswer(q.id, v)}
                />
              )}
            </div>
          ))}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-xs text-white/30">
              Twoje odpowiedzi są całkowicie anonimowe — nie zbieramy żadnych danych identyfikujących.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Wyślij
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
