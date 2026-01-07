// LLM Adapter Pattern - Vendor-agnostic interface
// Prevents vendor lock-in, allows switching between Claude/GPT/Local models

import { guardedClient } from './guarded-client.js';

/**
 * Abstract LLM Provider interface
 */
export class LLMProvider {
  constructor(config) {
    this.config = config;
    this.name = 'base';
  }

  async generateText(prompt, options = {}) {
    throw new Error('generateText must be implemented by provider');
  }

  async generateJSON(prompt, options = {}) {
    throw new Error('generateJSON must be implemented by provider');
  }

  estimateCost(inputTokens, outputTokens) {
    throw new Error('estimateCost must be implemented by provider');
  }
}

/**
 * Claude (Anthropic) Provider
 */
export class ClaudeProvider extends LLMProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'claude';
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.model = config.model || 'claude-sonnet-4-20250514';
    this.baseURL = 'https://api.anthropic.com/v1/messages';
  }

  async generateText(prompt, options = {}) {
    const apiCall = async (opts) => {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: opts.maxTokens || 3000,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    };

    return guardedClient.execute(apiCall, options);
  }

  async generateJSON(prompt, options = {}) {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON only. No markdown, no explanation.`;
    const result = await this.generateText(jsonPrompt, options);
    
    if (result.success) {
      try {
        result.data = JSON.parse(result.data);
      } catch (e) {
        result.success = false;
        result.error = 'Invalid JSON response';
      }
    }

    return result;
  }

  estimateCost(inputTokens, outputTokens) {
    // Claude Sonnet 4 pricing (approximate)
    const inputCost = inputTokens * 0.000003; // $3 per 1M tokens
    const outputCost = outputTokens * 0.000015; // $15 per 1M tokens
    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      currency: 'USD'
    };
  }
}

/**
 * OpenAI (GPT) Provider
 */
export class OpenAIProvider extends LLMProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'openai';
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.model = config.model || 'gpt-4-turbo-preview';
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }

  async generateText(prompt, options = {}) {
    const apiCall = async (opts) => {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: opts.maxTokens || 3000,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    };

    return guardedClient.execute(apiCall, options);
  }

  async generateJSON(prompt, options = {}) {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON only.`;
    const result = await this.generateText(jsonPrompt, options);
    
    if (result.success) {
      try {
        result.data = JSON.parse(result.data);
      } catch (e) {
        result.success = false;
        result.error = 'Invalid JSON response';
      }
    }

    return result;
  }

  estimateCost(inputTokens, outputTokens) {
    // GPT-4 Turbo pricing
    const inputCost = inputTokens * 0.00001; // $10 per 1M tokens
    const outputCost = outputTokens * 0.00003; // $30 per 1M tokens
    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      currency: 'USD'
    };
  }
}

/**
 * Groq Provider (Fast LLM)
 */
export class GroqProvider extends LLMProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'groq';
    this.apiKey = config.apiKey || process.env.GROQ_API_KEY;
    this.model = config.model || process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    this.baseURL = 'https://api.groq.com/openai/v1/chat/completions';
  }

  async generateText(prompt, options = {}) {
    const apiCall = async (opts) => {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: opts.maxTokens || 3000,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    };

    return guardedClient.execute(apiCall, options);
  }

  async generateJSON(prompt, options = {}) {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON only. No markdown, no explanation.`;
    const result = await this.generateText(jsonPrompt, options);
    
    if (result.success) {
      try {
        result.data = JSON.parse(result.data);
      } catch (e) {
        result.success = false;
        result.error = 'Invalid JSON response';
      }
    }

    return result;
  }

  estimateCost(inputTokens, outputTokens) {
    // Groq is currently free for most models
    return {
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
      currency: 'USD'
    };
  }
}

/**
 * KIMI Provider (Moonshot AI)
 */
export class KIMIProvider extends LLMProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'kimi';
    this.apiKey = config.apiKey || process.env.KIMI_API_KEY;
    this.model = config.model || process.env.KIMI_MODEL || 'kimi-latest';
    this.baseURL = config.baseURL || process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1/chat/completions';
  }

  async generateText(prompt, options = {}) {
    const apiCall = async (opts) => {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: opts.maxTokens || 3000,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`KIMI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    };

    return guardedClient.execute(apiCall, options);
  }

  async generateJSON(prompt, options = {}) {
    const jsonPrompt = `${prompt}\n\nRespond with valid JSON only. No markdown, no explanation.`;
    const result = await this.generateText(jsonPrompt, options);
    
    if (result.success) {
      try {
        result.data = JSON.parse(result.data);
      } catch (e) {
        result.success = false;
        result.error = 'Invalid JSON response';
      }
    }

    return result;
  }

  estimateCost(inputTokens, outputTokens) {
    // KIMI pricing (Moonshot AI - competitive pricing)
    const inputCost = inputTokens * 0.000001; // $1 per 1M tokens (estimated)
    const outputCost = outputTokens * 0.000003; // $3 per 1M tokens (estimated)
    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      currency: 'USD'
    };
  }
}

/**
 * Mock Provider (for testing/development)
 */
export class MockProvider extends LLMProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'mock';
    this.delay = config.delay || 100;
  }

  async generateText(prompt, options = {}) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    return {
      success: true,
      data: `Mock response to: ${prompt.substring(0, 50)}...`,
      metadata: {
        requestId: 'mock_' + Date.now(),
        duration: this.delay,
        tokensUsed: 100,
        cost: 0
      }
    };
  }

  async generateJSON(prompt, options = {}) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    return {
      success: true,
      data: { mock: true, prompt: prompt.substring(0, 50) },
      metadata: {
        requestId: 'mock_' + Date.now(),
        duration: this.delay,
        tokensUsed: 100,
        cost: 0
      }
    };
  }

  estimateCost(inputTokens, outputTokens) {
    return { inputCost: 0, outputCost: 0, totalCost: 0, currency: 'USD' };
  }
}

/**
 * LLM Adapter - Factory for creating providers
 */
export class LLMAdapter {
  static providers = {
    claude: ClaudeProvider,
    openai: OpenAIProvider,
    groq: GroqProvider,
    kimi: KIMIProvider,
    mock: MockProvider
  };

  /**
   * Create provider instance
   * @param {string} providerName - 'claude', 'openai', or 'mock'
   * @param {Object} config - Provider configuration
   */
  static createProvider(providerName, config = {}) {
    // Trim whitespace and convert to lowercase
    const cleanName = (providerName || '').trim().toLowerCase();
    const ProviderClass = this.providers[cleanName];
    
    if (!ProviderClass) {
      console.error(`Unknown provider: "${cleanName}". Available: ${Object.keys(this.providers).join(', ')}`);
      // Fallback to mock provider in production to avoid breaking the app
      return new MockProvider(config);
    }

    return new ProviderClass(config);
  }

  /**
   * Get default provider from environment
   */
  static getDefaultProvider() {
    const providerName = (process.env.LLM_PROVIDER || 'claude').trim().toLowerCase();
    return this.createProvider(providerName);
  }

  /**
   * Register custom provider
   */
  static registerProvider(name, ProviderClass) {
    this.providers[name] = ProviderClass;
  }
}

// Lazy-load default provider to avoid build-time initialization
let _defaultProvider = null;
export function getDefaultLLMProvider() {
  if (!_defaultProvider) {
    _defaultProvider = LLMAdapter.getDefaultProvider();
  }
  return _defaultProvider;
}

// Export for backward compatibility (but don't initialize at module load)
export const llmProvider = {
  get instance() {
    return getDefaultLLMProvider();
  }
};
