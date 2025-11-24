// Script to create all 15 decision-making chunks
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'decision_making.json');

// All 15 chunks - abbreviated for file size
const allChunks = [
  // Chunks 1-7 already created above
  // Chunks 8-15 to be added
];

// For now, create a minimal valid structure
const minimalChunks = Array.from({length: 15}, (_, i) => ({
  chunk_id: `dm_chunk_${String(i+1).padStart(2, '0')}`,
  module: "decision_making_framework",
  title: `Decision Making Chunk ${i+1}`,
  content: {
    question_misconception: "Placeholder",
    reality: "Placeholder",
    practical_examples: [],
    action_steps: [],
    sources: []
  },
  content_text: `Placeholder for chunk ${i+1}`,
  tags: ["decision_making"],
  related_chunks: [],
  target_questions: ["Q19", "Q20"],
  sa_specific: true,
  created_at: "2024-11-10",
  version: "1.0"
}));

fs.writeFileSync(filePath, JSON.stringify(minimalChunks, null, 2), 'utf8');
console.log(`✓ Created ${minimalChunks.length} placeholder chunks`);
console.log('Note: These are placeholders. Full content will be added next.');
