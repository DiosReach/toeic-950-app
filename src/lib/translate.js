// ─────────────────────────────────────────────────────────────
// Bidirectional translation helpers using free public endpoints:
//   • MyMemory          → English ⇄ Traditional Chinese (zh-TW)
//   • dictionaryapi.dev → part of speech + example for the English word
// Both support browser CORS. All calls fail soft with sensible fallbacks.
//
// `direction` is 'en2zh' (English → 中文) or 'zh2en' (中文 → English).
// Every result also carries `audioText` = the ENGLISH side of the pair, so
// the 🔊 US/UK buttons always read the English text, whichever mode you're in.
// ─────────────────────────────────────────────────────────────

const MYMEMORY = 'https://api.mymemory.translated.net/get'
const DICTIONARY = 'https://api.dictionaryapi.dev/api/v2/entries/en'

const LANGPAIR = { en2zh: 'en|zh-TW', zh2en: 'zh-TW|en' }

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

async function mmTranslate(text, langpair) {
  const url = `${MYMEMORY}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('translation failed')
  const data = await res.json()
  const out = data?.responseData?.translatedText
  if (!out) throw new Error('empty translation')
  return out
}

// Fetch part-of-speech + an example sentence for an English word.
async function fetchDict(englishWord) {
  const res = await fetch(`${DICTIONARY}/${encodeURIComponent(englishWord)}`)
  if (!res.ok) return { pos: '', example: '' }
  const json = await res.json()
  const meanings = Array.isArray(json) ? json[0]?.meanings || [] : []
  let example = ''
  for (const m of meanings) {
    const ex = m.definitions?.find((d) => d.example)?.example
    if (ex) {
      example = ex
      break
    }
  }
  return { pos: meanings[0]?.partOfSpeech || '', example }
}

/**
 * Translate a full sentence/paragraph in either direction.
 * @returns {{source, meaning, audioText, direction}}
 */
export async function translateSentence(text, direction = 'en2zh') {
  const out = await mmTranslate(text, LANGPAIR[direction])
  // English side = the input (en2zh) or the output (zh2en).
  const audioText = direction === 'en2zh' ? text : out
  return { source: text, meaning: out, audioText, direction }
}

/**
 * Build a dictionary card for a single word in either direction.
 * In zh2en, the Chinese input is translated to an English headword first,
 * then enriched with POS/example/etymology for that English word.
 * @returns {{word, meaning, pos, example, rootHint, audioText, direction}}
 */
export async function lookupWord(rawWord, direction = 'en2zh') {
  const text = rawWord.trim()

  if (direction === 'zh2en') {
    let english = text
    try {
      english = await mmTranslate(text, LANGPAIR.zh2en)
    } catch {
      /* keep original on failure */
    }
    const dict = await fetchDict(english).catch(() => ({ pos: '', example: '' }))
    return {
      word: english, // English headword (the translation)
      meaning: text, // the Chinese the user typed
      pos: dict.pos,
      rootHint: rootHint(english),
      example: dict.example || `Use “${english}” in a professional context.`,
      audioText: english,
      direction,
    }
  }

  // en2zh (default)
  const [zh, dict] = await Promise.allSettled([
    mmTranslate(text, LANGPAIR.en2zh),
    fetchDict(text),
  ])
  const meaning = zh.status === 'fulfilled' ? zh.value : '（查無翻譯，請稍後再試）'
  const info = dict.status === 'fulfilled' ? dict.value : { pos: '', example: '' }
  return {
    word: text,
    meaning,
    pos: info.pos,
    rootHint: rootHint(text),
    example: info.example || `Use “${text}” in a professional context.`,
    audioText: text,
    direction,
  }
}

// Heuristic: a single token with no spaces is treated as a word lookup.
export const looksLikeWord = (text) => text.trim().split(/\s+/).length === 1
