// Convert CONTENT-SPEC.md to JSON with FULL content extraction
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'CONTENT-SPEC.md');
const outputPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'decision_making.json');

console.log('🔄 Converting CONTENT-SPEC.md to JSON with FULL content...\n');

// Read the markdown file
const content = fs.readFileSync(specPath, 'utf8');

// Split by chunk headers
const chunkSections = content.split(/## CHUNK \d+:/);

// Remove header section (before first chunk)
chunkSections.shift();

const chunks = [];

chunkSections.forEach((section, index) => {
  const chunkNum = index + 1;
  const chunkId = `dm_chunk_${String(chunkNum).padStart(2, '0')}`;
  
  // Extract title (first line)
  const lines = section.trim().split('\n');
  const title = lines[0].trim();
  
  // Extract sections
  const questionMatch = section.match(/### The Question\/Misconception\n([\s\S]*?)### The Reality/);
  const realityMatch = section.match(/### The Reality\n([\s\S]*?)### Practical Examples/);
  const examplesMatch = section.match(/### Practical Examples\n([\s\S]*?)### Action Steps/);
  const actionsMatch = section.match(/### Action Steps\n([\s\S]*?)### Sources/);
  const sourcesMatch = section.match(/### Sources\n([\s\S]*?)(?:---|\n\n##|$)/);
  
  const question = questionMatch ? questionMatch[1].trim() : '';
  const reality = realityMatch ? realityMatch[1].trim() : '';
  const examples = examplesMatch ? examplesMatch[1].trim() : '';
  const actions = actionsMatch ? actionsMatch[1].trim() : '';
  const sources = sourcesMatch ? sourcesMatch[1].trim() : '';
  
  // Parse action steps
  const actionSteps = actions.split('\n')
    .filter(line => line.match(/^\d+\./))
    .map(line => line.replace(/^\d+\.\s*\*\*(.+?)\*\*:?\s*/, '').trim());
  
  // Parse sources
  const sourcesList = sources.split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim());
  
  // Create comprehensive content_text for embedding (include ALL content)
  // Combine all sections into rich text for semantic matching
  const fullContent = `${title}. Question: ${question}. Reality: ${reality}. Examples: ${examples}. Actions: ${actions}. Sources: ${sources}`;
  const content_text = fullContent.substring(0, 2000); // Limit to 2000 chars for embedding
  
  // Determine target questions
  let target_questions = [];
  if (chunkNum <= 3 || chunkNum === 8 || chunkNum === 9 || chunkNum === 10 || chunkNum === 11 || chunkNum === 12 || chunkNum === 13 || chunkNum === 14) {
    target_questions = ["Q19"];
  }
  if (chunkNum <= 7 || chunkNum === 15) {
    if (!target_questions.includes("Q20")) target_questions.push("Q20");
  }
  if (chunkNum <= 3 || chunkNum === 7) {
    if (!target_questions.includes("Q19")) target_questions.push("Q19");
  }
  
  // Create chunk object
  const chunk = {
    chunk_id: chunkId,
    module: "decision_making_framework",
    title: title,
    content: {
      question_misconception: question,
      reality: reality,
      practical_examples: examples,
      action_steps: actionSteps.length > 0 ? actionSteps : [actions],
      sources: sourcesList.length > 0 ? sourcesList : [sources]
    },
    content_text: content_text,
    tags: ["decision_making", "vis_model", "career_choice"],
    related_chunks: [],
    target_questions: target_questions,
    sa_specific: true,
    created_at: "2024-11-10",
    version: "1.0"
  };
  
  chunks.push(chunk);
  console.log(`✓ Parsed Chunk ${chunkNum}: ${title.substring(0, 60)}...`);
});

// Write to JSON file
fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2), 'utf8');

console.log(`\n✅ Conversion complete: ${chunks.length} chunks with FULL content`);
console.log(`✓ Written to ${outputPath}`);
console.log(`\n📊 Content Stats:`);
chunks.forEach((chunk, i) => {
  console.log(`   Chunk ${i+1}: ${chunk.content_text.length} chars in content_text`);
});
