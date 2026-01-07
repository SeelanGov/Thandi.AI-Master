// Quick KIMI Provider Test
import { LLMAdapter } from './lib/llm/llm-adapter.js';

console.log('🧪 Quick KIMI Test');

try {
  // Test provider creation
  const kimiProvider = LLMAdapter.createProvider('kimi');
  console.log(`✅ KIMI Provider: ${kimiProvider.name}`);
  console.log(`   Model: ${kimiProvider.model}`);
  console.log(`   Base URL: ${kimiProvider.baseURL}`);
  
  // Test default provider
  const defaultProvider = LLMAdapter.getDefaultProvider();
  console.log(`✅ Default Provider: ${defaultProvider.name}`);
  
  if (defaultProvider.name === 'kimi') {
    console.log('🎯 SUCCESS: KIMI is now the default provider!');
  } else {
    console.log(`⚠️ Expected 'kimi', got '${defaultProvider.name}'`);
  }
  
} catch (error) {
  console.log(`❌ Error: ${error.message}`);
}