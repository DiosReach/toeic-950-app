import { useMemo, useState } from 'react'
import { useProgressContext } from '../../context/ProgressContext'
import { WORDS } from '../../data/words'
import { ALL_WORDS_BY_ID } from '../../data/catalog'
import { ROOTS } from '../../data/roots'
import { getTodayWords } from '../../lib/daily'
import WordCard from '../WordCard'

// Words that belong to roots the user has unlocked — these join the study pool.
function unlockedRootWords(unlockedRoots) {
  return ROOTS.filter((r) => unlockedRoots.includes(r.id)).flatMap((r) =>
    r.words.map((w) => ({ ...w, rootId: r.id })),
  )
}

export default function StudyView() {
  const { progress, setStatus, toggleStar, dailyGoal, studiedTodayCount } =
    useProgressContext()
  const [tab, setTab] = useState('today')

  const dailyWords = useMemo(() => getTodayWords(), [])
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

  const tabs = [
    { key: 'today', label: 'Today', count: dailyWords.length },
    { key: 'all', label: 'All words', count: WORDS.length + rootWords.length },
    { key: 'mastered', label: 'Mastered', count: progress.mastered.length },
    { key: 'reviewing', label: 'Reviewing', count: progress.reviewing.length },
    { key: 'starred', label: 'Starred', count: progress.starred.length },
  ]

  const visibleWords = useMemo(() => {
    const byIds = (ids) => ids.map((id) => ALL_WORDS_BY_ID[id]).filter(Boolean)
    switch (tab) {
      case 'today':
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
  }, [tab, dailyWords, rootWords, progress])

  const goalPct = Math.min(100, Math.round((studiedTodayCount / dailyGoal) * 100))
  const goalMet = studiedTodayCount >= dailyGoal

  return (
    <div>
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
          <div className="text-right">
            <p className="text-2xl font-extrabold text-white">{progress.mastered.length}</p>
            <p className="text-xs uppercase tracking-wide text-slate-500">Mastered</p>
          </div>
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
        {tabs.map((t) => (
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
            <span className="ml-1.5 opacity-60">{t.count}</span>
          </button>
        ))}
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
    </div>
  )
}
