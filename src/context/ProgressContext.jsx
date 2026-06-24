import { createContext, useContext } from 'react'
import { useProgress } from '../hooks/useProgress'
import { useUserProfile } from '../hooks/useUserProfile'

// Calls useProgress + useUserProfile ONCE and shares them across every view,
// so the Study, Etymology, Calendar, Exam, and Translate tabs all read/write
// the same Firestore-backed state (no duplicate fetches, no diverging copies)
// and agree on the user's registration date / relative study day.
const ProgressContext = createContext(null)

export function ProgressProvider({ uid, children }) {
  const progress = useProgress(uid)
  const profile = useUserProfile(uid)
  const value = { ...progress, ...profile, uid }
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgressContext() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgressContext must be used within a ProgressProvider')
  return ctx
}
