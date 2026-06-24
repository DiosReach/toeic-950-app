import AudioPhonetics from './AudioPhonetics'

// Presentational card for a single vocabulary word.
// Now shows dual phonetics (KK/DJ) + US/UK audio. All state lives in the
// parent; this only renders + emits events.
export default function WordCard({ word, status, starred, onSetStatus, onToggleStar }) {
  const isMastered = status === 'mastered'
  const isReviewing = status === 'reviewing'

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-700 hover:bg-slate-900 animate-fade-in">
      {/* Star */}
      <button
        onClick={() => onToggleStar(word.id)}
        title={starred ? 'Remove star' : 'Star this word'}
        className={`absolute right-4 top-4 text-xl transition ${
          starred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
        }`}
      >
        {starred ? '★' : '☆'}
      </button>

      <div className="flex items-baseline gap-2 pr-8">
        <h3 className="text-xl font-bold text-white">{word.word}</h3>
        <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {word.pos}
        </span>
      </div>

      {/* Dual phonetics + dual audio */}
      <div className="mt-2">
        <AudioPhonetics word={word} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-300">{word.definition}</p>
      <p className="mt-2 text-sm italic text-slate-500">“{word.example}”</p>

      {word.note && (
        <p className="mt-2 rounded-lg bg-slate-800/60 px-3 py-1.5 text-xs text-indigo-300">
          🧬 {word.note}
        </p>
      )}

      {/* Status controls */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onSetStatus(word.id, isReviewing ? 'none' : 'reviewing')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            isReviewing
              ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isReviewing ? '🔁 Reviewing' : 'Review'}
        </button>
        <button
          onClick={() => onSetStatus(word.id, isMastered ? 'none' : 'mastered')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            isMastered
              ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {isMastered ? '✓ Mastered' : 'Mastered'}
        </button>
      </div>
    </div>
  )
}
