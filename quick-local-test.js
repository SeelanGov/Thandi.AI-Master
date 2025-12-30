#!/usr/bin/env node

/**
 * QUICK LOCAL TEST
 * Skip build, go straight to dev server testing
 */

const { spawn } = require('child_process');

function startDevServer() {
  console.log('🚀 STARTING DEVELOPMENT SERVER');
  console.log('==============================');
  console.log('⏳ Starting Next.js development server...');
  console.log('🌐 Server will be available at: http://localhost:3000');
  console.log('📄 Assessment page: http://localhost:3000/assessment');
  
  console.log('\n🔍 WHAT TO TEST:');
  console.log('================');
  console.log('1. ✅ Registration form appears (not grade selector)');
  console.log('2. ✅ Privacy notice with POPIA compliance');
  console.log('3. ✅ Thandi branding (not THANDI)');
  console.log('4. ✅ Teal colors (not blue)');
  console.log('5. ✅ School search functionality');
  console.log('6. ✅ Grade dropdown works');
  console.log('7. ✅ Registration submission');
  
  console.log('\n📋 CRITICAL TEST:');
  console.log('=================');
  console.log('□ Open http://localhost:3000/assessment');
  console.log('□ VERIFY: Shows registration form (not "What grade are you in?")');
  console.log('□ VERIFY: Privacy notice appears first');
  console.log('□ VERIFY: Can proceed to registration form');
  console.log('□ VERIFY: All UI fixes are visible');
  
  console.log('\n⚠️ IMPORTANT: If registration form shows, the fix works!');
  console.log('🛑 Press Ctrl+C to stop server when testing is complete');
  console.log('\n🚀 Starting server...\n');
  
  // Start the development server
  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  devServer.on('error', (error) => {
    console.log(`❌ Server error: ${error.message}`);
  });
  
  devServer.on('close', (code) => {
    console.log(`\n📅 Server stopped with code: ${code}`);
  });
}

console.log('🧪 QUICK LOCAL ASSESSMENT TEST');
console.log('===============================');
console.log(`📅 Started: ${new Date().toISOString()}`);
console.log('🎯 Goal: Test if registration form shows instead of grade selector');

startDevServer();