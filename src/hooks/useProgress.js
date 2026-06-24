import { useCallback, useEffect, useRef, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { DAILY_GOAL } from '../data/words'
import { todayKey, yesterdayKey } from '../lib/date'

// ─────────────────────────────────────────────────────────────
// Firestore document path:  users/{uid}/progress/state
// Every user reads & writes ONLY this path. Combined with the
// security rules in README.md (request.auth.uid == uid), this
// guarantees each account's data is strictly isolated.
// ─────────────────────────────────────────────────────────────
const progressRef = (uid) => doc(db, 'users', uid, 'progress', 'state')

const MAX_QUIZ_HISTORY = 50

const DEFAULT_PROGRESS = {
  mastered: [], // wordIds the user knows (daily + root words)
  reviewing: [], // wordIds the user wants to revisit
  starred: [], // wordIds the user bookmarked
  streak: 0, // consecutive days the daily goal was met
  lastCompletedDate: null, // 'YYYY-MM-DD' of last completed goal
  dailyDate: null, // 'YYYY-MM-DD' that `studiedToday` belongs to
  studiedToday: [], // distinct wordIds actioned today (counts toward goal)
  history: {}, // { 'YYYY-MM-DD': { studied: [ids], goalMet: bool, goal } }
  quizzes: [], // saved quiz/exam results (newest first)
  unlockedRoots: [], // rootIds the user has "generated"/unlocked
  unlockedDay: 1, // highest study day unlocked (advances by passing the daily quiz)
}

const addUnique = (arr, id) => (arr.includes(id) ? arr : [...arr, id])
const remove = (arr, id) => arr.filter((x) => x !== id)

/**
 * Loads a user's progress from Firestore and exposes mutators that
 * persist every change back to the cloud (write-through). All new
 * collections — history, quizzes, unlockedRoots — sync the same way,
 * scoped to the signed-in uid.
 *
 * @param {string|undefined} uid  Firebase auth uid; hook is inert until set.
 */
export function useProgress(uid) {
  const [progress, setProgress] = useState(DEFAULT_PROGRESS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Holds the freshest state so async mutators never act on stale closures.
  const stateRef = useRef(DEFAULT_PROGRESS)
  // The active day's goal = the size of that day's root family. The view that
  // knows the current day (StudyView) sets this; the streak/goal logic reads it.
  const [activeDayGoal, setActiveDayGoalState] = useState(DAILY_GOAL)
  const dayGoalRef = useRef(DAILY_GOAL)
  const setActiveDayGoal = useCallback((n) => {
    if (!n || n === dayGoalRef.current) return
    dayGoalRef.current = n
    setActiveDayGoalState(n)
  }, [])

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

  // Count a word toward today's goal, roll the streak, and log to history.
  const registerDailyActivity = (state, wordId) => {
    const today = todayKey()
    const dayGoal = dayGoalRef.current
    const sameDay = state.dailyDate === today
    const studiedToday = sameDay ? addUnique(state.studiedToday, wordId) : [wordId]

    const goalMet = studiedToday.length >= dayGoal
    const changes = {
      dailyDate: today,
      studiedToday,
      // Deep-merge the day's record into the history map (full object kept
      // locally so other dates aren't lost on the optimistic update).
      history: {
        ...state.history,
        [today]: { studied: studiedToday, goalMet, goal: dayGoal },
      },
    }

    const justHitGoal = goalMet && state.lastCompletedDate !== today
    const alreadyCountedToday = (sameDay ? state.studiedToday.length : 0) >= DAILY_GOAL
    if (justHitGoal && !alreadyCountedToday) {
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

  /** "Generate"/unlock an etymology root so its words join the study list. */
  const unlockRoot = useCallback(
    (rootId) => {
      const s = stateRef.current
      if (s.unlockedRoots.includes(rootId)) return Promise.resolve()
      return persist({ unlockedRoots: addUnique(s.unlockedRoots, rootId) })
    },
    [persist],
  )

  /** Save a completed quiz/exam result (kept newest-first, capped). */
  const addQuizResult = useCallback(
    (quiz) => {
      const s = stateRef.current
      const quizzes = [quiz, ...s.quizzes].slice(0, MAX_QUIZ_HISTORY)
      return persist({ quizzes })
    },
    [persist],
  )

  /**
   * Advance the study day. Called when the daily Lock-Unlock quiz is passed
   * (and by the Dev skip button). Persists the new highest unlocked day.
   * @param {number} [to] optional explicit day; defaults to current + 1
   */
  const unlockNextDay = useCallback(
    (to) => {
      const current = stateRef.current.unlockedDay || 1
      const next = Math.max(current + 1, to || 0)
      return persist({ unlockedDay: next })
    },
    [persist],
  )

  return {
    progress,
    loading,
    error,
    setStatus,
    toggleStar,
    unlockRoot,
    addQuizResult,
    unlockNextDay,
    unlockedDay: progress.unlockedDay || 1,
    setActiveDayGoal,
    dailyGoal: activeDayGoal,
    studiedTodayCount: progress.dailyDate === todayKey() ? progress.studiedToday.length : 0,
  }
}
