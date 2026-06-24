// ─────────────────────────────────────────────────────────────
// Greek/Latin root families for the Etymology Mastery view.
// Each root: { id, root, gloss, origin, explanation, words[] }
// Each word carries its own phonetics + a `note` tying it to the root.
// Word ids are namespaced (e.g. 'spect-prospect') so they never collide
// with the daily list and can be tracked individually in Firestore.
// ─────────────────────────────────────────────────────────────

export const ROOTS = [
  {
    id: 'spect',
    root: 'SPEC / SPECT',
    gloss: 'to look, to see',
    origin: 'Latin · specere',
    explanation:
      'From the Latin verb specere, "to look at." It is one of the most productive roots in legal and commercial English. A Roman inspector (in- "into" + specere) literally "looked into" matters of state; today an auditor inspects accounts. The same root gives us spectacle (something shown to be looked at) and, in finance, prospect — what one "looks forward" to. When you respect someone you "look back" at them with regard, and circumspect officials "look around" before acting.',
    words: [
      { id: 'spect-inspect', word: 'inspect', pos: 'verb', kk: '[ɪnˈspɛkt]', ipa: '/ɪnˈspekt/', definition: 'to look into something carefully; examine', example: 'Officials inspect every shipment at the port.', note: 'in- (into) + spect (look) = to look into.' },
      { id: 'spect-prospect', word: 'prospect', pos: 'noun', kk: '[ˈprɑspɛkt]', ipa: '/ˈprɒspekt/', definition: 'a possibility of future success', example: 'The merger improved the firm’s prospects.', note: 'pro- (forward) + spect (look) = to look ahead.' },
      { id: 'spect-perspective', word: 'perspective', pos: 'noun', kk: '[pɚˈspɛktɪv]', ipa: '/pəˈspektɪv/', definition: 'a particular way of viewing things', example: 'Her report offers a fresh perspective on costs.', note: 'per- (through) + spect (look) = a way of looking through.' },
      { id: 'spect-conspicuous', word: 'conspicuous', pos: 'adj', kk: '[kənˈspɪkjuəs]', ipa: '/kənˈspɪkjuəs/', definition: 'clearly visible; attracting notice', example: 'The exit signs were conspicuous and well lit.', note: 'con- (intensive) + spic (look) = standing out to be seen.' },
      { id: 'spect-speculate', word: 'speculate', pos: 'verb', kk: '[ˈspɛkjəˌlet]', ipa: '/ˈspekjəleɪt/', definition: 'to form a theory; to invest at risk', example: 'Investors speculated on a rate cut.', note: 'spec (look) = to look ahead and guess.' },
    ],
  },
  {
    id: 'cept',
    root: 'CAP / CEPT / CIP',
    gloss: 'to take, to seize',
    origin: 'Latin · capere',
    explanation:
      'From Latin capere, "to take or seize." In Roman law a captive (captus) was one "taken" in war, and to accept (ad- "to" + capere) is to "take toward" oneself. The root underlies the language of contracts and commerce: a recipient takes delivery, an exception is something "taken out" of a rule, and intercepted goods are "taken between" sender and receiver. Capable people have the capacity to "take hold" of a task.',
    words: [
      { id: 'cept-capable', word: 'capable', pos: 'adj', kk: '[ˈkepəbl̩]', ipa: '/ˈkeɪpəbl/', definition: 'having the ability to do something', example: 'She is more than capable of leading the team.', note: 'cap (take) = able to take hold of a task.' },
      { id: 'cept-recipient', word: 'recipient', pos: 'noun', kk: '[rɪˈsɪpiənt]', ipa: '/rɪˈsɪpiənt/', definition: 'a person who receives something', example: 'The recipient must sign for the parcel.', note: 're- (back) + cip (take) = one who takes/receives.' },
      { id: 'cept-exception', word: 'exception', pos: 'noun', kk: '[ɪkˈsɛpʃən]', ipa: '/ɪkˈsepʃn/', definition: 'something excluded from a general rule', example: 'No exceptions to the refund policy are allowed.', note: 'ex- (out) + cept (take) = taken out.' },
      { id: 'cept-perceptive', word: 'perceptive', pos: 'adj', kk: '[pɚˈsɛptɪv]', ipa: '/pəˈseptɪv/', definition: 'having keen insight or awareness', example: 'A perceptive manager spots problems early.', note: 'per- (through) + cept (take) = taking in fully.' },
      { id: 'cept-intercept', word: 'intercept', pos: 'verb', kk: '[ˌɪntɚˈsɛpt]', ipa: '/ˌɪntəˈsept/', definition: 'to stop or seize something in transit', example: 'Customs intercepted the undeclared goods.', note: 'inter- (between) + cept (take) = take between.' },
    ],
  },
  {
    id: 'duct',
    root: 'DUC / DUCT',
    gloss: 'to lead, to bring',
    origin: 'Latin · ducere',
    explanation:
      'From Latin ducere, "to lead." A Roman dux led armies (the title survives in "duke"). In modern business English the root describes movement and management: a conductor leads an orchestra or carries current, a factory produces (pro- "forward" + ducere) goods by "leading them forth," and a leader who induces change "leads others into" it. An aqueduct literally "leads water."',
    words: [
      { id: 'duct-conduct', word: 'conduct', pos: 'verb', kk: '[kənˈdʌkt]', ipa: '/kənˈdʌkt/', definition: 'to organize and carry out; to lead', example: 'They conducted the negotiations professionally.', note: 'con- (together) + duct (lead) = to lead together.' },
      { id: 'duct-produce', word: 'produce', pos: 'verb', kk: '[prəˈdjus]', ipa: '/prəˈdjuːs/', definition: 'to make or manufacture', example: 'The plant produces ten thousand units a day.', note: 'pro- (forward) + duce (lead) = to lead forth.' },
      { id: 'duct-induce', word: 'induce', pos: 'verb', kk: '[ɪnˈdjus]', ipa: '/ɪnˈdjuːs/', definition: 'to persuade or bring about', example: 'Lower prices induced more customers to buy.', note: 'in- (into) + duce (lead) = to lead into.' },
      { id: 'duct-conducive', word: 'conducive', pos: 'adj', kk: '[kənˈdjusɪv]', ipa: '/kənˈdjuːsɪv/', definition: 'making a certain outcome likely', example: 'A quiet office is conducive to focus.', note: 'con- + duc (lead) = leading toward a result.' },
      { id: 'duct-reduction', word: 'reduction', pos: 'noun', kk: '[rɪˈdʌkʃən]', ipa: '/rɪˈdʌkʃn/', definition: 'the act of making something smaller', example: 'A cost reduction boosted the margin.', note: 're- (back) + duct (lead) = to lead back/down.' },
    ],
  },
  {
    id: 'port',
    root: 'PORT',
    gloss: 'to carry',
    origin: 'Latin · portare',
    explanation:
      'From Latin portare, "to carry," and the related portus, "harbour" — the place goods are carried in and out. Trade law is full of it: to export is to "carry out" of a country, to import to "carry in," and a porter carries luggage. Something portable can be carried by hand, while rapport is a feeling "carried back" between people. To deport is to "carry away" a person.',
    words: [
      { id: 'port-export', word: 'export', pos: 'verb', kk: '[ɪkˈsport]', ipa: '/ɪkˈspɔːt/', definition: 'to send goods abroad for sale', example: 'The country exports most of its coffee.', note: 'ex- (out) + port (carry) = to carry out.' },
      { id: 'port-portable', word: 'portable', pos: 'adj', kk: '[ˈportəbl̩]', ipa: '/ˈpɔːtəbl/', definition: 'able to be carried easily', example: 'The portable scanner fits in a bag.', note: 'port (carry) + -able = able to be carried.' },
      { id: 'port-transport', word: 'transport', pos: 'verb', kk: '[trænsˈport]', ipa: '/trænˈspɔːt/', definition: 'to move goods or people from place to place', example: 'Refrigerated trucks transport the produce.', note: 'trans- (across) + port (carry) = carry across.' },
      { id: 'port-deport', word: 'deport', pos: 'verb', kk: '[dɪˈport]', ipa: '/dɪˈpɔːt/', definition: 'to expel a person from a country', example: 'The visitor was deported for overstaying.', note: 'de- (away) + port (carry) = to carry away.' },
      { id: 'port-rapport', word: 'rapport', pos: 'noun', kk: '[ræˈpɔr]', ipa: '/ræˈpɔː/', definition: 'a relationship of mutual understanding', example: 'The agent built rapport with the client.', note: 'Old French re-apporter = to carry back (a bond).' },
    ],
  },
  {
    id: 'dict',
    root: 'DICT',
    gloss: 'to say, to speak',
    origin: 'Latin · dicere',
    origin_note: '',
    explanation:
      'From Latin dicere, "to say or declare." It dominates the vocabulary of law and authority. A verdict (Latin vere dictum, "truly said") is the jury’s spoken truth; a dictator’s word is law; an edict is a proclamation "spoken out." To predict is to "say beforehand," to contradict is to "speak against," and a dictionary records how words are "said." Indices and indicators "point by saying."',
    words: [
      { id: 'dict-predict', word: 'predict', pos: 'verb', kk: '[prɪˈdɪkt]', ipa: '/prɪˈdɪkt/', definition: 'to say what will happen in advance', example: 'Economists predict slower growth.', note: 'pre- (before) + dict (say) = to say beforehand.' },
      { id: 'dict-verdict', word: 'verdict', pos: 'noun', kk: '[ˈvɝdɪkt]', ipa: '/ˈvɜːdɪkt/', definition: 'a decision reached by a jury or judge', example: 'The jury delivered a guilty verdict.', note: 'Latin vere (truly) + dict (said) = truly said.' },
      { id: 'dict-dictate', word: 'dictate', pos: 'verb', kk: '[ˈdɪktet]', ipa: '/dɪkˈteɪt/', definition: 'to state or order authoritatively', example: 'Market demand dictates our pricing.', note: 'dict (say) = to say with authority.' },
      { id: 'dict-contradict', word: 'contradict', pos: 'verb', kk: '[ˌkɑntrəˈdɪkt]', ipa: '/ˌkɒntrəˈdɪkt/', definition: 'to assert the opposite of a statement', example: 'The new data contradicts the forecast.', note: 'contra- (against) + dict (say) = to speak against.' },
      { id: 'dict-indicate', word: 'indicate', pos: 'verb', kk: '[ˈɪndəˌket]', ipa: '/ˈɪndɪkeɪt/', definition: 'to point out or show', example: 'The figures indicate a strong recovery.', note: 'in- (toward) + dic (say/point) = to point out.' },
    ],
  },
  {
    id: 'script',
    root: 'SCRIB / SCRIPT',
    gloss: 'to write',
    origin: 'Latin · scribere',
    explanation:
      'From Latin scribere, "to write." Before printing, a scribe wrote contracts and scripture by hand; the root still governs documents and agreements. To subscribe was originally to "write one’s name underneath" a contract, to prescribe is to "write a rule before," and a manuscript (manu + scriptum) is "written by hand." A transcript is a written copy carried across from speech.',
    words: [
      { id: 'script-describe', word: 'describe', pos: 'verb', kk: '[dɪˈskraɪb]', ipa: '/dɪˈskraɪb/', definition: 'to give an account of in words', example: 'Please describe the defect in detail.', note: 'de- (down) + scribe (write) = to write down.' },
      { id: 'script-prescribe', word: 'prescribe', pos: 'verb', kk: '[prɪˈskraɪb]', ipa: '/prɪˈskraɪb/', definition: 'to set down as a rule or remedy', example: 'The policy prescribes annual reviews.', note: 'pre- (before) + scribe (write) = to write beforehand.' },
      { id: 'script-subscribe', word: 'subscribe', pos: 'verb', kk: '[səbˈskraɪb]', ipa: '/səbˈskraɪb/', definition: 'to arrange to receive or support', example: 'Thousands subscribed to the newsletter.', note: 'sub- (under) + scribe (write) = to sign underneath.' },
      { id: 'script-manuscript', word: 'manuscript', pos: 'noun', kk: '[ˈmænjəˌskrɪpt]', ipa: '/ˈmænjuskrɪpt/', definition: 'a handwritten or typed document', example: 'The author submitted the manuscript.', note: 'manu (hand) + script (written) = written by hand.' },
      { id: 'script-transcript', word: 'transcript', pos: 'noun', kk: '[ˈtrænˌskrɪpt]', ipa: '/ˈtrænskrɪpt/', definition: 'a written copy of spoken material', example: 'A transcript of the call was emailed.', note: 'trans- (across) + script (written) = written across/over.' },
    ],
  },
  {
    id: 'tain',
    root: 'TEN / TAIN',
    gloss: 'to hold, to keep',
    origin: 'Latin · tenere',
    explanation:
      'From Latin tenere, "to hold." A tenant holds property, and the law of tenure grew from it. In business the root means keeping and continuing: to maintain (manu + tenere) is to "hold in the hand," to retain is to "hold back," to sustain is to "hold up from below," and to detain is to "hold away." Anything tenable can be held or defended.',
    words: [
      { id: 'tain-retain', word: 'retain', pos: 'verb', kk: '[rɪˈten]', ipa: '/rɪˈteɪn/', definition: 'to keep or hold onto', example: 'We work hard to retain skilled staff.', note: 're- (back) + tain (hold) = to hold back.' },
      { id: 'tain-sustain', word: 'sustain', pos: 'verb', kk: '[səˈsten]', ipa: '/səˈsteɪn/', definition: 'to keep going; to support', example: 'Demand sustained the company through the slump.', note: 'sus- (under) + tain (hold) = to hold up.' },
      { id: 'tain-tenant', word: 'tenant', pos: 'noun', kk: '[ˈtɛnənt]', ipa: '/ˈtenənt/', definition: 'a person who rents property', example: 'The tenant renewed the office lease.', note: 'ten (hold) = one who holds/occupies.' },
      { id: 'tain-detain', word: 'detain', pos: 'verb', kk: '[dɪˈten]', ipa: '/dɪˈteɪn/', definition: 'to hold back or keep in custody', example: 'Bad weather detained the shipment.', note: 'de- (away) + tain (hold) = to hold away.' },
      { id: 'tain-tenure', word: 'tenure', pos: 'noun', kk: '[ˈtɛnjɚ]', ipa: '/ˈtenjə/', definition: 'the holding of a position or property', example: 'During her tenure, profits doubled.', note: 'ten (hold) = the period one holds a post.' },
    ],
  },
  {
    id: 'vert',
    root: 'VERT / VERS',
    gloss: 'to turn',
    origin: 'Latin · vertere',
    explanation:
      'From Latin vertere, "to turn." It describes change of direction or state. To convert is to "turn with/around" into a new form, to reverse is to "turn back," and a versatile worker can "turn" to many tasks. An advert(isement) originally "turned" the public’s attention toward something, and to avert risk is to "turn it away."',
    words: [
      { id: 'vert-convert', word: 'convert', pos: 'verb', kk: '[kənˈvɝt]', ipa: '/kənˈvɜːt/', definition: 'to change into a different form', example: 'We converted the warehouse into offices.', note: 'con- (with) + vert (turn) = to turn around.' },
      { id: 'vert-reverse', word: 'reverse', pos: 'verb', kk: '[rɪˈvɝs]', ipa: '/rɪˈvɜːs/', definition: 'to turn the other way; to undo', example: 'The court reversed the earlier ruling.', note: 're- (back) + verse (turn) = to turn back.' },
      { id: 'vert-versatile', word: 'versatile', pos: 'adj', kk: '[ˈvɝsətl̩]', ipa: '/ˈvɜːsətaɪl/', definition: 'able to adapt to many functions', example: 'A versatile employee fills many roles.', note: 'vers (turn) = able to turn to anything.' },
      { id: 'vert-divert', word: 'divert', pos: 'verb', kk: '[daɪˈvɝt]', ipa: '/daɪˈvɜːt/', definition: 'to change the direction of', example: 'Traffic was diverted around the site.', note: 'di- (aside) + vert (turn) = to turn aside.' },
      { id: 'vert-avert', word: 'avert', pos: 'verb', kk: '[əˈvɝt]', ipa: '/əˈvɜːt/', definition: 'to prevent; to turn away', example: 'Quick action averted a costly error.', note: 'a- (away) + vert (turn) = to turn away.' },
    ],
  },
]

export const ROOTS_BY_ID = ROOTS.reduce((acc, r) => {
  acc[r.id] = r
  return acc
}, {})

// Flattened root words, each tagged with its rootId.
export const ROOT_WORDS = ROOTS.flatMap((r) =>
  r.words.map((w) => ({ ...w, rootId: r.id })),
)
