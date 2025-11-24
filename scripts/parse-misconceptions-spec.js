// Parse Career Misconceptions CONTENT-SPEC.md to JSON with FULL content
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'career_misconceptions_framework', 'CONTENT-SPEC.md');
const outputPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'career_misconceptions_framework', 'career_misconceptions.json');

console.log('🔄 Parsing Career Misconceptions CONTENT-SPEC.md...\n');

const content = fs.readFileSync(specPath, 'utf8');

// Split by chunk markers - looking for ### CHUNK pattern
const parts = content.split(/^### CHUNK /m);
parts.shift(); // Remove header

const chunks = [];

parts.forEach((part, index) => {
  const chunkNum = index + 1;
  
  // Extract title - everything from number to first ####
  const titleMatch = part.match(/^(\d+):([\s\S]*?)####/);
  if (!titleMatch) {
    console.log(`⚠️  Skipping chunk ${chunkNum} - no title found`);
    return;
  }
  
  const title = titleMatch[2].trim().replace(/\s+/g, ' ');
  
  // Extract sections
  const questionMatch = part.match(/#### The Question\/Misconception\s+([\s\S]*?)(?=####|$)/);
  const realityMatch = part.match(/#### The Reality\s+([\s\S]*?)(?=####|$)/);
  const examplesMatch = part.match(/#### Practical Examples\s+([\s\S]*?)(?=####|$)/);
  const actionsMatch = part.match(/#### Action Steps\s+([\s\S]*?)(?=####|$)/);
  const sourcesMatch = part.match(/#### Sources\s+([\s\S]*?)(?=---|^###|$)/m);
  
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
  
  // Determine target questions based on chunk number
  let target_questions = [];
  if ([1,2,3,4].includes(chunkNum)) {
    target_questions.push("Q11");
  }
  if ([5,6,7,8].includes(chunkNum)) {
    target_questions.push("Q12");
  }
  if ([9,11,12].includes(chunkNum)) {
    target_questions.push("Q13");
  }
  if ([13,14,15,16].includes(chunkNum)) {
    target_questions.push("Q14");
  }
  if ([9,10,17,18,19].includes(chunkNum)) {
    if (!target_questions.includes("Q15")) target_questions.push("Q15");
  }
  if (chunkNum === 20) {
    target_questions = ["Q11", "Q12", "Q13", "Q14", "Q15"]; // Whole person applies to all
  }
  
  const chunk = {
    chunk_id: `cm_chunk_${String(chunkNum).padStart(2, '0')}`,
    module: "career_misconceptions_framework",
    title: title,
    content: {
      question_misconception: question,
      reality: reality,
      practical_examples: examples,
      action_steps: actionSteps.length > 0 ? actionSteps : [actions],
      sources: sourcesList.length > 0 ? sourcesList : [sources]
    },
    content_text: content_text,
    tags: ["career_misconceptions", "myths", "career_guidance", "south_africa"],
    related_chunks: [],
    target_questions: target_questions,
    sa_specific: true,
    created_at: "2024-11-11",
    version: "1.0"
  };
  
  chunks.push(chunk);
  console.log(`✓ Chunk ${chunkNum}: ${title.substring(0, 50)}... (${content_text.length} chars)`);
});

// Write to file
fs.writeFileSync(outputPath, JSON.stringify(chunks, null, 2), 'utf8');

console.log(`\n✅ Created ${chunks.length} chunks with FULL content`);
console.log(`✓ Written to ${outputPath}\n`);
console.log('📊 Target question mapping:');
console.log('   Q11 (External Pressure): Chunks 1-4');
console.log('   Q12 (Creative Careers): Chunks 5-8');
console.log('   Q13 (University Value): Chunks 9, 11, 12');
console.log('   Q14 (AI & Future): Chunks 13-16');
console.log('   Q15 (Degree Value): Chunks 9, 10, 17-19');
console.log('   All: Chunk 20 (Whole Person)');
