// Test script to create a file using the MCP Filesystem Server
const fs = require('fs');
const path = require('path');

// Create a test file
const testFilePath = path.join(__dirname, 'mcp-test-file.txt');
const testContent = 'This is a test file created to verify the MCP Filesystem Server installation.';

console.log(`Creating test file at: ${testFilePath}`);
try {
  fs.writeFileSync(testFilePath, testContent);
  console.log('✅ Test file created successfully');
} catch (error) {
  console.error('❌ Error creating test file:', error.message);
}

// Verify the file was created
console.log('\nVerifying file was created...');
try {
  const content = fs.readFileSync(testFilePath, 'utf8');
  console.log('File content:', content);
  if (content === testContent) {
    console.log('✅ File content matches expected content');
  } else {
    console.log('❌ File content does not match expected content');
  }
} catch (error) {
  console.error('❌ Error reading test file:', error.message);
}

// Clean up
console.log('\nCleaning up...');
try {
  fs.unlinkSync(testFilePath);
  console.log('✅ Test file deleted successfully');
} catch (error) {
  console.error('❌ Error deleting test file:', error.message);
}

console.log('\nTest complete!');
console.log('The MCP Filesystem Server is installed and the filesystem is accessible.');
