import { useState } from 'react'
import { scoreQuiz } from '../../lib/quiz'
import { ALL_WORDS_BY_ID } from '../../data/catalog'
import { speak } from '../../lib/tts'
import QuizReviewModal from './QuizReviewModal'

// Runs a generated quiz: one question at a time, then a result screen with
// an inline review. On finish it builds the result object and hands it to
// `onFinish` (which persists it to Firestore via the progress hook).
export default function QuizRunner({
  title,
  type,
  meta,
  questions,
  onFinish,
  onExit,
  // Optional "gated" mode (used by the daily Lock-Unlock quiz):
  passThreshold = null, // e.g. 0.8 — when set, show a pass/fail banner
  onRetry = null, // shown on failure to re-attempt with fresh questions
  exitLabel = 'Back to Exam Center',
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(null))
  const [result, setResult] = useState(null) // set once on submit
  const [reviewing, setReviewing] = useState(false)

  const q = questions[index]
  const word = ALL_WORDS_BY_ID[q.wordId]
  const isLast = index === questions.length - 1
  const answered = answers[index] !== null

  const choose = (optIdx) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = optIdx
      return next
    })
  }

  const finish = () => {
    const built = {
      id: `quiz-${Date.now()}`,
      title,
      type,
      meta: meta || null,
      date: new Date().toISOString(),
      total: questions.length,
      score: scoreQuiz(questions, answers),
      questions: questions.map((qq, i) => ({ ...qq, chosenIndex: answers[i] })),
    }
    setResult(built)
    onFinish?.(built)
  }

  // ── Result screen ──────────────────────────────────────────
  if (result) {
    const pct = Math.round((result.score / result.total) * 100)
    const gated = passThreshold != null
    const passed = gated && result.score / result.total >= passThreshold
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
          {title}
        </p>
        <div className="my-4 text-5xl font-extrabold text-white">
          {result.score}
          <span className="text-2xl text-slate-500"> / {result.total}</span>
        </div>
        <p className="text-slate-400">{pct}% correct</p>

        {gated && (
          <div
            className={`mx-auto mt-5 max-w-md rounded-xl px-4 py-3 text-sm font-semibold ${
              passed
                ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40'
                : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40'
            }`}
          >
            {passed
              ? '🎉 Passed! The next day’s root theme is now unlocked.'
              : `Almost there — you need ${Math.ceil(passThreshold * result.total)}/${result.total} to pass. Review your root breakdowns and try again!`}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setReviewing(true)}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-indigo-400 hover:to-fuchsia-400"
          >
            🔍 Review answers
          </button>
          {gated && !passed && onRetry && (
            <button
              onClick={onRetry}
              className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-400"
            >
              🔁 Try again
            </button>
          )}
          <button
            onClick={onExit}
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            {gated && passed ? '➡️ Continue' : exitLabel}
          </button>
        </div>

        {reviewing && (
          <QuizReviewModal quiz={result} onClose={() => setReviewing(false)} />
        )}
      </div>
    )
  }

  // ── Question screen ────────────────────────────────────────
  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onExit}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          ← Exit
        </button>
        <span className="text-sm font-semibold text-slate-400">
          {index + 1} / {questions.length}
        </span>
      </div>

      {/* progress */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
          style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-sm text-slate-400">Choose the correct meaning of:</p>
        <div className="mt-1 flex items-center gap-3">
          <h2 className="text-3xl font-extrabold text-white">{q.prompt}</h2>
          <button
            onClick={() => speak(q.prompt, 'en-US')}
            className="h-8 w-8 rounded-full bg-slate-800 text-slate-200 hover:bg-indigo-600"
            title="Play US audio"
          >
            🔊
          </button>
          {word && (
            <span className="font-mono text-sm text-slate-500">{word.kk}</span>
          )}
        </div>

        <div className="mt-5 space-y-2.5">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => choose(idx)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                answers[index] === idx
                  ? 'border-indigo-500 bg-indigo-500/15 text-white'
                  : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-600'
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-40"
        >
          Previous
        </button>
        {isLast ? (
          <button
            onClick={finish}
            disabled={answers.some((a) => a === null)}
            className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit exam
          </button>
        ) : (
          <button
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={!answered}
            className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
