// Simple parser - split by chunk markers and extract everything
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'CONTENT-SPEC.md');
const outputPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'decision_making.json');

console.log('🔄 Simple parsing of CONTENT-SPEC.md...\n');

const content = fs.readFileSync(specPath, 'utf8');

// Split by chunk markers - use a simple split
const parts = content.split(/^## CHUNK /m);
parts.shift(); // Remove header

const chunks = [];

parts.forEach((part, index) => {
  const chunkNum = index + 1;
  
  // Extract title - everything from number to first ###
  const titleMatch = part.match(/^(\d+):([\s\S]*?)###/);
  if (!titleMatch) {
    console.log(`⚠️  Skipping chunk ${chunkNum} - no title found`);
    return;
  }
  
  const title = titleMatch[2].trim().replace(/\s+/g, ' ');
  
  // Extract sections
  const questionMatch = part.match(/### The Question\/Misconception\s+([\s\S]*?)(?=###|$)/);
  const realityMatch = part.match(/### The Reality\s+([\s\S]*?)(?=###|$)/);
  const examplesMatch = part.match(/### Practical Examples\s+([\s\S]*?)(?=###|$)/);
  const actionsMatch = part.match(/### Action Steps\s+([\s\S]*?)(?=###|$)/);
  const sourcesMatch = part.match(/### Sources\s+([\s\S]*?)(?=---|^##|$)/m);
  
  const question = questionMatch ? questionMatch[1].trim() : '';
  const reality = realityMatch ? realityMatch[1].trim() : '';
  const examples = examplesMatch ? examplesMatch[1].trim() : '';
  const actions = actionsMatch ? actionsMatch[1].trim() : '';
  const sources = sourcesMatch ? sourcesMatch[1].trim() : '';
  
  // Create FULL content_text with ALL career keywords
  const fullText = `${title}. ${question} ${reality} ${examples} ${actions}`;
  let content_text = fullText.substring(0, 2000);
  
  // Don't cut mid-sentence
  if (fullText.length > 2000) {
    const lastPeriod = content_text.lastIndexOf('.');
    if (lastPeriod > 1500) {
      content_text = content_text.substring(0, lastPeriod + 1);
    }
  }
  
  // Parse action steps
  const actionLines = actions.split('\n').filter(l => l.match(/^\d+\./));
  const actionSteps = actionLines.map(l => l.replace(/^\d+\.\s*\*\*(.+?)\*\*:?\s*/, '$1: ').replace(/^\d+\.\s*/, '').trim());
  
  // Parse sources
  const sourceLines = sources.split('\n').filter(l => l.trim().startsWith('-'));
  const sourcesList = sourceLines.map(l => l.replace(/^-\s*/, '').trim());
  
  // Target questions
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
      question_misconception: question,
      reality: reality,
      practical_examples: examples,
      action_steps: actionSteps.length > 0 ? actionSteps : [actions],
      sources: sourcesList.length > 0 ? sourcesList : [sources]
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
});

// Write to file
fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2), 'utf8');

console.log(`\n✅ Created ${chunks.length} chunks with FULL content`);
console.log(`✓ Written to ${outputPath}\n`);
