/**
 * FIND WORKING VERCEL URL
 * 
 * Attempts to find the correct Vercel deployment URL by testing various patterns
 */

const https = require('https');
const { execSync } = require('child_process');

async function findWorkingVercelUrl() {
  console.log('🔍 SEARCHING FOR WORKING VERCEL URL...');
  
  // First, let's check if we can get the actual Vercel URL from git or deployment
  console.log('\n📋 Checking deployment information...');
  
  try {
    // Check if vercel CLI is available and get project info
    const vercelInfo = execSync('vercel ls 2>/dev/null || echo "Vercel CLI not available"', { encoding: 'utf8' });
    console.log('Vercel CLI output:', vercelInfo);
  } catch (error) {
    console.log('⚠️  Vercel CLI not available or not logged in');
  }
  
  // Generate possible URL patterns based on repository name and common Vercel patterns
  const repoName = 'Thandi.AI-Master';
  const username = 'SeelanGov';
  
  const urlPatterns = [
    // Standard patterns
    'https://thandi-ai.vercel.app',
    'https://thandi-ai-master.vercel.app', 
    'https://thandi-ai-seelangovs-projects.vercel.app',
    'https://thandi-ai-git-main-seelangovs-projects.vercel.app',
    
    // Alternative patterns
    'https://thandi-ai-master-git-main-seelangovs-projects.vercel.app',
    'https://thandi-ai-master-seelangovs-projects.vercel.app',
    'https://thandi-rag-system.vercel.app',
    'https://thandi-rag-system-seelangovs-projects.vercel.app',
    
    // Branch-specific patterns
    'https://thandi-ai-876dd721-seelangovs-projects.vercel.app',
    'https://thandi-ai-main-seelangovs-projects.vercel.app',
    
    // Deployment-specific patterns (using recent commit hash)
    'https://thandi-ai-876dd721.vercel.app',
    'https://thandi-ai-cef794db.vercel.app'
  ];
  
  console.log(`\n🌐 Testing ${urlPatterns.length} possible URL patterns...`);
  
  const workingUrls = [];
  
  for (let i = 0; i < urlPatterns.length; i++) {
    const baseUrl = urlPatterns[i];
    console.log(`\n${i + 1}/${urlPatterns.length} Testing: ${baseUrl}`);
    
    try {
      // Test root URL
      const rootResponse = await makeRequest(baseUrl);
      console.log(`  Root: ${rootResponse.statusCode}`);
      
      if (rootResponse.statusCode === 200) {
        console.log('  ✅ Root accessible');
        
        // Test assessment page
        const assessmentResponse = await makeRequest(`${baseUrl}/assessment`);
        console.log(`  Assessment: ${assessmentResponse.statusCode}`);
        
        if (assessmentResponse.statusCode === 200) {
          console.log('  ✅ Assessment page accessible');
          
          // Check for THANDI content
          if (assessmentResponse.body.includes('THANDI') || assessmentResponse.body.includes('Career Assessment')) {
            console.log('  ✅ THANDI content found');
            
            workingUrls.push({
              url: baseUrl,
              assessmentUrl: `${baseUrl}/assessment`,
              hasContent: true,
              status: 'WORKING'
            });
            
            console.log('  🎯 FOUND WORKING URL!');
            
            // Test mobile-specific features
            await testMobileFeatures(assessmentResponse.body, baseUrl);
            
          } else {
            console.log('  ⚠️  No THANDI content detected');
            workingUrls.push({
              url: baseUrl,
              assessmentUrl: `${baseUrl}/assessment`,
              hasContent: false,
              status: 'ACCESSIBLE_BUT_NO_CONTENT'
            });
          }
        } else {
          console.log(`  ❌ Assessment page: ${assessmentResponse.statusCode}`);
        }
      } else if (rootResponse.statusCode === 301 || rootResponse.statusCode === 302) {
        console.log(`  🔄 Redirect to: ${rootResponse.headers.location}`);
        if (rootResponse.headers.location) {
          // Add redirect target to test list if not already there
          const redirectUrl = rootResponse.headers.location;
          if (!urlPatterns.includes(redirectUrl) && !workingUrls.find(u => u.url === redirectUrl)) {
            urlPatterns.push(redirectUrl);
          }
        }
      } else {
        console.log(`  ❌ Status: ${rootResponse.statusCode}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Report results
  console.log('\n📊 SEARCH RESULTS:');
  console.log('==================');
  
  if (workingUrls.length === 0) {
    console.log('❌ No working URLs found');
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Check Vercel dashboard for actual deployment URL');
    console.log('2. Verify the project is properly connected to GitHub');
    console.log('3. Check for build errors in Vercel deployment logs');
    console.log('4. Ensure the domain is properly configured');
    console.log('5. Try redeploying from Vercel dashboard');
  } else {
    console.log(`✅ Found ${workingUrls.length} accessible URL(s):`);
    
    workingUrls.forEach((urlInfo, index) => {
      console.log(`\n${index + 1}. ${urlInfo.url}`);
      console.log(`   Assessment: ${urlInfo.assessmentUrl}`);
      console.log(`   Status: ${urlInfo.status}`);
      console.log(`   Has THANDI content: ${urlInfo.hasContent ? 'Yes' : 'No'}`);
    });
    
    // Find the best URL (with content)
    const bestUrl = workingUrls.find(u => u.hasContent) || workingUrls[0];
    
    console.log(`\n🎯 RECOMMENDED URL FOR TESTING:`);
    console.log(`${bestUrl.assessmentUrl}`);
    
    return bestUrl;
  }
  
  return null;
}

async function testMobileFeatures(html, baseUrl) {
  console.log('  📱 Testing mobile features...');
  
  // Check for mobile viewport
  if (html.includes('width=device-width')) {
    console.log('    ✅ Mobile viewport configured');
  } else {
    console.log('    ❌ Mobile viewport missing');
  }
  
  // Check for theme color
  if (html.includes('#114E4E') || html.includes('theme-color')) {
    console.log('    ✅ THANDI theme color found');
  } else {
    console.log('    ❌ Theme color missing');
  }
  
  // Check for responsive CSS classes
  if (html.includes('sm:') || html.includes('md:') || html.includes('lg:')) {
    console.log('    ✅ Responsive CSS classes detected');
  } else {
    console.log('    ⚠️  Responsive CSS classes not detected in HTML');
  }
  
  // Test API endpoints
  console.log('  🔌 Testing API endpoints...');
  
  const apiEndpoints = [
    '/api/schools/search?q=test',
    '/api/student/register'
  ];
  
  for (const endpoint of apiEndpoints) {
    try {
      const response = await makeRequest(`${baseUrl}${endpoint}`);
      if (response.statusCode === 200 || response.statusCode === 405) {
        console.log(`    ✅ ${endpoint} - Accessible`);
      } else {
        console.log(`    ❌ ${endpoint} - Status ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`    ❌ ${endpoint} - Error: ${error.message}`);
    }
  }
}

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 8000
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run the search
if (require.main === module) {
  findWorkingVercelUrl().then(result => {
    if (result && result.hasContent) {
      console.log('\n🎉 SUCCESS! Ready for mobile testing.');
      console.log('\n📱 MOBILE TESTING CHECKLIST:');
      console.log(`1. Open ${result.assessmentUrl} on mobile device`);
      console.log('2. Test grade selection (touch targets)');
      console.log('3. Complete registration flow');
      console.log('4. Verify THANDI branding alignment');
      console.log('5. Check responsive design at different screen sizes');
      
      // Save the working URL for future tests
      const fs = require('fs');
      fs.writeFileSync('working-vercel-url.txt', result.assessmentUrl);
      console.log('\n💾 Working URL saved to: working-vercel-url.txt');
      
    } else {
      console.log('\n❌ No working URL found. Check Vercel deployment status.');
    }
  }).catch(console.error);
}

module.exports = { findWorkingVercelUrl };