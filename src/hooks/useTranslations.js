import { useCallback, useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// Saved-translation history, stored per user at users/{uid}/translations.
// Each doc: { mode, source, meaning, pos?, example?, rootHint?, createdAt }.
export function useTranslations(uid) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const colRef = useCallback(() => collection(db, 'users', uid, 'translations'), [uid])

  useEffect(() => {
    if (!uid) return
    let active = true
    setLoading(true)
    ;(async () => {
      try {
        const snap = await getDocs(query(colRef(), orderBy('createdAt', 'desc')))
        if (active) setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch {
        if (active) setItems([])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [uid, colRef])

  const save = useCallback(
    async (entry) => {
      if (!uid) return
      const ref = await addDoc(colRef(), { ...entry, createdAt: serverTimestamp() })
      // Optimistically prepend so it appears in history immediately.
      setItems((prev) => [{ id: ref.id, ...entry, createdAt: { seconds: Date.now() / 1000 } }, ...prev])
    },
    [uid, colRef],
  )

  const remove = useCallback(
    async (id) => {
      if (!uid) return
      setItems((prev) => prev.filter((it) => it.id !== id))
      try {
        await deleteDoc(doc(db, 'users', uid, 'translations', id))
      } catch {
        /* best-effort; UI already updated */
      }
    },
    [uid],
  )

  return { items, loading, save, remove }
}
