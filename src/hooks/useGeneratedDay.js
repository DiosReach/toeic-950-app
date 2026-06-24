import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { generateDay, TOPICS_BY_ID, tierForDay, targetForTier } from '../data/wordbank'
import { ALL_WORDS_BY_ID } from '../data/catalog'

// Resolve a stored/generated day record into full word objects + topic.
function hydrate(raw) {
  const tier = raw.tier ?? tierForDay(raw.day)
  return {
    day: raw.day,
    tier,
    target: raw.target ?? targetForTier(tier),
    topic: TOPICS_BY_ID[raw.topicId] || raw.topic,
    words: (raw.wordIds || []).map((id) => ALL_WORDS_BY_ID[id]).filter(Boolean),
  }
}

/**
 * Load (or lazily generate + persist) a user's word allocation for a given
 * relative day. Stored at users/{uid}/generatedDays/{day} so each user's
 * journey is stable and "infinite".
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
        if (snap.exists()) {
          setData(hydrate(snap.data()))
        } else {
          // First time on this day: deterministically generate + persist.
          const gen = generateDay(day)
          await setDoc(ref, {
            day: gen.day,
            tier: gen.tier,
            target: gen.target,
            topicId: gen.topicId,
            wordIds: gen.wordIds,
            generatedAt: serverTimestamp(),
          })
          if (active) setData(hydrate(gen))
        }
      } catch {
        // Network/permission issue: fall back to deterministic generation so
        // the UI still works offline.
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
