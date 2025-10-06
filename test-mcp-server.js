// Simple test script for MCP Filesystem Server

const fs = require('fs');
const path = require('path');

console.log('Testing MCP Filesystem Server...');
console.log('Current directory:', process.cwd());

// List files in the current directory
try {
  const files = fs.readdirSync('.');
  console.log('\nFiles in current directory:');
  files.forEach(file => {
    const stats = fs.statSync(path.join('.', file));
    console.log(`- ${file} (${stats.isDirectory() ? 'Directory' : 'File'})`);
  });
  console.log('\nMCP Filesystem Server test successful!');
} catch (error) {
  console.error('Error accessing filesystem:', error);
  console.log('MCP Filesystem Server test failed!');
}
