// Convert Sprint 1.1 CONTENT-SPEC.md to decision_making.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'CONTENT-SPEC.md');
const outputPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'decision_making.json');

console.log('🔄 Converting CONTENT-SPEC.md to JSON...\n');

// Read the markdown file
const content = fs.readFileSync(specPath, 'utf8');

// Parse chunks from markdown
const chunks = [];
const chunkRegex = /## CHUNK (\d+): (.+?)\n\n### The Question\/Misconception\n(.+?)\n\n### The Reality\n(.+?)\n\n### Practical Examples\n(.+?)\n\n### Action Steps\n(.+?)\n\n### Sources\n(.+?)\n\n---/gs;

let match;
let chunkCount = 0;

while ((match = chunkRegex.exec(content)) !== null) {
  chunkCount++;
  const [, number, title, question, reality, examples, actions, sources] = match;
  
  // Parse action steps
  const actionSteps = actions.split('\n')
    .filter(line => line.match(/^\d+\./))
    .map(line => line.replace(/^\d+\.\s*\*\*(.+?)\*\*:?\s*/, '').trim());
  
  // Parse sources
  const sourcesList = sources.split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim());
  
  // Create chunk object
  const chunk = {
    chunk_id: `dm_chunk_${number.padStart(2, '0')}`,
    module: "decision_making_framework",
    title: title.trim(),
    content: {
      question_misconception: question.trim(),
      reality: reality.trim(),
      practical_examples: examples.trim(),
      action_steps: actionSteps,
      sources: sourcesList
    },
    content_text: `${title}. ${question.trim()} ${reality.trim()} ${examples.trim()}`.substring(0, 1000),
    tags: ["decision_making", "vis_model", "career_choice"],
    related_chunks: [],
    target_questions: number <= 11 ? ["Q19", "Q20"] : ["Q19"],
    sa_specific: true,
    created_at: "2024-11-10",
    version: "1.0"
  };
  
  chunks.push(chunk);
}

console.log(`✓ Parsed ${chunkCount} chunks from CONTENT-SPEC.md`);

// Write to JSON file
fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2), 'utf8');
console.log(`✓ Written to ${outputPath}`);
console.log(`\n✅ Conversion complete: ${chunks.length} chunks ready for embedding generation`);
