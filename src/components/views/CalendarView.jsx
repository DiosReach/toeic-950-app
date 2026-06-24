import { useMemo, useState } from 'react'
import { useProgressContext } from '../../context/ProgressContext'
import { useGeneratedDay } from '../../hooks/useGeneratedDay'
import { toKey, todayKey, daysBetween, MONTHS, WEEKDAYS } from '../../lib/date'
import WordCard from '../WordCard'

function buildMonthCells(cursor) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const start = new Date(year, month, 1 - firstDay)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export default function CalendarView() {
  const { progress, setStatus, toggleStar, uid, registrationKey } = useProgressContext()
  const [cursor, setCursor] = useState(new Date())
  const [selectedKey, setSelectedKey] = useState(todayKey())

  const cells = useMemo(() => buildMonthCells(cursor), [cursor])
  const today = todayKey()

  // Relative day for a date key: Day 1 == registration date.
  const relDayOf = (key) =>
    registrationKey ? daysBetween(registrationKey, key) + 1 : null

  const selectedRel = relDayOf(selectedKey)
  const isFuture = selectedKey > today
  const beforeStart = selectedRel != null && selectedRel < 1
  // Only load a generated day for valid, unlocked (non-future) days.
  const loadDay = !isFuture && !beforeStart ? selectedRel : null
  const { day: dayData, loading } = useGeneratedDay(uid, loadDay)

  const statusOf = (id) =>
    progress.mastered.includes(id)
      ? 'mastered'
      : progress.reviewing.includes(id)
        ? 'reviewing'
        : 'none'

  const shiftMonth = (delta) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1))

  const selectedDate = (() => {
    const [y, m, d] = selectedKey.split('-').map(Number)
    return new Date(y, m - 1, d)
  })()
  const record = progress.history[selectedKey]

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      {/* Calendar */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => shiftMonth(-1)} className="h-8 w-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700">‹</button>
          <h2 className="text-lg font-bold">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </h2>
          <button onClick={() => shiftMonth(1)} className="h-8 w-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700">›</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-slate-500">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">{w}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d) => {
            const key = toKey(d)
            const inMonth = d.getMonth() === cursor.getMonth()
            const rel = relDayOf(key)
            const future = key > today
            const before = rel != null && rel < 1
            const rec = progress.history[key]
            const isSelected = key === selectedKey
            const isDayOne = rel === 1
            const disabled = future || before

            return (
              <button
                key={key}
                disabled={disabled}
                onClick={() => !disabled && setSelectedKey(key)}
                title={
                  future ? 'Locked — stay on schedule!' : rel >= 1 ? `Day ${rel}` : ''
                }
                className={`relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition ${
                  isSelected
                    ? 'bg-indigo-500 text-white'
                    : disabled
                      ? 'cursor-not-allowed text-slate-700'
                      : inMonth
                        ? 'text-slate-200 hover:bg-slate-800'
                        : 'text-slate-600 hover:bg-slate-800/50'
                } ${isDayOne && !isSelected ? 'ring-1 ring-fuchsia-400/70' : ''}`}
              >
                <span>{d.getDate()}</span>
                {rel >= 1 && !future && (
                  <span className="text-[8px] leading-none text-slate-500">
                    {isDayOne ? 'D1' : `D${rel}`}
                  </span>
                )}
                {future && <span className="text-[8px] leading-none">🔒</span>}
                {rec && (
                  <span
                    className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                      rec.goalMet ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> goal met</span>
          <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> studied</span>
          <span className="flex items-center gap-1.5">🔒 locked</span>
          <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded ring-1 ring-fuchsia-400/70" /> Day 1</span>
        </div>
      </section>

      {/* Selected day detail */}
      <section>
        <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-2">
            {selectedRel >= 1 && !isFuture && (
              <span className="rounded-lg bg-indigo-500/15 px-2 py-0.5 text-xs font-bold text-indigo-300">
                Day {selectedRel}
              </span>
            )}
            {dayData && (
              <span className="rounded-lg bg-fuchsia-500/15 px-2 py-0.5 text-xs font-bold text-fuchsia-300">
                Tier {dayData.tier} · Target {dayData.target}
              </span>
            )}
          </div>
          <h2 className="mt-2 text-lg font-bold">
            {selectedDate.toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            })}
          </h2>
          {isFuture ? (
            <p className="mt-1 text-sm text-amber-400">
              🔒 This day is locked. Keep your streak — words unlock one day at a time.
            </p>
          ) : beforeStart ? (
            <p className="mt-1 text-sm text-slate-400">Before your registration date.</p>
          ) : record ? (
            <p className="mt-1 text-sm text-slate-400">
              {record.goalMet ? '🎉 Goal met — ' : ''}
              {record.studied.length} of {record.goal} words studied this day.
              {dayData?.topic && <> · 🧬 {dayData.topic.title}</>}
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-400">
              The {dayData?.words.length ?? ''} words allocated for Day {selectedRel}.
              {dayData?.topic && <> · 🧬 {dayData.topic.title}</>}
            </p>
          )}
        </div>

        {isFuture || beforeStart ? null : loading ? (
          <div className="py-16 text-center text-slate-500 animate-pulse">Loading day…</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(dayData?.words || []).map((w) => (
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
        )}
      </section>
    </div>
  )
}
