import { useMemo, useState } from 'react'
import { useProgressContext } from '../../context/ProgressContext'
import { useGeneratedDay } from '../../hooks/useGeneratedDay'
import { WORDS } from '../../data/words'
import { ALL_WORDS_BY_ID } from '../../data/catalog'
import { ROOTS } from '../../data/roots'
import WordCard from '../WordCard'

function unlockedRootWords(unlockedRoots) {
  return ROOTS.filter((r) => unlockedRoots.includes(r.id)).flatMap((r) =>
    r.words.map((w) => ({ ...w, rootId: r.id })),
  )
}

export default function StudyView() {
  const {
    progress,
    setStatus,
    toggleStar,
    unlockRoot,
    dailyGoal,
    studiedTodayCount,
    uid,
    relativeDay,
  } = useProgressContext()

  // Active root family for the merged etymology header (defaults to SPECT).
  const [activeRootId, setActiveRootId] = useState(ROOTS[0].id)
  const activeRoot = ROOTS.find((r) => r.id === activeRootId) || ROOTS[0]

  // Grid source: the active root's words by default ("filtered accordingly").
  const [filter, setFilter] = useState('root')

  const { day: today, loading: dayLoading } = useGeneratedDay(uid, relativeDay)
  const dailyWords = today?.words || []
  const rootWords = useMemo(
    () => unlockedRootWords(progress.unlockedRoots),
    [progress.unlockedRoots],
  )

  const statusOf = (id) =>
    progress.mastered.includes(id)
      ? 'mastered'
      : progress.reviewing.includes(id)
        ? 'reviewing'
        : 'none'

  const masteredInRoot = activeRoot.words.filter((w) =>
    progress.mastered.includes(w.id),
  ).length
  const rootUnlocked = progress.unlockedRoots.includes(activeRoot.id)

  const goalPct = Math.min(100, Math.round((studiedTodayCount / dailyGoal) * 100))
  const goalMet = studiedTodayCount >= dailyGoal

  const filters = [
    { key: 'root', label: activeRoot.root, count: activeRoot.words.length },
    { key: 'day', label: `Day ${relativeDay ?? '–'}`, count: dailyWords.length },
    { key: 'mastered', label: 'Mastered', count: progress.mastered.length },
    { key: 'reviewing', label: 'Reviewing', count: progress.reviewing.length },
    { key: 'starred', label: 'Starred', count: progress.starred.length },
    { key: 'all', label: 'All', count: WORDS.length + rootWords.length },
  ]

  const visibleWords = useMemo(() => {
    const byIds = (ids) => ids.map((id) => ALL_WORDS_BY_ID[id]).filter(Boolean)
    switch (filter) {
      case 'root':
        return activeRoot.words
      case 'day':
        return dailyWords
      case 'mastered':
        return byIds(progress.mastered)
      case 'reviewing':
        return byIds(progress.reviewing)
      case 'starred':
        return byIds(progress.starred)
      case 'all':
      default:
        return [...WORDS, ...rootWords]
    }
  }, [filter, activeRoot, dailyWords, rootWords, progress])

  return (
    <div>
      {/* ── Rich etymology header (replaces the old grey progress block) ── */}
      <header className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/40">
        {/* Integrated daily-discipline strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/40 px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-indigo-500/15 px-2 py-0.5 text-xs font-bold text-indigo-300">
              Day {relativeDay ?? '–'}
            </span>
            {today && (
              <span className="rounded-lg bg-fuchsia-500/15 px-2 py-0.5 text-xs font-bold text-fuchsia-300">
                Tier {today.tier} · Target {today.target}
              </span>
            )}
            <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-xs font-bold text-amber-300">
              🔥 {progress.streak} day streak
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {goalMet ? '🎉 Goal complete' : `${studiedTodayCount} / ${dailyGoal} today`}
            </span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${goalPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Root selector */}
          <div className="scrollbar-slim mb-5 flex gap-2 overflow-x-auto pb-1">
            {ROOTS.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setActiveRootId(r.id)
                  setFilter('root')
                }}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  activeRootId === r.id
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {r.root}
              </button>
            ))}
          </div>

          {/* The SPEC/SPECT story */}
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            The Root · {activeRoot.origin}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-white">
            {activeRoot.root}
            <span className="ml-3 align-middle text-base font-medium text-slate-400">
              = {activeRoot.gloss}
            </span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            {activeRoot.explanation}
          </p>

          {/* Generate / unlock dashboard */}
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl bg-slate-950/60 p-4">
            <div className="min-w-[180px] flex-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{activeRoot.words.length} words in this family</span>
                <span>{masteredInRoot} mastered</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
                  style={{ width: `${(masteredInRoot / activeRoot.words.length) * 100}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => unlockRoot(activeRoot.id)}
              disabled={rootUnlocked}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                rootUnlocked
                  ? 'cursor-default bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40'
                  : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:from-indigo-400 hover:to-fuchsia-400'
              }`}
            >
              {rootUnlocked ? '✓ Added to study list' : '⚡ Generate & unlock words'}
            </button>
          </div>
        </div>
      </header>

      {/* Grid filters */}
      <div className="scrollbar-slim my-5 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              filter === f.key
                ? 'bg-white text-slate-900'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-60">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Word grid */}
      {filter === 'day' && dayLoading ? (
        <div className="py-16 text-center text-slate-500 animate-pulse">
          Generating today’s words…
        </div>
      ) : visibleWords.length === 0 ? (
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
    </div>
  )
}
