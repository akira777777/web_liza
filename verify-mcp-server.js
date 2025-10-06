// Simple script to verify MCP Filesystem Server functionality
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('Verifying MCP Filesystem Server installation...');

// Dynamically resolve npm global path
function getNpmGlobalPath() {
  const isWindows = os.platform() === 'win32';
  return process.env.APPDATA
    ? path.join(process.env.APPDATA, 'npm')
    : path.join(
        os.homedir(),
        isWindows ? 'AppData/Roaming/npm' : '.npm-global/bin'
      );
}

// Check if the executable files exist
const npmBinPath = getNpmGlobalPath();
console.log(`Checking npm global path: ${npmBinPath}`);

const executablePaths = [
  path.join(npmBinPath, 'mcp-server-filesystem'),
  path.join(npmBinPath, 'mcp-server-filesystem.cmd'),
  path.join(npmBinPath, 'mcp-server-filesystem.ps1')
];

console.log('Checking executable files:');
executablePaths.forEach(filePath => {
  try {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${filePath} exists (${stats.size} bytes)`);
  } catch (error) {
    console.log(`❌ ${filePath} does not exist or is not accessible`);
  }
});

// Check if the package is installed globally
console.log('\nChecking npm global installation:');
const { execSync } = require('child_process');
try {
  const npmOutput = execSync('npm list -g --depth=0').toString();
  console.log('Global npm packages:');
  console.log(npmOutput);

  // Check for both possible package names
  if (
    npmOutput.includes('@modelcontextprotocol/server-filesystem') ||
    npmOutput.includes('mcp-server-filesystem')
  ) {
    console.log('✅ MCP Filesystem Server is installed globally');
  } else {
    console.log('❌ MCP Filesystem Server is not installed globally');
    console.log(
      '   Install with: npm install -g @modelcontextprotocol/server-filesystem'
    );
  }
} catch (error) {
  console.log('❌ Error checking npm global packages:', error.message);
}

// Check if the server process is running
console.log('\nChecking if server process is running:');
try {
  const psOutput = execSync('tasklist | findstr node').toString();
  console.log('Node processes:');
  console.log(psOutput);

  if (psOutput.includes('node.exe')) {
    console.log(
      '✅ Node.js processes are running (one of them might be the MCP Filesystem Server)'
    );
  } else {
    console.log('❌ No Node.js processes found');
  }
} catch (error) {
  console.log('❌ Error checking running processes:', error.message);
}

console.log('\nVerification complete!');
