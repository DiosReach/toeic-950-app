import { ALL_WORDS, ALL_WORDS_BY_ID } from '../data/catalog'

export const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Build multiple-choice questions ("Choose the correct meaning of WORD").
 * Each question has 4 options: the correct definition + 3 random distractors.
 *
 * @param {string[]} wordIds  candidate word ids to test
 * @param {number}   count    how many questions to generate
 * @returns {Array<{wordId, prompt, options: {id,text}[], correctIndex}>}
 */
export function buildQuestions(wordIds, count) {
  const pool = [...new Set(wordIds)]
    .map((id) => ALL_WORDS_BY_ID[id])
    .filter(Boolean)

  const targets = shuffle(pool).slice(0, count)

  return targets.map((w) => {
    const distractors = shuffle(ALL_WORDS.filter((x) => x.id !== w.id)).slice(0, 3)
    const options = shuffle([w, ...distractors]).map((o) => ({
      id: o.id,
      text: o.definition,
    }))
    return {
      wordId: w.id,
      prompt: w.word,
      options,
      correctIndex: options.findIndex((o) => o.id === w.id),
    }
  })
}

export const scoreQuiz = (questions, answers) =>
  questions.reduce(
    (n, q, i) => (answers[i] === q.correctIndex ? n + 1 : n),
    0,
  )
