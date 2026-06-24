# TOEIC Vocab Cloud

A multi-user TOEIC vocabulary trainer. Each person signs in with their own
email/password account, and their progress — **30 words/day goal, streak,
mastered list, reviewing list, and starred words** — is stored privately in
**Cloud Firestore**, keyed by their Firebase `uid`. No more shared
`localStorage`.

Built with **Vite + React + Tailwind CSS + Firebase**.

---

## 1. Install

```bash
npm install
```

## 2. Create a Firebase project

1. Open the [Firebase Console](https://console.firebase.google.com/) → **Add project**.
2. **Build → Authentication → Get started →** enable **Email/Password**.
3. **Build → Firestore Database → Create database** (Production mode is fine).
4. **Project settings (⚙️) → Your apps → Web (`</>`)** → register an app and
   copy the `firebaseConfig` values.

## 3. Add your config

```bash
cp .env.example .env
```

Open `.env` and paste your values:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> Vite only exposes variables prefixed with `VITE_`. These web keys are safe to
> ship in client code — real security comes from the Firestore rules below.

## 4. Lock down data with Security Rules (important!)

In **Firestore → Rules**, paste this and **Publish**. It guarantees each
account can only read/write its own document — your data and your friend's data
are strictly isolated:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // A user may only touch documents under their own uid.
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

## 5. Run

```bash
npm run dev
```

Open the printed URL, create an account, and start studying. Have your friend
create their **own** account on the same deployed site — their progress lives at
a separate `users/{their-uid}` path.

---

## Data model

```
users/{uid}/progress/state
  ├─ mastered:          string[]   // word ids
  ├─ reviewing:         string[]   // word ids
  ├─ starred:           string[]   // word ids
  ├─ streak:            number     // consecutive days the 30-word goal was met
  ├─ lastCompletedDate: string     // 'YYYY-MM-DD'
  ├─ dailyDate:         string     // day that studiedToday belongs to
  ├─ studiedToday:      string[]   // distinct words studied today (toward goal)
  └─ updatedAt:         timestamp
```

## Where things live

| File | Responsibility |
| --- | --- |
| `src/firebase.js` | Initializes Firebase from `import.meta.env` |
| `src/context/AuthContext.jsx` | Auth state + sign in / sign up / log out |
| `src/hooks/useProgress.js` | Fetch + write-through save of Firestore progress |
| `src/components/AuthPage.jsx` | Login / sign-up gateway UI |
| `src/components/Dashboard.jsx` | Main app (only shown when authenticated) |
| `src/data/words.js` | Bundled TOEIC word list — expand freely |

## Adding more words

Append objects to `WORDS` in `src/data/words.js`. Give each a **new unique
`id`** (e.g. `w081`) and never renumber existing ids — they're the keys used to
store progress in Firestore.
