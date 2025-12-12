// Script to switch from mock to real database implementation
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const routePath = path.join(__dirname, '..', 'app', 'api', 'rag', 'query', 'route.js');
const mockPath = path.join(__dirname, '..', 'app', 'api', 'rag', 'query', 'route-mock.js');
const realPath = path.join(__dirname, '..', 'app', 'api', 'rag', 'query', 'route-real-db.js');

async function switchToRealDB() {
  console.log('🔄 SWITCHING TO REAL DATABASE IMPLEMENTATION\n');
  console.log('='.repeat(70));
  
  try {
    // Step 1: Backup current route.js as route-mock.js
    console.log('\n📦 Step 1: Backing up current mock implementation...');
    
    if (fs.existsSync(routePath)) {
      fs.copyFileSync(routePath, mockPath);
      console.log('✅ Backed up to route-mock.js');
    } else {
      console.log('⚠️  No existing route.js found');
    }
    
    // Step 2: Copy real implementation to route.js
    console.log('\n📦 Step 2: Activating real database implementation...');
    
    if (fs.existsSync(realPath)) {
      fs.copyFileSync(realPath, routePath);
      console.log('✅ Copied route-real-db.js to route.js');
    } else {
      throw new Error('route-real-db.js not found!');
    }
    
    // Step 3: Verify the switch
    console.log('\n🔍 Step 3: Verifying switch...');
    
    const content = fs.readFileSync(routePath, 'utf8');
    const isRealDB = content.includes('real-rag-v1') || content.includes('supabase-connected');
    
    if (isRealDB) {
      console.log('✅ Successfully switched to real database implementation');
    } else {
      throw new Error('Verification failed - route.js does not contain real DB code');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ SWITCH COMPLETE');
    console.log('='.repeat(70));
    
    console.log('\n📝 Next Steps:');
    console.log('1. Test locally:');
    console.log('   npm run dev');
    console.log('   node scripts/test-live-deployment-now.js');
    console.log('');
    console.log('2. Deploy to Vercel:');
    console.log('   git add app/api/rag/query/route.js');
    console.log('   git commit -m "Switch to real database implementation"');
    console.log('   vercel --prod');
    console.log('');
    console.log('3. To rollback if needed:');
    console.log('   node scripts/switch-to-mock.js');
    
    return true;
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\n⚠️  Rolling back...');
    
    // Rollback: restore mock if it exists
    if (fs.existsSync(mockPath)) {
      fs.copyFileSync(mockPath, routePath);
      console.log('✅ Rolled back to mock implementation');
    }
    
    return false;
  }
}

switchToRealDB()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
