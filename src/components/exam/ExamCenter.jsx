import { useMemo, useState } from 'react'
import { useProgressContext } from '../../context/ProgressContext'
import { ROOTS } from '../../data/roots'
import { getTodayWords } from '../../lib/daily'
import { buildQuestions } from '../../lib/quiz'
import { todayKey, keysInRange } from '../../lib/date'
import QuizRunner from './QuizRunner'
import QuizReviewModal from './QuizReviewModal'

export default function ExamCenter() {
  const { progress, addQuizResult } = useProgressContext()
  const [active, setActive] = useState(null) // { title, type, meta, questions }
  const [reviewQuiz, setReviewQuiz] = useState(null)

  // Grand-exam controls
  const today = todayKey()
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [count, setCount] = useState(20)

  // Word ids studied within the selected date range (from synced history).
  const rangeWordIds = useMemo(() => {
    if (from > to) return []
    const keys = keysInRange(from, to)
    const ids = new Set()
    keys.forEach((k) => progress.history[k]?.studied?.forEach((id) => ids.add(id)))
    return [...ids]
  }, [from, to, progress.history])

  const startQuiz = (title, type, ids, n, meta = null) => {
    const questions = buildQuestions(ids, n)
    if (!questions.length) return
    setActive({ title, type, meta, questions })
  }

  const handleFinish = (quiz) => addQuizResult(quiz)

  // ── Active quiz takes over the panel ───────────────────────
  if (active) {
    return (
      <QuizRunner
        title={active.title}
        type={active.type}
        meta={active.meta}
        questions={active.questions}
        onFinish={handleFinish}
        onExit={() => setActive(null)}
      />
    )
  }

  const todayWordIds = getTodayWords().map((w) => w.id)
  const maxGrand = Math.min(50, Math.max(0, rangeWordIds.length))

  return (
    <div className="space-y-8">
      {/* Mini quizzes */}
      <section>
        <h2 className="mb-1 text-xl font-bold">章節小考 · Mini-Quizzes</h2>
        <p className="mb-4 text-sm text-slate-400">
          Quick 10-question checks on today’s words or a single root family.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuizTile
            title="Today’s 30 words"
            subtitle="10 questions"
            onClick={() => startQuiz("Mini-Quiz · Today's words", 'mini', todayWordIds, 10)}
          />
          {ROOTS.map((r) => (
            <QuizTile
              key={r.id}
              title={`Root · ${r.root}`}
              subtitle={`${r.gloss} · 10 questions`}
              onClick={() =>
                startQuiz(
                  `Mini-Quiz · ${r.root}`,
                  'mini',
                  r.words.map((w) => w.id),
                  10,
                  { rootId: r.id },
                )
              }
            />
          ))}
        </div>
      </section>

      {/* Grand exam */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="mb-1 text-xl font-bold">自訂範圍大考 · Grand Exam</h2>
        <p className="mb-4 text-sm text-slate-400">
          Pick a date range — we pull every word you studied in that window and
          generate a randomized 20–50 question exam.
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="mb-1 block text-slate-400">From</span>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 [color-scheme:dark]"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-400">To</span>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 [color-scheme:dark]"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-slate-400">Questions</span>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
            >
              {[20, 30, 40, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-slate-400">
            {rangeWordIds.length} words available in this range
            {maxGrand > 0 && maxGrand < count && ` (exam will use ${maxGrand})`}
          </span>
          <button
            disabled={rangeWordIds.length === 0}
            onClick={() =>
              startQuiz(
                `Grand Exam · ${from} → ${to}`,
                'grand',
                rangeWordIds,
                Math.min(count, rangeWordIds.length),
                { from, to },
              )
            }
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:from-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🎓 Generate grand exam
          </button>
        </div>
        {rangeWordIds.length === 0 && (
          <p className="mt-2 text-xs text-amber-400">
            No studied words in this range yet. Mark some words as Mastered or
            Reviewing first — they’re logged to that day’s history.
          </p>
        )}
      </section>

      {/* Past results / review */}
      <section>
        <h2 className="mb-1 text-xl font-bold">回顧系統 · Exam Review</h2>
        <p className="mb-4 text-sm text-slate-400">
          Open any past attempt to see wrong answers in red, correct in green,
          with full etymology.
        </p>
        {progress.quizzes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 py-12 text-center text-slate-500">
            No exams taken yet.
          </div>
        ) : (
          <div className="space-y-2">
            {progress.quizzes.map((qz) => {
              const pct = Math.round((qz.score / qz.total) * 100)
              return (
                <button
                  key={qz.id}
                  onClick={() => setReviewQuiz(qz)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-left transition hover:border-slate-700"
                >
                  <div>
                    <p className="font-semibold text-white">{qz.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(qz.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${
                        pct >= 80
                          ? 'text-emerald-400'
                          : pct >= 50
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }`}
                    >
                      {qz.score}/{qz.total}
                    </span>
                    <span className="text-slate-500">›</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>

      {reviewQuiz && (
        <QuizReviewModal quiz={reviewQuiz} onClose={() => setReviewQuiz(null)} />
      )}
    </div>
  )
}

function QuizTile({ title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left transition hover:border-indigo-500 hover:bg-indigo-500/5"
    >
      <p className="font-bold text-white">{title}</p>
      <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
      <p className="mt-3 text-sm font-semibold text-indigo-400">Start ›</p>
    </button>
  )
}
