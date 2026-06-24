import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase'

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
        return cred.user
      },
      signIn: (email, password) => signInWithEmailAndPassword(auth, email, password),
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
