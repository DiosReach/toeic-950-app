import { useEffect } from 'react'
import { useProgressContext } from '../../context/ProgressContext'
import { useGeneratedDay } from '../../hooks/useGeneratedDay'
import WordCard from '../WordCard'

// The Study tab is now fully root-driven: the header tells the story of the
// day's assigned root, and the single word grid below IS that root's family.
// No split pills, no unrelated pool — the daily quota tracks these words.
export default function StudyView() {
  const {
    progress,
    setStatus,
    toggleStar,
    studiedTodayCount,
    uid,
    relativeDay,
    setActiveDayGoal,
  } = useProgressContext()

  const { day, loading } = useGeneratedDay(uid, relativeDay)

  // Tell the progress hook how big today's themed list is so the streak/goal
  // logic tracks the etymology words directly.
  useEffect(() => {
    if (day?.goal) setActiveDayGoal(day.goal)
  }, [day?.goal, setActiveDayGoal])

  if (loading || !day || !day.root) {
    return (
      <div className="py-20 text-center text-slate-500 animate-pulse">
        Generating today’s root vocabulary…
      </div>
    )
  }

  const root = day.root
  const words = day.words
  const goal = day.goal
  const statusOf = (id) =>
    progress.mastered.includes(id)
      ? 'mastered'
      : progress.reviewing.includes(id)
        ? 'reviewing'
        : 'none'

  const masteredCount = words.filter((w) => progress.mastered.includes(w.id)).length
  const goalPct = goal ? Math.min(100, Math.round((studiedTodayCount / goal) * 100)) : 0
  const goalMet = goal > 0 && studiedTodayCount >= goal

  return (
    <div>
      {/* ── Rich root header (single source of truth for the day) ── */}
      <header className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/40">
        {/* Daily-discipline strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/40 px-5 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-indigo-500/15 px-2 py-0.5 text-xs font-bold text-indigo-300">
              Day {relativeDay ?? '–'}
            </span>
            <span className="rounded-lg bg-fuchsia-500/15 px-2 py-0.5 text-xs font-bold text-fuchsia-300">
              Tier {day.tier} · Target {day.target}
            </span>
            <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-xs font-bold text-amber-300">
              🔥 {progress.streak} day streak
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              {goalMet ? '🎉 Goal complete' : `${studiedTodayCount} / ${goal} today`}
            </span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${goalPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* The root story */}
        <div className="p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Today’s Root · {root.origin}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
            {root.root}
            <span className="ml-3 align-middle text-base font-medium text-slate-400">
              = {root.gloss}
            </span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{root.explanation}</p>

          {/* Mastery progress for this root family */}
          <div className="mt-5 rounded-xl bg-slate-950/60 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{words.length} words in the {root.root} family</span>
              <span>{masteredCount} mastered</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                style={{ width: `${(masteredCount / words.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Single unified word grid — all from this root ── */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {words.map((w) => (
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
    </div>
  )
}
