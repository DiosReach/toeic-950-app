import { useEffect, useState } from 'react'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { toKey, todayKey, daysBetween } from '../lib/date'

// Loads users/{uid} to get the registration date, then derives the current
// "Relative Day": RelativeDay = today - registrationDate + 1.
// If the doc is missing createdAt (older accounts), it backfills `now`.
export function useUserProfile(uid) {
  const [registrationDate, setRegistrationDate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    let active = true
    setLoading(true)
    ;(async () => {
      try {
        const ref = doc(db, 'users', uid)
        const snap = await getDoc(ref)
        let createdAt = snap.exists() ? snap.data()?.createdAt : null
        if (!createdAt) {
          // Backfill so every user has a stable Day-1 anchor.
          await setDoc(ref, { createdAt: serverTimestamp() }, { merge: true })
          createdAt = new Date() // serverTimestamp resolves async; use now locally
        }
        const date = typeof createdAt?.toDate === 'function' ? createdAt.toDate() : new Date(createdAt)
        if (active) setRegistrationDate(date)
      } catch {
        if (active) setRegistrationDate(new Date())
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [uid])

  const registrationKey = registrationDate ? toKey(registrationDate) : null
  // At least 1; signups in the future (clock skew) still read as Day 1.
  const relativeDay = registrationKey
    ? Math.max(1, daysBetween(registrationKey, todayKey()) + 1)
    : null

  return { registrationDate, registrationKey, relativeDay, profileLoading: loading }
}
