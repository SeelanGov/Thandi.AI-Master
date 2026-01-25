/**
 * COPY-PASTE READY: Reliable File Writer
 * 
 * Usage:
 *   const { writeFileReliably, verifyFile } = require('./lib/utils/file-writer');
 *   const result = writeFileReliably('path/to/file.js', content);
 *   if (result.success) console.log('✅ File written');
 * 
 * This solves the "fsWrite creates empty files" problem by:
 * 1. Writing to temporary file first
 * 2. Verifying content matches
 * 3. Atomically renaming to final location
 * 4. Final verification
 * 5. Retry logic with exponential backoff
 */

const fs = require('fs');
const path = require('path');

/**
 * Reliably write file with comprehensive verification
 * 
 * @param {string} filePath - Path to file to write
 * @param {string} content - Content to write
 * @param {object} options - Configuration options
 *   @param {number} options.maxRetries - Max retry attempts (default: 3)
 *   @param {number} options.retryDelay - Delay between retries in ms (default: 100)
 *   @param {boolean} options.verbose - Log detailed info (default: false)
 * 
 * @returns {object} Result object
 *   @returns {boolean} success - Whether write succeeded
 *   @returns {string} path - File path
 *   @returns {number} size - Final file size in bytes
 *   @returns {number} attempt - Which attempt succeeded
 *   @returns {string} error - Error message if failed
 *   @returns {string} message - Human-readable message
 * 
 * @example
 *   const result = writeFileReliably('lib/admin/logger.js', content);
 *   if (result.success) {
 *     console.log(`✅ Written ${result.size} bytes`);
 *   } else {
 *     console.error(`❌ ${result.error}`);
 *   }
 */
function writeFileReliably(filePath, content, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 100,
    verbose = false
  } = options;

  if (!filePath) {
    return { success: false, error: 'filePath is required' };
  }

  if (content === undefined || content === null) {
    return { success: false, error: 'content is required' };
  }

  if (typeof content !== 'string') {
    return { success: false, error: 'content must be a string' };
  }

  if (content.length === 0) {
    return { success: false, error: 'content is empty' };
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (verbose) {
        console.log(`\n📝 Write attempt ${attempt}/${maxRetries}`);
        console.log(`   Path: ${filePath}`);
        console.log(`   Size: ${content.length} bytes`);
      }

      // Step 1: Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        if (verbose) console.log(`   📁 Creating directory: ${dir}`);
        fs.mkdirSync(dir, { recursive: true });
      }

      // Step 2: Write to temporary file
      const tempPath = filePath + '.tmp';
      if (verbose) console.log(`   📄 Writing to temp file: ${tempPath}`);
      
      fs.writeFileSync(tempPath, content, 'utf8');

      // Step 3: Verify temp file exists and has content
      if (!fs.existsSync(tempPath)) {
        throw new Error('Temp file was not created');
      }

      const tempStat = fs.statSync(tempPath);
      if (tempStat.size === 0) {
        throw new Error('Temp file is empty (0 bytes)');
      }

      if (verbose) console.log(`   ✓ Temp file created: ${tempStat.size} bytes`);

      // Step 4: Verify temp file content matches
      const tempContent = fs.readFileSync(tempPath, 'utf8');
      if (tempContent !== content) {
        throw new Error(
          `Temp file content mismatch: ${tempContent.length} vs ${content.length} bytes`
        );
      }

      if (verbose) console.log(`   ✓ Temp file content verified`);

      // Step 5: Remove old file if exists
      if (fs.existsSync(filePath)) {
        if (verbose) console.log(`   🗑️  Removing old file`);
        fs.unlinkSync(filePath);
      }

      // Step 6: Atomic rename (temp -> final)
      if (verbose) console.log(`   🔄 Renaming temp to final`);
      fs.renameSync(tempPath, filePath);

      // Step 7: Final verification
      if (!fs.existsSync(filePath)) {
        throw new Error('Final file does not exist after rename');
      }

      const finalStat = fs.statSync(filePath);
      if (finalStat.size === 0) {
        throw new Error('Final file is empty (0 bytes) after rename');
      }

      const finalContent = fs.readFileSync(filePath, 'utf8');
      if (finalContent !== content) {
        throw new Error(
          `Final file content mismatch: ${finalContent.length} vs ${content.length} bytes`
        );
      }

      if (verbose) {
        console.log(`   ✓ Final file verified: ${finalStat.size} bytes`);
        console.log(`   ✅ SUCCESS on attempt ${attempt}`);
      }

      return {
        success: true,
        path: filePath,
        size: finalStat.size,
        attempt,
        message: `File written successfully on attempt ${attempt}`
      };

    } catch (error) {
      if (verbose) {
        console.log(`   ❌ Attempt ${attempt} failed: ${error.message}`);
      }

      // Clean up temp file
      try {
        const tempPath = filePath + '.tmp';
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (e) {
        // Ignore cleanup errors
      }

      // If this was the last attempt, return error
      if (attempt === maxRetries) {
        return {
          success: false,
          path: filePath,
          error: error.message,
          attempts: maxRetries,
          message: `Failed after ${maxRetries} attempts: ${error.message}`
        };
      }

      // Wait before retry (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt - 1);
      if (verbose) console.log(`   ⏳ Waiting ${delay}ms before retry...`);
      
      const start = Date.now();
      while (Date.now() - start < delay) {
        // Busy wait to ensure delay
      }
    }
  }

  // Should never reach here
  return {
    success: false,
    path: filePath,
    error: 'Unknown error',
    attempts: maxRetries
  };
}

/**
 * Verify file exists and has content
 * 
 * @param {string} filePath - Path to file to verify
 * @returns {object} Verification result
 *   @returns {boolean} exists - File exists
 *   @returns {number} size - File size in bytes
 *   @returns {boolean} isEmpty - File is empty (0 bytes)
 *   @returns {string} content - First 200 chars of content
 *   @returns {string} error - Error message if verification failed
 * 
 * @example
 *   const verify = verifyFile('lib/admin/logger.js');
 *   if (verify.isEmpty) {
 *     console.error('❌ File is empty!');
 *   }
 */
function verifyFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        exists: false,
        size: 0,
        isEmpty: true,
        error: 'File does not exist'
      };
    }

    const stat = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    return {
      exists: true,
      size: stat.size,
      isEmpty: stat.size === 0,
      content: content.substring(0, 200),
      contentLength: content.length
    };
  } catch (error) {
    return {
      exists: false,
      size: 0,
      isEmpty: true,
      error: error.message
    };
  }
}

/**
 * Write file using streaming (for very large files)
 * 
 * @param {string} filePath - Path to file
 * @param {string} content - Content to write
 * @param {object} options - Configuration
 *   @param {number} options.chunkSize - Chunk size in bytes (default: 50000)
 *   @param {boolean} options.verbose - Log details (default: false)
 * 
 * @returns {Promise} Resolves with result object
 * 
 * @example
 *   const result = await writeFileStreaming('large-file.js', content);
 *   if (result.success) console.log(`✅ Written ${result.size} bytes`);
 */
async function writeFileStreaming(filePath, content, options = {}) {
  const { chunkSize = 50000, verbose = false } = options;

  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const tempPath = filePath + '.tmp';
      const stream = fs.createWriteStream(tempPath, {
        encoding: 'utf8',
        highWaterMark: chunkSize
      });

      let bytesWritten = 0;
      let chunkCount = 0;

      stream.on('finish', () => {
        try {
          const stat = fs.statSync(tempPath);

          if (stat.size === 0) {
            reject(new Error('Stream write resulted in empty file'));
            return;
          }

          // Verify content
          const written = fs.readFileSync(tempPath, 'utf8');
          if (written.length !== content.length) {
            reject(
              new Error(
                `Content length mismatch: ${written.length} vs ${content.length}`
              )
            );
            return;
          }

          // Atomic rename
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          fs.renameSync(tempPath, filePath);

          if (verbose) {
            console.log(`✅ Stream write complete: ${stat.size} bytes in ${chunkCount} chunks`);
          }

          resolve({
            success: true,
            path: filePath,
            size: stat.size,
            chunks: chunkCount,
            message: `Written ${stat.size} bytes in ${chunkCount} chunks`
          });
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', reject);

      // Write content in chunks
      let offset = 0;
      const writeNextChunk = () => {
        if (offset >= content.length) {
          stream.end();
          return;
        }

        const chunk = content.slice(offset, offset + chunkSize);
        offset += chunkSize;
        bytesWritten += chunk.length;
        chunkCount++;

        if (verbose && chunkCount % 10 === 0) {
          console.log(`  📦 Chunk ${chunkCount}: ${bytesWritten} bytes written`);
        }

        if (!stream.write(chunk)) {
          stream.once('drain', writeNextChunk);
        } else {
          setImmediate(writeNextChunk);
        }
      };

      writeNextChunk();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Batch write multiple files
 * 
 * @param {array} files - Array of { path, content } objects
 * @param {object} options - Configuration
 * 
 * @returns {array} Array of result objects
 * 
 * @example
 *   const results = batchWriteFiles([
 *     { path: 'file1.js', content: 'content1' },
 *     { path: 'file2.js', content: 'content2' }
 *   ]);
 */
function batchWriteFiles(files, options = {}) {
  const results = [];

  for (const file of files) {
    if (!file.path || !file.content) {
      results.push({
        success: false,
        error: 'Missing path or content'
      });
      continue;
    }

    const result = writeFileReliably(file.path, file.content, options);
    results.push(result);
  }

  return results;
}

// Export functions
module.exports = {
  writeFileReliably,
  verifyFile,
  writeFileStreaming,
  batchWriteFiles
};

// If run directly, run tests
if (require.main === module) {
  console.log('🧪 Testing file writer...\n');

  // Test 1: Small file
  console.log('Test 1: Small file');
  const result1 = writeFileReliably(
    'test-small.txt',
    'Hello World'.repeat(10),
    { verbose: true }
  );
  console.log('Result:', result1, '\n');

  // Test 2: Verify
  console.log('Test 2: Verify file');
  const verify = verifyFile('test-small.txt');
  console.log('Verification:', verify, '\n');

  // Cleanup
  if (fs.existsSync('test-small.txt')) {
    fs.unlinkSync('test-small.txt');
  }

  console.log('✅ Tests complete');
}
