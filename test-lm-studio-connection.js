/**
 * LM Studio Connection Test Script
 * Tests the connection to LM Studio and verifies configuration
 */

const http = require('http');

// Configuration
const LM_STUDIO_BASE_URL = 'http://localhost:1234';
const TIMEOUT = 5000; // 5 seconds

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, LM_STUDIO_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: TIMEOUT
    };

    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', error => reject(error));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testServerConnection() {
  log('\n🔍 Testing LM Studio Server Connection...', 'cyan');
  log('━'.repeat(50), 'cyan');

  try {
    const response = await makeRequest('/v1/models');

    if (response.status === 200) {
      log('✅ Server is running and accessible', 'green');
      return true;
    } else {
      log(`⚠️  Server responded with status: ${response.status}`, 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Cannot connect to LM Studio server', 'red');
    log(`   Error: ${error.message}`, 'red');
    log('\n💡 Troubleshooting:', 'yellow');
    log('   1. Make sure LM Studio is running', 'yellow');
    log(
      '   2. Check that the server is started (green indicator in LM Studio)',
      'yellow'
    );
    log('   3. Verify the server is running on port 1234', 'yellow');
    log('   4. Check firewall settings', 'yellow');
    return false;
  }
}

async function checkLoadedModels() {
  log('\n📦 Checking Loaded Models...', 'cyan');
  log('━'.repeat(50), 'cyan');

  try {
    const response = await makeRequest('/v1/models');

    if (response.status === 200 && response.data.data) {
      const models = response.data.data;

      if (models.length === 0) {
        log('⚠️  No models are currently loaded', 'yellow');
        log('\n💡 Action Required:', 'yellow');
        log('   1. Open LM Studio', 'yellow');
        log('   2. Go to the "Models" tab', 'yellow');
        log('   3. Load a model with at least 16K context length', 'yellow');
        return null;
      }

      log(`✅ Found ${models.length} loaded model(s):`, 'green');
      models.forEach((model, index) => {
        log(`\n   Model ${index + 1}:`, 'blue');
        log(`   • ID: ${model.id}`, 'blue');
        if (model.context_length) {
          log(
            `   • Context Length: ${model.context_length.toLocaleString()} tokens`,
            'blue'
          );

          // Check if context length is sufficient
          if (model.context_length < 16384) {
            log(
              '   ⚠️  WARNING: Context length is too small for Blackbox AI!',
              'yellow'
            );
            log('   ⚠️  Minimum recommended: 16,384 tokens', 'yellow');
            log('   ⚠️  Ideal: 32,768+ tokens', 'yellow');
          } else if (model.context_length >= 32768) {
            log('   ✅ Context length is ideal for Blackbox AI', 'green');
          } else {
            log('   ✅ Context length meets minimum requirements', 'green');
          }
        }
      });

      return models[0]; // Return first model for testing
    } else {
      log('❌ Failed to retrieve model information', 'red');
      return null;
    }
  } catch (error) {
    log('❌ Error checking models', 'red');
    log(`   Error: ${error.message}`, 'red');
    return null;
  }
}

async function testModelInference(model) {
  if (!model) {
    log('\n⏭️  Skipping inference test (no model loaded)', 'yellow');
    return false;
  }

  log('\n🧪 Testing Model Inference...', 'cyan');
  log('━'.repeat(50), 'cyan');

  const testMessage = {
    model: model.id,
    messages: [
      {
        role: 'user',
        content:
          'Hello! Please respond with "LM Studio is working correctly" if you can read this.'
      }
    ],
    max_tokens: 50,
    temperature: 0.7
  };

  try {
    log('   Sending test message...', 'blue');
    const response = await makeRequest(
      '/v1/chat/completions',
      'POST',
      testMessage
    );

    if (response.status === 200 && response.data.choices) {
      const reply = response.data.choices[0].message.content;
      log('✅ Model inference is working!', 'green');
      log(`   Response: "${reply}"`, 'green');
      return true;
    } else {
      log('❌ Model inference failed', 'red');
      log(`   Status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log('❌ Error during inference test', 'red');
    log(`   Error: ${error.message}`, 'red');

    if (error.message.includes('timeout')) {
      log(
        '\n💡 The model might be too slow or the context is too large',
        'yellow'
      );
      log('   Try reducing the context length in LM Studio settings', 'yellow');
    }

    return false;
  }
}

async function testContextLength(model) {
  if (!model) {
    log('\n⏭️  Skipping context length test (no model loaded)', 'yellow');
    return false;
  }

  log('\n📏 Testing Context Length Handling...', 'cyan');
  log('━'.repeat(50), 'cyan');

  // Create a message with substantial context (simulating Blackbox prompts)
  const longContext = 'This is a test message. '.repeat(500); // ~2500 tokens

  const testMessage = {
    model: model.id,
    messages: [
      { role: 'system', content: longContext },
      {
        role: 'user',
        content:
          'Can you confirm you received the context? Just say "yes" or "no".'
      }
    ],
    max_tokens: 10,
    temperature: 0.7
  };

  try {
    log('   Sending message with ~2500 token context...', 'blue');
    const response = await makeRequest(
      '/v1/chat/completions',
      'POST',
      testMessage
    );

    if (response.status === 200) {
      log('✅ Model can handle moderate context length', 'green');
      log('   Note: Blackbox AI may send 10K-50K+ token contexts', 'blue');
      return true;
    } else {
      log('⚠️  Model struggled with moderate context', 'yellow');
      log('   This may cause issues with Blackbox AI', 'yellow');
      return false;
    }
  } catch (error) {
    log('❌ Context length test failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    log('\n💡 This suggests the context length is insufficient', 'yellow');
    log('   Increase context length in LM Studio settings', 'yellow');
    return false;
  }
}

function printConfiguration(model) {
  log('\n⚙️  Recommended Configuration for Blackbox AI', 'cyan');
  log('━'.repeat(50), 'cyan');

  if (model) {
    log('\nCurrent Setup:', 'blue');
    log(`  Model: ${model.id}`, 'blue');
    if (model.context_length) {
      log(
        `  Context Length: ${model.context_length.toLocaleString()} tokens`,
        'blue'
      );
    }
  }

  log('\nBlackbox AI Configuration:', 'blue');
  log('  {', 'blue');
  log('    "provider": "lm-studio",', 'blue');
  log('    "baseURL": "http://localhost:1234/v1",', 'blue');
  log('    "apiKey": "lm-studio",', 'blue');
  log(`    "model": "${model ? model.id : 'your-model-name'}",`, 'blue');
  log('    "contextLength": 32768,', 'blue');
  log('    "temperature": 0.7,', 'blue');
  log('    "maxTokens": 4096', 'blue');
  log('  }', 'blue');

  log(
    '\n📝 Configuration file created: blackbox-lm-studio-config.json',
    'green'
  );
  log('📖 Full guide available: lm-studio-setup-guide.md', 'green');
}

function printSummary(results) {
  log(`\n${'═'.repeat(50)}`, 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('═'.repeat(50), 'cyan');

  const tests = [
    { name: 'Server Connection', passed: results.connection },
    { name: 'Model Loaded', passed: results.modelLoaded },
    { name: 'Model Inference', passed: results.inference },
    { name: 'Context Handling', passed: results.context }
  ];

  tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌';
    const color = test.passed ? 'green' : 'red';
    log(`${icon} ${test.name}`, color);
  });

  const allPassed = tests.every(t => t.passed);

  log(`\n${'═'.repeat(50)}`, 'cyan');

  if (allPassed) {
    log('🎉 All tests passed! LM Studio is ready for Blackbox AI', 'green');
    log('\n✅ Next Steps:', 'green');
    log('   1. Configure Blackbox AI with the settings shown above', 'green');
    log(
      '   2. Start using Blackbox AI with your local LM Studio model',
      'green'
    );
  } else {
    log('⚠️  Some tests failed. Please review the issues above.', 'yellow');
    log(
      '\n📖 For detailed troubleshooting, see: lm-studio-setup-guide.md',
      'yellow'
    );
  }

  log(`${'═'.repeat(50)}\n`, 'cyan');
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════╗', 'cyan');
  log('║     LM Studio Connection Test for Blackbox AI    ║', 'cyan');
  log('╚═══════════════════════════════════════════════════╝', 'cyan');

  const results = {
    connection: false,
    modelLoaded: false,
    inference: false,
    context: false
  };

  // Test 1: Server Connection
  results.connection = await testServerConnection();

  if (!results.connection) {
    printSummary(results);
    process.exit(1);
  }

  // Test 2: Check Loaded Models
  const model = await checkLoadedModels();
  results.modelLoaded = model !== null;

  if (!results.modelLoaded) {
    printSummary(results);
    process.exit(1);
  }

  // Test 3: Model Inference
  results.inference = await testModelInference(model);

  // Test 4: Context Length
  results.context = await testContextLength(model);

  // Print Configuration
  printConfiguration(model);

  // Print Summary
  printSummary(results);

  process.exit(
    results.connection && results.modelLoaded && results.inference ? 0 : 1
  );
}

// Run the tests
main().catch(error => {
  log('\n❌ Unexpected error occurred:', 'red');
  log(error.stack, 'red');
  process.exit(1);
});
