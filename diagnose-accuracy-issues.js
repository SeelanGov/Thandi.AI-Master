/**
 * Diagnose Accuracy Issues
 * Identifies why our test scenarios are not matching expected keywords
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function diagnoseScenario(name, query, curriculum, expectedKeywords) {
  console.log(`\n🔍 DIAGNOSING: ${name}`);
  console.log('=' .repeat(50));
  
  try {
    const response = await fetch(`${BASE_URL}/api/rag/simple-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, curriculum })
    });
    
    const data = await response.json();
    
    if (data.success && data.answer) {
      console.log(`📝 Query: "${query}"`);
      console.log(`🎓 Curriculum Filter: ${curriculum}`);
      console.log(`📊 Sources Found: ${data.sources?.length || 0}`);
      
      // Show source details
      if (data.sources && data.sources.length > 0) {
        console.log('\n📚 Source Analysis:');
        data.sources.forEach((source, i) => {
          console.log(`   ${i + 1}. Curriculum: ${source.curriculum}, Category: ${source.category}, Subject: ${source.subject}`);
        });
      }
      
      console.log(`\n📄 Full Answer (${data.answer.length} chars):`);
      console.log(`"${data.answer}"`);
      
      console.log('\n🎯 Keyword Analysis:');
      const answer = data.answer.toLowerCase();
      
      expectedKeywords.forEach(keyword => {
        const found = answer.includes(keyword.toLowerCase());
        const variations = [
          keyword.toLowerCase(),
          keyword.toLowerCase().replace(/\s+/g, ''),
          keyword.toLowerCase().replace(/\s+/g, '-'),
          keyword.toLowerCase().replace(/\s+/g, '_')
        ];
        
        const foundVariation = variations.find(v => answer.includes(v));
        
        console.log(`   "${keyword}": ${found ? '✅ FOUND' : '❌ MISSING'}`);
        
        if (!found && foundVariation) {
          console.log(`     Found variation: "${foundVariation}"`);
        }
        
        if (!found) {
          // Look for partial matches
          const words = keyword.toLowerCase().split(' ');
          const partialMatches = words.filter(word => answer.includes(word));
          if (partialMatches.length > 0) {
            console.log(`     Partial matches: ${partialMatches.join(', ')}`);
          }
        }
      });
      
      // Identify the core issue
      console.log('\n🔧 ISSUE ANALYSIS:');
      
      if (data.sources?.length === 0) {
        console.log('❌ PRIMARY ISSUE: No relevant sources found');
        console.log('   - Check if curriculum filter is working');
        console.log('   - Verify embeddings contain the right content');
        console.log('   - Consider query reformulation');
      } else if (data.sources?.length > 0) {
        console.log('✅ Sources found, but keyword matching issues:');
        
        // Check if it's a content issue or keyword issue
        const hasRelevantContent = expectedKeywords.some(keyword => 
          answer.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (!hasRelevantContent) {
          console.log('❌ Content doesn\'t match expected keywords');
          console.log('   - Sources may not contain the expected information');
          console.log('   - Query may be retrieving wrong content');
          console.log('   - LLM may be generating generic responses');
        } else {
          console.log('⚠️ Partial keyword matching - content is relevant but incomplete');
        }
      }
      
      return {
        sourcesFound: data.sources?.length || 0,
        answerLength: data.answer.length,
        keywordMatches: expectedKeywords.filter(k => answer.includes(k.toLowerCase())).length,
        totalKeywords: expectedKeywords.length
      };
      
    } else {
      console.log(`❌ Query failed: ${data.error || 'No answer'}`);
      return { error: data.error };
    }
    
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return { error: error.message };
  }
}

async function runDiagnostics() {
  console.log('🔍 ACCURACY DIAGNOSTIC ANALYSIS');
  console.log('Identifying why our test scenarios have low accuracy rates\n');
  
  const scenarios = [
    {
      name: 'IEB Advanced Programme Mathematics',
      query: 'What is Advanced Programme Mathematics in IEB and how does it help with university applications?',
      curriculum: 'ieb',
      expectedKeywords: ['Advanced Programme', 'Mathematics', 'IEB', 'university', 'bonus'],
      issue: 'Missing "Advanced Programme" and "bonus" keywords'
    },
    {
      name: 'CAPS Mathematical Literacy',
      query: 'What career options do I have with Mathematical Literacy in CAPS?',
      curriculum: 'caps',
      expectedKeywords: ['Mathematical Literacy', 'CAPS', 'career', 'limitations'],
      issue: 'No sources found for CAPS content'
    },
    {
      name: 'UCT vs Wits Comparison',
      query: 'Compare engineering requirements at UCT vs Wits for IEB students',
      curriculum: 'ieb',
      expectedKeywords: ['UCT', 'Wits', 'engineering', 'FPS', 'APS'],
      issue: 'Missing "FPS" and "APS" keywords'
    }
  ];
  
  const diagnostics = [];
  
  for (const scenario of scenarios) {
    const result = await diagnoseScenario(
      scenario.name,
      scenario.query,
      scenario.curriculum,
      scenario.expectedKeywords
    );
    
    diagnostics.push({ ...scenario, ...result });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Summary and recommendations
  console.log('\n📋 DIAGNOSTIC SUMMARY & RECOMMENDATIONS');
  console.log('=' .repeat(60));
  
  const avgSources = diagnostics
    .filter(d => d.sourcesFound !== undefined)
    .reduce((sum, d) => sum + d.sourcesFound, 0) / diagnostics.filter(d => d.sourcesFound !== undefined).length;
  
  console.log(`📊 Average sources per query: ${avgSources.toFixed(1)}`);
  
  // Identify patterns
  const noSourcesQueries = diagnostics.filter(d => d.sourcesFound === 0);
  const lowMatchQueries = diagnostics.filter(d => d.keywordMatches !== undefined && d.keywordMatches < d.totalKeywords * 0.8);
  
  console.log('\n🎯 IDENTIFIED ISSUES:');
  
  if (noSourcesQueries.length > 0) {
    console.log(`\n❌ ${noSourcesQueries.length} queries found no sources:`);
    noSourcesQueries.forEach(q => {
      console.log(`   - ${q.name} (${q.curriculum} curriculum)`);
    });
    console.log('\n💡 SOLUTION: Improve content coverage or query matching');
  }
  
  if (lowMatchQueries.length > 0) {
    console.log(`\n⚠️ ${lowMatchQueries.length} queries have low keyword matching:`);
    lowMatchQueries.forEach(q => {
      console.log(`   - ${q.name}: ${q.keywordMatches}/${q.totalKeywords} keywords matched`);
    });
    console.log('\n💡 SOLUTION: Adjust expected keywords or improve content quality');
  }
  
  console.log('\n🔧 RECOMMENDED FIXES:');
  console.log('1. ✅ Add missing "Advanced Programme" content to IEB mathematics');
  console.log('2. ✅ Add CAPS Mathematical Literacy career guidance content');
  console.log('3. ✅ Ensure university files mention "APS" and "FPS" explicitly');
  console.log('4. ✅ Add "bonus" information for AP subjects');
  console.log('5. ✅ Improve query-to-content matching in RAG system');
  
  return diagnostics;
}

runDiagnostics().catch(console.error);