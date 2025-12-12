// Script to rollback to mock implementation (safety net)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routePath = path.join(__dirname, '..', 'app', 'api', 'rag', 'query', 'route.js');
const mockPath = path.join(__dirname, '..', 'app', 'api', 'rag', 'query', 'route-mock.js');

async function switchToMock() {
  console.log('🔄 ROLLING BACK TO MOCK IMPLEMENTATION\n');
  console.log('='.repeat(70));
  
  try {
    // Check if mock backup exists
    if (!fs.existsSync(mockPath)) {
      throw new Error('Mock backup (route-mock.js) not found!');
    }
    
    console.log('\n📦 Restoring mock implementation...');
    
    // Copy mock back to route.js
    fs.copyFileSync(mockPath, routePath);
    console.log('✅ Copied route-mock.js to route.js');
    
    // Verify the switch
    console.log('\n🔍 Verifying rollback...');
    
    const content = fs.readFileSync(routePath, 'utf8');
    const isMock = content.includes('1.0.0-mock') || content.includes('Mock response');
    
    if (isMock) {
      console.log('✅ Successfully rolled back to mock implementation');
    } else {
      throw new Error('Verification failed - route.js does not contain mock code');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ ROLLBACK COMPLETE');
    console.log('='.repeat(70));
    
    console.log('\n📝 System is now using safe mock responses');
    console.log('   Students will see the same 3 careers for all queries');
    console.log('   This is the safe fallback mode');
    console.log('');
    console.log('To switch back to real database:');
    console.log('   node scripts/switch-to-real-db.js');
    
    return true;
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    return false;
  }
}

switchToMock()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
