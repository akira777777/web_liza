# LM Studio Configuration Guide for Blackbox AI

## Overview

This guide helps you configure LM Studio to work properly with Blackbox AI by ensuring adequate context length and proper server settings.

## The Error Explained

**Error Message:**

```
Please check the LM Studio developer logs to debug what went wrong.
You may need to load the model with a larger context length to work with blackbox's prompts.
```

**What it means:**

- Blackbox AI sends detailed prompts that include system instructions, file contents, project context, and conversation history
- These prompts can be very large (10K-50K+ tokens)
- If your LM Studio model has insufficient context length, it cannot process these prompts

## Step-by-Step Configuration

### 1. Choose the Right Model

Select a model with adequate context length:

#### Recommended Models (by context size):

**Small Context (4K-8K tokens)** - ❌ NOT RECOMMENDED for Blackbox

- Most 7B models with standard context
- Will fail with complex projects

**Medium Context (16K-32K tokens)** - ✅ MINIMUM RECOMMENDED

- Mistral 7B Instruct v0.2 (32K)
- Llama 2 13B Chat (16K extended)
- OpenHermes 2.5 Mistral 7B (32K)

**Large Context (64K-128K tokens)** - ✅ IDEAL for Blackbox

- Mistral 7B Instruct v0.3 (128K)
- Llama 3 8B Instruct (128K)
- Yi 34B Chat (200K)
- Qwen 14B Chat (128K)

**Extra Large Context (200K+ tokens)** - ✅ BEST for large projects

- Claude-style models with extended context
- Specialized long-context fine-tunes

### 2. Configure LM Studio Settings

#### A. Load Your Model

1. Open LM Studio
2. Go to the **"Models"** tab
3. Search for and download a model with adequate context (see recommendations above)
4. Click **"Load Model"**

#### B. Adjust Context Settings

1. After loading the model, click the **"⚙️ Settings"** icon
2. Find the **"Context Length"** or **"Max Context"** setting
3. Set it to the **maximum supported by your model**:

   ```
   For 32K models: Set to 32768
   For 64K models: Set to 65536
   For 128K models: Set to 131072
   ```

4. **Important GPU/RAM Settings:**
   - **GPU Layers**: Set based on your GPU VRAM
     - 8GB VRAM: 20-25 layers
     - 12GB VRAM: 30-35 layers
     - 16GB+ VRAM: All layers
   - **Context Length**: Higher context = more VRAM needed
   - If you get OOM (Out of Memory) errors, reduce context or GPU layers

#### C. Server Configuration

1. Go to the **"Local Server"** tab
2. Click **"Start Server"**
3. Note the server address (usually `http://localhost:1234`)
4. Ensure these settings:
   ```
   Port: 1234 (default)
   CORS: Enabled
   API Format: OpenAI Compatible
   ```

### 3. Configure Blackbox AI to Use LM Studio

#### Option A: Through Blackbox Settings

1. Open Blackbox AI settings
2. Navigate to **"Model Provider"** or **"LLM Settings"**
3. Select **"Custom OpenAI-Compatible API"** or **"LM Studio"**
4. Enter the connection details:
   ```
   Base URL: http://localhost:1234/v1
   API Key: lm-studio (or leave blank)
   Model: <your-loaded-model-name>
   ```

#### Option B: Create Configuration File

Create a file named `blackbox-lm-studio-config.json`:

```json
{
  "provider": "lm-studio",
  "baseURL": "http://localhost:1234/v1",
  "apiKey": "lm-studio",
  "model": "your-model-name",
  "contextLength": 32768,
  "temperature": 0.7,
  "maxTokens": 4096,
  "timeout": 120000
}
```

### 4. Verify the Setup

#### Test 1: Check Server Status

Open your browser and navigate to:

```
http://localhost:1234/v1/models
```

You should see a JSON response listing your loaded model.

#### Test 2: Simple API Test

Create a test file `test-lm-studio.js`:

```javascript
const fetch = require('node-fetch')

async function testLMStudio() {
  try {
    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'your-model-name',
        messages: [
          { role: 'user', content: 'Hello! Can you confirm you are working?' }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    })

    const data = await response.json()
    console.log('✅ LM Studio is working!')
    console.log('Response:', data.choices[0].message.content)
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testLMStudio()
```

Run it:

```bash
node test-lm-studio.js
```

#### Test 3: Check Context Length

In LM Studio's server logs, you should see:

```
Model loaded with context length: 32768
```

### 5. Troubleshooting

#### Problem: "Context length exceeded" error

**Solution:**

1. Load a model with larger context (64K or 128K)
2. Increase the context length setting in LM Studio
3. Reduce the amount of context Blackbox sends (if possible)

#### Problem: "Connection refused" or "Cannot connect to LM Studio"

**Solution:**

1. Ensure LM Studio server is running (green indicator in LM Studio)
2. Check the port number (default: 1234)
3. Verify firewall isn't blocking localhost connections
4. Try restarting LM Studio

#### Problem: "Out of memory" or crashes

**Solution:**

1. Reduce GPU layers in LM Studio settings
2. Use a smaller model (e.g., 7B instead of 13B)
3. Reduce context length (but keep above 16K for Blackbox)
4. Close other GPU-intensive applications
5. Consider using CPU-only mode (slower but more stable)

#### Problem: Very slow responses

**Solution:**

1. Increase GPU layers (if you have VRAM available)
2. Use a smaller model
3. Enable Flash Attention if available
4. Reduce context length slightly
5. Check CPU/GPU usage in Task Manager

#### Problem: Model gives poor quality responses

**Solution:**

1. Try a different model (some work better with Blackbox prompts)
2. Adjust temperature (0.7 is usually good)
3. Ensure you're using an instruction-tuned model (not base model)
4. Check if the model supports the context length you're using

### 6. Recommended Settings by Hardware

#### Low-End System (8GB RAM, No GPU or <6GB VRAM)

```
Model: Mistral 7B Instruct (Q4 quantization)
Context Length: 16384
GPU Layers: 0 (CPU only) or 10-15
Expected Speed: 2-5 tokens/sec
```

#### Mid-Range System (16GB RAM, 8-12GB VRAM)

```
Model: Mistral 7B Instruct v0.3 (Q5 quantization)
Context Length: 32768
GPU Layers: 25-30
Expected Speed: 15-30 tokens/sec
```

#### High-End System (32GB+ RAM, 16GB+ VRAM)

```
Model: Llama 3 8B Instruct or Yi 34B (Q5/Q6 quantization)
Context Length: 65536-131072
GPU Layers: All layers
Expected Speed: 30-60+ tokens/sec
```

### 7. Best Practices

1. **Always start LM Studio before using Blackbox AI**
2. **Keep LM Studio updated** to the latest version
3. **Monitor VRAM usage** - don't max it out
4. **Use quantized models** (Q4, Q5, Q6) for better performance
5. **Test with simple prompts first** before complex tasks
6. **Keep context length at least 16K** for Blackbox compatibility
7. **Save your configuration** for easy reuse

### 8. Alternative: Use Cloud Models

If LM Studio continues to have issues, consider using cloud-based models:

- **OpenAI GPT-4** - Best quality, paid
- **Anthropic Claude** - Excellent for coding, paid
- **Google Gemini** - Good free tier
- **Groq** - Fast inference, free tier available

Configure these in Blackbox AI settings instead of LM Studio.

## Quick Reference

### Minimum Requirements for Blackbox AI

- ✅ Context Length: 16K+ (32K+ recommended)
- ✅ Model Type: Instruction-tuned
- ✅ Server: OpenAI-compatible API
- ✅ Connection: http://localhost:1234/v1

### Recommended Models

1. Mistral 7B Instruct v0.3 (128K context)
2. Llama 3 8B Instruct (128K context)
3. OpenHermes 2.5 Mistral (32K context)
4. Yi 34B Chat (200K context)

### Common Issues Checklist

- [ ] Is LM Studio server running?
- [ ] Is context length ≥16K?
- [ ] Is the model instruction-tuned?
- [ ] Is the API endpoint correct?
- [ ] Do you have enough VRAM/RAM?
- [ ] Are there any firewall blocks?

## Support

If you continue to experience issues:

1. Check LM Studio logs: **View → Developer → Toggle Developer Tools**
2. Check Blackbox AI logs
3. Try a different model
4. Restart both LM Studio and Blackbox AI
5. Consider using cloud models as an alternative

## Additional Resources

- [LM Studio Documentation](https://lmstudio.ai/docs)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Blackbox AI Documentation](https://blackbox.ai/docs)
- [Hugging Face Model Hub](https://huggingface.co/models) - Find models with large context

---

**Last Updated:** 2025-01-XX
**Version:** 1.0
