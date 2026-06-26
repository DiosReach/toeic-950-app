# Local Dictionary — Dynamic Chunk Architecture

The keyless local dictionary is split into **alphabetical JSON chunks** that are
**lazy-loaded via dynamic `import()`** from [translate.js](../../lib/translate.js).
Vite code-splits each chunk into its own cached asset, so the main app bundle
stays small and the dataset can scale to thousands of words without bloating
memory or crashing the browser.

## Files

| Chunk | First letter | File |
| --- | --- | --- |
| `ag` | a – g | `chunk_a_g.json` |
| `ho` | h – o | `chunk_h_o.json` |
| `pz` | p – z | `chunk_p_z.json` |

## Entry format

Each chunk is a hash map keyed by the **lowercase word** for O(1) lookup:

```json
{
  "further":  { "casual": "再往前、另外的、聊更多", "formal": "進一步推動、深化、補充說明" },
  "prospect": { "casual": "機會、盼頭、未來性",     "formal": "前景、展望、潛在客戶" }
}
```

- `casual` — natural, modern, white-collar everyday Traditional Chinese.
- `formal` — strict, executive / TOEIC-grade Traditional Chinese.

## How lookup works

1. A single English word → `chunkIdFor(word)` maps its first letter to a chunk.
2. `loadChunk()` dynamic-imports that JSON once and caches the parsed map.
3. `map[word]` is an instant hash lookup → renders with ~0s delay, offline.
4. Sentences / phrases / words not in any chunk fall through to the cloud LLM.

## Scaling to 9,000+ words

The architecture already supports it — **no code changes needed**, just larger
chunk files (and optionally more of them). The current files are a curated,
**human-verified** seed. To reach full 950-target coverage, ingest a vetted
lexical dataset rather than machine-generating translations (which reintroduces
hallucinations). A simple build step can convert a source CSV into these chunks:

```
word,casual,formal
further,再往前、另外的、聊更多,進一步推動、深化、補充說明
...
```

Group rows by first letter, write each group to the matching `chunk_*.json`,
and (optionally) split very large ranges into more files — just extend
`CHUNK_LOADERS` / `chunkIdFor` in `translate.js` to match. Because every chunk
is loaded on demand, adding tens of thousands of entries never grows the
initial bundle.
