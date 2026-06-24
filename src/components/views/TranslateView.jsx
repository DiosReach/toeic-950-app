import { useState } from 'react'
import { useProgressContext } from '../../context/ProgressContext'
import { useTranslations } from '../../hooks/useTranslations'
import { generateVariants } from '../../lib/translate'
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
      const out = await generateVariants(text, direction)
      setResult({ mode, ...out })
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
      isCurated: result.isCurated,
      // Persist all three versions so history shows the full set.
      versions: result.versions.map((v) => ({ key: v.key, en: v.en, zh: v.zh })),
      // a flat meaning for compact history rows
      meaning: result.versions.map((v) => v.en).join(' · '),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">智慧雙模翻譯中心</h1>
        <p className="text-sm text-slate-400">
          Triple-version localized translation · 美式口語 / 英式口語 / 商務正式
        </p>
      </div>

      {/* Controls: direction + mode */}
      <div className="flex flex-wrap items-center gap-3">
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
      <div className="grid gap-4 lg:grid-cols-2">
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
                  ? 'e.g. schedule'
                  : '例如：開會'
                : isEn2Zh
                  ? 'Type something to render in US / UK / formal styles…'
                  : '輸入中文，轉成美式 / 英式 / 商務英文…'
            }
            rows={mode === 'word' ? 3 : 7}
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

        {/* Output: triple-version cards */}
        <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              三版本並列輸出
            </span>
            {result && (
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    result.isCurated
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {result.isCurated ? '✦ curated' : 'auto'}
                </span>
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

          {error ? (
            <p className="rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400">{error}</p>
          ) : busy ? (
            <p className="animate-pulse rounded-xl bg-slate-950/40 p-4 text-sm text-slate-500">
              Working…
            </p>
          ) : !result ? (
            <p className="rounded-xl bg-slate-950/40 p-4 text-sm text-slate-600">
              Three versions appear here — 🇺🇸 US casual, 🇬🇧 UK casual, and 💼 formal —
              each with its own 🔊 in the right accent.
            </p>
          ) : (
            <div className="space-y-3">
              {result.versions.map((v) => (
                <VersionCard key={v.key} v={v} />
              ))}
            </div>
          )}
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
                  <p className="truncate font-semibold text-white">{it.source}</p>
                  {Array.isArray(it.versions) ? (
                    <div className="mt-1 space-y-0.5">
                      {it.versions.map((v) => (
                        <p key={v.key} className="truncate text-xs text-slate-400">
                          {VERSION_FLAG[v.key]} {v.en}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 truncate text-sm text-slate-300">{it.meaning}</p>
                  )}
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

const VERSION_FLAG = { us: '🇺🇸', uk: '🇬🇧', formal: '💼' }

function VersionCard({ v }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{v.flag}</span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">{v.label}</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">{v.sub}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Smart audio: play THIS version's English in its native accent. */}
          {v.key === 'formal' ? (
            <>
              <AudioBtn label="US" onClick={() => speak(v.audioText, 'en-US')} />
              <AudioBtn label="UK" onClick={() => speak(v.audioText, 'en-GB')} />
            </>
          ) : (
            <AudioBtn
              label={v.key === 'us' ? 'US' : 'UK'}
              onClick={() => speak(v.audioText, v.accent)}
            />
          )}
        </div>
      </div>
      <p className="text-lg font-semibold leading-snug text-white">{v.en}</p>
      <p className="mt-1 text-sm text-slate-400">{v.zh}</p>
    </div>
  )
}

function AudioBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!speechSupported}
      title={`Play ${label} audio`}
      className="inline-flex items-center gap-0.5 rounded-full bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:bg-indigo-600 disabled:opacity-40"
    >
      🔊 {label}
    </button>
  )
}
