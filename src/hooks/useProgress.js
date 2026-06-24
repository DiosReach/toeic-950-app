import { useCallback, useEffect, useRef, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { DAILY_GOAL } from '../data/words'

// ─────────────────────────────────────────────────────────────
// Firestore document path:  users/{uid}/progress/state
// Every user reads & writes ONLY this path. Combined with the
// security rules in README.md (which require request.auth.uid == uid),
// this guarantees each account's data is strictly isolated.
// ─────────────────────────────────────────────────────────────
const progressRef = (uid) => doc(db, 'users', uid, 'progress', 'state')

const DEFAULT_PROGRESS = {
  mastered: [], // wordIds the user knows
  reviewing: [], // wordIds the user wants to revisit
  starred: [], // wordIds the user bookmarked
  streak: 0, // consecutive days the daily goal was met
  lastCompletedDate: null, // 'YYYY-MM-DD' of last completed goal
  dailyDate: null, // 'YYYY-MM-DD' that `studiedToday` belongs to
  studiedToday: [], // distinct wordIds actioned today (counts toward goal)
}

// ── small date helpers (local time, YYYY-MM-DD) ──────────────
const toKey = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
const todayKey = () => toKey(new Date())
const yesterdayKey = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toKey(d)
}

const addUnique = (arr, id) => (arr.includes(id) ? arr : [...arr, id])
const remove = (arr, id) => arr.filter((x) => x !== id)

/**
 * Loads a user's progress from Firestore and exposes mutators that
 * persist every change back to the cloud (write-through).
 *
 * @param {string|undefined} uid  Firebase auth uid; hook is inert until set.
 */
export function useProgress(uid) {
  const [progress, setProgress] = useState(DEFAULT_PROGRESS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Holds the freshest state so async mutators never act on stale closures.
  const stateRef = useRef(DEFAULT_PROGRESS)

  const apply = useCallback((next) => {
    stateRef.current = next
    setProgress(next)
  }, [])

  // ── Initial fetch when a user signs in ─────────────────────
  useEffect(() => {
    if (!uid) return
    let active = true
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const snap = await getDoc(progressRef(uid))
        if (!active) return
        if (snap.exists()) {
          // Merge with defaults so newly added fields always exist.
          apply({ ...DEFAULT_PROGRESS, ...snap.data() })
        } else {
          // First login for this account: seed an empty progress doc.
          const seed = { ...DEFAULT_PROGRESS }
          await setDoc(progressRef(uid), { ...seed, updatedAt: serverTimestamp() })
          if (active) apply(seed)
        }
      } catch (err) {
        if (active) setError(err)
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [uid, apply])

  // Persist a partial update to Firestore and local state together.
  const persist = useCallback(
    async (changes) => {
      if (!uid) return
      const next = { ...stateRef.current, ...changes }
      apply(next) // optimistic local update
      try {
        await setDoc(
          progressRef(uid),
          { ...changes, updatedAt: serverTimestamp() },
          { merge: true },
        )
      } catch (err) {
        setError(err)
      }
    },
    [uid, apply],
  )

  // Count a word toward today's 30-word goal and roll the streak forward.
  const registerDailyActivity = (state, wordId) => {
    const today = todayKey()
    // New day → reset the daily counter.
    const sameDay = state.dailyDate === today
    const studiedToday = sameDay ? addUnique(state.studiedToday, wordId) : [wordId]

    const changes = { dailyDate: today, studiedToday }

    const justHitGoal =
      studiedToday.length >= DAILY_GOAL && state.lastCompletedDate !== today
    const alreadyCountedToday =
      (sameDay ? state.studiedToday.length : 0) >= DAILY_GOAL

    if (justHitGoal && !alreadyCountedToday) {
      // Increment streak if yesterday was also completed, else restart at 1.
      changes.streak = state.lastCompletedDate === yesterdayKey() ? state.streak + 1 : 1
      changes.lastCompletedDate = today
    }
    return changes
  }

  // ── Public mutators ────────────────────────────────────────

  /** Mark a word as mastered / reviewing / or clear its status ('none'). */
  const setStatus = useCallback(
    (wordId, status) => {
      const s = stateRef.current
      let mastered = remove(s.mastered, wordId)
      let reviewing = remove(s.reviewing, wordId)
      if (status === 'mastered') mastered = addUnique(mastered, wordId)
      if (status === 'reviewing') reviewing = addUnique(reviewing, wordId)

      const changes = { mastered, reviewing }
      // Mastering or marking for review counts as "studying" the word today.
      if (status === 'mastered' || status === 'reviewing') {
        Object.assign(changes, registerDailyActivity(s, wordId))
      }
      return persist(changes)
    },
    [persist],
  )

  /** Toggle the star/bookmark on a word. */
  const toggleStar = useCallback(
    (wordId) => {
      const s = stateRef.current
      const starred = s.starred.includes(wordId)
        ? remove(s.starred, wordId)
        : addUnique(s.starred, wordId)
      return persist({ starred })
    },
    [persist],
  )

  return {
    progress,
    loading,
    error,
    setStatus,
    toggleStar,
    dailyGoal: DAILY_GOAL,
    studiedTodayCount:
      progress.dailyDate === todayKey() ? progress.studiedToday.length : 0,
  }
}
