import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { generateDay, tierForDay, targetForTier } from '../data/wordbank'
import { ROOTS_BY_ID } from '../data/roots'
import { ALL_WORDS_BY_ID } from '../data/catalog'

// Resolve a stored/generated day record into its root theme + full word
// objects. Every day's words come entirely from one root family.
function hydrate(raw) {
  const tier = raw.tier ?? tierForDay(raw.day)
  const root = ROOTS_BY_ID[raw.rootId]
  const words = (raw.wordIds || []).map((id) => ALL_WORDS_BY_ID[id]).filter(Boolean)
  return {
    day: raw.day,
    tier,
    target: raw.target ?? targetForTier(tier),
    root, // full theme: root, gloss, origin, explanation, words
    // back-compat shape for the calendar's topic label
    topic: root ? { title: root.root, hint: root.gloss } : null,
    goal: raw.goal ?? words.length,
    words,
  }
}

/**
 * Load (or lazily generate + persist) a user's root-driven word allocation
 * for a given relative day. Stored at users/{uid}/generatedDays/{day}.
 *
 * @param {string|undefined} uid
 * @param {number|null} day  1-based relative day; pass null to stay idle
 */
export function useGeneratedDay(uid, day) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid || !day || day < 1) return
    let active = true
    setLoading(true)
    ;(async () => {
      try {
        const ref = doc(db, 'users', uid, 'generatedDays', String(day))
        const snap = await getDoc(ref)
        if (!active) return
        if (snap.exists() && snap.data()?.rootId) {
          setData(hydrate(snap.data()))
        } else {
          // First time on this day: deterministically assign root + persist.
          const gen = generateDay(day)
          await setDoc(ref, {
            day: gen.day,
            tier: gen.tier,
            target: gen.target,
            rootId: gen.rootId,
            wordIds: gen.wordIds,
            goal: gen.goal,
            generatedAt: serverTimestamp(),
          })
          if (active) setData(hydrate(gen))
        }
      } catch {
        // Offline / permission fallback: deterministic local generation.
        if (active) setData(hydrate(generateDay(day)))
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [uid, day])

  return { day: data, loading }
}
