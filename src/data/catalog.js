// Unified word catalog: daily list + etymology root words + tiered bank.
// Use this for any lookup that must resolve EVERY source (mastered lists,
// quiz questions, calendar history, generated days, exam review).
import { WORDS } from './words'
import { ROOT_WORDS } from './roots'
import { TIER2_WORDS, TIER3_WORDS } from './wordbank'

export const ALL_WORDS = [...WORDS, ...ROOT_WORDS, ...TIER2_WORDS, ...TIER3_WORDS]

export const ALL_WORDS_BY_ID = ALL_WORDS.reduce((acc, w) => {
  acc[w.id] = w
  return acc
}, {})
