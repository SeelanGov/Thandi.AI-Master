// Robust parser for CONTENT-SPEC.md - extracts ALL content with career keywords
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'CONTENT-SPEC.md');
const outputPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'decision_making.json');

console.log('🔄 Parsing CONTENT-SPEC.md with robust extraction...\n');

const content = fs.readFileSync(specPath, 'utf8');
const lines = content.split('\n');

const chunks = [];
let currentChunk = null;
let currentSection = null;
let sectionContent = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // New chunk starts
  const chunkMatch = line.match(/^## CHUNK (\d+):/);
  if (chunkMatch) {
    // Save previous chunk if exists
    if (currentChunk && currentSection) {
      currentChunk.sections[currentSection] = sectionContent.join('\n').trim();
    }
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    // Start new chunk - title may span multiple lines
    const titleMatch = line.match(/^## CHUNK \d+: (.*)$/);
    let title = titleMatch ? titleMatch[1].trim() : '';
    
    // Check if title continues on next lines
    let j = i + 1;
    while (j < lines.length && !lines[j].match(/^###/) && !lines[j].match(/^##/) && lines[j].trim()) {
      title += ' ' + lines[j].trim();
      j++;
    }
    
    currentChunk = {
      number: parseInt(chunkMatch[1]),
      title: title,
      sections: {}
    };
    currentSection = null;
    sectionContent = [];
  }
  // New section starts
  else if (line.match(/^### (.+)$/)) {
    // Save previous section
    if (currentChunk && currentSection) {
      currentChunk.sections[currentSection] = sectionContent.join('\n').trim();
    }
    
    // Start new section
    const match = line.match(/^### (.+)$/);
    currentSection = match[1].trim();
    sectionContent = [];
  }
  // Content line
  else if (currentSection && line.trim() !== '---') {
    sectionContent.push(line);
  }
}

// Save last chunk
if (currentChunk && currentSection) {
  currentChunk.sections[currentSection] = sectionContent.join('\n').trim();
}
if (currentChunk) {
  chunks.push(currentChunk);
}

console.log(`✓ Parsed ${chunks.length} chunks\n`);

// Convert to JSON format
const jsonChunks = chunks.map(chunk => {
  const question = chunk.sections['The Question/Misconception'] || '';
  const reality = chunk.sections['The Reality'] || '';
  const examples = chunk.sections['Practical Examples'] || '';
  const actions = chunk.sections['Action Steps'] || '';
  const sources = chunk.sections['Sources'] || '';
  
  // Create FULL content_text with ALL career keywords (limit 2000 chars)
  const fullText = `${chunk.title}. Question: ${question}. Reality: ${reality}. Examples: ${examples}. Actions: ${actions}`;
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
  const actionSteps = actionLines.map(l => {
    const cleaned = l.replace(/^\d+\.\s*\*\*(.+?)\*\*:?\s*/, '$1: ');
    return cleaned.replace(/^\d+\.\s*/, '').trim();
  });
  
  // Parse sources
  const sourceLines = sources.split('\n').filter(l => l.trim().startsWith('-'));
  const sourcesList = sourceLines.map(l => l.replace(/^-\s*/, '').trim());
  
  // Target questions
  let target_questions = [];
  if ([1,2,3,7,8,9,10,11,12,13,14].includes(chunk.number)) {
    target_questions.push("Q19");
  }
  if ([1,2,3,4,5,6,7,15].includes(chunk.number)) {
    if (!target_questions.includes("Q20")) target_questions.push("Q20");
  }
  
  return {
    chunk_id: `dm_chunk_${String(chunk.number).padStart(2, '0')}`,
    module: "decision_making_framework",
    title: chunk.title,
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
});

// Write to file
fs.writeFileSync(outputPath, JSON.stringify(jsonChunks, null, 2), 'utf8');

console.log(`✅ Created ${jsonChunks.length} chunks with FULL content`);
console.log(`✓ Written to ${outputPath}\n`);
console.log('📊 Content stats:');
jsonChunks.forEach(c => {
  console.log(`   ${c.chunk_id}: ${c.content_text.length} chars - ${c.title.substring(0, 40)}...`);
});
