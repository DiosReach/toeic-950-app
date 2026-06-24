// ─────────────────────────────────────────────────────────────
// Translation helpers using free public endpoints (no API key):
//   • MyMemory          → English → Traditional Chinese (zh-TW)
//   • dictionaryapi.dev → part of speech + example sentence
// Both support browser CORS. All calls fail soft with sensible fallbacks.
// ─────────────────────────────────────────────────────────────

const MYMEMORY = 'https://api.mymemory.translated.net/get'
const DICTIONARY = 'https://api.dictionaryapi.dev/api/v2/entries/en'

// Common Latin/Greek roots & prefixes for a quick etymology hint in Word Mode.
const ROOT_HINTS = [
  ['spect', 'spect = to look (Latin specere)'],
  ['port', 'port = to carry (Latin portare)'],
  ['dict', 'dict = to say (Latin dicere)'],
  ['script', 'script = to write (Latin scribere)'],
  ['scrib', 'scrib = to write (Latin scribere)'],
  ['duct', 'duct = to lead (Latin ducere)'],
  ['tain', 'tain = to hold (Latin tenere)'],
  ['ten', 'ten = to hold (Latin tenere)'],
  ['vert', 'vert = to turn (Latin vertere)'],
  ['vers', 'vers = to turn (Latin vertere)'],
  ['cept', 'cept = to take (Latin capere)'],
  ['ceiv', 'ceiv = to take (Latin capere)'],
  ['fer', 'fer = to carry/bring (Latin ferre)'],
  ['ject', 'ject = to throw (Latin jacere)'],
  ['form', 'form = shape (Latin forma)'],
]
const PREFIX_HINTS = [
  ['pre', 'pre- = before'],
  ['re', 're- = again / back'],
  ['inter', 'inter- = between'],
  ['trans', 'trans- = across'],
  ['sub', 'sub- = under'],
  ['con', 'con- = together / with'],
  ['com', 'com- = together / with'],
  ['pro', 'pro- = forward'],
  ['de', 'de- = down / away'],
  ['ex', 'ex- = out'],
  ['in', 'in- = in / not'],
]

export function rootHint(word) {
  const w = word.toLowerCase()
  for (const [frag, hint] of ROOT_HINTS) if (w.includes(frag)) return hint
  for (const [frag, hint] of PREFIX_HINTS) if (w.startsWith(frag)) return hint
  return null
}

async function translateToZh(text) {
  const url = `${MYMEMORY}?q=${encodeURIComponent(text)}&langpair=en|zh-TW`
  const res = await fetch(url)
  if (!res.ok) throw new Error('translation failed')
  const data = await res.json()
  const out = data?.responseData?.translatedText
  if (!out) throw new Error('empty translation')
  return out
}

/** Translate a full sentence/paragraph into Traditional Chinese. */
export async function translateSentence(text) {
  return translateToZh(text)
}

/**
 * Build a dictionary card for a single word: zh-TW meaning, part of speech,
 * root/etymology hint, and a business-style example sentence.
 */
export async function lookupWord(rawWord) {
  const word = rawWord.trim()
  // Run both lookups in parallel; tolerate either failing.
  const [zh, dict] = await Promise.allSettled([
    translateToZh(word),
    fetch(`${DICTIONARY}/${encodeURIComponent(word)}`).then((r) =>
      r.ok ? r.json() : Promise.reject(new Error('no entry')),
    ),
  ])

  const meaning = zh.status === 'fulfilled' ? zh.value : '（查無翻譯，請稍後再試）'

  let pos = ''
  let example = ''
  if (dict.status === 'fulfilled' && Array.isArray(dict.value)) {
    const meanings = dict.value[0]?.meanings || []
    pos = meanings[0]?.partOfSpeech || ''
    for (const m of meanings) {
      const ex = m.definitions?.find((d) => d.example)?.example
      if (ex) {
        example = ex
        break
      }
    }
  }

  return {
    word,
    meaning,
    pos,
    rootHint: rootHint(word),
    example: example || `Use “${word}” in a professional context.`,
  }
}

// Heuristic: a single token with no spaces is treated as a word lookup.
export const looksLikeWord = (text) => text.trim().split(/\s+/).length === 1
