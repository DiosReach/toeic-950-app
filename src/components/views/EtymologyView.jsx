import { useState } from 'react'
import { useProgressContext } from '../../context/ProgressContext'
import { ROOTS } from '../../data/roots'
import WordCard from '../WordCard'

export default function EtymologyView() {
  const { progress, setStatus, toggleStar, unlockRoot } = useProgressContext()
  const [activeId, setActiveId] = useState(ROOTS[0].id)
  const active = ROOTS.find((r) => r.id === activeId)

  const isUnlocked = (rootId) => progress.unlockedRoots.includes(rootId)
  const masteredInRoot = (root) =>
    root.words.filter((w) => progress.mastered.includes(w.id)).length

  const statusOf = (id) =>
    progress.mastered.includes(id)
      ? 'mastered'
      : progress.reviewing.includes(id)
        ? 'reviewing'
        : 'none'

  const unlocked = isUnlocked(active.id)
  const masteredCount = masteredInRoot(active)

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Root selector */}
      <aside className="space-y-2">
        <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-slate-500">
          Root Families
        </h2>
        {ROOTS.map((r) => {
          const done = masteredInRoot(r)
          return (
            <button
              key={r.id}
              onClick={() => setActiveId(r.id)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                activeId === r.id
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{r.root}</span>
                {isUnlocked(r.id) && (
                  <span className="text-xs text-emerald-400">unlocked</span>
                )}
              </div>
              <p className="text-xs text-slate-400">{r.gloss}</p>
              <p className="mt-1 text-[11px] text-slate-500">
                {done}/{r.words.length} mastered
              </p>
            </button>
          )
        })}
      </aside>

      {/* Active root dashboard */}
      <section>
        <header className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/40 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            The Root · {active.origin}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-white">
            {active.root}
            <span className="ml-3 align-middle text-base font-medium text-slate-400">
              = {active.gloss}
            </span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            {active.explanation}
          </p>

          {/* Generate / unlock dashboard */}
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl bg-slate-950/60 p-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{active.words.length} words in this family</span>
                <span>{masteredCount} mastered</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
                  style={{ width: `${(masteredCount / active.words.length) * 100}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => unlockRoot(active.id)}
              disabled={unlocked}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                unlocked
                  ? 'cursor-default bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40'
                  : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:from-indigo-400 hover:to-fuchsia-400'
              }`}
            >
              {unlocked ? '✓ Added to study list' : '⚡ Generate & unlock words'}
            </button>
          </div>
        </header>

        {/* Generated words grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {active.words.map((w) => (
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
      </section>
    </div>
  )
}
