// scripts/chunk-docs.mjs
//
// Reads docs/*.md (excluding decisions-log.md) and custom-elements.json,
// splits them into retrieval-sized chunks, and writes chunks.json.
// No network calls, no embeddings here, that's the next step.

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, basename } from 'path';

const DOCS_DIR = 'docs';
const CEM_PATH = 'custom-elements.json';
const OUTPUT_PATH = 'chunks.json';
const SKIP_FILES = new Set(['decisions-log.md']);

/** Split one doc's raw text into chunks along '## ' headings. */
function chunkMarkdownFile(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const source = basename(filePath);

  // Split keeping the '## ' delimiter with each section.
  const sections = raw.split(/\n(?=## )/g).filter((s) => s.trim().startsWith('## '));

  return sections.map((section, i) => {
    const headingMatch = section.match(/^## (.+)/);
    const heading = headingMatch ? headingMatch[1].trim() : `section-${i}`;

    // Pull the metadata comment out wherever it sits, strip it from the body.
    const metaMatch = section.match(/<!--\s*tag:\s*([\w-]+)\s*,\s*audience:\s*([\w-]+)\s*-->/i);
    const tag = metaMatch ? metaMatch[1] : 'unknown';
    const audience = metaMatch ? metaMatch[2] : 'unknown';

    const body = section.replace(/<!--\s*tag:.*?-->\n?/i, '').trim();

    return {
      id: `${source}#${slugify(heading)}`,
      text: body,
      source,
      tag,
      audience,
    };
  });
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

/** Turn each component in the custom-elements manifest into one chunk. */
function chunkCustomElements(filePath) {
  const manifest = JSON.parse(readFileSync(filePath, 'utf8'));
  const chunks = [];

  for (const mod of manifest.modules ?? []) {
    for (const decl of mod.declarations ?? []) {
      if (!decl.tagName) continue; // skip non-component exports

      const props = (decl.attributes ?? decl.members?.filter((m) => m.kind === 'field') ?? [])
        .map((a) => `${a.name}${a.type ? ` (${a.type.text ?? a.type})` : ''}${a.description ? `: ${a.description}` : ''}`)
        .join('; ');

      const slots = (decl.slots ?? []).map((s) => `${s.name || 'default'}: ${s.description ?? ''}`).join('; ');
      const events = (decl.events ?? []).map((e) => `${e.name}: ${e.description ?? ''}`).join('; ');

      const parts = [
        `${decl.tagName} — ${decl.description ?? 'no description provided'}.`,
        props ? `Attributes/properties: ${props}.` : '',
        slots ? `Slots: ${slots}.` : '',
        events ? `Events: ${events}.` : '',
      ].filter(Boolean);

      chunks.push({
        id: `custom-elements.json#${decl.tagName}`,
        text: parts.join(' '),
        source: 'custom-elements.json',
        tag: 'component-reference',
        audience: 'consumer',
      });
    }
  }

  return chunks;
}

function main() {
  const docChunks = readdirSync(DOCS_DIR)
    .filter((f) => f.endsWith('.md') && !SKIP_FILES.has(f))
    .flatMap((f) => chunkMarkdownFile(join(DOCS_DIR, f)));

  let componentChunks = [];
  try {
    componentChunks = chunkCustomElements(CEM_PATH);
  } catch (err) {
    console.warn(`Skipping custom-elements.json (${err.message}). Run "npm run build:metadata" first if you expect component chunks.`);
  }

  const all = [...docChunks, ...componentChunks];

  writeFileSync(OUTPUT_PATH, JSON.stringify(all, null, 2));
  console.log(`Wrote ${all.length} chunks to ${OUTPUT_PATH} (${docChunks.length} from docs, ${componentChunks.length} from components).`);
}

main();
