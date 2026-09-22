// scripts/embed-chunks.mjs
//
// Reads chunks.json, gets an embedding for each chunk's text from OpenAI's
// text-embedding-3-small, and writes embeddings.json (each chunk plus its
// embedding vector). Run with:
//   node --env-file=.env scripts/embed-chunks.mjs
// (--env-file requires Node 20.6+; if your Node is older, export
// OPENAI_API_KEY in your shell instead and drop that flag.)

import { readFileSync, writeFileSync } from 'fs';

const CHUNKS_PATH = 'chunks.json';
const OUTPUT_PATH = 'embeddings.json';
const MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 50; // well under OpenAI's per-request item limit

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY is not set. Run with --env-file=.env or export it first.');
  process.exit(1);
}

function batch(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

async function embedBatch(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, input: texts }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  // data.data is an array of { embedding, index }, in the same order as input
  return data.data.map((d) => d.embedding);
}

async function main() {
  const chunks = JSON.parse(readFileSync(CHUNKS_PATH, 'utf8'));
  if (chunks.length === 0) {
    console.error(`${CHUNKS_PATH} is empty, nothing to embed.`);
    process.exit(1);
  }

  const batches = batch(chunks, BATCH_SIZE);
  const results = [];

  for (const [i, group] of batches.entries()) {
    console.log(`Embedding batch ${i + 1}/${batches.length} (${group.length} chunks)...`);
    const vectors = await embedBatch(group.map((c) => c.text));
    group.forEach((chunk, j) => {
      results.push({ ...chunk, embedding: vectors[j] });
    });
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));

  const dims = results[0]?.embedding?.length ?? 0;
  console.log(`Wrote ${results.length} embedded chunks to ${OUTPUT_PATH} (vector length: ${dims}).`);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
