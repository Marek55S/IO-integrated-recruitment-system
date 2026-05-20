'use client';

import { useEffect, useState } from 'react';
import {
  BarChart2, Plus, Star, MessageSquare, ChevronDown, ChevronRight,
  CheckCircle, Circle, Trash2, Loader2, ArrowLeft,
} from 'lucide-react';

type QuestionType = 'scale' | 'text';

type Question = {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
};

type SurveyListItem = {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  total_responses: number;
  questions: Question[];
};

type QuestionStats = {
  id: string;
  text: string;
  type: QuestionType;
  total_answers: number;
  average?: number;
  distribution?: Record<string, number>;
  comments?: string[];
};

type SurveyStats = {
  survey_id: string;
  title: string;
  total_responses: number;
  questions: QuestionStats[];
};

function BarChart({ distribution }: { distribution: Record<string, number> }) {
  const max = Math.max(...Object.values(distribution), 1);
  return (
    <div className="flex items-end gap-2 h-20">
      {[1, 2, 3, 4, 5].map((v) => {
        const count = distribution[String(v)] ?? 0;
        const pct = Math.round((count / max) * 100);
        const label = ['', 'Zd. nie', 'Raczej nie', 'Neutralnie', 'Raczej tak', 'Zd. tak'][v];
        return (
          <div key={v} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-white/40">{count}</span>
            <div className="w-full rounded-t-sm transition-all" style={{
              height: `${Math.max(pct, 4)}%`,
              backgroundColor: `hsl(${(v - 1) * 25 + 200}, 80%, 60%)`,
            }} />
            <span className="text-[9px] text-white/30 text-center leading-tight">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatsView({ surveyId, onBack }: { surveyId: string; onBack: () => void }) {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/surveys/${surveyId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [surveyId]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="size-8 animate-spin text-blue-400" />
    </div>
  );

  if (!stats) return <p className="text-white/40 text-sm">Błąd ładowania statystyk.</p>;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
        <ArrowLeft className="size-4" /> Powrót do listy
      </button>

      <header>
        <h2 className="text-xl font-bold text-white">{stats.title}</h2>
        <p className="text-sm text-white/50 mt-1">
          Łącznie odpowiedzi: <span className="text-white font-semibold">{stats.total_responses}</span>
        </p>
      </header>

      {stats.questions.map((q) => (
        <div key={q.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4">
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wide mb-1">
              {q.type === 'scale' ? 'Skala 1–5' : 'Odpowiedź tekstowa'}
            </p>
            <p className="font-medium text-white text-sm">{q.text}</p>
          </div>
          <p className="text-xs text-white/40">Odpowiedzi: {q.total_answers}</p>

          {q.type === 'scale' && q.distribution && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="size-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold text-amber-300">
                  Średnia: {q.average ?? '—'} / 5
                </span>
              </div>
              <BarChart distribution={q.distribution} />
            </div>
          )}

          {q.type === 'text' && q.comments && q.comments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/40 uppercase">Anonimowe komentarze</p>
              <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {q.comments.map((c, idx) => (
                  <li key={idx} className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-white/70 italic">
                    "{c}"
                  </li>
                ))}
              </ul>
            </div>
          )}

          {q.type === 'text' && (!q.comments || q.comments.length === 0) && (
            <p className="text-xs text-white/30 italic">Brak komentarzy.</p>
          )}
        </div>
      ))}
    </div>
  );
}

function CreateSurveyForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q1', text: '', type: 'scale', required: true },
  ]);
  const [isActive, setIsActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addQuestion(type: QuestionType) {
    setQuestions((prev) => [
      ...prev,
      { id: `q${Date.now()}`, text: '', type, required: false },
    ]);
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Podaj tytuł ankiety'); return; }
    if (questions.some((q) => !q.text.trim())) { setError('Uzupełnij treść wszystkich pytań'); return; }
    setError(null);
    setSaving(true);

    const res = await fetch('/api/admin/surveys', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, questions, is_active: isActive }),
    });

    setSaving(false);
    if (res.ok) { onCreated(); }
    else {
      const d = await res.json();
      setError(d?.detail ?? 'Błąd tworzenia ankiety');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide">Tytuł ankiety *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="np. Ankieta satysfakcji z rekrutacji 2025"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide">Opis (opcjonalnie)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Krótki opis celu ankiety…"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* Questions */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-wide">Pytania</p>
        {questions.map((q, idx) => (
          <div key={q.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-white/40">Pytanie {idx + 1}</span>
              <div className="flex items-center gap-2">
                <select
                  value={q.type}
                  onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuestionType })}
                  className="text-xs rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-white/70 focus:outline-none"
                >
                  <option value="scale">Skala 1–5</option>
                  <option value="text">Tekst otwarty</option>
                </select>
                <label className="flex items-center gap-1 text-xs text-white/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                    className="accent-blue-500"
                  />
                  Wymagane
                </label>
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(q.id)} className="text-white/30 hover:text-red-400 transition-colors">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={q.text}
              onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              placeholder={q.type === 'scale' ? 'np. Jak oceniasz przejrzystość procesu rekrutacji?' : 'np. Co chciałbyś zmienić w procesie rekrutacji?'}
              rows={2}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        ))}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addQuestion('scale')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300 hover:bg-blue-500/20 transition-colors"
          >
            <Plus className="size-3.5" /> Dodaj pytanie (skala)
          </button>
          <button
            type="button"
            onClick={() => addQuestion('text')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300 hover:bg-purple-500/20 transition-colors"
          >
            <Plus className="size-3.5" /> Dodaj pytanie (tekst)
          </button>
        </div>
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div
          onClick={() => setIsActive((v) => !v)}
          className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-white/15'}`}
        >
          <div className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-sm text-white/70">
          {isActive ? 'Aktywna od razu (dezaktywuje inne)' : 'Nieaktywna (aktywuj ręcznie)'}
        </span>
      </label>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Utwórz ankietę
        </button>
      </div>
    </form>
  );
}

export default function AdminSurveysPage() {
  const [surveys, setSurveys] = useState<SurveyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'create' | 'stats'>('list');
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);

  async function loadSurveys() {
    setLoading(true);
    const res = await fetch('/api/admin/surveys', { credentials: 'include' });
    if (res.ok) setSurveys(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadSurveys(); }, []);

  async function handleActivate(id: string) {
    setActivating(id);
    await fetch(`/api/admin/surveys/${id}`, { method: 'PATCH', credentials: 'include' });
    await loadSurveys();
    setActivating(null);
  }

  if (view === 'stats' && selectedSurveyId) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto max-w-3xl">
          <StatsView surveyId={selectedSurveyId} onBack={() => setView('list')} />
        </div>
      </main>
    );
  }

  if (view === 'create') {
    return (
      <main className="min-h-screen px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto max-w-2xl space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Plus className="size-6 text-blue-400" /> Nowa ankieta
            </h1>
            <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
              <ArrowLeft className="size-4" /> Powrót
            </button>
          </header>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <CreateSurveyForm onCreated={() => { setView('list'); loadSurveys(); }} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart2 className="size-6 text-blue-400" /> Ankiety satysfakcji
            </h1>
            <p className="text-white/50 text-sm mt-1">Anonimowe odpowiedzi kandydatów i studentów</p>
          </div>
          <button
            onClick={() => setView('create')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shrink-0"
          >
            <Plus className="size-4" /> Nowa ankieta
          </button>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-blue-400" />
          </div>
        ) : surveys.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-white/30 text-sm">
            Brak ankiet. Utwórz pierwszą.
          </div>
        ) : (
          <ul className="space-y-3">
            {surveys.map((s) => (
              <li key={s.id} className={`rounded-2xl border p-5 space-y-3 ${
                s.is_active ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-white/[0.04]'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-semibold text-white text-sm">{s.title}</h3>
                      {s.is_active && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-300">
                          <CheckCircle className="size-3" /> Aktywna
                        </span>
                      )}
                    </div>
                    {s.description && (
                      <p className="text-xs text-white/40 line-clamp-1">{s.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!s.is_active && (
                      <button
                        onClick={() => handleActivate(s.id)}
                        disabled={activating === s.id}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {activating === s.id ? <Loader2 className="size-3 animate-spin" /> : <Circle className="size-3" />}
                        Aktywuj
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedSurveyId(s.id); setView('stats'); }}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] text-blue-300 hover:bg-blue-500/20 transition-colors"
                    >
                      <BarChart2 className="size-3" /> Statystyki
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-white/40">
                  <span><MessageSquare className="size-3 inline mr-0.5" /> {s.total_responses} odpowiedzi</span>
                  <span>{s.questions.length} pytań</span>
                  <span>{new Date(s.created_at).toLocaleDateString('pl-PL')}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
