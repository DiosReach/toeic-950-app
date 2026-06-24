// ─────────────────────────────────────────────────────────────
// Text-to-speech with US / UK accent selection.
// Uses the browser's built-in Web Speech API (window.speechSynthesis).
// Works on desktop + mobile; voices load asynchronously, so we keep a
// live cache and refresh it on the 'voiceschanged' event.
// ─────────────────────────────────────────────────────────────

export const speechSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window

let voices = []

const refreshVoices = () => {
  if (!speechSupported) return
  voices = window.speechSynthesis.getVoices() || []
}

if (speechSupported) {
  refreshVoices()
  // Some browsers (Chrome, mobile Safari) populate voices lazily.
  window.speechSynthesis.onvoiceschanged = refreshVoices
}

const norm = (lang) => lang.replace('_', '-').toLowerCase()

// Pick the best available voice for a BCP-47 lang like 'en-US' / 'en-GB'.
const pickVoice = (lang) => {
  if (!voices.length) refreshVoices()
  const want = norm(lang)
  const prefix = want.slice(0, 2)
  return (
    voices.find((v) => norm(v.lang) === want) ||
    // Prefer a localized English voice for the right region.
    voices.find((v) => norm(v.lang).startsWith(prefix) && norm(v.lang).includes(want.slice(3))) ||
    voices.find((v) => norm(v.lang).startsWith(prefix)) ||
    null
  )
}

/**
 * Speak `text` in the given accent.
 * @param {string} text
 * @param {'en-US'|'en-GB'} lang
 */
export function speak(text, lang = 'en-US') {
  if (!speechSupported || !text) return
  const synth = window.speechSynthesis
  // Cancel any in-flight utterance so rapid taps don't queue/overlap.
  synth.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang // critical for mobile, where voice list may be empty
  const voice = pickVoice(lang)
  if (voice) utterance.voice = voice
  utterance.rate = 0.95
  utterance.pitch = 1

  // iOS Safari occasionally needs a tick after cancel() before speak().
  setTimeout(() => synth.speak(utterance), 0)
}
