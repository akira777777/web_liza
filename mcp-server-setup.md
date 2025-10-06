# MCP Filesystem Server Setup Guide

## Overview

The MCP (Model Context Protocol) Filesystem Server provides a secure way to access the filesystem from MCP-enabled applications. This guide will help you set up and manage the server.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation Steps

1. Install the MCP Filesystem Server globally:

```bash
npm install -g @modelcontextprotocol/server-filesystem
```

If you encounter permission issues, you may need to use the `--force` flag:

```bash
npm install -g @modelcontextprotocol/server-filesystem --force
```

**Note:** The package name is `@modelcontextprotocol/server-filesystem`, but the executable is `mcp-server-filesystem`.

## Usage

### Starting the Server

To start the MCP Filesystem Server, use the provided batch script:

```bash
.\start-mcp-server.bat
```

This will start the server with the current directory as the allowed directory.

Alternatively, you can run the server directly:

```bash
mcp-server-filesystem <allowed-directory> [additional-directories...]
```

Where:

- `<allowed-directory>` is the main directory that the server will have access to
- `[additional-directories...]` are optional additional directories to allow access to

### Stopping the Server

To stop the MCP Filesystem Server, use the provided batch script:

```bash
.\stop-mcp-server.bat
```

This script will:
1. Attempt to stop the MCP Filesystem Server executable
2. If not found, check for and stop Node.js processes running the server
3. Provide clear feedback on the operation status

## Testing the Installation

After installation, you can verify the setup using the provided test scripts:

### 1. Verify Installation
```bash
node verify-mcp-server.js
```
This script checks:
- If the MCP server executable exists
- If the package is installed globally
- If any server processes are running

### 2. Simple Test
```bash
node simple-mcp-test.js
```
Runs a basic test to ensure the server can start.

### 3. Request Test
```bash
node test-mcp-request.js
```
Sends a JSON-RPC request to test server functionality.

### 4. Interactive Client Test
```bash
node mcp-client-test.js
```
Provides an interactive menu to test various server operations.

## Troubleshooting

### Common Issues

1. **Permission Errors**: If you encounter permission errors during installation, try running the command with administrator privileges or using the `--force` flag.

2. **Port Already in Use**: If the server fails to start because the port is already in use, you may have another instance of the server running. Use the stop script to terminate all instances.

3. **Access Denied**: If the server cannot access certain directories, make sure you have the necessary permissions and that the directories are included in the allowed directories list.

4. **Executable Not Found**: If the scripts cannot find the MCP server executable, ensure:
   - The package is installed globally: `npm list -g --depth=0`
   - Your npm global path is in your system PATH
   - On Windows, the path should be: `%APPDATA%\npm`
   - On Linux/Mac, the path should be: `~/.npm-global/bin` or `/usr/local/bin`

## Security Considerations

- The MCP Filesystem Server only allows access to the specified directories. Make sure to only include directories that you want to expose.
- Consider running the server with the minimum necessary permissions.
- Regularly update the server to get the latest security patches.

## Performance Optimization

- Limit the number of allowed directories to improve performance.
- Avoid allowing access to directories with a large number of files.
- Consider using a process manager like PM2 for production deployments.

## Integration with Other Tools

The MCP Filesystem Server can be integrated with various tools and frameworks:

- **Visual Studio Code**: Use the MCP extension to connect to the server.
- **Node.js Applications**: Use the MCP client library to connect to the server.
- **Python Applications**: Use the MCP Python client to connect to the server.

## Script Improvements

All test scripts have been updated to:
- **Dynamically resolve paths**: No more hardcoded user-specific paths
- **Cross-platform support**: Works on Windows, Linux, and macOS
- **Better error handling**: Clearer error messages and status reporting
- **Consistent formatting**: All scripts follow the same code style

## Additional Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [MCP Filesystem Server GitHub Repository](https://github.com/modelcontextprotocol/servers)
- [Node.js Documentation](https://nodejs.org/en/docs/)

## Changelog

### Version 2.0 (Current)
- Fixed hardcoded paths in all test scripts
- Added dynamic path resolution for cross-platform compatibility
- Improved stop-mcp-server.bat with better status reporting
- Updated package name references to correct `@modelcontextprotocol/server-filesystem`
- Added comprehensive testing section
- Enhanced error handling across all scripts
