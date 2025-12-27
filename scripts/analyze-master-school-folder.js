#!/usr/bin/env node

/**
 * Analyze the thandi_master_school folder to understand available data files
 */

import fs from 'fs';
import path from 'path';

console.log('📁 Analyzing thandi_master_school folder...\n');

function analyzeFolder() {
  const folderPath = 'thandi_master_school name file';
  
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Folder not found: ${folderPath}`);
    console.log('\n📋 Available folders in root:');
    const rootFiles = fs.readdirSync('.');
    rootFiles.filter(file => fs.statSync(file).isDirectory()).forEach(dir => {
      console.log(`   📁 ${dir}`);
    });
    return;
  }

  const files = fs.readdirSync(folderPath);
  
  if (files.length === 0) {
    console.log('📂 Folder is empty');
    return;
  }

  console.log(`📊 Found ${files.length} files in ${folderPath}:\n`);

  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(1);
    
    console.log(`📄 ${file}`);
    console.log(`   Size: ${size} KB`);
    console.log(`   Modified: ${stats.mtime.toISOString().split('T')[0]}`);
    
    // Try to analyze file content
    if (file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        if (Array.isArray(data)) {
          console.log(`   Records: ${data.length}`);
          
          if (data.length > 0) {
            const sample = data[0];
            console.log(`   Sample fields: ${Object.keys(sample).join(', ')}`);
            
            // Check for school types
            if (sample.type || sample.institution_type) {
              const typeField = sample.type || sample.institution_type;
              console.log(`   Sample type: ${typeField}`);
            }
          }
        } else {
          console.log(`   Type: Object (${Object.keys(data).length} keys)`);
        }
      } catch (e) {
        console.log(`   ⚠️  Invalid JSON: ${e.message}`);
      }
    } else if (file.endsWith('.csv')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        console.log(`   Rows: ${lines.length - 1} (excluding header)`);
        
        if (lines.length > 0) {
          const headers = lines[0].split(',');
          console.log(`   Columns: ${headers.length}`);
          console.log(`   Headers: ${headers.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''}`);
        }
      } catch (e) {
        console.log(`   ⚠️  Error reading CSV: ${e.message}`);
      }
    }
    
    console.log('');
  });

  // Provide recommendations
  console.log('💡 Recommendations:');
  
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  const csvFiles = files.filter(f => f.endsWith('.csv'));
  
  if (jsonFiles.length > 0) {
    console.log(`   📄 JSON files available: ${jsonFiles.join(', ')}`);
    console.log(`   🔧 To update with JSON: node scripts/update-school-master-data.js "${folderPath}/${jsonFiles[0]}"`);
  }
  
  if (csvFiles.length > 0) {
    console.log(`   📄 CSV files available: ${csvFiles.join(', ')}`);
    console.log(`   🔧 To update with CSV: node scripts/update-school-master-data.js "${folderPath}/${csvFiles[0]}"`);
  }
  
  console.log('\n📋 Before updating:');
  console.log('   1. Ensure the file contains only secondary schools (Grades 8-12)');
  console.log('   2. Verify the data format matches expected structure');
  console.log('   3. Run the update script to safely replace school data');
}

analyzeFolder();