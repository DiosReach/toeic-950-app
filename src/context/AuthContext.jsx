import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

// Ensure a users/{uid} profile doc exists with a createdAt baseline.
// New accounts get createdAt = now; pre-existing accounts that never had the
// field fall back to the current timestamp on first load. This date is the
// anchor for the "Registration Day = Day 1" calendar.
async function ensureUserProfile(user, extra = {}) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists() || !snap.data()?.createdAt) {
    await setDoc(
      ref,
      {
        email: user.email,
        displayName: user.displayName || extra.displayName || null,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    )
  }
}

const AuthContext = createContext(null)

/**
 * Provides the current Firebase user + auth actions to the whole app.
 * `loading` is true until Firebase resolves the initial auth state, which
 * prevents the login screen from flashing for already-signed-in users.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fires immediately with the persisted user (or null), then on every
    // sign-in / sign-out. This is the single source of truth for auth state.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      signUp: async (email, password, displayName) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        if (displayName) {
          await updateProfile(cred.user, { displayName })
          // Reflect the new display name locally without waiting for a reload.
          setUser({ ...cred.user })
        }
        // Save the registration baseline (Day 1 anchor) to Firestore.
        await ensureUserProfile(cred.user, { displayName })
        return cred.user
      },
      signIn: async (email, password) => {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        // Backfill createdAt for accounts made before this feature existed.
        await ensureUserProfile(cred.user)
        return cred.user
      },
      resetPassword: (email) => sendPasswordResetEmail(auth, email),
      logout: () => signOut(auth),
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
