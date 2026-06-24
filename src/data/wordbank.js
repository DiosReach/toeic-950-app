// ─────────────────────────────────────────────────────────────
// Score-tiered TOEIC word bank + deterministic "infinite" day generator.
//
// Tier 1 (Days 1-30)   → Target 700  · Core Business Ops, Logistics, Meetings
// Tier 2 (Days 31-60)  → Target 850  · Corporate Strategy, Finance, Marketing
// Tier 3 (Days 61-100+)→ Target 950  · Elite Nuances, Idioms, Tricky Synonyms
//
// generateDay(n) is pure & deterministic: the same day number always yields
// the same 30-word allocation + root/prefix topic, seeded by the day number.
// Firestore (users/{uid}/generatedDays/{n}) persists each allocation so a
// user's journey is stable and "infinite" even if the algorithm changes later.
// ─────────────────────────────────────────────────────────────
import { WORDS } from './words'

// Tier 1 reuses the core 80-word business list.
export const TIER1_WORDS = WORDS

// Tier 2 — strategy / finance / marketing (Target 850)
export const TIER2_WORDS = [
  { id: 't2-01', word: 'leverage', pos: 'verb', kk: '[ˈlɛvərɪdʒ]', ipa: '/ˈliːvərɪdʒ/', definition: 'to use something to maximum advantage', example: 'We leveraged our brand to enter new markets.' },
  { id: 't2-02', word: 'diversify', pos: 'verb', kk: '[daɪˈvɝsəˌfaɪ]', ipa: '/daɪˈvɜːsɪfaɪ/', definition: 'to spread investments or activities to reduce risk', example: 'The fund diversified across several sectors.' },
  { id: 't2-03', word: 'liquidity', pos: 'noun', kk: '[lɪˈkwɪdəti]', ipa: '/lɪˈkwɪdəti/', definition: 'the availability of cash or easily sold assets', example: 'Strong liquidity helped the firm survive the downturn.' },
  { id: 't2-04', word: 'valuation', pos: 'noun', kk: '[ˌvæljuˈeʃən]', ipa: '/ˌvæljuˈeɪʃn/', definition: 'an estimate of something’s worth', example: 'The startup’s valuation doubled after funding.' },
  { id: 't2-05', word: 'margin', pos: 'noun', kk: '[ˈmɑrdʒɪn]', ipa: '/ˈmɑːdʒɪn/', definition: 'the difference between cost and selling price', example: 'Higher volume improved the profit margin.' },
  { id: 't2-06', word: 'overhead', pos: 'noun', kk: '[ˈovɚˌhɛd]', ipa: '/ˈəʊvəhed/', definition: 'ongoing business expenses not tied to a product', example: 'Moving offices cut our overhead.' },
  { id: 't2-07', word: 'segment', pos: 'noun', kk: '[ˈsɛɡmənt]', ipa: '/ˈseɡmənt/', definition: 'a distinct portion of a market', example: 'The luxury segment grew fastest.' },
  { id: 't2-08', word: 'acquisition', pos: 'noun', kk: '[ˌækwəˈzɪʃən]', ipa: '/ˌækwɪˈzɪʃn/', definition: 'the purchase of one company by another', example: 'The acquisition expanded their portfolio.' },
  { id: 't2-09', word: 'stakeholder', pos: 'noun', kk: '[ˈstekˌholdɚ]', ipa: '/ˈsteɪkhəʊldə/', definition: 'a person with an interest in a business', example: 'We surveyed every stakeholder before deciding.' },
  { id: 't2-10', word: 'forecasting', pos: 'noun', kk: '[ˈforˌkæstɪŋ]', ipa: '/ˈfɔːkɑːstɪŋ/', definition: 'predicting future trends from data', example: 'Accurate forecasting prevents overstocking.' },
  { id: 't2-11', word: 'benchmark', pos: 'noun', kk: '[ˈbɛntʃˌmɑrk]', ipa: '/ˈbentʃmɑːk/', definition: 'a standard used for comparison', example: 'Our response time beats the industry benchmark.' },
  { id: 't2-12', word: 'dividend', pos: 'noun', kk: '[ˈdɪvəˌdɛnd]', ipa: '/ˈdɪvɪdend/', definition: 'a share of profits paid to shareholders', example: 'The board raised the quarterly dividend.' },
  { id: 't2-13', word: 'portfolio', pos: 'noun', kk: '[portˈfolioˌo]', ipa: '/pɔːtˈfəʊliəʊ/', definition: 'a range of investments or products held', example: 'They rebalanced the portfolio toward bonds.' },
  { id: 't2-14', word: 'capitalize', pos: 'verb', kk: '[ˈkæpətlˌaɪz]', ipa: '/ˈkæpɪtəlaɪz/', definition: 'to take advantage of; to provide funding', example: 'They capitalized on the holiday demand.' },
  { id: 't2-15', word: 'projection', pos: 'noun', kk: '[prəˈdʒɛkʃən]', ipa: '/prəˈdʒekʃn/', definition: 'an estimate of future performance', example: 'Revenue projections were revised upward.' },
  { id: 't2-16', word: 'allocation', pos: 'noun', kk: '[ˌæləˈkeʃən]', ipa: '/ˌæləˈkeɪʃn/', definition: 'the distribution of resources', example: 'Budget allocation favored R&D this year.' },
  { id: 't2-17', word: 'penetration', pos: 'noun', kk: '[ˌpɛnəˈtreʃən]', ipa: '/ˌpenɪˈtreɪʃn/', definition: 'the degree a product reaches a market', example: 'Mobile penetration boosted online sales.' },
  { id: 't2-18', word: 'synergy', pos: 'noun', kk: '[ˈsɪnɚdʒi]', ipa: '/ˈsɪnədʒi/', definition: 'combined effect greater than separate parts', example: 'The merger created real cost synergy.' },
  { id: 't2-19', word: 'turnover', pos: 'noun', kk: '[ˈtɝnˌovɚ]', ipa: '/ˈtɜːnəʊvə/', definition: 'total sales; rate staff leave a company', example: 'High staff turnover raised training costs.' },
  { id: 't2-20', word: 'incentivize', pos: 'verb', kk: '[ɪnˈsɛntəˌvaɪz]', ipa: '/ɪnˈsentɪvaɪz/', definition: 'to motivate with a reward', example: 'Commissions incentivize the sales team.' },
  { id: 't2-21', word: 'scalable', pos: 'adj', kk: '[ˈskeləbl̩]', ipa: '/ˈskeɪləbl/', definition: 'able to grow without losing efficiency', example: 'A scalable platform handles sudden demand.' },
  { id: 't2-22', word: 'demographic', pos: 'noun', kk: '[ˌdɛməˈɡræfɪk]', ipa: '/ˌdeməˈɡræfɪk/', definition: 'a section of a population', example: 'The ad targeted a younger demographic.' },
  { id: 't2-23', word: 'consolidation', pos: 'noun', kk: '[kənˌsɑləˈdeʃən]', ipa: '/kənˌsɒlɪˈdeɪʃn/', definition: 'the combining of companies or assets', example: 'Industry consolidation reduced competition.' },
  { id: 't2-24', word: 'optimize', pos: 'verb', kk: '[ˈɑptəˌmaɪz]', ipa: '/ˈɒptɪmaɪz/', definition: 'to make as effective as possible', example: 'We optimized the supply chain for speed.' },
]

// Tier 3 — elite nuances / idioms / tricky synonyms (Target 950)
export const TIER3_WORDS = [
  { id: 't3-01', word: 'ostensibly', pos: 'adv', kk: '[ɑˈstɛnsəbli]', ipa: '/ɒˈstensəbli/', definition: 'apparently, but perhaps not really', example: 'He left, ostensibly to make a call.' },
  { id: 't3-02', word: 'mitigate', pos: 'verb', kk: '[ˈmɪtəˌɡet]', ipa: '/ˈmɪtɪɡeɪt/', definition: 'to make less severe', example: 'Hedging mitigated the currency risk.' },
  { id: 't3-03', word: 'prudent', pos: 'adj', kk: '[ˈprudn̩t]', ipa: '/ˈpruːdnt/', definition: 'showing careful good judgment', example: 'A prudent investor keeps a cash reserve.' },
  { id: 't3-04', word: 'lucrative', pos: 'adj', kk: '[ˈlukrətɪv]', ipa: '/ˈluːkrətɪv/', definition: 'producing a great deal of profit', example: 'They signed a lucrative licensing deal.' },
  { id: 't3-05', word: 'contingency', pos: 'noun', kk: '[kənˈtɪndʒənsi]', ipa: '/kənˈtɪndʒənsi/', definition: 'a future event planned for just in case', example: 'We set aside a contingency budget.' },
  { id: 't3-06', word: 'discrepancy', pos: 'noun', kk: '[dɪˈskrɛpənsi]', ipa: '/dɪˈskrepənsi/', definition: 'a difference that should not exist', example: 'An audit found a discrepancy in the totals.' },
  { id: 't3-07', word: 'ambiguous', pos: 'adj', kk: '[æmˈbɪɡjuəs]', ipa: '/æmˈbɪɡjuəs/', definition: 'open to more than one interpretation', example: 'The clause was ambiguous and caused disputes.' },
  { id: 't3-08', word: 'preliminary', pos: 'adj', kk: '[prɪˈlɪməˌnɛri]', ipa: '/prɪˈlɪmɪnəri/', definition: 'coming before the main part', example: 'Preliminary results look encouraging.' },
  { id: 't3-09', word: 'unprecedented', pos: 'adj', kk: '[ʌnˈprɛsəˌdɛntɪd]', ipa: '/ʌnˈpresɪdentɪd/', definition: 'never done or known before', example: 'Demand reached unprecedented levels.' },
  { id: 't3-10', word: 'inadvertently', pos: 'adv', kk: '[ˌɪnədˈvɝtntli]', ipa: '/ˌɪnədˈvɜːtntli/', definition: 'without intention; accidentally', example: 'The figures were inadvertently omitted.' },
  { id: 't3-11', word: 'compelling', pos: 'adj', kk: '[kəmˈpɛlɪŋ]', ipa: '/kəmˈpelɪŋ/', definition: 'convincingly persuasive', example: 'She made a compelling case for the budget.' },
  { id: 't3-12', word: 'viable', pos: 'adj', kk: '[ˈvaɪəbl̩]', ipa: '/ˈvaɪəbl/', definition: 'capable of working successfully', example: 'Solar became a viable alternative.' },
  { id: 't3-13', word: 'streamlined', pos: 'adj', kk: '[ˈstrimˌlaɪnd]', ipa: '/ˈstriːmlaɪnd/', definition: 'made simpler and more efficient', example: 'A streamlined process cut delays.' },
  { id: 't3-14', word: 'redundant', pos: 'adj', kk: '[rɪˈdʌndənt]', ipa: '/rɪˈdʌndənt/', definition: 'no longer needed; superfluous', example: 'Automation made several roles redundant.' },
  { id: 't3-15', word: 'meticulous', pos: 'adj', kk: '[məˈtɪkjələs]', ipa: '/məˈtɪkjələs/', definition: 'extremely careful about detail', example: 'Her meticulous records impressed the auditor.' },
  { id: 't3-16', word: 'leverageable', pos: 'adj', kk: '[ˈlɛvərɪdʒəbl̩]', ipa: '/ˈliːvərɪdʒəbl/', definition: 'able to be used for advantage', example: 'Their data is a leverageable asset.' },
  { id: 't3-17', word: 'paramount', pos: 'adj', kk: '[ˈpɛrəˌmaʊnt]', ipa: '/ˈpærəmaʊnt/', definition: 'more important than anything else', example: 'Customer trust is paramount.' },
  { id: 't3-18', word: 'tentatively', pos: 'adv', kk: '[ˈtɛntətɪvli]', ipa: '/ˈtentətɪvli/', definition: 'in a hesitant or provisional way', example: 'We tentatively agreed to the terms.' },
  { id: 't3-19', word: 'nuance', pos: 'noun', kk: '[ˈnuˌɑns]', ipa: '/ˈnjuːɑːns/', definition: 'a subtle difference in meaning', example: 'The translation lost a key nuance.' },
  { id: 't3-20', word: 'culminate', pos: 'verb', kk: '[ˈkʌlməˌnet]', ipa: '/ˈkʌlmɪneɪt/', definition: 'to reach a final climactic point', example: 'The talks culminated in a partnership.' },
  { id: 't3-21', word: 'pragmatic', pos: 'adj', kk: '[præɡˈmætɪk]', ipa: '/præɡˈmætɪk/', definition: 'dealing with things practically', example: 'They took a pragmatic approach to costs.' },
  { id: 't3-22', word: 'inherent', pos: 'adj', kk: '[ɪnˈhɪrənt]', ipa: '/ɪnˈhɪərənt/', definition: 'existing as a permanent quality', example: 'Every venture carries inherent risk.' },
  { id: 't3-23', word: 'discretion', pos: 'noun', kk: '[dɪˈskrɛʃən]', ipa: '/dɪˈskreʃn/', definition: 'freedom to decide; careful judgment', example: 'Refunds are issued at the manager’s discretion.' },
  { id: 't3-24', word: 'expedient', pos: 'adj', kk: '[ɪkˈspidiənt]', ipa: '/ɪkˈspiːdiənt/', definition: 'convenient and practical, if not principled', example: 'It was expedient to settle out of court.' },
]

// Root/prefix topics cycled across days to frame each day's theme.
export const TOPICS = [
  { id: 'pre', title: 'Prefix: PRE-', root: 'pre-', hint: 'before / in advance (predict, prepare, preliminary)' },
  { id: 'spect', title: 'Root: SPECT', root: 'spect', hint: 'to look (inspect, prospect, perspective)' },
  { id: 're', title: 'Prefix: RE-', root: 're-', hint: 'again / back (retain, reverse, reimburse)' },
  { id: 'port', title: 'Root: PORT', root: 'port', hint: 'to carry (export, transport, portable)' },
  { id: 'inter', title: 'Prefix: INTER-', root: 'inter-', hint: 'between / among (intercept, interact, interim)' },
  { id: 'dict', title: 'Root: DICT', root: 'dict', hint: 'to say (predict, verdict, dictate)' },
  { id: 'trans', title: 'Prefix: TRANS-', root: 'trans-', hint: 'across / change (transfer, transport, transcript)' },
  { id: 'duct', title: 'Root: DUC/DUCT', root: 'duct', hint: 'to lead (conduct, produce, induce)' },
  { id: 'con', title: 'Prefix: CON-', root: 'con-', hint: 'together / with (consolidate, conduct, contingent)' },
  { id: 'tain', title: 'Root: TEN/TAIN', root: 'tain', hint: 'to hold (retain, sustain, maintain)' },
  { id: 'sub', title: 'Prefix: SUB-', root: 'sub-', hint: 'under / below (subscribe, subsequent, submit)' },
  { id: 'vert', title: 'Root: VERT/VERS', root: 'vert', hint: 'to turn (convert, reverse, divert)' },
]

export const TOPICS_BY_ID = TOPICS.reduce((a, t) => ((a[t.id] = t), a), {})

const TIER_OWN = { 1: TIER1_WORDS, 2: TIER2_WORDS, 3: TIER3_WORDS }
// Cumulative lower-tier pools guarantee at least 30 words are always available.
const TIER_LOWER = {
  1: [],
  2: [...TIER1_WORDS],
  3: [...TIER1_WORDS, ...TIER2_WORDS],
}

export const tierForDay = (day) => (day <= 30 ? 1 : day <= 60 ? 2 : 3)
export const targetForTier = (tier) => (tier === 1 ? 700 : tier === 2 ? 850 : 950)

// Small seeded PRNG (mulberry32) so allocations are deterministic per day.
const mulberry32 = (seed) => () => {
  let t = (seed += 0x6d2b79f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const sampleN = (arr, rng, n) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, Math.min(n, a.length))
}

const DAY_SIZE = 30

/**
 * Deterministically allocate a day's topic + 30 word ids.
 * @param {number} day  1-based relative study day
 * @returns {{day, tier, target, topicId, topic, wordIds:string[]}}
 */
export function generateDay(day) {
  const tier = tierForDay(day)
  const target = targetForTier(tier)
  const topic = TOPICS[(day - 1) % TOPICS.length]
  const rng = mulberry32((day * 2654435761) >>> 0)

  const own = sampleN(TIER_OWN[tier], rng, 22)
  const fill = sampleN(TIER_LOWER[tier], rng, DAY_SIZE - own.length)
  // Dedupe + cap at 30, shuffled together for variety.
  const seen = new Set()
  const merged = sampleN([...own, ...fill], rng, [...own, ...fill].length)
    .filter((w) => (seen.has(w.id) ? false : (seen.add(w.id), true)))
    .slice(0, DAY_SIZE)

  return {
    day,
    tier,
    target,
    topicId: topic.id,
    topic,
    wordIds: merged.map((w) => w.id),
  }
}
