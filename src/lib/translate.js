// ─────────────────────────────────────────────────────────────
// Two-register translation engine (keyless).
//
// For any input we surface TWO renderings of the translated result:
//   💬 casual  — natural, conversational Traditional Chinese (or casual EN)
//   💼 formal  — polished business / TOEIC-grade Traditional Chinese (or EN)
//
// Strategy (no LLM at runtime):
//   1. A curated PHRASEBOOK gives authentic casual/formal output for common
//      workplace terms (instant, zero network).
//   2. Otherwise we fetch the base translation from MyMemory (auto-chunked to
//      bypass the 500-char limit) and style it into the two registers.
//
// Each version exposes `result` (the translated text — the MAIN large font in
// the UI) and `source` (the original input — the small reference line).
// `generateVariants()` keeps a stable shape so an LLM can later replace step 2.
// ─────────────────────────────────────────────────────────────

const MYMEMORY = 'https://api.mymemory.translated.net/get'
const LANGPAIR = { en2zh: 'en|zh-TW', zh2en: 'zh-TW|en' }
const MAX_CHUNK = 400 // stay safely under MyMemory's free 500-char limit

export const VERSION_META = {
  casual: { icon: '💬', label: '口語化表達', sub: 'Modern Casual Expression' },
  formal: { icon: '💼', label: '商業正式翻譯', sub: 'Elite Business & TOEIC Formal' },
}
const ORDER = ['casual', 'formal']

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
  update: {
    us: { en: 'Quick update / where are we at?', zh: '快速更新、進度到哪了' },
    uk: { en: 'A quick update / where are we?', zh: '更新一下進度' },
    formal: { en: 'A status update', zh: '進度報告' },
  },
  sync: {
    us: { en: 'Sync up / get on the same page', zh: '同步、對齊一下' },
    uk: { en: 'Have a quick catch-up', zh: '碰一下、對齊' },
    formal: { en: 'Align on the matter', zh: '就此事達成共識' },
  },
  brainstorm: {
    us: { en: 'Spitball some ideas', zh: '隨便丟點子' },
    uk: { en: 'Kick some ideas around', zh: '一起想想點子' },
    formal: { en: 'Hold an ideation session', zh: '召開腦力激盪會議' },
  },
  feedback: {
    us: { en: 'Thoughts? / let me know what you think', zh: '你覺得呢？' },
    uk: { en: 'Any comments? / your thoughts', zh: '有什麼意見嗎' },
    formal: { en: 'Your feedback would be appreciated', zh: '敬請提供回饋' },
  },
  approve: {
    us: { en: 'Give it the green light', zh: '放行、批准' },
    uk: { en: 'Give it the nod / sign off', zh: '點頭、核准' },
    formal: { en: 'Grant approval', zh: '予以核准' },
  },
  'sign off': {
    us: { en: 'Sign off on it', zh: '簽核、放行' },
    uk: { en: 'Give it the sign-off', zh: '核可' },
    formal: { en: 'Provide formal authorization', zh: '正式授權' },
  },
  priority: {
    us: { en: 'Top of the list / front burner', zh: '第一順位' },
    uk: { en: 'Top priority / first port of call', zh: '最優先' },
    formal: { en: 'The highest priority', zh: '最高優先事項' },
  },
  blocker: {
    us: { en: 'What’s blocking you? / a roadblock', zh: '卡點、卡住了' },
    uk: { en: 'A sticking point', zh: '卡關的地方' },
    formal: { en: 'An impediment to progress', zh: '進度受阻的因素' },
  },
  bandwidth: {
    us: { en: 'Do you have the bandwidth?', zh: '你有餘力嗎' },
    uk: { en: 'Have you got capacity?', zh: '你忙得過來嗎' },
    formal: { en: 'Availability of resources', zh: '人力/資源是否充裕' },
  },
  'out of office': {
    us: { en: 'I’m OOO / off the grid', zh: '我休假、不在線上' },
    uk: { en: 'I’m out of office / away', zh: '我不在辦公室' },
    formal: { en: 'I am currently out of office', zh: '本人目前不在辦公室' },
  },
  'work from home': {
    us: { en: 'WFH / remote today', zh: '在家工作' },
    uk: { en: 'Working from home', zh: '在家上班' },
    formal: { en: 'Working remotely', zh: '遠距辦公' },
  },
  deal: {
    us: { en: 'It’s a deal / done deal', zh: '成交、說定了' },
    uk: { en: 'Sorted / that’s a deal', zh: '講定了' },
    formal: { en: 'The agreement is finalized', zh: '協議已定案' },
  },
  sorry: {
    us: { en: 'My bad / sorry about that', zh: '我的錯、抱歉' },
    uk: { en: 'Sorry about that / apologies', zh: '抱歉' },
    formal: { en: 'Please accept my apologies', zh: '敬請見諒' },
  },
  congratulations: {
    us: { en: 'Way to go / congrats', zh: '太讚了、恭喜' },
    uk: { en: 'Well done / congrats', zh: '做得好、恭喜' },
    formal: { en: 'My sincere congratulations', zh: '謹致賀忱' },
  },
  hello: {
    us: { en: 'Hey / what’s up', zh: '嘿、你好' },
    uk: { en: 'Hiya / you alright?', zh: '嗨、還好嗎' },
    formal: { en: 'Good day', zh: '您好' },
  },
  goodbye: {
    us: { en: 'Catch you later / see ya', zh: '回頭見' },
    uk: { en: 'Cheerio / see you', zh: '再見' },
    formal: { en: 'Kind regards', zh: '敬祝安好' },
  },
  cheap: {
    us: { en: 'A steal / dirt cheap', zh: '超便宜、划算' },
    uk: { en: 'A bargain / cheap as chips', zh: '便宜、划算' },
    formal: { en: 'Cost-effective', zh: '具成本效益' },
  },
  budget: {
    us: { en: 'What’s the budget?', zh: '預算多少' },
    uk: { en: 'The budget / the spend', zh: '預算' },
    formal: { en: 'The allocated budget', zh: '核定預算' },
  },
  raise: {
    us: { en: 'Ask for a raise / a bump', zh: '加薪' },
    uk: { en: 'Ask for a pay rise', zh: '加薪' },
    formal: { en: 'Request a salary increase', zh: '申請調薪' },
  },
  promotion: {
    us: { en: 'Move up / get bumped up', zh: '升職' },
    uk: { en: 'A step up / a promotion', zh: '升遷' },
    formal: { en: 'A promotion', zh: '晉升' },
  },
  hire: {
    us: { en: 'Bring someone on / onboard them', zh: '找人進來、報到' },
    uk: { en: 'Take someone on', zh: '聘人' },
    formal: { en: 'Recruit a candidate', zh: '招募人選' },
  },
  'lay off': {
    us: { en: 'Let someone go', zh: '裁員、讓人走' },
    uk: { en: 'Make someone redundant', zh: '裁撤、資遣' },
    formal: { en: 'Terminate employment', zh: '終止聘僱' },
  },
  quit: {
    us: { en: 'Call it quits / bounce', zh: '不幹了、走人' },
    uk: { en: 'Jack it in / hand in my notice', zh: '辭職、遞辭呈' },
    formal: { en: 'Tender one’s resignation', zh: '提出辭呈' },
  },
  help: {
    us: { en: 'Can you help me out?', zh: '幫個忙好嗎' },
    uk: { en: 'Could you give me a hand?', zh: '幫個忙' },
    formal: { en: 'I would appreciate your assistance', zh: '懇請協助' },
  },
  idea: {
    us: { en: 'Got a thought / here’s an idea', zh: '有個點子' },
    uk: { en: 'A thought / a suggestion', zh: '一個想法' },
    formal: { en: 'A proposal', zh: '一項提議' },
  },
  goal: {
    us: { en: 'What are we shooting for?', zh: '目標是什麼' },
    uk: { en: 'What we’re aiming for', zh: '目標' },
    formal: { en: 'The objective', zh: '目標/標的' },
  },
  done: {
    us: { en: 'All set / good to go', zh: '搞定、沒問題了' },
    uk: { en: 'All sorted / done and dusted', zh: '搞定、完成' },
    formal: { en: 'The task is complete', zh: '任務已完成' },
  },
  quick: {
    us: { en: 'Real quick / in a sec', zh: '很快、一下下' },
    uk: { en: 'In a tick / shortly', zh: '馬上、一會兒' },
    formal: { en: 'Momentarily', zh: '稍候、即刻' },
  },
  soon: {
    us: { en: 'Any minute / super soon', zh: '很快、馬上' },
    uk: { en: 'Shortly / in a bit', zh: '不久、待會' },
    formal: { en: 'In due course', zh: '適時、不久後' },
  },
  agree: {
    us: { en: 'I’m down / works for me', zh: '我OK、可以' },
    uk: { en: 'Sounds good / I’m happy with that', zh: '好啊、可以' },
    formal: { en: 'I concur', zh: '本人同意' },
  },
  question: {
    us: { en: 'Got a quick question', zh: '有個小問題' },
    uk: { en: 'A quick question', zh: '想問一下' },
    formal: { en: 'I have an inquiry', zh: '有一事請教' },
  },
  review: {
    us: { en: 'Take a look / look it over', zh: '看一下、過目' },
    uk: { en: 'Have a look / cast an eye over', zh: '看一下' },
    formal: { en: 'Review the document', zh: '審閱文件' },
  },
  welcome: {
    us: { en: 'Welcome aboard', zh: '歡迎加入' },
    uk: { en: 'Welcome / good to have you', zh: '歡迎' },
    formal: { en: 'We are pleased to welcome you', zh: '謹此歡迎您' },
  },
  ping: {
    us: { en: 'Ping me / shoot me a message', zh: '敲我一下' },
    uk: { en: 'Drop me a message', zh: '傳個訊息給我' },
    formal: { en: 'Send me a message', zh: '傳送訊息給我' },
  },
  'circle back': {
    us: { en: 'Circle back / loop back', zh: '稍後再聊、回頭討論' },
    uk: { en: 'Come back to it', zh: '回頭再說' },
    formal: { en: 'Revisit this later', zh: '稍後再議' },
  },
  break: {
    us: { en: 'Grab a coffee / take five', zh: '休息一下、喝杯咖啡' },
    uk: { en: 'Have a tea break / a breather', zh: '喝個茶、休息一下' },
    formal: { en: 'Take a short break', zh: '稍作休息' },
  },
  stressed: {
    us: { en: 'I’m stressed / under the gun', zh: '壓力山大' },
    uk: { en: 'I’m under pressure / frazzled', zh: '壓力很大' },
    formal: { en: 'Under considerable pressure', zh: '承受相當壓力' },
  },
}

// ── English register transforms (used when the target is English) ──
const casualizeEn = (s) =>
  s
    .replace(/\bcannot\b/gi, 'can’t')
    .replace(/\bdo not\b/gi, 'don’t')
    .replace(/\bwill not\b/gi, 'won’t')
    .replace(/\bI am\b/g, 'I’m')
    .replace(/\byou are\b/gi, 'you’re')
    .replace(/\bit is\b/gi, 'it’s')
    .replace(/\bwe are\b/gi, 'we’re')
    .replace(/\bgentlemen\b/gi, 'folks')

const formalizeEn = (s) =>
  s
    .replace(/\bcan’t\b/gi, 'cannot')
    .replace(/\bdon’t\b/gi, 'do not')
    .replace(/\bwon’t\b/gi, 'will not')
    .replace(/\bI’m\b/g, 'I am')
    .replace(/\bASAP\b/gi, 'at your earliest convenience')
    .replace(/\bget\b/gi, 'obtain')
    .replace(/\bok\b/gi, 'acceptable')
    .replace(/\bhi\b/gi, 'Dear Sir or Madam')

// ── Traditional Chinese register transforms (target is Chinese) ──
// Heuristic, keyless styling so the casual vs formal outputs differ usefully.
const ZH_FORMAL = [
  [/你們/g, '各位'], [/你/g, '您'], [/不能/g, '無法'], [/不會/g, '不會'],
  [/因為/g, '由於'], [/所以/g, '因此'], [/而且/g, '並且'], [/但是/g, '惟'],
  [/馬上/g, '立即'], [/趕快/g, '盡速'], [/這個/g, '該'], [/這些/g, '該等'],
  [/這/g, '此'], [/會議/g, '會議'], [/幫/g, '協助'], [/給/g, '提供'],
  [/已經/g, '業已'], [/想要/g, '擬'], [/謝謝/g, '謹致謝忱'], [/請/g, '敬請'],
]
const ZH_CASUAL = [
  [/各位/g, '大家'], [/您/g, '你'], [/無法/g, '不能'], [/由於/g, '因為'],
  [/因此/g, '所以'], [/並且/g, '而且'], [/立即/g, '馬上'], [/盡速/g, '趕快'],
  [/該等/g, '這些'], [/該/g, '這個'], [/此/g, '這'], [/業已/g, '已經'],
  [/協助/g, '幫'], [/敬請/g, '請'], [/謹致謝忱/g, '謝啦'], [/之/g, '的'],
]
const applyMap = (s, map) => map.reduce((acc, [re, to]) => acc.replace(re, to), s)
const formalizeZh = (s) => applyMap(s, ZH_FORMAL)
const casualizeZh = (s) => applyMap(s, ZH_CASUAL)

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

// Split long text into <MAX_CHUNK pieces on sentence boundaries (handles both
// Latin .!? and CJK 。！？；plus newlines). Long single sentences are hard-wrapped.
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

// Translate any length of text by chunking + merging (bypasses the 500 cap).
async function translateLong(text, langpair) {
  const chunks = splitIntoChunks(text)
  if (chunks.length === 1) return mmTranslate(chunks[0], langpair)
  const parts = await Promise.all(chunks.map((c) => mmTranslate(c, langpair)))
  // English target needs spaces between sentences; Chinese keeps its own marks.
  const sep = langpair.split('|')[1].startsWith('en') ? ' ' : ''
  return parts.join(sep).replace(/\s{2,}/g, ' ').trim()
}

const phrasebookKey = (s) =>
  s.trim().toLowerCase().replace(/[.!?,;:'"]/g, '').replace(/\s+/g, ' ')

/**
 * Produce the casual + formal renderings for the given text + direction.
 * @returns {{source, direction, isCurated, versions: object[]}}
 *   each version: { key, icon, label, sub, result, source, audioText }
 */
export async function generateVariants(rawText, direction = 'en2zh') {
  const text = rawText.trim()
  const isEn2Zh = direction === 'en2zh'

  // Base translation of the whole text (auto-chunked for long input).
  const base = await translateLong(text, isEn2Zh ? LANGPAIR.en2zh : LANGPAIR.zh2en)

  // Curated phrasebook is keyed by the English form.
  const englishKey = isEn2Zh ? text : base
  const entry = PHRASEBOOK[phrasebookKey(englishKey)]

  let casualText
  let formalText
  let isCurated = false
  if (entry) {
    isCurated = true
    casualText = isEn2Zh ? entry.us.zh : entry.us.en
    formalText = isEn2Zh ? entry.formal.zh : entry.formal.en
  } else if (isEn2Zh) {
    casualText = casualizeZh(base)
    formalText = formalizeZh(base)
  } else {
    casualText = casualizeEn(base)
    formalText = formalizeEn(base)
  }

  const build = (key, result) => ({
    key,
    ...VERSION_META[key],
    result, // translated text — MAIN large font
    source: text, // original input — small reference line
    // 🔊 reads the English side: the input (en2zh) or this result (zh2en).
    audioText: isEn2Zh ? text : result,
  })

  return {
    source: text,
    direction,
    isCurated,
    versions: [build('casual', casualText), build('formal', formalText)],
  }
}
