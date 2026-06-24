// Unified word catalog: the daily TOEIC list + all etymology root words.
// Use this for any lookup that must resolve BOTH sources (mastered lists,
// quiz questions, calendar history, exam review).
import { WORDS } from './words'
import { ROOT_WORDS } from './roots'

export const ALL_WORDS = [...WORDS, ...ROOT_WORDS]

export const ALL_WORDS_BY_ID = ALL_WORDS.reduce((acc, w) => {
  acc[w.id] = w
  return acc
}, {})
