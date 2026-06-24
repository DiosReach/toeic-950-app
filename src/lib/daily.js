import { WORDS, DAILY_GOAL } from '../data/words'
import { dayIndexForDate } from './date'

// Deterministic daily word slice for any calendar date. The same date always
// yields the same 30-word list, so the Calendar can show "the list studied or
// scheduled for that day" reliably (past, present, or future).
export function getDailyWordsForDate(date) {
  const idx = dayIndexForDate(date)
  const size = Math.min(DAILY_GOAL, WORDS.length)
  const start = ((idx * DAILY_GOAL) % WORDS.length + WORDS.length) % WORDS.length
  const out = []
  for (let i = 0; i < size; i++) {
    out.push(WORDS[(start + i) % WORDS.length])
  }
  return out
}

export const getTodayWords = () => getDailyWordsForDate(new Date())
