// Extract FULL content from CONTENT-SPEC.md with all career keyword injections
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'CONTENT-SPEC.md');
const outputPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'decision_making.json');

console.log('🔄 Extracting FULL content from CONTENT-SPEC.md...\n');

// Read the markdown file
const content = fs.readFileSync(specPath, 'utf8');

// Split into chunks by the ## CHUNK pattern
const chunkPattern = /^## CHUNK (\d+): (.+)$/gm;
const matches = [...content.matchAll(chunkPattern)];

const chunks = [];

for (let i = 0; i < matches.length; i++) {
  const match = matches[i];
  const chunkNum = parseInt(match[1]);
  const title = match[2].trim();
  
  // Get content between this chunk and the next (or end of file)
  const startIndex = match.index + match[0].length;
  const endIndex = i < matches.length - 1 ? matches[i + 1].index : content.length;
  const chunkContent = content.substring(startIndex, endIndex);
  
  // Extract sections
  const sections = {
    question: '',
    reality: '',
    examples: '',
    actions: '',
    sources: ''
  };
  
  // Extract each section
  const questionMatch = chunkContent.match(/### The Question\/Misconception\n([\s\S]*?)(?=###|$)/);
  const realityMatch = chunkContent.match(/### The Reality\n([\s\S]*?)(?=###|$)/);
  const examplesMatch = chunkContent.match(/### Practical Examples\n([\s\S]*?)(?=###|$)/);
  const actionsMatch = chunkContent.match(/### Action Steps\n([\s\S]*?)(?=###|$)/);
  const sourcesMatch = chunkContent.match(/### Sources\n([\s\S]*?)(?=---|##|$)/);
  
  sections.question = questionMatch ? questionMatch[1].trim() : '';
  sections.reality = realityMatch ? realityMatch[1].trim() : '';
  sections.examples = examplesMatch ? examplesMatch[1].trim() : '';
  sections.actions = actionsMatch ? actionsMatch[1].trim() : '';
  sections.sources = sourcesMatch ? sourcesMatch[1].trim() : '';
  
  // Create comprehensive content_text with ALL career keywords
  const fullText = `${title}. ${sections.question} ${sections.reality} ${sections.examples} ${sections.actions}`;
  
  // Limit to 2000 chars but prioritize keeping career keywords
  let content_text = fullText.substring(0, 2000);
  
  // Ensure we didn't cut off mid-sentence
  if (fullText.length > 2000) {
    const lastPeriod = content_text.lastIndexOf('.');
    if (lastPeriod > 1500) {
      content_text = content_text.substring(0, lastPeriod + 1);
    }
  }
  
  // Parse action steps
  const actionLines = sections.actions.split('\n').filter(l => l.match(/^\d+\./));
  const actionSteps = actionLines.map(l => l.replace(/^\d+\.\s*\*\*(.+?)\*\*:?\s*/, '').trim());
  
  // Parse sources
  const sourceLines = sections.sources.split('\n').filter(l => l.trim().startsWith('-'));
  const sourcesList = sourceLines.map(l => l.replace(/^-\s*/, '').trim());
  
  // Determine target questions based on chunk number
  let target_questions = [];
  if ([1,2,3,7,8,9,10,11,12,13,14].includes(chunkNum)) {
    target_questions.push("Q19");
  }
  if ([1,2,3,4,5,6,7,15].includes(chunkNum)) {
    if (!target_questions.includes("Q20")) target_questions.push("Q20");
  }
  
  const chunk = {
    chunk_id: `dm_chunk_${String(chunkNum).padStart(2, '0')}`,
    module: "decision_making_framework",
    title: title,
    content: {
      question_misconception: sections.question,
      reality: sections.reality,
      practical_examples: sections.examples,
      action_steps: actionSteps.length > 0 ? actionSteps : [sections.actions],
      sources: sourcesList.length > 0 ? sourcesList : [sections.sources]
    },
    content_text: content_text,
    tags: ["decision_making", "vis_model", "career_choice", "south_africa"],
    related_chunks: [],
    target_questions: target_questions,
    sa_specific: true,
    created_at: "2024-11-10",
    version: "1.1"
  };
  
  chunks.push(chunk);
  console.log(`✓ Chunk ${chunkNum}: ${title.substring(0, 50)}... (${content_text.length} chars)`);
}

// Write to JSON
fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2), 'utf8');

console.log(`\n✅ Extracted ${chunks.length} chunks with FULL content`);
console.log(`✓ Written to ${outputPath}`);
console.log(`\n📊 Content length stats:`);
chunks.forEach(c => {
  console.log(`   ${c.chunk_id}: ${c.content_text.length} chars`);
});
