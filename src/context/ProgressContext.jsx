import { createContext, useContext } from 'react'
import { useProgress } from '../hooks/useProgress'

// Calls useProgress ONCE and shares it across every view, so the Study,
// Etymology, Calendar, and Exam tabs all read/write the same Firestore-backed
// state (no duplicate fetches, no diverging copies).
const ProgressContext = createContext(null)

export function ProgressProvider({ uid, children }) {
  const value = useProgress(uid)
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgressContext() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgressContext must be used within a ProgressProvider')
  return ctx
}
