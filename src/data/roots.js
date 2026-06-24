// ─────────────────────────────────────────────────────────────
// Greek/Latin root families — the SOLE source of each day's vocabulary.
// Each root: { id, root, gloss, origin, explanation, words[] }
// Each word carries its own phonetics + a `note` tying it to the root.
// Word ids are namespaced (e.g. 'spect-prospect') so they never collide
// with other lists and can be tracked individually in Firestore.
//
// Day N is powered entirely by ROOTS[(N-1) % ROOTS.length] (see wordbank.js),
// so every word a user studies on a given day is born from that root.
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
      { id: 'spect-aspect', word: 'aspect', pos: 'noun', kk: '[ˈæspɛkt]', ipa: '/ˈæspekt/', definition: 'a particular feature or side of something', example: 'We reviewed every aspect of the contract.', note: 'a(d)- (to) + spect (look) = a way of looking at.' },
      { id: 'spect-spectator', word: 'spectator', pos: 'noun', kk: '[ˈspɛkˌtetɚ]', ipa: '/spekˈteɪtə/', definition: 'a person who watches an event', example: 'The launch drew thousands of spectators.', note: 'spect (look) = one who looks on.' },
      { id: 'spect-spectacular', word: 'spectacular', pos: 'adj', kk: '[spɛkˈtækjəlɚ]', ipa: '/spekˈtækjələ/', definition: 'strikingly impressive', example: 'The quarter ended with spectacular growth.', note: 'spect (look) = worth looking at.' },
      { id: 'spect-retrospect', word: 'retrospect', pos: 'noun', kk: '[ˈrɛtrəˌspɛkt]', ipa: '/ˈretrəspekt/', definition: 'a review of past events', example: 'In retrospect, the launch was premature.', note: 'retro- (back) + spect (look) = to look back.' },
      { id: 'spect-circumspect', word: 'circumspect', pos: 'adj', kk: '[ˈsɝkəmˌspɛkt]', ipa: '/ˈsɜːkəmspekt/', definition: 'cautious; considering all circumstances', example: 'Be circumspect before signing the deal.', note: 'circum- (around) + spect (look) = to look around.' },
      { id: 'spect-suspect', word: 'suspect', pos: 'verb', kk: '[səˈspɛkt]', ipa: '/səˈspekt/', definition: 'to believe something without proof', example: 'Auditors suspect an error in the totals.', note: 'sus- (under) + spect (look) = to look under/secretly.' },
      { id: 'spect-respect', word: 'respect', pos: 'noun', kk: '[rɪˈspɛkt]', ipa: '/rɪˈspekt/', definition: 'admiration or regard for someone', example: 'She earned the respect of her team.', note: 're- (back) + spect (look) = to look back at with regard.' },
      { id: 'spect-conspicuous', word: 'conspicuous', pos: 'adj', kk: '[kənˈspɪkjuəs]', ipa: '/kənˈspɪkjuəs/', definition: 'clearly visible; attracting notice', example: 'The exit signs were conspicuous and well lit.', note: 'con- (intensive) + spic (look) = standing out to be seen.' },
      { id: 'spect-speculate', word: 'speculate', pos: 'verb', kk: '[ˈspɛkjəˌlet]', ipa: '/ˈspekjəleɪt/', definition: 'to form a theory; to invest at risk', example: 'Investors speculated on a rate cut.', note: 'spec (look) = to look ahead and guess.' },
      { id: 'spect-specify', word: 'specify', pos: 'verb', kk: '[ˈspɛsəˌfaɪ]', ipa: '/ˈspesɪfaɪ/', definition: 'to state clearly and in detail', example: 'Please specify the delivery date.', note: 'spec (look) + -ify = to make distinctly seen.' },
      { id: 'spect-specimen', word: 'specimen', pos: 'noun', kk: '[ˈspɛsəmən]', ipa: '/ˈspesɪmən/', definition: 'an example or sample for inspection', example: 'They sent a specimen of the new fabric.', note: 'spec (look) = something to be looked at.' },
      { id: 'spect-prospectus', word: 'prospectus', pos: 'noun', kk: '[prəˈspɛktəs]', ipa: '/prəˈspektəs/', definition: 'a document describing a business or offering', example: 'Investors read the prospectus before buying.', note: 'pro- (forward) + spect (look) = an outlook document.' },
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
      { id: 'cept-accept', word: 'accept', pos: 'verb', kk: '[əkˈsɛpt]', ipa: '/əkˈsept/', definition: 'to agree to receive or undertake', example: 'They accepted the revised terms.', note: 'ac- (to) + cept (take) = to take toward oneself.' },
      { id: 'cept-acceptance', word: 'acceptance', pos: 'noun', kk: '[əkˈsɛptəns]', ipa: '/əkˈseptəns/', definition: 'the act of agreeing to receive', example: 'We await your acceptance of the offer.', note: 'ac- (to) + cept (take) + -ance.' },
      { id: 'cept-recipient', word: 'recipient', pos: 'noun', kk: '[rɪˈsɪpiənt]', ipa: '/rɪˈsɪpiənt/', definition: 'a person who receives something', example: 'The recipient must sign for the parcel.', note: 're- (back) + cip (take) = one who takes/receives.' },
      { id: 'cept-reception', word: 'reception', pos: 'noun', kk: '[rɪˈsɛpʃən]', ipa: '/rɪˈsepʃn/', definition: 'the receiving of guests; a front desk area', example: 'Please wait at reception.', note: 're- (back) + cept (take) = the taking-in of guests.' },
      { id: 'cept-receipt', word: 'receipt', pos: 'noun', kk: '[rɪˈsit]', ipa: '/rɪˈsiːt/', definition: 'a written proof of payment', example: 'Keep the receipt for reimbursement.', note: 're- (back) + ceipt (take) = proof of taking payment.' },
      { id: 'cept-exception', word: 'exception', pos: 'noun', kk: '[ɪkˈsɛpʃən]', ipa: '/ɪkˈsepʃn/', definition: 'something excluded from a general rule', example: 'No exceptions to the refund policy are allowed.', note: 'ex- (out) + cept (take) = taken out.' },
      { id: 'cept-concept', word: 'concept', pos: 'noun', kk: '[ˈkɑnsɛpt]', ipa: '/ˈkɒnsept/', definition: 'an abstract idea', example: 'The concept tested well with customers.', note: 'con- (together) + cept (take) = a thought taken together.' },
      { id: 'cept-perceptive', word: 'perceptive', pos: 'adj', kk: '[pɚˈsɛptɪv]', ipa: '/pəˈseptɪv/', definition: 'having keen insight or awareness', example: 'A perceptive manager spots problems early.', note: 'per- (through) + cept (take) = taking in fully.' },
      { id: 'cept-intercept', word: 'intercept', pos: 'verb', kk: '[ˌɪntɚˈsɛpt]', ipa: '/ˌɪntəˈsept/', definition: 'to stop or seize something in transit', example: 'Customs intercepted the undeclared goods.', note: 'inter- (between) + cept (take) = take between.' },
      { id: 'cept-capacity', word: 'capacity', pos: 'noun', kk: '[kəˈpæsəti]', ipa: '/kəˈpæsəti/', definition: 'the maximum amount that can be held', example: 'The plant is running at full capacity.', note: 'cap (take/hold) = ability to hold.' },
      { id: 'cept-anticipate', word: 'anticipate', pos: 'verb', kk: '[ænˈtɪsəˌpet]', ipa: '/ænˈtɪsɪpeɪt/', definition: 'to expect or foresee', example: 'We anticipate strong fourth-quarter sales.', note: 'anti- (before) + cip (take) = to take before.' },
      { id: 'cept-participate', word: 'participate', pos: 'verb', kk: '[pɑrˈtɪsəˌpet]', ipa: '/pɑːˈtɪsɪpeɪt/', definition: 'to take part in', example: 'All staff participate in annual training.', note: 'part + cip (take) = to take part.' },
      { id: 'cept-capture', word: 'capture', pos: 'verb', kk: '[ˈkæptʃɚ]', ipa: '/ˈkæptʃə/', definition: 'to take control of; to record', example: 'The brand captured a new market segment.', note: 'cap (take) = to seize.' },
      { id: 'cept-occupancy', word: 'occupancy', pos: 'noun', kk: '[ˈɑkjəpənsi]', ipa: '/ˈɒkjəpənsi/', definition: 'the act of occupying a space', example: 'Hotel occupancy rose over the holidays.', note: 'oc- (over) + cup (take) = taking/holding a place.' },
    ],
  },
  {
    id: 'duct',
    root: 'DUC / DUCT',
    gloss: 'to lead, to bring',
    origin: 'Latin · ducere',
    explanation:
      'From Latin ducere, "to lead." A Roman dux led armies (the title survives in "duke"). In modern business English the root describes movement and management: a conductor leads, a factory produces (pro- "forward" + ducere) goods by "leading them forth," and a leader who induces change "leads others into" it. An aqueduct literally "leads water."',
    words: [
      { id: 'duct-conduct', word: 'conduct', pos: 'verb', kk: '[kənˈdʌkt]', ipa: '/kənˈdʌkt/', definition: 'to organize and carry out; to lead', example: 'They conducted the negotiations professionally.', note: 'con- (together) + duct (lead) = to lead together.' },
      { id: 'duct-produce', word: 'produce', pos: 'verb', kk: '[prəˈdjus]', ipa: '/prəˈdjuːs/', definition: 'to make or manufacture', example: 'The plant produces ten thousand units a day.', note: 'pro- (forward) + duce (lead) = to lead forth.' },
      { id: 'duct-product', word: 'product', pos: 'noun', kk: '[ˈprɑdʌkt]', ipa: '/ˈprɒdʌkt/', definition: 'something made for sale', example: 'The new product launched in March.', note: 'pro- (forward) + duct (lead) = what is led forth.' },
      { id: 'duct-production', word: 'production', pos: 'noun', kk: '[prəˈdʌkʃən]', ipa: '/prəˈdʌkʃn/', definition: 'the process of manufacturing', example: 'Production slowed during the shortage.', note: 'pro- + duct (lead) + -ion.' },
      { id: 'duct-productivity', word: 'productivity', pos: 'noun', kk: '[ˌprodʌkˈtɪvəti]', ipa: '/ˌprɒdʌkˈtɪvəti/', definition: 'the rate of efficient output', example: 'Automation boosted productivity.', note: 'pro- + duct (lead) = capacity to lead forth output.' },
      { id: 'duct-induce', word: 'induce', pos: 'verb', kk: '[ɪnˈdjus]', ipa: '/ɪnˈdjuːs/', definition: 'to persuade or bring about', example: 'Lower prices induced more customers to buy.', note: 'in- (into) + duce (lead) = to lead into.' },
      { id: 'duct-introduce', word: 'introduce', pos: 'verb', kk: '[ˌɪntrəˈdjus]', ipa: '/ˌɪntrəˈdjuːs/', definition: 'to bring in or present for the first time', example: 'They introduced a loyalty program.', note: 'intro- (inward) + duce (lead) = to lead in.' },
      { id: 'duct-conducive', word: 'conducive', pos: 'adj', kk: '[kənˈdjusɪv]', ipa: '/kənˈdjuːsɪv/', definition: 'making a certain outcome likely', example: 'A quiet office is conducive to focus.', note: 'con- + duc (lead) = leading toward a result.' },
      { id: 'duct-conductor', word: 'conductor', pos: 'noun', kk: '[kənˈdʌktɚ]', ipa: '/kənˈdʌktə/', definition: 'a person or thing that leads/carries', example: 'Copper is an excellent conductor.', note: 'con- + duct (lead) + -or = one who leads.' },
      { id: 'duct-deduct', word: 'deduct', pos: 'verb', kk: '[dɪˈdʌkt]', ipa: '/dɪˈdʌkt/', definition: 'to subtract an amount', example: 'Taxes are deducted from each paycheck.', note: 'de- (away) + duct (lead) = to lead away.' },
      { id: 'duct-deduction', word: 'deduction', pos: 'noun', kk: '[dɪˈdʌkʃən]', ipa: '/dɪˈdʌkʃn/', definition: 'an amount subtracted; a conclusion', example: 'Claim the deduction on your return.', note: 'de- (away) + duct (lead) + -ion.' },
      { id: 'duct-reduce', word: 'reduce', pos: 'verb', kk: '[rɪˈdjus]', ipa: '/rɪˈdjuːs/', definition: 'to make smaller or less', example: 'We reduced overhead by ten percent.', note: 're- (back) + duce (lead) = to lead back/down.' },
      { id: 'duct-reduction', word: 'reduction', pos: 'noun', kk: '[rɪˈdʌkʃən]', ipa: '/rɪˈdʌkʃn/', definition: 'the act of making something smaller', example: 'A cost reduction boosted the margin.', note: 're- (back) + duct (lead) = to lead back/down.' },
      { id: 'duct-induction', word: 'induction', pos: 'noun', kk: '[ɪnˈdʌkʃən]', ipa: '/ɪnˈdʌkʃn/', definition: 'formal introduction to a job or role', example: 'New hires attend an induction day.', note: 'in- (into) + duct (lead) + -ion = leading in.' },
      { id: 'duct-aqueduct', word: 'aqueduct', pos: 'noun', kk: '[ˈækwəˌdʌkt]', ipa: '/ˈækwɪdʌkt/', definition: 'a channel that carries water', example: 'The ancient aqueduct still stands.', note: 'aqua (water) + duct (lead) = water-leader.' },
    ],
  },
  {
    id: 'port',
    root: 'PORT',
    gloss: 'to carry',
    origin: 'Latin · portare',
    explanation:
      'From Latin portare, "to carry," and the related portus, "harbour" — the place goods are carried in and out. Trade law is full of it: to export is to "carry out" of a country, to import to "carry in," and a porter carries luggage. Something portable can be carried by hand, while rapport is a feeling "carried back" between people.',
    words: [
      { id: 'port-export', word: 'export', pos: 'verb', kk: '[ɪkˈsport]', ipa: '/ɪkˈspɔːt/', definition: 'to send goods abroad for sale', example: 'The country exports most of its coffee.', note: 'ex- (out) + port (carry) = to carry out.' },
      { id: 'port-import', word: 'import', pos: 'verb', kk: '[ɪmˈport]', ipa: '/ɪmˈpɔːt/', definition: 'to bring goods in from abroad', example: 'They import components from overseas.', note: 'im- (in) + port (carry) = to carry in.' },
      { id: 'port-report', word: 'report', pos: 'noun', kk: '[rɪˈport]', ipa: '/rɪˈpɔːt/', definition: 'an account of information', example: 'The annual report is due Friday.', note: 're- (back) + port (carry) = to carry back news.' },
      { id: 'port-support', word: 'support', pos: 'verb', kk: '[səˈport]', ipa: '/səˈpɔːt/', definition: 'to hold up; to assist', example: 'The data supports our strategy.', note: 'sup- (under) + port (carry) = to carry from below.' },
      { id: 'port-transport', word: 'transport', pos: 'verb', kk: '[trænsˈport]', ipa: '/trænˈspɔːt/', definition: 'to move goods or people', example: 'Refrigerated trucks transport the produce.', note: 'trans- (across) + port (carry) = carry across.' },
      { id: 'port-transportation', word: 'transportation', pos: 'noun', kk: '[ˌtrænspɚˈteʃən]', ipa: '/ˌtrænspɔːˈteɪʃn/', definition: 'a system for moving people or goods', example: 'Public transportation cut commuting costs.', note: 'trans- + port (carry) + -ation.' },
      { id: 'port-portable', word: 'portable', pos: 'adj', kk: '[ˈportəbl̩]', ipa: '/ˈpɔːtəbl/', definition: 'able to be carried easily', example: 'The portable scanner fits in a bag.', note: 'port (carry) + -able = able to be carried.' },
      { id: 'port-deport', word: 'deport', pos: 'verb', kk: '[dɪˈport]', ipa: '/dɪˈpɔːt/', definition: 'to expel a person from a country', example: 'The visitor was deported for overstaying.', note: 'de- (away) + port (carry) = to carry away.' },
      { id: 'port-rapport', word: 'rapport', pos: 'noun', kk: '[ræˈpɔr]', ipa: '/ræˈpɔː/', definition: 'a relationship of mutual understanding', example: 'The agent built rapport with the client.', note: 'Old French re-apporter = to carry back (a bond).' },
      { id: 'port-portfolio', word: 'portfolio', pos: 'noun', kk: '[portˈfolioˌo]', ipa: '/pɔːtˈfəʊliəʊ/', definition: 'a range of investments or work held', example: 'They rebalanced the portfolio toward bonds.', note: 'port (carry) + folio (leaf) = a case to carry papers.' },
      { id: 'port-importer', word: 'importer', pos: 'noun', kk: '[ɪmˈportɚ]', ipa: '/ɪmˈpɔːtə/', definition: 'a company that brings in foreign goods', example: 'They are the largest importer of tea.', note: 'im- (in) + port (carry) + -er.' },
      { id: 'port-exporter', word: 'exporter', pos: 'noun', kk: '[ɪkˈsportɚ]', ipa: '/ɪkˈspɔːtə/', definition: 'a company that sells goods abroad', example: 'The exporter opened a new branch in Asia.', note: 'ex- (out) + port (carry) + -er.' },
      { id: 'port-importance', word: 'importance', pos: 'noun', kk: '[ɪmˈportns]', ipa: '/ɪmˈpɔːtns/', definition: 'the state of being significant', example: 'They stressed the importance of deadlines.', note: 'im- (in) + port (carry) = what is carried in/weighs.' },
      { id: 'port-opportunity', word: 'opportunity', pos: 'noun', kk: '[ˌɑpɚˈtunəti]', ipa: '/ˌɒpəˈtjuːnəti/', definition: 'a favorable chance', example: 'Expansion is a major growth opportunity.', note: 'ob- (toward) + port (harbour) = wind carrying a ship to port.' },
      { id: 'port-porter', word: 'porter', pos: 'noun', kk: '[ˈportɚ]', ipa: '/ˈpɔːtə/', definition: 'a person who carries luggage or goods', example: 'A porter delivered the bags to the room.', note: 'port (carry) + -er = one who carries.' },
    ],
  },
  {
    id: 'dict',
    root: 'DICT',
    gloss: 'to say, to speak',
    origin: 'Latin · dicere',
    explanation:
      'From Latin dicere, "to say or declare." It dominates the vocabulary of law and authority. A verdict (Latin vere dictum, "truly said") is the jury’s spoken truth; a dictator’s word is law; an edict is a proclamation "spoken out." To predict is to "say beforehand," to contradict is to "speak against," and a dictionary records how words are "said."',
    words: [
      { id: 'dict-predict', word: 'predict', pos: 'verb', kk: '[prɪˈdɪkt]', ipa: '/prɪˈdɪkt/', definition: 'to say what will happen in advance', example: 'Economists predict slower growth.', note: 'pre- (before) + dict (say) = to say beforehand.' },
      { id: 'dict-prediction', word: 'prediction', pos: 'noun', kk: '[prɪˈdɪkʃən]', ipa: '/prɪˈdɪkʃn/', definition: 'a forecast of a future event', example: 'Her prediction proved accurate.', note: 'pre- (before) + dict (say) + -ion.' },
      { id: 'dict-verdict', word: 'verdict', pos: 'noun', kk: '[ˈvɝdɪkt]', ipa: '/ˈvɜːdɪkt/', definition: 'a decision reached by a jury or judge', example: 'The jury delivered a guilty verdict.', note: 'Latin vere (truly) + dict (said) = truly said.' },
      { id: 'dict-dictate', word: 'dictate', pos: 'verb', kk: '[ˈdɪktet]', ipa: '/dɪkˈteɪt/', definition: 'to state or order authoritatively', example: 'Market demand dictates our pricing.', note: 'dict (say) = to say with authority.' },
      { id: 'dict-dictation', word: 'dictation', pos: 'noun', kk: '[dɪkˈteʃən]', ipa: '/dɪkˈteɪʃn/', definition: 'the act of saying words to be written', example: 'The assistant took dictation in the meeting.', note: 'dict (say) + -ation.' },
      { id: 'dict-dictator', word: 'dictator', pos: 'noun', kk: '[ˈdɪkˌtetɚ]', ipa: '/dɪkˈteɪtə/', definition: 'a ruler with absolute power', example: 'The regime was led by a dictator.', note: 'dict (say) = one whose word is law.' },
      { id: 'dict-contradict', word: 'contradict', pos: 'verb', kk: '[ˌkɑntrəˈdɪkt]', ipa: '/ˌkɒntrəˈdɪkt/', definition: 'to assert the opposite of a statement', example: 'The new data contradicts the forecast.', note: 'contra- (against) + dict (say) = to speak against.' },
      { id: 'dict-indicate', word: 'indicate', pos: 'verb', kk: '[ˈɪndəˌket]', ipa: '/ˈɪndɪkeɪt/', definition: 'to point out or show', example: 'The figures indicate a strong recovery.', note: 'in- (toward) + dic (say/point) = to point out.' },
      { id: 'dict-indication', word: 'indication', pos: 'noun', kk: '[ˌɪndəˈkeʃən]', ipa: '/ˌɪndɪˈkeɪʃn/', definition: 'a sign or signal', example: 'There is no indication of fraud.', note: 'in- (toward) + dic (point) + -ation.' },
      { id: 'dict-dedicate', word: 'dedicate', pos: 'verb', kk: '[ˈdɛdəˌket]', ipa: '/ˈdedɪkeɪt/', definition: 'to devote to a purpose', example: 'They dedicated a team to the project.', note: 'de- (intensive) + dic (say/proclaim) = to proclaim for.' },
      { id: 'dict-dedication', word: 'dedication', pos: 'noun', kk: '[ˌdɛdəˈkeʃən]', ipa: '/ˌdedɪˈkeɪʃn/', definition: 'committed devotion to a task', example: 'Her dedication earned a promotion.', note: 'de- + dic (proclaim) + -ation.' },
      { id: 'dict-diction', word: 'diction', pos: 'noun', kk: '[ˈdɪkʃən]', ipa: '/ˈdɪkʃn/', definition: 'the choice and clarity of words', example: 'Clear diction helps in presentations.', note: 'dict (say) + -ion = manner of saying.' },
      { id: 'dict-dictionary', word: 'dictionary', pos: 'noun', kk: '[ˈdɪkʃəˌnɛri]', ipa: '/ˈdɪkʃənri/', definition: 'a reference of words and meanings', example: 'Check the term in a business dictionary.', note: 'dict (say) = a record of how words are said.' },
      { id: 'dict-edict', word: 'edict', pos: 'noun', kk: '[ˈidɪkt]', ipa: '/ˈiːdɪkt/', definition: 'an official order or proclamation', example: 'A new edict tightened safety rules.', note: 'e- (out) + dict (say) = spoken out.' },
      { id: 'dict-jurisdiction', word: 'jurisdiction', pos: 'noun', kk: '[ˌdʒʊrɪsˈdɪkʃən]', ipa: '/ˌdʒʊərɪsˈdɪkʃn/', definition: 'the official authority to make decisions', example: 'The case falls outside our jurisdiction.', note: 'juris (law) + dict (say) = where the law is spoken.' },
    ],
  },
  {
    id: 'script',
    root: 'SCRIB / SCRIPT',
    gloss: 'to write',
    origin: 'Latin · scribere',
    explanation:
      'From Latin scribere, "to write." Before printing, a scribe wrote contracts and scripture by hand; the root still governs documents and agreements. To subscribe was originally to "write one’s name underneath" a contract, to prescribe is to "write a rule before," and a manuscript (manu + scriptum) is "written by hand."',
    words: [
      { id: 'script-describe', word: 'describe', pos: 'verb', kk: '[dɪˈskraɪb]', ipa: '/dɪˈskraɪb/', definition: 'to give an account of in words', example: 'Please describe the defect in detail.', note: 'de- (down) + scribe (write) = to write down.' },
      { id: 'script-description', word: 'description', pos: 'noun', kk: '[dɪˈskrɪpʃən]', ipa: '/dɪˈskrɪpʃn/', definition: 'a written or spoken account', example: 'The job description lists key duties.', note: 'de- (down) + script (write) + -ion.' },
      { id: 'script-prescribe', word: 'prescribe', pos: 'verb', kk: '[prɪˈskraɪb]', ipa: '/prɪˈskraɪb/', definition: 'to set down as a rule or remedy', example: 'The policy prescribes annual reviews.', note: 'pre- (before) + scribe (write) = to write beforehand.' },
      { id: 'script-prescription', word: 'prescription', pos: 'noun', kk: '[prɪˈskrɪpʃən]', ipa: '/prɪˈskrɪpʃn/', definition: 'a written instruction or remedy', example: 'Follow the prescription exactly.', note: 'pre- + script (write) + -ion.' },
      { id: 'script-subscribe', word: 'subscribe', pos: 'verb', kk: '[səbˈskraɪb]', ipa: '/səbˈskraɪb/', definition: 'to arrange to receive or support', example: 'Thousands subscribed to the newsletter.', note: 'sub- (under) + scribe (write) = to sign underneath.' },
      { id: 'script-subscription', word: 'subscription', pos: 'noun', kk: '[səbˈskrɪpʃən]', ipa: '/səbˈskrɪpʃn/', definition: 'an arrangement to receive something regularly', example: 'Subscription revenue grew sharply.', note: 'sub- (under) + script (write) + -ion.' },
      { id: 'script-manuscript', word: 'manuscript', pos: 'noun', kk: '[ˈmænjəˌskrɪpt]', ipa: '/ˈmænjuskrɪpt/', definition: 'a handwritten or typed document', example: 'The author submitted the manuscript.', note: 'manu (hand) + script (written) = written by hand.' },
      { id: 'script-transcript', word: 'transcript', pos: 'noun', kk: '[ˈtrænˌskrɪpt]', ipa: '/ˈtrænskrɪpt/', definition: 'a written copy of spoken material', example: 'A transcript of the call was emailed.', note: 'trans- (across) + script (written) = written over.' },
      { id: 'script-transcribe', word: 'transcribe', pos: 'verb', kk: '[trænˈskraɪb]', ipa: '/trænˈskraɪb/', definition: 'to put speech into writing', example: 'They transcribe every interview.', note: 'trans- (across) + scribe (write) = to write across.' },
      { id: 'script-inscription', word: 'inscription', pos: 'noun', kk: '[ɪnˈskrɪpʃən]', ipa: '/ɪnˈskrɪpʃn/', definition: 'words engraved or written on something', example: 'The award bore a short inscription.', note: 'in- (on) + script (write) + -ion.' },
      { id: 'script-ascribe', word: 'ascribe', pos: 'verb', kk: '[əˈskraɪb]', ipa: '/əˈskraɪb/', definition: 'to attribute to a cause or source', example: 'They ascribed the gain to new pricing.', note: 'a- (to) + scribe (write) = to write to/assign.' },
      { id: 'script-scribe', word: 'scribe', pos: 'noun', kk: '[skraɪb]', ipa: '/skraɪb/', definition: 'a person who copies documents', example: 'A scribe recorded the council’s decisions.', note: 'scribe (write) = one who writes.' },
      { id: 'script-scripture', word: 'scripture', pos: 'noun', kk: '[ˈskrɪptʃɚ]', ipa: '/ˈskrɪptʃə/', definition: 'sacred writings', example: 'The verse is quoted from scripture.', note: 'script (written) + -ure = sacred writing.' },
      { id: 'script-postscript', word: 'postscript', pos: 'noun', kk: '[ˈpostˌskrɪpt]', ipa: '/ˈpəʊstskrɪpt/', definition: 'an added note after a letter’s end', example: 'She added the price in a postscript.', note: 'post- (after) + script (written) = written after.' },
      { id: 'script-nondescript', word: 'nondescript', pos: 'adj', kk: '[ˈnɑndɪˌskrɪpt]', ipa: '/ˈnɒndɪskrɪpt/', definition: 'lacking distinctive features', example: 'The office was in a nondescript building.', note: 'non- (not) + de- + script (write) = not classifiable.' },
    ],
  },
  {
    id: 'tain',
    root: 'TEN / TAIN',
    gloss: 'to hold, to keep',
    origin: 'Latin · tenere',
    explanation:
      'From Latin tenere, "to hold." A tenant holds property, and the law of tenure grew from it. In business the root means keeping and continuing: to maintain (manu + tenere) is to "hold in the hand," to retain is to "hold back," to sustain is to "hold up from below," and to detain is to "hold away."',
    words: [
      { id: 'tain-retain', word: 'retain', pos: 'verb', kk: '[rɪˈten]', ipa: '/rɪˈteɪn/', definition: 'to keep or hold onto', example: 'We work hard to retain skilled staff.', note: 're- (back) + tain (hold) = to hold back.' },
      { id: 'tain-retention', word: 'retention', pos: 'noun', kk: '[rɪˈtɛnʃən]', ipa: '/rɪˈtenʃn/', definition: 'the act of keeping something', example: 'Customer retention improved this year.', note: 're- (back) + ten (hold) + -tion.' },
      { id: 'tain-maintain', word: 'maintain', pos: 'verb', kk: '[menˈten]', ipa: '/meɪnˈteɪn/', definition: 'to keep in good condition; to continue', example: 'We maintain our equipment regularly.', note: 'main (hand) + tain (hold) = to hold in hand.' },
      { id: 'tain-maintenance', word: 'maintenance', pos: 'noun', kk: '[ˈmentənəns]', ipa: '/ˈmeɪntənəns/', definition: 'the upkeep of equipment or property', example: 'Routine maintenance prevents breakdowns.', note: 'main (hand) + ten (hold) + -ance.' },
      { id: 'tain-obtain', word: 'obtain', pos: 'verb', kk: '[əbˈten]', ipa: '/əbˈteɪn/', definition: 'to get or acquire', example: 'You must obtain a permit first.', note: 'ob- (toward) + tain (hold) = to take hold of.' },
      { id: 'tain-sustain', word: 'sustain', pos: 'verb', kk: '[səˈsten]', ipa: '/səˈsteɪn/', definition: 'to keep going; to support', example: 'Demand sustained the company through the slump.', note: 'sus- (under) + tain (hold) = to hold up.' },
      { id: 'tain-sustainable', word: 'sustainable', pos: 'adj', kk: '[səˈstenəbl̩]', ipa: '/səˈsteɪnəbl/', definition: 'able to be maintained over time', example: 'They adopted sustainable packaging.', note: 'sus- (under) + tain (hold) + -able.' },
      { id: 'tain-contain', word: 'contain', pos: 'verb', kk: '[kənˈten]', ipa: '/kənˈteɪn/', definition: 'to hold or include within', example: 'The report contains the full figures.', note: 'con- (together) + tain (hold) = to hold together.' },
      { id: 'tain-container', word: 'container', pos: 'noun', kk: '[kənˈtenɚ]', ipa: '/kənˈteɪnə/', definition: 'an object for holding goods', example: 'Each container ships overseas weekly.', note: 'con- + tain (hold) + -er.' },
      { id: 'tain-detain', word: 'detain', pos: 'verb', kk: '[dɪˈten]', ipa: '/dɪˈteɪn/', definition: 'to hold back or keep in custody', example: 'Bad weather detained the shipment.', note: 'de- (away) + tain (hold) = to hold away.' },
      { id: 'tain-tenant', word: 'tenant', pos: 'noun', kk: '[ˈtɛnənt]', ipa: '/ˈtenənt/', definition: 'a person who rents property', example: 'The tenant renewed the office lease.', note: 'ten (hold) = one who holds/occupies.' },
      { id: 'tain-tenure', word: 'tenure', pos: 'noun', kk: '[ˈtɛnjɚ]', ipa: '/ˈtenjə/', definition: 'the holding of a position or property', example: 'During her tenure, profits doubled.', note: 'ten (hold) = the period one holds a post.' },
      { id: 'tain-attain', word: 'attain', pos: 'verb', kk: '[əˈten]', ipa: '/əˈteɪn/', definition: 'to achieve or reach', example: 'They attained record revenue.', note: 'at- (to) + tain (hold) = to reach and hold.' },
      { id: 'tain-abstain', word: 'abstain', pos: 'verb', kk: '[əbˈsten]', ipa: '/əbˈsteɪn/', definition: 'to choose not to do something', example: 'Two directors abstained from the vote.', note: 'abs- (from) + tain (hold) = to hold back from.' },
      { id: 'tain-tenacious', word: 'tenacious', pos: 'adj', kk: '[tɪˈneʃəs]', ipa: '/tɪˈneɪʃəs/', definition: 'holding firmly; persistent', example: 'A tenacious negotiator rarely gives up.', note: 'ten (hold) + -acious = holding firmly.' },
    ],
  },
  {
    id: 'vert',
    root: 'VERT / VERS',
    gloss: 'to turn',
    origin: 'Latin · vertere',
    explanation:
      'From Latin vertere, "to turn." It describes change of direction or state. To convert is to "turn around" into a new form, to reverse is to "turn back," and a versatile worker can "turn" to many tasks. To avert risk is to "turn it away," and a diverse market has many "turnings."',
    words: [
      { id: 'vert-convert', word: 'convert', pos: 'verb', kk: '[kənˈvɝt]', ipa: '/kənˈvɜːt/', definition: 'to change into a different form', example: 'We converted the warehouse into offices.', note: 'con- (with) + vert (turn) = to turn around.' },
      { id: 'vert-conversion', word: 'conversion', pos: 'noun', kk: '[kənˈvɝʒən]', ipa: '/kənˈvɜːʃn/', definition: 'the act of changing form or use', example: 'The ad’s conversion rate doubled.', note: 'con- + vers (turn) + -ion.' },
      { id: 'vert-convertible', word: 'convertible', pos: 'adj', kk: '[kənˈvɝtəbl̩]', ipa: '/kənˈvɜːtəbl/', definition: 'able to be changed in form', example: 'They issued convertible bonds.', note: 'con- + vert (turn) + -ible.' },
      { id: 'vert-reverse', word: 'reverse', pos: 'verb', kk: '[rɪˈvɝs]', ipa: '/rɪˈvɜːs/', definition: 'to turn the other way; to undo', example: 'The court reversed the earlier ruling.', note: 're- (back) + verse (turn) = to turn back.' },
      { id: 'vert-revert', word: 'revert', pos: 'verb', kk: '[rɪˈvɝt]', ipa: '/rɪˈvɜːt/', definition: 'to return to a previous state', example: 'Prices reverted to normal after the sale.', note: 're- (back) + vert (turn) = to turn back.' },
      { id: 'vert-versatile', word: 'versatile', pos: 'adj', kk: '[ˈvɝsətl̩]', ipa: '/ˈvɜːsətaɪl/', definition: 'able to adapt to many functions', example: 'A versatile employee fills many roles.', note: 'vers (turn) = able to turn to anything.' },
      { id: 'vert-divert', word: 'divert', pos: 'verb', kk: '[daɪˈvɝt]', ipa: '/daɪˈvɜːt/', definition: 'to change the direction of', example: 'Traffic was diverted around the site.', note: 'di- (aside) + vert (turn) = to turn aside.' },
      { id: 'vert-diversion', word: 'diversion', pos: 'noun', kk: '[daɪˈvɝʒən]', ipa: '/daɪˈvɜːʃn/', definition: 'a change of route or attention', example: 'The detour caused a long diversion.', note: 'di- (aside) + vers (turn) + -ion.' },
      { id: 'vert-diverse', word: 'diverse', pos: 'adj', kk: '[daɪˈvɝs]', ipa: '/daɪˈvɜːs/', definition: 'showing much variety', example: 'They serve a diverse customer base.', note: 'di- (apart) + verse (turn) = turned different ways.' },
      { id: 'vert-avert', word: 'avert', pos: 'verb', kk: '[əˈvɝt]', ipa: '/əˈvɜːt/', definition: 'to prevent; to turn away', example: 'Quick action averted a costly error.', note: 'a- (away) + vert (turn) = to turn away.' },
      { id: 'vert-invert', word: 'invert', pos: 'verb', kk: '[ɪnˈvɝt]', ipa: '/ɪnˈvɜːt/', definition: 'to turn upside down or reverse', example: 'Invert the chart to see the trend.', note: 'in- (in) + vert (turn) = to turn in/over.' },
      { id: 'vert-vertical', word: 'vertical', pos: 'adj', kk: '[ˈvɝtɪkl̩]', ipa: '/ˈvɜːtɪkl/', definition: 'upright; at a right angle to the ground', example: 'The chart shows a vertical spike.', note: 'vert (turn) = the point a thing turns on.' },
      { id: 'vert-adverse', word: 'adverse', pos: 'adj', kk: '[ædˈvɝs]', ipa: '/ˈædvɜːs/', definition: 'unfavorable; harmful', example: 'Adverse conditions delayed the launch.', note: 'ad- (toward) + verse (turn) = turned against.' },
      { id: 'vert-controversy', word: 'controversy', pos: 'noun', kk: '[ˈkɑntrəˌvɝsi]', ipa: '/ˈkɒntrəvɜːsi/', definition: 'public disagreement or dispute', example: 'The merger sparked controversy.', note: 'contro- (against) + vers (turn) = turned against.' },
      { id: 'vert-anniversary', word: 'anniversary', pos: 'noun', kk: '[ˌænəˈvɝsəri]', ipa: '/ˌænɪˈvɜːsəri/', definition: 'the yearly return of a date', example: 'The firm marked its 50th anniversary.', note: 'annus (year) + vers (turn) = the year turning around.' },
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
