// Simple MCP test script
const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

// Dynamically resolve the MCP server executable path
function getMcpServerPath() {
  const isWindows = os.platform() === 'win32';
  const npmGlobalPath = process.env.APPDATA
    ? path.join(process.env.APPDATA, 'npm')
    : path.join(
        os.homedir(),
        isWindows ? 'AppData/Roaming/npm' : '.npm-global/bin'
      );

  const executable = isWindows
    ? 'mcp-server-filesystem.cmd'
    : 'mcp-server-filesystem';
  return path.join(npmGlobalPath, executable);
}

console.log('Testing MCP Filesystem Server...');

// Test running the server with a simple command
try {
  const serverPath = getMcpServerPath();
  console.log(`Running MCP Filesystem Server from: ${serverPath}`);
  const output = execSync(`"${serverPath}" . --test`, {
    timeout: 5000,
    stdio: 'pipe'
  }).toString();

  console.log('Output:', output);
  console.log('✅ Server started successfully');
} catch (error) {
  console.log('❌ Error running server:', error.message);
  if (error.stdout) {
    console.log('stdout:', error.stdout.toString());
  }
  if (error.stderr) {
    console.log('stderr:', error.stderr.toString());
  }
}

console.log('\nTest complete!');
