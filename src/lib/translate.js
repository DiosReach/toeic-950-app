// ─────────────────────────────────────────────────────────────
// Hybrid translation engine — Local-First dictionary + keyless Cloud AI.
//
// The local dictionary is NOT inlined. It lives in alphabetical JSON chunks
// under src/assets/dict/ and is loaded on demand via dynamic import(), so the
// main bundle stays small and the dataset scales to thousands of words without
// bloating memory. Vite code-splits each chunk into its own cached asset.
//
// Flow:
//   Step 1 (instant): for a single English word, route to its alphabetical
//     chunk, async-load it once (cached), and hash-lookup. A hit renders with
//     ~0s delay — permanently insulated from cloud rate limits.
//   Step 2 (fallback): only full sentences / paragraphs / uncached phrases go
//     to Pollinations.AI (keyless, CORS-enabled) with the "Translating…" spinner.
//
// Two registers everywhere:
//   💬 casual  — natural, white-collar / everyday phrasing
//   💼 formal  — strict corporate / TOEIC-grade phrasing
// Each version exposes `result` (translated text — MAIN large font) and
// `source` (original input — small reference line).
// ─────────────────────────────────────────────────────────────

const MAX_CHUNK = 500 // per-request character budget per cloud call

export const VERSION_META = {
  casual: { icon: '💬', label: '口語化表達', sub: 'Modern Casual Expression' },
  formal: { icon: '💼', label: '商業正式翻譯', sub: 'Elite Business & TOEIC Formal' },
}

// ── Dynamic alphabetical dictionary chunks (code-split, lazy-loaded) ──
// Each loader is dynamic-imported on first use, then its parsed map is cached
// for instant hash lookups thereafter.
const CHUNK_LOADERS = {
  ag: () => import('../assets/dict/chunk_a_g.json'),
  ho: () => import('../assets/dict/chunk_h_o.json'),
  pz: () => import('../assets/dict/chunk_p_z.json'),
}
const chunkCache = {} // { ag: Promise<map>, ... }

// Map a word's first letter to its chunk id (non-letters → no local chunk).
function chunkIdFor(word) {
  const c = word.charCodeAt(0)
  if (c >= 97 && c <= 103) return 'ag' // a–g
  if (c >= 104 && c <= 111) return 'ho' // h–o
  if (c >= 112 && c <= 122) return 'pz' // p–z
  return null
}

async function loadChunk(id) {
  if (!chunkCache[id]) {
    chunkCache[id] = CHUNK_LOADERS[id]()
      .then((m) => m.default || m)
      .catch((err) => {
        delete chunkCache[id] // allow retry if the asset failed to load
        throw err
      })
  }
  return chunkCache[id]
}

// Instant local lookup: load the right chunk (cached) then hash-lookup the word.
async function lookupLocal(word) {
  const id = chunkIdFor(word)
  if (!id) return null
  try {
    const map = await loadChunk(id)
    return map[word] || null
  } catch {
    return null // fall through to cloud on any chunk-load failure
  }
}

export const looksLikeWord = (text) => text.trim().split(/\s+/).length === 1

// Normalize an input to a dictionary key: trimmed, lowercased, depunctuated.
const dictKey = (s) =>
  s.trim().toLowerCase().replace(/[.!?,;:'"]/g, '').replace(/\s+/g, ' ')

// Split long text into <MAX_CHUNK pieces on sentence boundaries (Latin + CJK).
export function splitIntoChunks(text, max = MAX_CHUNK) {
  const clean = text.trim()
  if (clean.length <= max) return [clean]
  const sentences = clean.match(/[^.!?。！？；\n]+[.!?。！？；\n]*/g) || [clean]
  const chunks = []
  let cur = ''
  for (const s of sentences) {
    if (cur && (cur + s).length > max) {
      chunks.push(cur)
      cur = ''
    }
    if (s.length > max) {
      let rest = s
      while (rest.length > max) {
        let cut = rest.lastIndexOf(' ', max)
        if (cut <= 0) cut = max
        chunks.push((cur + rest.slice(0, cut)).trim())
        cur = ''
        rest = rest.slice(cut)
      }
      cur = rest
    } else {
      cur += s
    }
  }
  if (cur.trim()) chunks.push(cur.trim())
  return chunks.map((c) => c.trim()).filter(Boolean)
}

// ── Keyless cloud LLM (Pollinations.AI) — only for non-cached text ──
const POLLI_OPENAI = 'https://text.pollinations.ai/openai'
const POLLI_TEXT = 'https://text.pollinations.ai'
const AI_MODEL = 'openai'

async function cloudComplete(system, user) {
  // Primary: OpenAI-compatible chat endpoint.
  try {
    const res = await fetch(POLLI_OPENAI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
        private: true,
        referrer: 'toeic-vocab-cloud',
      }),
    })
    if (res.ok) {
      const data = await res.json().catch(() => null)
      const content =
        data?.choices?.[0]?.message?.content ?? (typeof data === 'string' ? data : null)
      if (content) return content
    }
  } catch {
    /* fall through to the simple endpoint */
  }
  // Fallback: simple GET text endpoint.
  const prompt = `${system}\n\n${user}`
  const url = `${POLLI_TEXT}/${encodeURIComponent(prompt)}?model=${AI_MODEL}&json=true&referrer=toeic-vocab-cloud`
  const res2 = await fetch(url)
  if (!res2.ok) throw new Error('AI_HTTP_' + res2.status)
  return (await res2.text()) || ''
}

const SYSTEM_PROMPT = `You are a precise translation engine for a TOEIC business-English study app.
Translate between English and Traditional Chinese with ZERO hallucination — never invent unrelated meanings (e.g. "further" must NEVER become "臨床技能").
Reply with ONLY a compact JSON object and nothing else: {"casual":"...","formal":"..."}
- "casual": natural, modern, white-collar everyday phrasing.
- "formal": strict, elite corporate / official / TOEIC-grade phrasing.
The two MUST differ meaningfully in register; never return them identical.`

const userPrompt = (text, isEn2Zh) =>
  isEn2Zh
    ? `Translate this English into Traditional Chinese (casual + formal).
Example: "prospect" -> {"casual":"未來的機會 / 盼頭","formal":"前景 / 展望 / 潛在客戶"}
Text: """${text}"""`
    : `Translate this Traditional Chinese into English (casual + formal).
Example: "前景" -> {"casual":"what's ahead / the outlook","formal":"prospects / future outlook"}
Text: """${text}"""`

// Robustly pull {casual, formal} out of a model reply.
function extractJson(raw) {
  if (!raw) return null
  let s = String(raw).replace(/```json|```/gi, '').trim()
  const a = s.indexOf('{')
  const b = s.lastIndexOf('}')
  if (a >= 0 && b > a) s = s.slice(a, b + 1)
  try {
    const obj = JSON.parse(s)
    if (obj && (obj.casual || obj.formal)) return obj
  } catch {
    /* fall through to loose parsing */
  }
  const c = s.match(/"casual"\s*:\s*"([^"]*)"/)
  const f = s.match(/"formal"\s*:\s*"([^"]*)"/)
  if (c || f) return { casual: c?.[1] || '', formal: f?.[1] || '' }
  return null
}

const runLLM = (user) => cloudComplete(SYSTEM_PROMPT, user)

const buildResult = (text, direction, engine, casualText, formalText, isEn2Zh) => {
  const build = (key, r) => ({
    key,
    ...VERSION_META[key],
    result: r, // translated text — MAIN large font
    source: text, // original input — small reference line
    audioText: isEn2Zh ? text : r, // 🔊 always reads the English side
  })
  return { source: text, direction, engine, versions: [build('casual', casualText), build('formal', formalText)] }
}

/**
 * Produce the casual + formal renderings for the given text + direction.
 * Local-First: instant dictionary hit → otherwise keyless cloud LLM.
 * @param {{onStatus?: (s:string)=>void}} [opts] status callback for the UI
 * @returns {{source, direction, engine, versions: object[]}}
 */
export async function generateVariants(rawText, direction = 'en2zh', opts = {}) {
  const { onStatus } = opts
  const text = rawText.trim()
  const isEn2Zh = direction === 'en2zh'

  // ── Step 1: Local-First — async chunk load + hash lookup (instant) ──
  // Only single English words route to the local dictionary; sentences and
  // phrases skip straight to the cloud per the architecture.
  if (isEn2Zh && looksLikeWord(text)) {
    const hit = await lookupLocal(dictKey(text))
    if (hit) return buildResult(text, direction, 'local', hit.casual, hit.formal, isEn2Zh)
  }

  // ── Step 2: Cloud LLM (only for sentences / uncached words) ──
  onStatus?.('Translating…')
  const chunks = splitIntoChunks(text, MAX_CHUNK)
  const raws = await Promise.all(chunks.map((ch) => runLLM(userPrompt(ch, isEn2Zh))))
  const casuals = []
  const formals = []
  for (const raw of raws) {
    const obj = extractJson(raw) || {}
    casuals.push((obj.casual || '').trim())
    formals.push((obj.formal || '').trim())
  }
  const sep = isEn2Zh ? '' : ' '
  let casualText = casuals.join(sep).trim()
  let formalText = formals.join(sep).trim()
  if (!casualText && !formalText) throw new Error('EMPTY_AI')
  if (!casualText) casualText = formalText
  if (!formalText) formalText = casualText

  return buildResult(text, direction, 'ai', casualText, formalText, isEn2Zh)
}
