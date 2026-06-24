import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProgressContext } from '../context/ProgressContext'
import StudyView from './views/StudyView'
import EtymologyView from './views/EtymologyView'
import CalendarView from './views/CalendarView'
import ExamCenter from './exam/ExamCenter'

const NAV = [
  { key: 'study', label: 'Study', icon: '📚' },
  { key: 'etymology', label: 'Etymology', icon: '🧬' },
  { key: 'calendar', label: 'Calendar', icon: '🗓️' },
  { key: 'exam', label: 'Exam Center', icon: '🎓' },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const { progress, loading, error } = useProgressContext()
  const [view, setView] = useState('study')

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse">Loading your progress…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 font-extrabold">
              T
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">TOEIC Vocab Cloud</p>
              <p className="text-xs text-slate-500">{user?.displayName || user?.email}</p>
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

        {/* Tab nav */}
        <nav className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="scrollbar-slim flex gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setView(n.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  view === n.key
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
            Couldn’t sync with the cloud: {error.message}
          </div>
        )}

        {view === 'study' && <StudyView />}
        {view === 'etymology' && <EtymologyView />}
        {view === 'calendar' && <CalendarView />}
        {view === 'exam' && <ExamCenter />}
      </main>
    </div>
  )
}
