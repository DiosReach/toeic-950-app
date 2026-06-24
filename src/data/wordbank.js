// ─────────────────────────────────────────────────────────────
// Root-driven daily vocabulary generator.
//
// Each relative study day is powered 100% by a single Greek/Latin root
// family. Day N → ROOT_SEQUENCE[(N-1) % length], and that day's words ARE
// that root's derived word family. There is no separate/unrelated word pool.
//
// Score tiers still describe the journey for the badge/target only:
//   Days 1-30 → Target 700 · Days 31-60 → Target 850 · Days 61+ → Target 950
//
// TIER2_WORDS / TIER3_WORDS below are NOT used for daily generation anymore;
// they remain only to enrich the catalog (extra distractors for exams).
// ─────────────────────────────────────────────────────────────
import { ROOTS } from './roots'

// Order in which roots are assigned to days (Day 1 = SPEC/SPECT).
export const ROOT_SEQUENCE = ROOTS

export const tierForDay = (day) => (day <= 30 ? 1 : day <= 60 ? 2 : 3)
export const targetForTier = (tier) => (tier === 1 ? 700 : tier === 2 ? 850 : 950)

/**
 * Allocate a day's vocabulary — entirely from its assigned root family.
 * Deterministic: the same day always maps to the same root + word set.
 * @param {number} day  1-based relative study day
 * @returns {{day, tier, target, rootId, wordIds:string[], goal:number}}
 */
export function generateDay(day) {
  const root = ROOT_SEQUENCE[(day - 1) % ROOT_SEQUENCE.length]
  const tier = tierForDay(day)
  const wordIds = root.words.map((w) => w.id)
  return {
    day,
    tier,
    target: targetForTier(tier),
    rootId: root.id,
    wordIds,
    goal: wordIds.length, // the day's quota = the size of this root family
  }
}

// ── Supplementary TOEIC words (catalog/exam distractors only) ────────────
export const TIER2_WORDS = [
  { id: 't2-01', word: 'leverage', pos: 'verb', kk: '[ˈlɛvərɪdʒ]', ipa: '/ˈliːvərɪdʒ/', definition: 'to use something to maximum advantage', example: 'We leveraged our brand to enter new markets.' },
  { id: 't2-02', word: 'diversify', pos: 'verb', kk: '[daɪˈvɝsəˌfaɪ]', ipa: '/daɪˈvɜːsɪfaɪ/', definition: 'to spread investments or activities to reduce risk', example: 'The fund diversified across several sectors.' },
  { id: 't2-03', word: 'liquidity', pos: 'noun', kk: '[lɪˈkwɪdəti]', ipa: '/lɪˈkwɪdəti/', definition: 'the availability of cash or easily sold assets', example: 'Strong liquidity helped the firm survive the downturn.' },
  { id: 't2-04', word: 'valuation', pos: 'noun', kk: '[ˌvæljuˈeʃən]', ipa: '/ˌvæljuˈeɪʃn/', definition: 'an estimate of something’s worth', example: 'The startup’s valuation doubled after funding.' },
  { id: 't2-05', word: 'margin', pos: 'noun', kk: '[ˈmɑrdʒɪn]', ipa: '/ˈmɑːdʒɪn/', definition: 'the difference between cost and selling price', example: 'Higher volume improved the profit margin.' },
  { id: 't2-06', word: 'overhead', pos: 'noun', kk: '[ˈovɚˌhɛd]', ipa: '/ˈəʊvəhed/', definition: 'ongoing business expenses not tied to a product', example: 'Moving offices cut our overhead.' },
  { id: 't2-07', word: 'stakeholder', pos: 'noun', kk: '[ˈstekˌholdɚ]', ipa: '/ˈsteɪkhəʊldə/', definition: 'a person with an interest in a business', example: 'We surveyed every stakeholder before deciding.' },
  { id: 't2-08', word: 'benchmark', pos: 'noun', kk: '[ˈbɛntʃˌmɑrk]', ipa: '/ˈbentʃmɑːk/', definition: 'a standard used for comparison', example: 'Our response time beats the industry benchmark.' },
  { id: 't2-09', word: 'dividend', pos: 'noun', kk: '[ˈdɪvəˌdɛnd]', ipa: '/ˈdɪvɪdend/', definition: 'a share of profits paid to shareholders', example: 'The board raised the quarterly dividend.' },
  { id: 't2-10', word: 'synergy', pos: 'noun', kk: '[ˈsɪnɚdʒi]', ipa: '/ˈsɪnədʒi/', definition: 'combined effect greater than separate parts', example: 'The merger created real cost synergy.' },
  { id: 't2-11', word: 'turnover', pos: 'noun', kk: '[ˈtɝnˌovɚ]', ipa: '/ˈtɜːnəʊvə/', definition: 'total sales; rate staff leave a company', example: 'High staff turnover raised training costs.' },
  { id: 't2-12', word: 'scalable', pos: 'adj', kk: '[ˈskeləbl̩]', ipa: '/ˈskeɪləbl/', definition: 'able to grow without losing efficiency', example: 'A scalable platform handles sudden demand.' },
]

export const TIER3_WORDS = [
  { id: 't3-01', word: 'mitigate', pos: 'verb', kk: '[ˈmɪtəˌɡet]', ipa: '/ˈmɪtɪɡeɪt/', definition: 'to make less severe', example: 'Hedging mitigated the currency risk.' },
  { id: 't3-02', word: 'prudent', pos: 'adj', kk: '[ˈprudn̩t]', ipa: '/ˈpruːdnt/', definition: 'showing careful good judgment', example: 'A prudent investor keeps a cash reserve.' },
  { id: 't3-03', word: 'lucrative', pos: 'adj', kk: '[ˈlukrətɪv]', ipa: '/ˈluːkrətɪv/', definition: 'producing a great deal of profit', example: 'They signed a lucrative licensing deal.' },
  { id: 't3-04', word: 'discrepancy', pos: 'noun', kk: '[dɪˈskrɛpənsi]', ipa: '/dɪˈskrepənsi/', definition: 'a difference that should not exist', example: 'An audit found a discrepancy in the totals.' },
  { id: 't3-05', word: 'ambiguous', pos: 'adj', kk: '[æmˈbɪɡjuəs]', ipa: '/æmˈbɪɡjuəs/', definition: 'open to more than one interpretation', example: 'The clause was ambiguous and caused disputes.' },
  { id: 't3-06', word: 'unprecedented', pos: 'adj', kk: '[ʌnˈprɛsəˌdɛntɪd]', ipa: '/ʌnˈpresɪdentɪd/', definition: 'never done or known before', example: 'Demand reached unprecedented levels.' },
  { id: 't3-07', word: 'compelling', pos: 'adj', kk: '[kəmˈpɛlɪŋ]', ipa: '/kəmˈpelɪŋ/', definition: 'convincingly persuasive', example: 'She made a compelling case for the budget.' },
  { id: 't3-08', word: 'viable', pos: 'adj', kk: '[ˈvaɪəbl̩]', ipa: '/ˈvaɪəbl/', definition: 'capable of working successfully', example: 'Solar became a viable alternative.' },
  { id: 't3-09', word: 'meticulous', pos: 'adj', kk: '[məˈtɪkjələs]', ipa: '/məˈtɪkjələs/', definition: 'extremely careful about detail', example: 'Her meticulous records impressed the auditor.' },
  { id: 't3-10', word: 'paramount', pos: 'adj', kk: '[ˈpɛrəˌmaʊnt]', ipa: '/ˈpærəmaʊnt/', definition: 'more important than anything else', example: 'Customer trust is paramount.' },
  { id: 't3-11', word: 'pragmatic', pos: 'adj', kk: '[præɡˈmætɪk]', ipa: '/præɡˈmætɪk/', definition: 'dealing with things practically', example: 'They took a pragmatic approach to costs.' },
  { id: 't3-12', word: 'discretion', pos: 'noun', kk: '[dɪˈskrɛʃən]', ipa: '/dɪˈskreʃn/', definition: 'freedom to decide; careful judgment', example: 'Refunds are issued at the manager’s discretion.' },
]
