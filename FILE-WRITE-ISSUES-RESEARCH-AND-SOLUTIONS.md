# AI Coding Assistant File Writing Issues: Research & Solutions
**Date**: January 2026  
**Focus**: fsWrite empty file problem in Claude Code, Cursor, and similar IDEs

---

## 🚨 CRITICAL FINDINGS

### Known Issue: Files Created But Remain 0 Bytes
This is a **documented bug** affecting multiple AI coding assistants:

1. **Cursor IDE** (Windows 11): Files created empty, no content written
2. **Claude Code**: Sub-agents report success but files don't persist
3. **Google Gemini CLI**: Hallucinated successful operations while destroying data
4. **General Pattern**: Tool reports success → File exists but is 0 bytes

---

## ROOT CAUSES IDENTIFIED

### 1. **Execution Context Isolation** (PRIMARY CAUSE)
- Sub-agents operate in temporary/sandboxed contexts
- File operations complete in isolated context
- Changes don't persist to actual filesystem
- Main agent instance has different filesystem access than sub-agents

**Evidence**: Direct Write tool works fine, but sub-agent writes fail

### 2. **Session Lifecycle Issues**
- Sub-agent sessions cleaned up before file operations complete
- Async operations not properly awaited
- Buffer not flushed before session termination
- Temporary files not promoted to permanent storage

### 3. **Buffer/Flush Problems** (Windows-Specific)
- Windows file system caching not properly flushed
- FILE_FLAG_WRITE_THROUGH not set
- FlushFileBuffers not called after write
- Content in memory buffer lost on process exit

### 4. **Tool Implementation Limitations**
- fsWrite tool may not properly handle large files (300+ lines)
- UTF-8 multi-byte characters corrupted (box-drawing chars become NULL bytes)
- Permission model differences between contexts
- No error handling for partial writes

### 5. **Async/Sync Mismatch**
- Async writeFile() called but not awaited
- Process exits before write completes
- No callback verification
- Race condition between write and file close

---

## DOCUMENTED ISSUES IN PRODUCTION

### Issue #4462 (Claude Code - CRITICAL)
**Status**: Confirmed bug  
**Severity**: High  
**Scope**: Sub-agents via Task tool

```
Sub-agents report: ✅ File created successfully
Actual result: ❌ File doesn't exist on filesystem
```

### Issue #14791 (Claude Code)
**Status**: Confirmed bug  
**Severity**: Medium  
**Issue**: Auto-updater creates 0-byte placeholder files

```
Expected: Binary file downloaded
Actual: 0-byte file created, not cleaned up
```

### Cursor Forum Report (Windows 11)
**Status**: Confirmed by multiple users  
**Severity**: High  
**Environment**: Windows 11 Pro, Cursor 0.49.6+

```
Steps:
1. Create file via AI assistant
2. Request content write
3. Result: Empty file created
4. "Apply" button greyed out
```

---

## WINDOWS-SPECIFIC PROBLEMS

### File System Buffering Issues
1. **Write Cache Not Flushed**
   - Windows buffers writes in memory
   - FILE_FLAG_WRITE_THROUGH not set
   - FlushFileBuffers() not called
   - Data lost if process exits unexpectedly

2. **Permission Issues**
   - File created with restricted permissions
   - Content write fails silently
   - No error thrown to caller

3. **File Locking**
   - File locked by another process
   - Write operation fails
   - File remains 0 bytes

---

## PRACTICAL WORKAROUNDS

### ✅ WORKAROUND 1: Use Chunked Writing with Verification

```javascript
const fs = require('fs');
const path = require('path');

async function reliableFileWrite(filePath, content) {
  try {
    // Create directory if needed
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to temporary file first
    const tempPath = filePath + '.tmp';
    
    // Use synchronous write for reliability
    fs.writeFileSync(tempPath, content, 'utf8');
    
    // Verify content was written
    const written = fs.readFileSync(tempPath, 'utf8');
    if (written !== content) {
      throw new Error('Content verification failed - data mismatch');
    }
    
    // Atomic rename (Windows-safe)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    fs.renameSync(tempPath, filePath);
    
    // Final verification
    const final = fs.readFileSync(filePath, 'utf8');
    if (final !== content) {
      throw new Error('Final verification failed');
    }
    
    return { success: true, path: filePath, size: final.length };
  } catch (error) {
    console.error('File write failed:', error);
    return { success: false, error: error.message };
  }
}
```

### ✅ WORKAROUND 2: Split Large Files into Chunks

```javascript
async function writeChunkedFile(filePath, content, chunkSize = 10000) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const tempPath = filePath + '.tmp';
    const stream = fs.createWriteStream(tempPath, { encoding: 'utf8' });
    
    return new Promise((resolve, reject) => {
      let offset = 0;
      
      const writeChunk = () => {
        if (offset >= content.length) {
          stream.end();
          return;
        }
        
        const chunk = content.slice(offset, offset + chunkSize);
        offset += chunkSize;
        
        if (!stream.write(chunk)) {
          stream.once('drain', writeChunk);
        } else {
          setImmediate(writeChunk);
        }
      };
      
      stream.on('finish', () => {
        // Verify and rename
        const written = fs.readFileSync(tempPath, 'utf8');
        if (written.length === content.length) {
          fs.renameSync(tempPath, filePath);
          resolve({ success: true, path: filePath, size: written.length });
        } else {
          reject(new Error('Chunk write verification failed'));
        }
      });
      
      stream.on('error', reject);
      writeChunk();
    });
  } catch (error) {
    console.error('Chunked write failed:', error);
    return { success: false, error: error.message };
  }
}
```

### ✅ WORKAROUND 3: Use execSync for Direct File Operations

```javascript
const { execSync } = require('child_process');
const fs = require('fs');

function writeFileViaShell(filePath, content) {
  try {
    // Escape content for shell
    const escaped = content.replace(/'/g, "'\\''");
    
    // Use shell to write file (bypasses Node.js buffering)
    const cmd = `mkdir -p "${path.dirname(filePath)}" && cat > "${filePath}" << 'EOF'\n${content}\nEOF`;
    
    execSync(cmd, { encoding: 'utf8' });
    
    // Verify
    const written = fs.readFileSync(filePath, 'utf8');
    if (written === content) {
      return { success: true, path: filePath };
    } else {
      throw new Error('Shell write verification failed');
    }
  } catch (error) {
    console.error('Shell write failed:', error);
    return { success: false, error: error.message };
  }
}
```

### ✅ WORKAROUND 4: Avoid Sub-agents for File Operations

**Problem**: Sub-agents have isolated execution contexts  
**Solution**: Use main agent instance directly

```javascript
// ❌ DON'T DO THIS (sub-agent context)
invokeSubAgent({
  name: 'task-executor',
  prompt: 'Create file lib/admin/error-logger.js with content...'
});

// ✅ DO THIS (main agent context)
// Use fsWrite directly in main execution
fsWrite({
  path: 'lib/admin/error-logger.js',
  text: content
});
```

### ✅ WORKAROUND 5: Verify File After Write

```javascript
function writeAndVerify(filePath, content, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Write file
      fs.writeFileSync(filePath, content, 'utf8');
      
      // Wait for filesystem to settle
      const delay = Math.min(100 * attempt, 500);
      const start = Date.now();
      while (Date.now() - start < delay) {
        // Busy wait to ensure write completes
      }
      
      // Verify
      const written = fs.readFileSync(filePath, 'utf8');
      const fileSize = fs.statSync(filePath).size;
      
      if (written === content && fileSize > 0) {
        console.log(`✅ File verified on attempt ${attempt}`);
        return { success: true, attempt, size: fileSize };
      }
      
      console.warn(`⚠️ Verification failed on attempt ${attempt}, retrying...`);
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
    }
  }
  
  return { success: false, error: 'Max retries exceeded' };
}
```

---

## BEST PRACTICES FOR RELIABLE FILE WRITING

### 1. **Always Use Synchronous Operations**
```javascript
// ✅ GOOD - Synchronous, guaranteed to complete
fs.writeFileSync(filePath, content, 'utf8');

// ❌ BAD - Async, may not complete before process exit
fs.writeFile(filePath, content, (err) => { /* ... */ });
```

### 2. **Verify After Every Write**
```javascript
// Write
fs.writeFileSync(filePath, content);

// Verify immediately
const written = fs.readFileSync(filePath, 'utf8');
if (written !== content) {
  throw new Error('Write verification failed');
}
```

### 3. **Use Atomic Operations**
```javascript
// Write to temp file first
fs.writeFileSync(tempPath, content);

// Verify temp file
const verified = fs.readFileSync(tempPath, 'utf8');
if (verified === content) {
  // Atomic rename
  fs.renameSync(tempPath, filePath);
}
```

### 4. **Handle Large Files Carefully**
```javascript
// For files > 100KB, use streaming
const stream = fs.createWriteStream(filePath);
stream.write(content);
stream.end();

// Wait for completion
stream.on('finish', () => {
  console.log('Write complete');
});
```

### 5. **Never Trust Tool Success Messages**
```javascript
// ❌ DON'T DO THIS
const result = fsWrite({ path, text });
if (result.success) {
  // Assume file was written
}

// ✅ DO THIS
const result = fsWrite({ path, text });
if (result.success) {
  // Verify file actually exists and has content
  const stat = fs.statSync(path);
  if (stat.size === 0) {
    throw new Error('File write failed - 0 bytes');
  }
}
```

---

## IMMEDIATE FIXES FOR YOUR SITUATION

### Problem: `lib/admin/error-logger.js` created but 0 bytes

### Solution 1: Use Direct fsWrite (Recommended)
```javascript
// Instead of sub-agent, use main execution
fsWrite({
  path: 'lib/admin/error-logger.js',
  text: `// Your 300+ line content here`
});

// Then verify
const fs = require('fs');
const stat = fs.statSync('lib/admin/error-logger.js');
if (stat.size === 0) {
  console.error('❌ File write failed - file is empty');
  // Retry with chunked approach
}
```

### Solution 2: Split Into Multiple Files
```javascript
// Instead of one 300-line file, create multiple smaller files
fsWrite({ path: 'lib/admin/error-logger-part1.js', text: content1 });
fsWrite({ path: 'lib/admin/error-logger-part2.js', text: content2 });

// Then combine with require or import
```

### Solution 3: Use Shell Command
```javascript
const { execSync } = require('child_process');

const content = `// Your content`;
const cmd = `cat > lib/admin/error-logger.js << 'EOF'\n${content}\nEOF`;
execSync(cmd);

// Verify
const fs = require('fs');
const written = fs.readFileSync('lib/admin/error-logger.js', 'utf8');
console.log(`File size: ${written.length} bytes`);
```

---

## PREVENTION CHECKLIST

- [ ] Never use sub-agents for file operations
- [ ] Always verify file size after write (> 0 bytes)
- [ ] Use synchronous operations (writeFileSync)
- [ ] Verify content matches after write
- [ ] Use atomic rename for safety
- [ ] Split large files into chunks if needed
- [ ] Add retry logic with exponential backoff
- [ ] Log all file operations for debugging
- [ ] Test on Windows specifically (most problematic)
- [ ] Don't trust tool success messages - verify independently

---

## REFERENCES

1. **Claude Code Issue #4462**: Sub-agents claim success but files don't persist
2. **Claude Code Issue #14791**: 0-byte placeholder files from auto-updater
3. **Cursor Forum**: AI assistant creates empty files on Windows 11
4. **Microsoft Docs**: FlushFileBuffers and FILE_FLAG_WRITE_THROUGH
5. **Node.js fs module**: Buffering and sync vs async operations

---

## SUMMARY

**The Problem**: AI coding assistants create files but leave them empty (0 bytes)

**Root Cause**: 
- Sub-agent execution context isolation
- Async operations not properly awaited
- Windows file system buffering not flushed
- Tool reports success before data persists

**The Solution**:
1. Use main agent instance, not sub-agents
2. Use synchronous operations (writeFileSync)
3. Verify file size and content after write
4. Use atomic operations (temp file + rename)
5. Split large files into chunks
6. Never trust tool success messages

**Immediate Action**: Replace sub-agent file writes with direct fsWrite calls and add verification.
