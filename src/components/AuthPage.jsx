import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { isFirebaseConfigured } from '../firebase'

// Translates Firebase auth error codes into friendly messages.
const friendlyError = (code) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.'
    case 'auth/missing-email':
      return 'Please enter your email address.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

export default function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'reset'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('') // success / confirmation messages
  const [busy, setBusy] = useState(false)

  const isSignup = mode === 'signup'
  const isReset = mode === 'reset'

  const goTo = (next) => {
    setMode(next)
    setError('')
    setInfo('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    try {
      if (isReset) {
        await resetPassword(email.trim())
        setInfo(`If an account exists for ${email.trim()}, a reset link is on its way.`)
      } else if (isSignup) {
        await signUp(email.trim(), password, name.trim())
      } else {
        await signIn(email.trim(), password)
      }
      // On sign in/up success, onAuthStateChanged swaps the screen automatically.
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setBusy(false)
    }
  }

  const title = isReset ? 'Reset your password' : 'TOEIC Vocab Cloud'
  const subtitle = isReset
    ? 'We’ll email you a link to set a new password.'
    : '30 words a day, synced to your account.'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-950 relative overflow-hidden">
      {/* ambient gradient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
            <span className="text-2xl font-extrabold">T</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur">
          {/* Mode toggle — hidden on the reset screen */}
          {!isReset && (
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-800/70 p-1 text-sm font-semibold">
              <button
                type="button"
                onClick={() => goTo('login')}
                className={`rounded-lg py-2 transition ${
                  !isSignup ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => goTo('signup')}
                className={`rounded-lg py-2 transition ${
                  isSignup ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {!isFirebaseConfigured && (
            <div className="mb-5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Firebase isn’t configured yet. Add your web config to <code>.env</code> and
              restart the dev server.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <Field
                label="Display name"
                type="text"
                value={name}
                onChange={setName}
                placeholder="Alex"
                autoComplete="name"
                required
              />
            )}
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            {!isReset && (
              <div>
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                />
                {!isSignup && (
                  <div className="mt-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => goTo('reset')}
                      className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      忘記密碼 · Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy
                ? 'Please wait…'
                : isReset
                  ? 'Send reset link'
                  : isSignup
                    ? 'Create account'
                    : 'Log in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {isReset ? (
              <>
                Remembered it?{' '}
                <button
                  onClick={() => goTo('login')}
                  className="font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Back to log in
                </button>
              </>
            ) : isSignup ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => goTo('login')}
                  className="font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                New here?{' '}
                <button
                  onClick={() => goTo('signup')}
                  className="font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Create one
                </button>
              </>
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Your progress is private to your account.
        </p>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
      />
    </label>
  )
}
