import { useState } from 'react'
import { useProgressContext } from '../../context/ProgressContext'
import { useTranslations } from '../../hooks/useTranslations'
import { translateSentence, lookupWord, looksLikeWord } from '../../lib/translate'
import { speak, speechSupported } from '../../lib/tts'

export default function TranslateView() {
  const { uid } = useProgressContext()
  const { items, save, remove } = useTranslations(uid)

  const [direction, setDirection] = useState('en2zh') // 'en2zh' | 'zh2en'
  const [mode, setMode] = useState('sentence') // 'sentence' | 'word'
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const isEn2Zh = direction === 'en2zh'
  const sourceLang = isEn2Zh ? 'English' : '繁體中文'
  const targetLang = isEn2Zh ? '繁體中文' : 'English'

  const reset = () => {
    setResult(null)
    setError('')
  }

  const handleTranslate = async () => {
    const text = input.trim()
    if (!text) return
    setBusy(true)
    setError('')
    setResult(null)
    try {
      if (mode === 'word') {
        if (!looksLikeWord(text)) {
          setError('Word Mode expects a single word. Switch to Sentence Mode for phrases.')
          setBusy(false)
          return
        }
        const card = await lookupWord(text, direction)
        setResult({ mode: 'word', source: text, ...card })
      } else {
        const out = await translateSentence(text, direction)
        setResult({ mode: 'sentence', ...out })
      }
    } catch {
      setError('Translation service is unavailable right now. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const saveCurrent = () => {
    if (!result) return
    save({
      mode: result.mode,
      direction,
      source: result.source,
      meaning: result.meaning,
      audioText: result.audioText || null,
      pos: result.pos || null,
      example: result.example || null,
      rootHint: result.rootHint || null,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">智慧雙模翻譯中心</h1>
        <p className="text-sm text-slate-400">
          Smart dual-mode translation · {sourceLang} → {targetLang}
        </p>
      </div>

      {/* Controls: direction + mode */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Direction toggle */}
        <div className="inline-flex items-center rounded-xl bg-slate-800/70 p-1 text-sm font-semibold">
          {[
            { key: 'en2zh', label: 'English ➔ 中文' },
            { key: 'zh2en', label: '中文 ➔ English' },
          ].map((d) => (
            <button
              key={d.key}
              onClick={() => {
                setDirection(d.key)
                setInput('')
                reset()
              }}
              className={`rounded-lg px-4 py-2 transition ${
                direction === d.key ? 'bg-fuchsia-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Mode toggle */}
        <div className="inline-flex rounded-xl bg-slate-800/70 p-1 text-sm font-semibold">
          {[
            { key: 'word', label: '單字查詢 · Word' },
            { key: 'sentence', label: '整句翻譯 · Sentence' },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setMode(m.key)
                reset()
              }}
              className={`rounded-lg px-4 py-2 transition ${
                mode === m.key ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            {sourceLang} {mode === 'word' ? '(single word)' : '(paragraph or sentence)'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (mode === 'word' && e.key === 'Enter') {
                e.preventDefault()
                handleTranslate()
              }
            }}
            placeholder={
              mode === 'word'
                ? isEn2Zh
                  ? 'e.g. negotiate'
                  : '例如：談判'
                : isEn2Zh
                  ? 'Paste a business paragraph to translate into Traditional Chinese…'
                  : '貼上中文段落，翻譯成英文…'
            }
            rows={mode === 'word' ? 3 : 8}
            className="scrollbar-slim flex-1 resize-none rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
          />
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleTranslate}
              disabled={busy || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Translating…' : 'Translate'}
            </button>
            {input && (
              <button
                onClick={() => {
                  setInput('')
                  reset()
                }}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {targetLang} Result
            </span>
            {result && (
              <div className="flex items-center gap-1.5">
                {/* 🔊 always reads the ENGLISH side, in either direction */}
                <AudioBtn label="US" onClick={() => speak(result.audioText, 'en-US')} />
                <AudioBtn label="UK" onClick={() => speak(result.audioText, 'en-GB')} />
                <button
                  onClick={saveCurrent}
                  title="Save to history"
                  className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-slate-700"
                >
                  ★ Save
                </button>
              </div>
            )}
          </div>

          <div className="scrollbar-slim flex-1 overflow-y-auto rounded-xl bg-slate-950/40 p-4">
            {error ? (
              <p className="text-sm text-rose-400">{error}</p>
            ) : busy ? (
              <p className="animate-pulse text-sm text-slate-500">Working…</p>
            ) : !result ? (
              <p className="text-sm text-slate-600">
                Translation appears here. 🔊 always reads the English text aloud.
              </p>
            ) : result.mode === 'word' ? (
              <WordResult result={result} />
            ) : (
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-white">
                {result.meaning}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      <section>
        <h2 className="mb-3 text-lg font-bold">⭐ Saved history</h2>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 py-10 text-center text-slate-500">
            No saved translations yet.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-400">
                      {it.mode}
                    </span>
                    <span className="truncate font-semibold text-white">{it.source}</span>
                    <AudioBtn label="US" onClick={() => speak(it.audioText || it.source, 'en-US')} small />
                    <AudioBtn label="UK" onClick={() => speak(it.audioText || it.source, 'en-GB')} small />
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-300">{it.meaning}</p>
                </div>
                <button
                  onClick={() => remove(it.id)}
                  className="shrink-0 text-slate-500 hover:text-rose-400"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function WordResult({ result }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-extrabold text-white">{result.word}</h3>
        {result.pos && (
          <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium uppercase text-slate-400">
            {result.pos}
          </span>
        )}
      </div>
      <p className="text-xl text-white">{result.meaning}</p>
      {result.rootHint && (
        <p className="rounded-lg bg-slate-800/60 px-3 py-1.5 text-xs text-indigo-300">
          🧬 {result.rootHint}
        </p>
      )}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Example</p>
        <p className="text-sm italic text-slate-300">“{result.example}”</p>
      </div>
    </div>
  )
}

function AudioBtn({ label, onClick, small }) {
  return (
    <button
      onClick={onClick}
      disabled={!speechSupported}
      title={`Play ${label} audio`}
      className={`inline-flex items-center gap-0.5 rounded-full bg-slate-800 font-semibold text-slate-200 transition hover:bg-indigo-600 disabled:opacity-40 ${
        small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
      }`}
    >
      🔊 {label}
    </button>
  )
}
