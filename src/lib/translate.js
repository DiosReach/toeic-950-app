// ─────────────────────────────────────────────────────────────
// Hybrid translation engine — Local-First cache + keyless Cloud AI.
//
// Step 1 (instant, 0s): a built-in elite dictionary of 150+ high-frequency
//   TOEIC / workplace words with pre-baked dual-register Traditional Chinese.
//   A lowercase-trim match returns immediately with ZERO network.
// Step 2 (only if not cached): route to Pollinations.AI — a free, public,
//   CORS-enabled, OpenAI-compatible LLM proxy (no API key, no download) — and
//   show the "Translating…" spinner.
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

// ── Built-in elite dictionary (English → dual-register Traditional Chinese) ──
// Keys are lowercase. casual = conversational; formal = business/TOEIC.
export const LOCAL_DICT = {
  account: { casual: '帳戶、客戶', formal: '帳目、往來客戶' },
  achieve: { casual: '做到、達成', formal: '達成、實現' },
  acquire: { casual: '拿到、學到', formal: '取得、收購' },
  adjust: { casual: '調一下、改', formal: '調整、修正' },
  agenda: { casual: '要談的事', formal: '議程' },
  allocate: { casual: '分一分、撥給', formal: '分配、撥配' },
  announce: { casual: '公布、說一聲', formal: '宣布、公告' },
  annual: { casual: '一年一次的', formal: '年度的、每年的' },
  appoint: { casual: '指派、找人來做', formal: '任命、指派' },
  appreciate: { casual: '感謝、懂得欣賞', formal: '感激、體認' },
  approve: { casual: '同意、放行', formal: '核准、批准' },
  arrange: { casual: '安排、喬一下', formal: '安排、籌備' },
  assess: { casual: '看看怎樣、評一下', formal: '評估、評定' },
  assign: { casual: '派工作', formal: '指派、分派' },
  assist: { casual: '幫忙', formal: '協助' },
  attach: { casual: '附上、夾帶', formal: '附加、檢附' },
  attend: { casual: '出席、去', formal: '出席、參加' },
  available: { casual: '有空、有貨', formal: '可供使用、可洽詢' },
  avoid: { casual: '避開、別碰', formal: '避免、規避' },
  balance: { casual: '餘額、平衡', formal: '結餘、平衡' },
  benefit: { casual: '好處、福利', formal: '效益、福利' },
  bill: { casual: '帳單', formal: '帳單、票據' },
  board: { casual: '董事會', formal: '董事會、理事會' },
  branch: { casual: '分店', formal: '分公司、分行' },
  brief: { casual: '簡單說一下', formal: '簡報、摘要說明' },
  budget: { casual: '預算多少', formal: '預算、經費' },
  cancel: { casual: '取消、不辦了', formal: '取消、撤銷' },
  candidate: { casual: '人選、應徵者', formal: '候選人、應徵者' },
  capacity: { casual: '容量、能耐', formal: '產能、容量' },
  career: { casual: '工作、事業', formal: '職涯、職業生涯' },
  client: { casual: '客人', formal: '客戶、委託人' },
  colleague: { casual: '同事', formal: '同仁、同事' },
  commit: { casual: '答應、投入', formal: '承諾、致力' },
  commute: { casual: '通勤、上下班', formal: '通勤' },
  compensate: { casual: '補償、賠', formal: '補償、賠償' },
  compete: { casual: '競爭、比', formal: '競爭、角逐' },
  complete: { casual: '做完、弄好', formal: '完成、辦理完竣' },
  comply: { casual: '照做、配合', formal: '遵守、遵循' },
  conduct: { casual: '進行、做', formal: '執行、進行' },
  confirm: { casual: '確定、敲定', formal: '確認、核實' },
  consult: { casual: '問一下、商量', formal: '諮詢、洽詢' },
  contact: { casual: '聯絡、找他', formal: '聯繫、洽詢' },
  contract: { casual: '合約', formal: '合約、契約' },
  contribute: { casual: '出一份力、貢獻', formal: '貢獻、挹注' },
  coordinate: { casual: '喬一下、協調', formal: '協調、統籌' },
  cost: { casual: '花多少、成本', formal: '成本、費用' },
  credit: { casual: '信用、賒帳', formal: '信用、賒欠額度' },
  deadline: { casual: '截止日、死線', formal: '截止期限、繳交期限' },
  deal: { casual: '交易、說定', formal: '交易、協議' },
  decline: { casual: '變少、婉拒', formal: '下滑、婉拒' },
  decrease: { casual: '變少、減少', formal: '減少、遞減' },
  delay: { casual: '拖到、晚了', formal: '延遲、延誤' },
  deliver: { casual: '送、交出來', formal: '交付、運送' },
  demand: { casual: '需求、要', formal: '需求、要求' },
  department: { casual: '部門', formal: '部門、處室' },
  deposit: { casual: '訂金、存錢', formal: '訂金、存款' },
  determine: { casual: '決定、看出', formal: '決定、判定' },
  develop: { casual: '做出來、發展', formal: '開發、發展' },
  discount: { casual: '打折、便宜點', formal: '折扣、優惠' },
  discuss: { casual: '聊一下、討論', formal: '討論、商議' },
  distribute: { casual: '發、分給', formal: '分發、配銷' },
  document: { casual: '文件、檔案', formal: '文件、文書' },
  draft: { casual: '草稿、初稿', formal: '草案、初稿' },
  due: { casual: '到期、該交了', formal: '到期、屆期' },
  efficient: { casual: '有效率、又快又好', formal: '有效率的、高效的' },
  eligible: { casual: '有資格', formal: '符合資格、具備資格' },
  employ: { casual: '雇用、請人', formal: '聘僱、任用' },
  encourage: { casual: '鼓勵、推一把', formal: '鼓勵、促進' },
  enhance: { casual: '變更好、加強', formal: '提升、強化' },
  ensure: { casual: '確保、顧好', formal: '確保、保證' },
  equipment: { casual: '設備、傢伙', formal: '設備、器材' },
  estimate: { casual: '抓個大概、估', formal: '估計、估算' },
  evaluate: { casual: '評一評、看好不好', formal: '評估、評鑑' },
  execute: { casual: '動手做、搞定', formal: '執行、實行、履行' },
  expand: { casual: '變大、擴點', formal: '擴展、擴大' },
  expense: { casual: '花費、開銷', formal: '費用、支出' },
  expertise: { casual: '專長、很厲害', formal: '專業知識、專長' },
  extend: { casual: '延長、拉長', formal: '延長、展延' },
  facility: { casual: '場地、設施', formal: '設施、廠房' },
  feedback: { casual: '意見、回饋', formal: '回饋意見、反饋' },
  figure: { casual: '數字、想出來', formal: '數據、數字' },
  finance: { casual: '錢的事、財務', formal: '財務、融資' },
  forecast: { casual: '預估、看趨勢', formal: '預測、預估' },
  further: { casual: '再往前、另外的、聊更多', formal: '進一步推動、深化、補充說明' },
  generate: { casual: '生出、帶來', formal: '產生、創造' },
  goal: { casual: '目標', formal: '目標、標的' },
  grant: { casual: '給、撥款', formal: '核給、補助' },
  growth: { casual: '成長、變多', formal: '成長、增長' },
  guarantee: { casual: '保證、掛保證', formal: '保證、擔保' },
  handle: { casual: '處理、搞定', formal: '處理、辦理' },
  headquarters: { casual: '總部', formal: '總公司、總部' },
  hire: { casual: '找人、請人', formal: '聘僱、招募' },
  implement: { casual: '做出來、落實', formal: '實施、執行、導入' },
  improve: { casual: '變更好、改進', formal: '改善、提升' },
  income: { casual: '收入、賺的', formal: '收入、所得' },
  increase: { casual: '變多、加', formal: '增加、提高' },
  industry: { casual: '業界、行業', formal: '產業、業界' },
  inform: { casual: '告訴、說一聲', formal: '告知、通知' },
  invoice: { casual: '發票、帳單', formal: '發票、請款單' },
  issue: { casual: '問題、狀況', formal: '議題、問題' },
  item: { casual: '東西、項目', formal: '項目、品項' },
  launch: { casual: '推出、上架', formal: '推出、發表' },
  lease: { casual: '租', formal: '租賃、承租' },
  manage: { casual: '管、搞定', formal: '管理、經營' },
  manufacture: { casual: '製造、做', formal: '製造、生產' },
  margin: { casual: '賺頭、利潤', formal: '利潤、毛利' },
  market: { casual: '市場、客群', formal: '市場、行銷' },
  meeting: { casual: '開會、碰面', formal: '會議' },
  merge: { casual: '合併、併在一起', formal: '合併、整併' },
  negotiate: { casual: '談、喬價錢', formal: '協商、談判' },
  notify: { casual: '通知、說一聲', formal: '通知、告知' },
  objective: { casual: '目標、想達到的', formal: '目標、宗旨' },
  obtain: { casual: '拿到、弄到', formal: '取得、獲取' },
  offer: { casual: '開的條件、提供', formal: '提議、錄取通知' },
  operate: { casual: '運作、開', formal: '營運、操作' },
  opportunity: { casual: '機會', formal: '機會、商機' },
  order: { casual: '訂、下單', formal: '訂單、訂購' },
  organize: { casual: '整理、辦', formal: '籌辦、規劃' },
  outcome: { casual: '結果', formal: '結果、成效' },
  overtime: { casual: '加班', formal: '加班、逾時工作' },
  partner: { casual: '夥伴、合夥', formal: '合作夥伴、合夥人' },
  payment: { casual: '付款、款', formal: '付款、給付' },
  performance: { casual: '表現、業績', formal: '績效、表現' },
  permit: { casual: '准、許可證', formal: '許可、准許' },
  policy: { casual: '規定、做法', formal: '政策、規範' },
  position: { casual: '職位、位子', formal: '職位、職務' },
  postpone: { casual: '延後、改期', formal: '延期、延後' },
  priority: { casual: '先做的事、重點', formal: '優先事項、優先順序' },
  procedure: { casual: '步驟、流程', formal: '程序、作業流程' },
  process: { casual: '流程、處理', formal: '流程、處理程序' },
  produce: { casual: '做出、生產', formal: '生產、製造' },
  profit: { casual: '賺的、利潤', formal: '利潤、盈餘' },
  progress: { casual: '進度', formal: '進展、進度' },
  project: { casual: '案子、專案', formal: '專案、計畫' },
  promote: { casual: '升職、推廣', formal: '晉升、推廣' },
  proposal: { casual: '提案、建議', formal: '提案、企劃書' },
  prospect: { casual: '機會、盼頭、未來性', formal: '前景、展望、潛在客戶' },
  provide: { casual: '給、提供', formal: '提供、供應' },
  purchase: { casual: '買', formal: '採購、購置' },
  quality: { casual: '品質、好不好', formal: '品質、質量' },
  quote: { casual: '報價、開價', formal: '報價、估價單' },
  range: { casual: '範圍、種類', formal: '範圍、區間' },
  rate: { casual: '費率、比例', formal: '費率、比率' },
  receipt: { casual: '收據、發票', formal: '收據、簽收' },
  recommend: { casual: '推薦、建議', formal: '推薦、建議' },
  recruit: { casual: '找人、招人', formal: '招募、徵才' },
  reduce: { casual: '減少、砍', formal: '減少、降低' },
  refund: { casual: '退錢', formal: '退款、退費' },
  register: { casual: '報名、登記', formal: '登記、註冊' },
  reimburse: { casual: '報帳、還錢', formal: '核銷、報支' },
  reject: { casual: '不要、退回', formal: '拒絕、駁回' },
  release: { casual: '推出、放出', formal: '發布、釋出' },
  reliable: { casual: '靠得住', formal: '可靠的、穩定的' },
  remind: { casual: '提醒一下', formal: '提醒、提示' },
  renew: { casual: '續、再辦一次', formal: '續約、更新' },
  replace: { casual: '換掉、替', formal: '更換、替換' },
  report: { casual: '報告、回報', formal: '報告、呈報' },
  request: { casual: '要求、拜託', formal: '要求、請求' },
  require: { casual: '需要、要', formal: '要求、規定須' },
  reschedule: { casual: '改時間、改期', formal: '重新安排時程、改期' },
  reserve: { casual: '訂、留位', formal: '預訂、保留' },
  resign: { casual: '離職、不幹了', formal: '辭職、請辭' },
  resolve: { casual: '解決、搞定', formal: '解決、化解' },
  resource: { casual: '資源、人手', formal: '資源' },
  responsible: { casual: '負責', formal: '負責的、職責所在' },
  resume: { casual: '重新開始、履歷', formal: '恢復、履歷表' },
  revenue: { casual: '營收、賺的', formal: '營收、收益' },
  review: { casual: '看一下、檢查', formal: '審查、檢視' },
  revise: { casual: '改一改', formal: '修訂、修正' },
  salary: { casual: '薪水', formal: '薪資、薪俸' },
  sample: { casual: '樣品、試', formal: '樣品、樣本' },
  schedule: { casual: '排時間、安排', formal: '時程表、排定行程' },
  sector: { casual: '領域、行業', formal: '產業別、部門' },
  secure: { casual: '弄到手、安全', formal: '取得、確保' },
  shift: { casual: '班、輪班', formal: '班別、輪班' },
  ship: { casual: '出貨、寄', formal: '出貨、運送' },
  shortage: { casual: '缺貨、不夠', formal: '短缺、不足' },
  skill: { casual: '技能、本事', formal: '技能、專長' },
  solution: { casual: '解法、辦法', formal: '解決方案、對策' },
  staff: { casual: '員工、人手', formal: '員工、職員' },
  stock: { casual: '庫存、股票', formal: '存貨、股票' },
  strategy: { casual: '策略、招', formal: '策略、方略' },
  submit: { casual: '交、送出', formal: '提交、呈交' },
  supervise: { casual: '盯、看著', formal: '督導、監督' },
  supply: { casual: '供應、給貨', formal: '供應、供給' },
  support: { casual: '幫、撐', formal: '支援、支持' },
  survey: { casual: '問卷、調查', formal: '調查、問卷' },
  target: { casual: '目標', formal: '目標、標的' },
  task: { casual: '工作、任務', formal: '任務、工作項目' },
  tax: { casual: '稅', formal: '稅、稅務' },
  team: { casual: '團隊、組', formal: '團隊、小組' },
  terminate: { casual: '結束、解約', formal: '終止、解除' },
  transfer: { casual: '轉、調', formal: '轉移、調動、匯款' },
  update: { casual: '更新、說進度', formal: '更新、最新狀況' },
  urgent: { casual: '很急', formal: '緊急、急件' },
  vacancy: { casual: '職缺、空位', formal: '職缺、空缺' },
  vendor: { casual: '廠商、賣家', formal: '供應商、廠商' },
  verify: { casual: '確認、查一下', formal: '核實、查證' },
  warehouse: { casual: '倉庫', formal: '倉庫、物流中心' },
  warranty: { casual: '保固', formal: '保固、保證書' },
  withdraw: { casual: '領錢、退出', formal: '提領、撤回' },
  workflow: { casual: '工作流程', formal: '工作流程、作業流程' },
  workload: { casual: '工作量', formal: '工作負荷、業務量' },
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

  // ── Step 1: Local-First — instant, ZERO network ──
  if (isEn2Zh) {
    const hit = LOCAL_DICT[dictKey(text)]
    if (hit) return buildResult(text, direction, 'local', hit.casual, hit.formal, isEn2Zh)
  }

  // ── Step 2: Cloud LLM (only for uncached / custom text) ──
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
