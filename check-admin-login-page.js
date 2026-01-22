async function checkAdminLogin() {
  const url = 'https://www.thandi.online/admin/login';
  console.log(`Checking: ${url}\n`);
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('\nSearching for key terms:');
    console.log('- Contains "Admin Login":', html.includes('Admin Login'));
    console.log('- Contains "School Login":', html.includes('School Login'));
    console.log('- Contains "Thandi":', html.includes('Thandi'));
    console.log('- Contains "email":', html.includes('email'));
    console.log('- Contains "password":', html.includes('password'));
    
    console.log('\nFirst 1000 characters of response:');
    console.log(html.substring(0, 1000));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAdminLogin();
