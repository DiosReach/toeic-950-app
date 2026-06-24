import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../hooks/useProgress'
import { WORDS, WORDS_BY_ID } from '../data/words'
import WordCard from './WordCard'

// Deterministic 30-word set for a given calendar day. Everyone sees a fresh
// rotating window each day; the set is stable on reload (not random per render).
function getDailyWords(goal) {
  const dayIndex = Math.floor(Date.now() / 86_400_000) // days since epoch
  const start = (dayIndex * goal) % WORDS.length
  const out = []
  for (let i = 0; i < Math.min(goal, WORDS.length); i++) {
    out.push(WORDS[(start + i) % WORDS.length])
  }
  return out
}

const TABS = [
  { key: 'today', label: 'Today' },
  { key: 'all', label: 'All words' },
  { key: 'mastered', label: 'Mastered' },
  { key: 'reviewing', label: 'Reviewing' },
  { key: 'starred', label: 'Starred' },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { progress, loading, error, setStatus, toggleStar, dailyGoal, studiedTodayCount } =
    useProgress(user?.uid)

  const [tab, setTab] = useState('today')

  const dailyWords = useMemo(() => getDailyWords(dailyGoal), [dailyGoal])

  const statusOf = (id) =>
    progress.mastered.includes(id)
      ? 'mastered'
      : progress.reviewing.includes(id)
        ? 'reviewing'
        : 'none'

  const visibleWords = useMemo(() => {
    switch (tab) {
      case 'today':
        return dailyWords
      case 'mastered':
        return progress.mastered.map((id) => WORDS_BY_ID[id]).filter(Boolean)
      case 'reviewing':
        return progress.reviewing.map((id) => WORDS_BY_ID[id]).filter(Boolean)
      case 'starred':
        return progress.starred.map((id) => WORDS_BY_ID[id]).filter(Boolean)
      case 'all':
      default:
        return WORDS
    }
  }, [tab, dailyWords, progress])

  const goalPct = Math.min(100, Math.round((studiedTodayCount / dailyGoal) * 100))
  const goalMet = studiedTodayCount >= dailyGoal

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        <div className="animate-pulse">Loading your progress…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 font-extrabold">
              T
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">TOEIC Vocab Cloud</p>
              <p className="text-xs text-slate-500">
                {user?.displayName || user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-sm font-semibold"
              title="Daily streak"
            >
              🔥 <span>{progress.streak}</span>
              <span className="hidden text-slate-400 sm:inline">day streak</span>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
            Couldn’t sync with the cloud: {error.message}
          </div>
        )}

        {/* Daily goal banner */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                {goalMet ? '🎉 Daily goal complete!' : 'Today’s goal'}
              </h2>
              <p className="text-sm text-slate-400">
                {studiedTodayCount} / {dailyGoal} words studied today
              </p>
            </div>
            <Stat label="Mastered" value={progress.mastered.length} />
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-500"
              style={{ width: `${goalPct}%` }}
            />
          </div>
        </section>

        {/* Tabs */}
        <div className="scrollbar-slim mb-5 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const count =
              t.key === 'mastered'
                ? progress.mastered.length
                : t.key === 'reviewing'
                  ? progress.reviewing.length
                  : t.key === 'starred'
                    ? progress.starred.length
                    : t.key === 'today'
                      ? dailyWords.length
                      : WORDS.length
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  tab === t.key
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {t.label}
                <span className="ml-1.5 opacity-60">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Word grid */}
        {visibleWords.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 py-16 text-center text-slate-500">
            Nothing here yet. Start marking words to fill this list.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleWords.map((w) => (
              <WordCard
                key={w.id}
                word={w}
                status={statusOf(w.id)}
                starred={progress.starred.includes(w.id)}
                onSetStatus={setStatus}
                onToggleStar={toggleStar}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="text-right">
      <p className="text-2xl font-extrabold text-white">{value}</p>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  )
}
