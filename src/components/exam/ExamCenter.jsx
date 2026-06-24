import { useMemo, useState } from 'react'
import { useProgressContext } from '../../context/ProgressContext'
import { generateDay } from '../../data/wordbank'
import { buildQuestions } from '../../lib/quiz'
import { todayKey, keysInRange, daysBetween } from '../../lib/date'
import QuizRunner from './QuizRunner'
import QuizReviewModal from './QuizReviewModal'

// Gather the root-vocabulary word ids unlocked across a set of relative days.
// Each day is powered by one root family (see wordbank.generateDay).
function wordIdsForRelDays(days) {
  const ids = new Set()
  for (const d of days) {
    if (d >= 1) generateDay(d).wordIds.forEach((id) => ids.add(id))
  }
  return [...ids]
}

// Inclusive integer range [a, b] (a clamped to >= 1).
const relDayRange = (a, b) => {
  const start = Math.max(1, a)
  const out = []
  for (let d = start; d <= b; d++) out.push(d)
  return out
}

export default function ExamCenter() {
  const { progress, addQuizResult, relativeDay, registrationKey } = useProgressContext()
  const [active, setActive] = useState(null)
  const [reviewQuiz, setReviewQuiz] = useState(null)

  // Custom-range controls
  const today = todayKey()
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [count, setCount] = useState(30)

  // ── Spaced-repetition word pools (relative to signup day) ──
  const weeklyIds = useMemo(
    () => (relativeDay ? wordIdsForRelDays(relDayRange(relativeDay - 6, relativeDay)) : []),
    [relativeDay],
  )
  const monthlyIds = useMemo(
    () => (relativeDay ? wordIdsForRelDays(relDayRange(relativeDay - 29, relativeDay)) : []),
    [relativeDay],
  )

  // Custom range → relative days within the picked dates (no future, >= Day 1).
  const rangeIds = useMemo(() => {
    if (!registrationKey || from > to) return []
    const days = keysInRange(from, to)
      .map((k) => daysBetween(registrationKey, k) + 1)
      .filter((d) => d >= 1 && (!relativeDay || d <= relativeDay))
    return wordIdsForRelDays(days)
  }, [from, to, registrationKey, relativeDay])

  const startQuiz = (title, type, ids, n, meta = null) => {
    const questions = buildQuestions(ids, Math.min(n, ids.length))
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

  const customMax = Math.min(count, rangeIds.length)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold">三合一週期複習考試系統</h1>
        <p className="text-sm text-slate-400">
          Spaced-repetition exams, scaled to your relative study day (Day {relativeDay ?? '–'}).
        </p>
      </div>

      {/* Weekly + Monthly review */}
      <div className="grid gap-4 md:grid-cols-2">
        <ExamCard
          accent="from-indigo-500 to-blue-500"
          badge="一週複習考"
          title="Weekly Review"
          desc="Every root word unlocked in your past 7 study days — a 20-question comprehensive check."
          stat={`${weeklyIds.length} words from Day ${Math.max(1, (relativeDay ?? 1) - 6)}–${relativeDay ?? '–'}`}
          cta="🗓️ Start 20-question weekly exam"
          disabled={weeklyIds.length === 0}
          onStart={() =>
            startQuiz(
              `Weekly Review · Day ${Math.max(1, (relativeDay ?? 1) - 6)}–${relativeDay}`,
              'weekly',
              weeklyIds,
              20,
              { window: 7, endDay: relativeDay },
            )
          }
        />
        <ExamCard
          accent="from-fuchsia-500 to-purple-500"
          badge="一個月複習考"
          title="Monthly Review"
          desc="Every root word from your past 30 days — a 50-question ultimate diagnostic exam."
          stat={`${monthlyIds.length} words from Day ${Math.max(1, (relativeDay ?? 1) - 29)}–${relativeDay ?? '–'}`}
          cta="📅 Start 50-question monthly exam"
          disabled={monthlyIds.length === 0}
          onStart={() =>
            startQuiz(
              `Monthly Review · Day ${Math.max(1, (relativeDay ?? 1) - 29)}–${relativeDay}`,
              'monthly',
              monthlyIds,
              50,
              { window: 30, endDay: relativeDay },
            )
          }
        />
      </div>

      {/* Custom range */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-300">
          自訂範圍考試
        </span>
        <h2 className="mt-2 text-xl font-bold">Custom Range Exam</h2>
        <p className="mb-4 mt-1 text-sm text-slate-400">
          Pick any date range — we map it to your study days and pull every root
          word from that window into a randomized exam.
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
            {rangeIds.length} words available in this range
            {customMax > 0 && customMax < count && ` (exam will use ${customMax})`}
          </span>
          <button
            disabled={rangeIds.length === 0}
            onClick={() =>
              startQuiz(`Custom Exam · ${from} → ${to}`, 'custom', rangeIds, count, { from, to })
            }
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🎯 Generate custom exam
          </button>
        </div>
        {rangeIds.length === 0 && (
          <p className="mt-2 text-xs text-amber-400">
            No study days fall in this range yet. Pick dates on or after your signup day.
          </p>
        )}
      </section>

      {/* Past results / review (retained for all three modes) */}
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

function ExamCard({ accent, badge, title, desc, stat, cta, disabled, onStart }) {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <span className={`w-fit rounded-md bg-gradient-to-r ${accent} px-2 py-0.5 text-xs font-bold text-white`}>
        {badge}
      </span>
      <h2 className="mt-2 text-xl font-bold">{title}</h2>
      <p className="mt-1 flex-1 text-sm text-slate-400">{desc}</p>
      <p className="mt-3 text-xs text-slate-500">{stat}</p>
      <button
        disabled={disabled}
        onClick={onStart}
        className={`mt-4 rounded-xl bg-gradient-to-r ${accent} px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40`}
      >
        {cta}
      </button>
      {disabled && (
        <p className="mt-2 text-xs text-amber-400">
          Not enough study days yet — keep going!
        </p>
      )}
    </section>
  )
}
