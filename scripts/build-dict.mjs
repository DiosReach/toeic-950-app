#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Dictionary ingestion: CSV → alphabetical JSON chunks.
//
// Reads a vetted TOEIC vocab CSV (columns: word,pos,zh,example,category,level)
// and writes src/assets/dict/chunk_{a_g,h_o,p_z}.json as hash maps:
//   { "<word>": { "casual": "...", "formal": "..." } }
//
// • The CSV carries a single verified `zh` gloss, so casual = formal = zh
//   (faithful, never token-mangled — no hallucination risk).
// • Any EXISTING hand-authored entries with DISTINCT casual ≠ formal are
//   harvested first and overlaid last, so curated quality is preserved.
//
// Usage: node scripts/build-dict.mjs [path/to/toeic_vocab.csv]
// ─────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DICT_DIR = resolve(__dirname, '../src/assets/dict')

const CHUNKS = {
  ag: { file: resolve(DICT_DIR, 'chunk_a_g.json'), test: (c) => c >= 97 && c <= 103 },
  ho: { file: resolve(DICT_DIR, 'chunk_h_o.json'), test: (c) => c >= 104 && c <= 111 },
  pz: { file: resolve(DICT_DIR, 'chunk_p_z.json'), test: (c) => c >= 112 && c <= 122 },
}
const chunkIdFor = (word) => {
  const c = word.charCodeAt(0)
  for (const id of Object.keys(CHUNKS)) if (CHUNKS[id].test(c)) return id
  return null
}

const csvArg = process.argv[2] || 'files_9000/toeic_vocab.csv'
const csvPath = resolve(process.cwd(), csvArg)
if (!existsSync(csvPath)) {
  console.error(`✗ CSV not found: ${csvPath}`)
  process.exit(1)
}

// 1) Harvest existing hand-authored entries (casual ≠ formal) to preserve them.
const curated = {}
for (const id of Object.keys(CHUNKS)) {
  const f = CHUNKS[id].file
  if (!existsSync(f)) continue
  const map = JSON.parse(readFileSync(f, 'utf8'))
  for (const [w, v] of Object.entries(map)) {
    if (v && v.casual && v.formal && v.casual !== v.formal) curated[w] = v
  }
}
console.log(`• preserved ${Object.keys(curated).length} curated (distinct-register) entries`)

// 2) Parse the CSV. We only need columns 0 (word) and 2 (zh); commas in the
//    later `example` column never affect these earlier fields.
const raw = readFileSync(csvPath, 'utf8').replace(/^﻿/, '')
const lines = raw.split(/\r?\n/)
const base = {}
let rows = 0
for (const line of lines) {
  if (!line.trim()) continue
  const cols = line.split(',')
  const word = (cols[0] || '').trim().toLowerCase()
  const zh = (cols[2] || '').trim()
  if (!word || !zh || word === 'word') continue // skip header / blanks
  if (!/^[a-z]/.test(word)) continue // only a–z route to a chunk
  base[word] = { casual: zh, formal: zh }
  rows++
}
console.log(`• parsed ${rows} CSV rows`)

// 3) Merge: CSV base first, curated overrides win.
const merged = { ...base, ...curated }

// 4) Split into chunks (sorted for stable diffs) and write.
const buckets = { ag: {}, ho: {}, pz: {} }
let skipped = 0
for (const word of Object.keys(merged).sort()) {
  const id = chunkIdFor(word)
  if (!id) {
    skipped++
    continue
  }
  buckets[id][word] = merged[word]
}

const writeChunk = (id) => {
  const obj = buckets[id]
  const body = Object.keys(obj)
    .map((w) => `  ${JSON.stringify(w)}: ${JSON.stringify(obj[w])}`)
    .join(',\n')
  writeFileSync(CHUNKS[id].file, `{\n${body}\n}\n`)
  return Object.keys(obj).length
}

const counts = Object.fromEntries(Object.keys(CHUNKS).map((id) => [id, writeChunk(id)]))
const total = Object.values(counts).reduce((a, b) => a + b, 0)
console.log(`✓ wrote chunks  a-g:${counts.ag}  h-o:${counts.ho}  p-z:${counts.pz}  (skipped ${skipped})`)
console.log(`✓ total dictionary entries: ${total}`)
