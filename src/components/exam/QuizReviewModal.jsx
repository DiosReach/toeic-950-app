import { ALL_WORDS_BY_ID } from '../../data/catalog'
import AudioPhonetics from '../AudioPhonetics'

// Review modal: inspect each question, with the user's answer in RED (when
// wrong) and the correct answer in GREEN, plus the word's full
// etymology/explanation. `quiz.questions[i]` carries { wordId, prompt,
// options, correctIndex, chosenIndex }.
export default function QuizReviewModal({ quiz, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="scrollbar-slim my-8 w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-slate-800 bg-slate-900/95 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="text-lg font-bold">{quiz.title}</h2>
            <p className="text-sm text-slate-400">
              Scored {quiz.score} / {quiz.total} ·{' '}
              {new Date(quiz.date).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Questions */}
        <div className="space-y-5 p-6">
          {quiz.questions.map((q, i) => {
            const word = ALL_WORDS_BY_ID[q.wordId]
            const correct = q.chosenIndex === q.correctIndex
            return (
              <div
                key={i}
                className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Q{i + 1}</span>
                    <span className="text-lg font-bold text-white">{q.prompt}</span>
                    <span className={correct ? 'text-emerald-400' : 'text-rose-400'}>
                      {correct ? '✓' : '✗'}
                    </span>
                  </div>
                  {word && <AudioPhonetics word={word} size="sm" />}
                </div>

                <ul className="space-y-1.5">
                  {q.options.map((opt, idx) => {
                    const isCorrect = idx === q.correctIndex
                    const isChosen = idx === q.chosenIndex
                    let cls = 'border-slate-800 bg-slate-900 text-slate-300'
                    if (isCorrect) cls = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    else if (isChosen) cls = 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                    return (
                      <li
                        key={idx}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${cls}`}
                      >
                        <span>{opt.text}</span>
                        <span className="ml-3 shrink-0 text-xs font-semibold">
                          {isCorrect ? 'Correct' : isChosen ? 'Your answer' : ''}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                {/* Etymology / explanation */}
                {word && (
                  <div className="mt-3 rounded-lg bg-slate-800/50 px-3 py-2 text-xs text-slate-300">
                    {word.note && <p className="mb-1 text-indigo-300">🧬 {word.note}</p>}
                    <p className="italic text-slate-400">“{word.example}”</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
