// Debug Environment Provider
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Environment Debug');
console.log(`LLM_PROVIDER from env: "${process.env.LLM_PROVIDER}"`);
console.log(`All LLM vars:`);
console.log(`- ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`- OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`- GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`- KIMI_API_KEY: ${process.env.KIMI_API_KEY ? 'SET' : 'NOT SET'}`);

import { LLMAdapter } from './lib/llm/llm-adapter.js';

const defaultProvider = LLMAdapter.getDefaultProvider();
console.log(`Default provider: ${defaultProvider.name}`);