import { speak, speechSupported } from '../lib/tts'

// Shows KK (US) + DJ/IPA (UK) phonetics with a 🔊 button for each accent.
// `size="sm"` renders a compact inline variant for lists/review screens.
export default function AudioPhonetics({ word, size = 'md' }) {
  const compact = size === 'sm'

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
      <AccentRow
        flag="🇺🇸"
        label="US · KK"
        phonetic={word.kk}
        onPlay={() => speak(word.word, 'en-US')}
        compact={compact}
      />
      <AccentRow
        flag="🇬🇧"
        label="UK · DJ"
        phonetic={word.ipa}
        onPlay={() => speak(word.word, 'en-GB')}
        compact={compact}
      />
    </div>
  )
}

function AccentRow({ flag, label, phonetic, onPlay, compact }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={onPlay}
        disabled={!speechSupported}
        title={speechSupported ? `Play ${label}` : 'Audio not supported in this browser'}
        className={`inline-flex items-center justify-center rounded-full bg-slate-800 text-slate-200 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 ${
          compact ? 'h-6 w-6 text-xs' : 'h-7 w-7'
        }`}
      >
        🔊
      </button>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {flag} {label}
      </span>
      <span className="font-mono text-slate-300">{phonetic}</span>
    </div>
  )
}
