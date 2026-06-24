// ─────────────────────────────────────────────────────────────
// Firebase initialization
// ─────────────────────────────────────────────────────────────
// Values are read from environment variables (see .env.example).
// Copy .env.example -> .env and plug in your own web config, then
// restart the dev server. Nothing else in the app needs editing.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Helpful guard during development: if the API key is still a placeholder,
// surface a clear message in the console instead of a cryptic Firebase error.
// Matches "your-api-key", "YOUR_API_KEY", etc. case-insensitively.
const apiKey = String(firebaseConfig.apiKey || '')
export const isFirebaseConfigured = Boolean(
  apiKey && !/your[_-]?api[_-]?key/i.test(apiKey),
)

if (!isFirebaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Firebase] Config missing or still using placeholders.\n' +
      'Copy .env.example to .env and add your Firebase web config, then restart the dev server.',
  )
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
