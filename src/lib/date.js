// Shared local-time date helpers. Keys are 'YYYY-MM-DD'.

export const toKey = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const todayKey = () => toKey(new Date())

export const fromKey = (key) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (date, n) => {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export const yesterdayKey = () => toKey(addDays(new Date(), -1))

// Stable index for a calendar day, used to deterministically slice the
// daily word list. Computed from Y/M/D so it's timezone-independent.
export const dayIndexForDate = (date) =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)

// Whole-day difference between two date keys (bKey - aKey).
export const daysBetween = (aKey, bKey) =>
  Math.round((fromKey(bKey).getTime() - fromKey(aKey).getTime()) / 86_400_000)

// Inclusive list of date keys between two keys.
export const keysInRange = (startKey, endKey) => {
  let cur = fromKey(startKey)
  const end = fromKey(endKey)
  const out = []
  while (cur <= end) {
    out.push(toKey(cur))
    cur = addDays(cur, 1)
  }
  return out
}

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
