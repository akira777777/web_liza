// Simple MCP client test script
const { spawn } = require('child_process');
const readline = require('readline');
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

// Start the MCP Filesystem Server
const serverPath = getMcpServerPath();
console.log(`Using MCP server at: ${serverPath}`);

const server = spawn(serverPath, ['.'], {
  stdio: ['pipe', 'pipe', process.stderr]
});

// Create interface to read from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Set up response handler
server.stdout.on('data', data => {
  try {
    const response = JSON.parse(data.toString().trim());
    console.log('Server response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.log('Raw server output:', data.toString());
  }
});

// Function to send a request to the server
function sendRequest(method, params) {
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  };

  const requestStr = `${JSON.stringify(request)}\n`;
  server.stdin.write(requestStr);
  console.log(`Sent request: ${method}`);
}

// Menu of available commands
function showMenu() {
  console.log('\nAvailable commands:');
  console.log('1. List files in current directory');
  console.log('2. Get info about package.json');
  console.log('3. Read first 100 bytes of package.json');
  console.log('4. Exit');

  rl.question('Enter command number: ', answer => {
    switch (answer.trim()) {
      case '1':
        sendRequest('fs/list', { path: '.' });
        setTimeout(showMenu, 1000);
        break;
      case '2':
        sendRequest('fs/stat', { path: 'package.json' });
        setTimeout(showMenu, 1000);
        break;
      case '3':
        sendRequest('fs/readFile', { path: 'package.json' });
        setTimeout(showMenu, 1000);
        break;
      case '4':
        console.log('Exiting...');
        server.kill();
        rl.close();
        process.exit(0);
      default:
        console.log('Invalid command');
        showMenu();
        break;
    }
  });
}

console.log('MCP Filesystem Server Client Test');
console.log('--------------------------------');
console.log('Server started with current directory as allowed path');

// Wait for server to initialize
setTimeout(showMenu, 1000);

// Handle cleanup
process.on('SIGINT', () => {
  console.log('Terminating server...');
  server.kill();
  rl.close();
  process.exit(0);
});
