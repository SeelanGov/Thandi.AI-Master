// Script to append chunks 8-15 to decision_making.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '..', 'thandi_knowledge_base', 'decision_making_framework', 'decision_making.json');

// Read existing file
let existingChunks = [];
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  existingChunks = JSON.parse(fileContent);
  console.log(`✓ Loaded ${existingChunks.length} existing chunks`);
} catch (error) {
  console.error('Error reading file:', error.message);
  process.exit(1);
}

// New chunks 8-11
const newChunks = [
  {
    "chunk_id": "dm_chunk_08_five_questions",
    "module": "decision_making_framework",
    "title": "The 5 Must-Ask Career Test Questions",
    "content": {
      "question_misconception": "After all the research, I still can't decide. What simple questions can I ask myself right now to cut through the confusion?",
      "reality": "Before committing to any path, use these five self-assessment questions to challenge your assumptions. These questions cover the critical areas of V.I.S., financial reality, and external pressure. If you can't answer 'yes' to at least 4 of these 5 questions, the career path needs serious reconsideration or risk mitigation.",
      "practical_examples": [
        {
          "question_number": 1,
          "question": "Can I see myself doing this 8 hours a day for 5 years?",
          "what_it_tests": "Interest and resilience",
          "interpretation": "If the answer is 'no,' the career is not a good V.I.S. fit. You'll burn out or quit. Example: 'I love the idea of being a doctor, but I can't handle blood' = No. 'I enjoy coding and could do it daily' = Yes."
        },
        {
          "question_number": 2,
          "question": "Will I earn enough to support the lifestyle I want?",
          "what_it_tests": "Financial reality check",
          "interpretation": "If the answer is 'no,' you must revert to the Passion vs. Pay Framework (Chunk 4). Example: 'I want to travel internationally twice a year, but social work pays R15K/month' = No, lifestyle mismatch. 'I'm happy living simply, and teaching pays R20K/month' = Yes."
        },
        {
          "question_number": 3,
          "question": "Am I choosing this for me or for others?",
          "what_it_tests": "External pressure vs authentic choice",
          "interpretation": "If the answer is 'for others,' go straight to Chunk 14 (Whole Person). Example: 'My parents want me to be an accountant, but I hate numbers' = For others. 'I genuinely enjoy problem-solving and want to be an engineer' = For me."
        },
        {
          "question_number": 4,
          "question": "Do I currently have, or can I realistically get, the required subjects?",
          "what_it_tests": "Ability/academic reality check",
          "interpretation": "If the answer is 'no,' the path is blocked unless you upgrade subjects. Example: 'I want to study medicine but I have 45% in Physical Science' = No, need to improve or pivot. 'I have 75% in Math and want to study Data Science' = Yes."
        },
        {
          "question_number": 5,
          "question": "Can I afford the training (Tuition, Books, Accommodation, Transport)?",
          "what_it_tests": "Affordability check",
          "interpretation": "If the answer is 'no,' explore TVET, NSFAS, SETA learnerships, or corporate bursaries immediately. Example: 'My family earns R250K/year, I qualify for NSFAS' = Yes. 'My family earns R500K/year, no bursaries available, can't afford R80K/year university' = No, consider TVET or part-time study."
        }
      ],
      "action_steps": [
        "Score 1–5: Answer each question for your top choice. If you score less than 4 'Yeses,' the option requires major risk mitigation or should be dropped.",
        "Listen to the Answers: Be brutally honest with yourself. This process helps you organize information about your interests and abilities.",
        "Address the 'No' Answers: For each 'no,' identify a specific action to convert it to 'yes' (e.g., upgrade Math, apply for NSFAS, have honest conversation with parents).",
        "Repeat for Option 2: Run the same 5 questions for your second career choice to compare."
      ],
      "sources": [
        "Career counseling self-assessment frameworks",
        "V.I.S. Model validation questions",
        "South African education access and affordability data"
      ]
    },
    "content_text": "The 5 Must-Ask Career Test Questions. After all the research, I still can't decide. What simple questions can I ask myself? Use these 5 self-assessment questions covering V.I.S., financial reality, and external pressure. Q1: Can I see myself doing this 8 hours a day for 5 years? Tests interest and resilience. Q2: Will I earn enough to support the lifestyle I want? Tests financial reality. Q3: Am I choosing this for me or for others? Tests external pressure. Q4: Do I have or can I get the required subjects? Tests academic ability. Q5: Can I afford the training? Tests affordability - explore NSFAS, TVET, bursaries if no. Score 1-5: Need at least 4 yeses. Be brutally honest, address each no with specific action.",
    "tags": ["decision_making", "self_assessment", "vis_model", "validation"],
    "related_chunks": ["dm_chunk_01_career_choice_matrix", "dm_chunk_09_decision_tree", "dm_chunk_14_whole_person"],
    "target_questions": ["Q19"],
    "sa_specific": true,
    "created_at": "2024-11-10",
    "version": "1.0"
  }
];

// Append new chunks
const allChunks = [...existingChunks, ...newChunks];

// Write back to file
try {
  fs.writeFileSync(filePath, JSON.stringify(allChunks, null, 2), 'utf8');
  console.log(`✓ Successfully wrote ${allChunks.length} chunks to file`);
  console.log(`✓ Added ${newChunks.length} new chunks`);
} catch (error) {
  console.error('Error writing file:', error.message);
  process.exit(1);
}
