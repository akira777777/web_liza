// Test script to send a JSON-RPC request to the MCP Filesystem Server
const { spawn } = require('child_process');
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

// Start a new MCP Filesystem Server process
const serverPath = getMcpServerPath();
console.log(`Starting MCP Filesystem Server from: ${serverPath}`);
const server = spawn(serverPath, ['.'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Handle server output
server.stdout.on('data', data => {
  try {
    const response = JSON.parse(data.toString().trim());
    console.log('\nServer response:');
    console.log(JSON.stringify(response, null, 2));

    // If we got a successful response, exit
    if (response.result) {
      console.log('\n✅ MCP Filesystem Server is working correctly!');
      server.kill();
      process.exit(0);
    }
  } catch (error) {
    console.log('Server output:', data.toString());
  }
});

server.stderr.on('data', data => {
  console.error('Server error:', data.toString());
});

// Wait for server to start
setTimeout(() => {
  console.log('Sending list files request...');

  // Send a request to list files in the current directory
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'fs/list',
    params: { path: '.' }
  };

  server.stdin.write(`${JSON.stringify(request)}\n`);
}, 1000);

// Set a timeout to exit if we don't get a response
setTimeout(() => {
  console.log('\n❌ Timeout waiting for server response');
  server.kill();
  process.exit(1);
}, 5000);
