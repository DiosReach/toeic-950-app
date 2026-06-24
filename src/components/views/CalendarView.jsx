import { useMemo, useState } from 'react'
import { useProgressContext } from '../../context/ProgressContext'
import { getDailyWordsForDate } from '../../lib/daily'
import { toKey, todayKey, MONTHS, WEEKDAYS } from '../../lib/date'
import WordCard from '../WordCard'

// Build the 6-week grid (42 cells) for the month containing `cursor`.
function buildMonthCells(cursor) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const cells = []
  const start = new Date(year, month, 1 - firstDay)
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    cells.push(d)
  }
  return cells
}

export default function CalendarView() {
  const { progress, setStatus, toggleStar } = useProgressContext()
  const [cursor, setCursor] = useState(new Date())
  const [selectedKey, setSelectedKey] = useState(todayKey())

  const cells = useMemo(() => buildMonthCells(cursor), [cursor])
  const selectedDate = useMemo(() => {
    const [y, m, d] = selectedKey.split('-').map(Number)
    return new Date(y, m - 1, d)
  }, [selectedKey])

  const dayWords = useMemo(() => getDailyWordsForDate(selectedDate), [selectedDate])
  const record = progress.history[selectedKey]

  const statusOf = (id) =>
    progress.mastered.includes(id)
      ? 'mastered'
      : progress.reviewing.includes(id)
        ? 'reviewing'
        : 'none'

  const shiftMonth = (delta) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1))

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      {/* Calendar */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => shiftMonth(-1)}
            className="h-8 w-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            ‹
          </button>
          <h2 className="text-lg font-bold">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </h2>
          <button
            onClick={() => shiftMonth(1)}
            className="h-8 w-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-slate-500">
          {WEEKDAYS.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d) => {
            const key = toKey(d)
            const inMonth = d.getMonth() === cursor.getMonth()
            const rec = progress.history[key]
            const isToday = key === todayKey()
            const isSelected = key === selectedKey
            return (
              <button
                key={key}
                onClick={() => setSelectedKey(key)}
                className={`relative aspect-square rounded-lg text-sm transition ${
                  isSelected
                    ? 'bg-indigo-500 text-white'
                    : inMonth
                      ? 'text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:bg-slate-800/50'
                } ${isToday && !isSelected ? 'ring-1 ring-indigo-400/60' : ''}`}
              >
                {d.getDate()}
                {/* progress dot */}
                {rec && (
                  <span
                    className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                      rec.goalMet ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> goal met
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> studied
          </span>
        </div>
      </section>

      {/* Selected day detail */}
      <section>
        <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-bold">
            {selectedDate.toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h2>
          {record ? (
            <p className="mt-1 text-sm text-slate-400">
              {record.goalMet ? '🎉 Goal met — ' : ''}
              {record.studied.length} of {record.goal} words studied this day.
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-400">
              No study record yet — here is the 30-word list allocated for this day.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {dayWords.map((w) => (
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
      </section>
    </div>
  )
}
