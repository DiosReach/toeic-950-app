import { useEffect, useState } from 'react'
import { useProgressContext } from '../../context/ProgressContext'
import { useGeneratedDay } from '../../hooks/useGeneratedDay'
import { buildQuestions } from '../../lib/quiz'
import WordCard from '../WordCard'
import QuizRunner from '../exam/QuizRunner'

// Pass mark for the daily Lock-Unlock quiz (8/10).
const PASS_THRESHOLD = 0.8
const DAILY_QUIZ_SIZE = 10

// The Study tab is fully root-driven AND gated: the active day is the user's
// `unlockedDay`. Finishing the day's words reveals the Lock-Unlock quiz; passing
// it increments unlockedDay in Firestore, revealing the next root theme.
export default function StudyView() {
  const {
    progress,
    setStatus,
    toggleStar,
    studiedTodayCount,
    uid,
    unlockedDay,
    unlockNextDay,
    setActiveDayGoal,
  } = useProgressContext()

  const { day, loading } = useGeneratedDay(uid, unlockedDay)
  const [quiz, setQuiz] = useState(null) // { questions, key } when quiz is open
  const [passed, setPassed] = useState(false) // did the latest attempt pass?

  useEffect(() => {
    if (day?.goal) setActiveDayGoal(day.goal)
  }, [day?.goal, setActiveDayGoal])

  // Reset any open quiz when the active day changes (e.g. after unlocking).
  useEffect(() => {
    setQuiz(null)
  }, [unlockedDay])

  const statusOf = (id) =>
    progress.mastered.includes(id)
      ? 'mastered'
      : progress.reviewing.includes(id)
        ? 'reviewing'
        : 'none'

  // Dev back-door: skip to the next day without taking the quiz.
  const devSkip = () => unlockNextDay()

  if (loading || !day || !day.root) {
    return (
      <div>
        <DevSkipBar onSkip={devSkip} day={unlockedDay} />
        <div className="py-20 text-center text-slate-500 animate-pulse">
          Generating today’s root vocabulary…
        </div>
      </div>
    )
  }

  const root = day.root
  const words = day.words
  const goal = day.goal

  const masteredCount = words.filter((w) => progress.mastered.includes(w.id)).length
  const reviewedCount = words.filter((w) => statusOf(w.id) !== 'none').length
  const allReviewed = words.length > 0 && reviewedCount === words.length
  const goalPct = goal ? Math.min(100, Math.round((studiedTodayCount / goal) * 100)) : 0
  const goalMet = goal > 0 && studiedTodayCount >= goal

  // ── Daily Lock-Unlock quiz ─────────────────────────────────
  const startQuiz = () => {
    setPassed(false)
    const questions = buildQuestions(
      words.map((w) => w.id),
      Math.min(DAILY_QUIZ_SIZE, words.length),
    )
    if (questions.length) setQuiz({ questions, key: Date.now() })
  }

  // Record pass/fail; the actual Firestore unlock happens on "Continue" so the
  // success screen isn't whisked away by the day changing underneath it.
  const handleQuizFinish = (result) => {
    setPassed(result.score / result.total >= PASS_THRESHOLD)
  }

  const exitQuiz = () => {
    if (passed) unlockNextDay() // officially advance the RelativeDay state
    setQuiz(null)
    setPassed(false)
  }

  if (quiz) {
    return (
      <div>
        <DevSkipBar onSkip={devSkip} day={unlockedDay} />
        <QuizRunner
          key={quiz.key}
          title={`Day ${unlockedDay} · ${root.root} Lock-Unlock Quiz`}
          type="daily"
          questions={quiz.questions}
          passThreshold={PASS_THRESHOLD}
          onFinish={handleQuizFinish}
          onRetry={startQuiz}
          onExit={exitQuiz}
          exitLabel="Back to study"
        />
      </div>
    )
  }

  return (
    <div>
      <DevSkipBar onSkip={devSkip} day={unlockedDay} />

      {/* ── Rich root header ── */}
      <header className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/40">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/40 px-5 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-indigo-500/15 px-2 py-0.5 text-xs font-bold text-indigo-300">
              Day {unlockedDay}
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

      {/* ── Single unified word grid ── */}
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

      {/* ── Daily Lock-Unlock quiz trigger ── */}
      <div className="mt-6">
        {allReviewed ? (
          <button
            onClick={startQuiz}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-4 text-center text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-fuchsia-400 animate-pop"
          >
            📝 開始今日通關小考 · Take Today’s Lock-Unlock Quiz
            <span className="ml-2 text-sm font-medium opacity-80">
              ({DAILY_QUIZ_SIZE} Q · pass {Math.ceil(PASS_THRESHOLD * DAILY_QUIZ_SIZE)}/
              {DAILY_QUIZ_SIZE} to unlock Day {unlockedDay + 1})
            </span>
          </button>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-800 px-6 py-4 text-center text-sm text-slate-500">
            Review all {words.length} words ({reviewedCount}/{words.length} done) to
            unlock today’s 通關小考.
          </div>
        )}
      </div>
    </div>
  )
}

// Temporary developer back-door — kept visible at the very top for testing.
function DevSkipBar({ onSkip, day }) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 px-4 py-2">
      <span className="text-xs font-medium text-amber-400/80">
        🛠️ Dev tools · current Day {day}
      </span>
      <button
        onClick={onSkip}
        className="rounded-lg border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/10"
      >
        Dev: Skip to Next Day →
      </button>
    </div>
  )
}
