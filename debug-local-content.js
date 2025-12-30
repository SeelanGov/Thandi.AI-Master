#!/usr/bin/env node

/**
 * DEBUG LOCAL CONTENT
 * See what's actually being served locally
 */

const http = require('http');
const fs = require('fs');

async function debugLocalContent() {
  console.log('🔍 DEBUGGING LOCAL CONTENT');
  console.log('===========================');
  
  const ports = [3000, 3001, 3002, 3003];
  
  for (const port of ports) {
    console.log(`\n🌐 Testing port ${port}:`);
    
    const result = await new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}/assessment`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            content: data,
            port: port
          });
        });
      });
      req.on('error', () => resolve({ success: false, port: port }));
      req.setTimeout(3000, () => {
        req.destroy();
        resolve({ success: false, port: port });
      });
    });
    
    if (result.success) {
      console.log(`✅ Port ${port} responding (${result.statusCode})`);
      
      // Save content to file for analysis
      fs.writeFileSync(`local-content-port-${port}.html`, result.content);
      console.log(`💾 Saved content to: local-content-port-${port}.html`);
      
      // Analyze content
      const hasNextData = result.content.includes('__NEXT_DATA__');
      const hasNextScripts = result.content.includes('_next/static/chunks/');
      const hasRegistration = result.content.includes('Student Registration') || result.content.includes('privacy');
      const hasGradeSelector = result.content.includes('What grade are you in');
      const hasReactRoot = result.content.includes('__next');
      
      console.log(`   ⚛️ Next.js Data: ${hasNextData ? 'Yes' : 'No'}`);
      console.log(`   📜 Next.js Scripts: ${hasNextScripts ? 'Yes' : 'No'}`);
      console.log(`   📝 Registration: ${hasRegistration ? 'Yes' : 'No'}`);
      console.log(`   🎯 Grade Selector: ${hasGradeSelector ? 'Yes' : 'No'}`);
      console.log(`   🌳 React Root: ${hasReactRoot ? 'Yes' : 'No'}`);
      
      // Show first 500 characters
      console.log(`   📄 Content preview:`);
      console.log(`   ${result.content.substring(0, 500)}...`);
      
      return { port, content: result.content, working: true };
    } else {
      console.log(`❌ Port ${port} not responding`);
    }
  }
  
  return null;
}

debugLocalContent().then(result => {
  if (result) {
    console.log(`\n✅ Found working server on port ${result.port}`);
    console.log('📄 Content saved for analysis');
  } else {
    console.log('\n❌ No working servers found');
  }
}).catch(error => {
  console.error('❌ Error:', error.message);
});