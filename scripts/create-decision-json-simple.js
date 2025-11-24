// Simple approach: Create JSON with full markdown content for each chunk
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'CONTENT-SPEC.md');
const outputPath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'decision_making.json');

console.log('🔄 Creating JSON with full markdown content...\n');

// Read the full markdown
const fullMarkdown = fs.readFileSync(specPath, 'utf8');

// Split by "## CHUNK" to get each chunk's full content
const chunkSections = fullMarkdown.split(/(?=## CHUNK \d+:)/);

// Remove header
const chunks = chunkSections.filter(section => section.startsWith('## CHUNK'));

const jsonChunks = chunks.map((section, index) => {
  const chunkNum = index + 1;
  const chunkId = `dm_chunk_${String(chunkNum).padStart(2, '0')}`;
  
  // Extract title from first line
  const titleMatch = section.match(/## CHUNK \d+: (.+)/);
  const title = titleMatch ? titleMatch[1].trim() : `Chunk ${chunkNum}`;
  
  // Use the ENTIRE section as content_text (up to 2000 chars for embedding)
  // This includes all the rich content: questions, reality, examples, actions, sources
  const content_text = section.replace(/^## CHUNK \d+: /, '').substring(0, 2000);
  
  // Determine target questions based on chunk number
  let target_questions = [];
  if ([1,2,3,7,8,9,10,11,12,13,14].includes(chunkNum)) {
    target_questions.push("Q19");
  }
  if ([1,2,3,4,5,6,7,15].includes(chunkNum)) {
    if (!target_questions.includes("Q20")) target_questions.push("Q20");
  }
  
  return {
    chunk_id: chunkId,
    module: "decision_making_framework",
    title: title,
    content: {
      question_misconception: "See full content in content_text field",
      reality: "See full content in content_text field",
      practical_examples: "See full content in content_text field",
      action_steps: ["See full content in content_text field"],
      sources: ["See full content in content_text field"]
    },
    content_text: content_text,
    tags: ["decision_making", "vis_model", "career_choice"],
    related_chunks: [],
    target_questions: target_questions,
    sa_specific: true,
    created_at: "2024-11-10",
    version: "1.0"
  };
});

// Write to file
fs.writeFileSync(outputPath, JSON.stringify(jsonChunks, null, 2), 'utf8');

console.log(`✅ Created ${jsonChunks.length} chunks with FULL markdown content\n`);
console.log('📊 Content Stats:');
jsonChunks.forEach((chunk, i) => {
  console.log(`   Chunk ${i+1}: ${chunk.content_text.length} chars - ${chunk.title.substring(0, 50)}...`);
});
console.log(`\n✓ Written to decision_making.json`);
console.log('\n🔄 Next: Delete old chunks from database and re-embed with new content');
