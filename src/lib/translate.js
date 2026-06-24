// ─────────────────────────────────────────────────────────────
// Triple-version translation engine.
//
// For any input (word or sentence) we surface THREE register variants:
//   🇺🇸 us     — Modern US workplace & casual
//   🇬🇧 uk     — Modern UK workplace & casual
//   💼 formal  — Elite business / TOEIC formal
//
// Strategy (no LLM required at runtime):
//   1. A curated PHRASEBOOK gives authentic 3-version output for common
//      high-frequency workplace terms (instant, zero network).
//   2. Anything else falls back to a register TEMPLATE engine that styles
//      the base translation (from MyMemory) into the three registers.
//
// `generateVariants()` is the single seam to later swap in Claude (e.g. via
// a Netlify Function) for fully dynamic slang — keep its return shape stable.
// ─────────────────────────────────────────────────────────────

const MYMEMORY = 'https://api.mymemory.translated.net/get'
const LANGPAIR = { en2zh: 'en|zh-TW', zh2en: 'zh-TW|en' }

export const VERSION_META = {
  us: { flag: '🇺🇸', label: '美國現代口語版', sub: 'Modern US · Workplace & Casual', accent: 'en-US' },
  uk: { flag: '🇬🇧', label: '英國現代口語版', sub: 'Modern UK · Workplace & Casual', accent: 'en-GB' },
  formal: { flag: '💼', label: '國際商務正式版', sub: 'Elite Business · TOEIC Formal', accent: 'en-GB' },
}
const ORDER = ['us', 'uk', 'formal']

// ── Curated phrasebook: authentic, contemporary 3-version renderings ──
const PHRASEBOOK = {
  schedule: {
    us: { en: 'Book it in / Lock it in', zh: '排進行程、定下來' },
    uk: { en: 'Diary it / Slot it in', zh: '記進日誌、安排檔期' },
    formal: { en: 'Prioritize according to the itinerary', zh: '依行程表排定優先順序' },
  },
  meeting: {
    us: { en: 'Hop on a call / sync up', zh: '開個會、同步一下' },
    uk: { en: 'Have a quick catch-up', zh: '碰個面、聊一下' },
    formal: { en: 'Convene a formal meeting', zh: '召開正式會議' },
  },
  deadline: {
    us: { en: 'When’s this due? / the drop-dead date', zh: '截止日、最後期限' },
    uk: { en: 'the cut-off / when’s it due by', zh: '截止時間' },
    formal: { en: 'the submission deadline', zh: '繳交期限' },
  },
  cancel: {
    us: { en: 'Call it off / scrap it', zh: '取消、作罷' },
    uk: { en: 'Bin it / knock it on the head', zh: '取消、喊停' },
    formal: { en: 'Cancel the arrangement', zh: '取消該項安排' },
  },
  urgent: {
    us: { en: 'It’s on fire / need it ASAP', zh: '很急、火燒眉毛' },
    uk: { en: 'It’s rather pressing', zh: '相當緊急' },
    formal: { en: 'This matter requires immediate attention', zh: '此事需立即處理' },
  },
  busy: {
    us: { en: 'Slammed / swamped', zh: '忙翻了' },
    uk: { en: 'Rushed off my feet', zh: '忙得不可開交' },
    formal: { en: 'Heavily committed at present', zh: '目前事務繁忙' },
  },
  available: {
    us: { en: 'Free / around', zh: '有空' },
    uk: { en: 'Free / about', zh: '有空' },
    formal: { en: 'Available at your convenience', zh: '有空檔、方便時' },
  },
  confirm: {
    us: { en: 'Lock it in / you’re all set', zh: '確定、搞定' },
    uk: { en: 'That’s sorted / all confirmed', zh: '搞定、確認好了' },
    formal: { en: 'Confirm the arrangement', zh: '確認該項安排' },
  },
  contact: {
    us: { en: 'Hit me up / ping me', zh: '敲我、聯絡我' },
    uk: { en: 'Drop me a line / give me a bell', zh: '跟我說一聲' },
    formal: { en: 'Contact me directly', zh: '直接與我聯繫' },
  },
  'follow up': {
    us: { en: 'Circle back / loop back', zh: '再跟進、回頭聊' },
    uk: { en: 'Chase it up', zh: '追一下進度' },
    formal: { en: 'Follow up accordingly', zh: '後續妥善跟進' },
  },
  'reach out': {
    us: { en: 'Hit them up / ping them', zh: '敲一下、聯絡他們' },
    uk: { en: 'Drop them a line', zh: '跟他們說一聲' },
    formal: { en: 'Make contact with the relevant party', zh: '與相關人員聯繫' },
  },
  'touch base': {
    us: { en: 'Touch base / sync up', zh: '碰一下、同步一下' },
    uk: { en: 'Have a catch-up', zh: '聊一下近況' },
    formal: { en: 'Liaise on the matter', zh: '就此事聯繫協調' },
  },
  thanks: {
    us: { en: 'Thanks a ton / appreciate it', zh: '多謝啦、感激不盡' },
    uk: { en: 'Cheers / ta', zh: '謝啦' },
    formal: { en: 'I sincerely appreciate it', zh: '由衷感謝' },
  },
  ok: {
    us: { en: 'Sounds good / you got it', zh: '好喔、沒問題' },
    uk: { en: 'Brilliant / right-o', zh: '好的、沒問題' },
    formal: { en: 'Understood and noted', zh: '了解、敬悉' },
  },
  'no problem': {
    us: { en: 'No worries / you bet', zh: '沒事、不客氣' },
    uk: { en: 'No bother / not at all', zh: '不麻煩、不客氣' },
    formal: { en: 'It is my pleasure', zh: '樂意之至' },
  },
  problem: {
    us: { en: 'A glitch / a snag', zh: '出包、卡關' },
    uk: { en: 'A hiccup / a spot of bother', zh: '小狀況' },
    formal: { en: 'An issue requiring resolution', zh: '待解決的問題' },
  },
  expensive: {
    us: { en: 'Pricey / steep', zh: '貴森森' },
    uk: { en: 'Dear / pricey', zh: '偏貴' },
    formal: { en: 'Costly', zh: '成本高昂' },
  },
  'let me know': {
    us: { en: 'Gimme a shout / keep me posted', zh: '跟我說一聲、隨時更新' },
    uk: { en: 'Give us a shout', zh: '讓我知道一下' },
    formal: { en: 'Please advise', zh: '敬請告知' },
  },
  'great job': {
    us: { en: 'Crushed it / nailed it', zh: '做得超棒' },
    uk: { en: 'Top marks / well done', zh: '做得好' },
    formal: { en: 'An outstanding performance', zh: '表現傑出' },
  },
  asap: {
    us: { en: 'ASAP / like yesterday', zh: '越快越好' },
    uk: { en: 'As soon as you can', zh: '盡快' },
    formal: { en: 'At your earliest convenience', zh: '請盡早辦理' },
  },
  fyi: {
    us: { en: 'Heads up / FYI', zh: '給你參考、提醒一下' },
    uk: { en: 'Just so you know', zh: '讓你知道一下' },
    formal: { en: 'For your information', zh: '供您參考' },
  },
}

// ── Lightweight register transforms for the template fallback ──
const britishize = (s) =>
  s
    .replace(/(\w)ize\b/g, '$1ise')
    .replace(/(\w)izing\b/g, '$1ising')
    .replace(/(\w)ization\b/g, '$1isation')
    .replace(/\bcolor\b/gi, 'colour')
    .replace(/\bcanceled\b/gi, 'cancelled')
    .replace(/\bschedule\b/gi, 'diary')

const casualize = (s) =>
  s
    .replace(/\bcannot\b/gi, 'can’t')
    .replace(/\bdo not\b/gi, 'don’t')
    .replace(/\bwill not\b/gi, 'won’t')
    .replace(/\bI am\b/g, 'I’m')
    .replace(/\byou are\b/gi, 'you’re')
    .replace(/\bit is\b/gi, 'it’s')
    .replace(/\bwe are\b/gi, 'we’re')

const formalize = (s) =>
  s
    .replace(/\bcan’t\b/gi, 'cannot')
    .replace(/\bdon’t\b/gi, 'do not')
    .replace(/\bwon’t\b/gi, 'will not')
    .replace(/\bI’m\b/g, 'I am')
    .replace(/\bASAP\b/gi, 'at your earliest convenience')
    .replace(/\bget\b/gi, 'obtain')
    .replace(/\bok\b/gi, 'acceptable')

export const looksLikeWord = (text) => text.trim().split(/\s+/).length === 1

async function mmTranslate(text, langpair) {
  const url = `${MYMEMORY}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langpair)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('translation failed')
  const data = await res.json()
  const out = data?.responseData?.translatedText
  if (!out) throw new Error('empty translation')
  return out
}

const phrasebookKey = (s) =>
  s.trim().toLowerCase().replace(/[.!?,;:'"]/g, '').replace(/\s+/g, ' ')

const toVersion = (key, en, zh) => ({
  key,
  ...VERSION_META[key],
  en,
  zh,
  audioText: en, // 🔊 reads this version's English
})

/**
 * Produce the three register versions for the given text + direction.
 * @returns {{source, direction, isCurated, versions: object[]}}
 */
export async function generateVariants(rawText, direction = 'en2zh') {
  const text = rawText.trim()

  // Resolve the English form (the thing we render registers of) + a base zh.
  let coreEn
  let baseZh
  if (direction === 'zh2en') {
    coreEn = await mmTranslate(text, LANGPAIR.zh2en)
    baseZh = text
  } else {
    coreEn = text
    baseZh = null // lazily fetched only if not curated
  }

  // 1) Curated phrasebook — authentic, instant.
  const entry = PHRASEBOOK[phrasebookKey(coreEn)] || PHRASEBOOK[phrasebookKey(text)]
  if (entry) {
    return {
      source: text,
      direction,
      isCurated: true,
      versions: ORDER.map((k) => toVersion(k, entry[k].en, entry[k].zh)),
    }
  }

  // 2) Template fallback — style the base translation into 3 registers.
  if (baseZh == null) {
    try {
      baseZh = await mmTranslate(text, LANGPAIR.en2zh)
    } catch {
      baseZh = '（查無翻譯）'
    }
  }
  const usEn = casualize(coreEn)
  const ukEn = britishize(casualize(coreEn))
  const formalEn = formalize(coreEn)

  return {
    source: text,
    direction,
    isCurated: false,
    versions: [
      toVersion('us', usEn, baseZh),
      toVersion('uk', ukEn, baseZh),
      toVersion('formal', formalEn, baseZh),
    ],
  }
}
