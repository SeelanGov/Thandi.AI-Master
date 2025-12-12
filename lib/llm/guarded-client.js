// Guarded LLM Client - Timeout + Token Cap protection
// Required for demo reliability and cost control

export class GuardedClient {
  constructor(config = {}) {
    this.timeout = config.timeout || 5000; // 5 seconds default
    this.maxTokens = config.maxTokens || 3000; // Token cap per request
    this.maxRetries = config.maxRetries || 1; // Single retry on timeout
    this.costPerToken = config.costPerToken || 0.000015; // Claude Sonnet pricing
  }

  /**
   * Execute LLM call with timeout and token protection
   * @param {Function} apiCall - The actual API call function
   * @param {Object} options - Call options
   * @returns {Promise} - API response or timeout error
   */
  async execute(apiCall, options = {}) {
    const startTime = Date.now();
    const requestId = this._generateRequestId();

    // Enforce token cap
    const cappedTokens = Math.min(
      options.maxTokens || this.maxTokens,
      this.maxTokens
    );

    console.log(`[GUARDED] Request ${requestId}: max_tokens=${cappedTokens}, timeout=${this.timeout}ms`);

    try {
      // Wrap API call with timeout
      const result = await this._withTimeout(
        apiCall({ ...options, maxTokens: cappedTokens }),
        this.timeout,
        requestId
      );

      const duration = Date.now() - startTime;
      const tokensUsed = this._estimateTokens(result);
      const cost = tokensUsed * this.costPerToken;

      console.log(`[GUARDED] Request ${requestId}: success in ${duration}ms, ~${tokensUsed} tokens, ~R${cost.toFixed(2)}`);

      return {
        success: true,
        data: result,
        metadata: {
          requestId,
          duration,
          tokensUsed,
          cost,
          timedOut: false
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      if (error.name === 'TimeoutError') {
        console.error(`[GUARDED] Request ${requestId}: TIMEOUT after ${duration}ms`);

        // Retry once on timeout
        if (this.maxRetries > 0 && !options._isRetry) {
          console.log(`[GUARDED] Request ${requestId}: Retrying...`);
          return this.execute(apiCall, { ...options, _isRetry: true });
        }

        return {
          success: false,
          error: 'Request timed out',
          fallback: this._getFallbackResponse(options),
          metadata: {
            requestId,
            duration,
            timedOut: true
          }
        };
      }

      // Other errors
      console.error(`[GUARDED] Request ${requestId}: ERROR`, error.message);
      return {
        success: false,
        error: error.message,
        fallback: this._getFallbackResponse(options),
        metadata: {
          requestId,
          duration,
          timedOut: false
        }
      };
    }
  }

  /**
   * Wrap promise with timeout
   */
  async _withTimeout(promise, timeoutMs, requestId) {
    let timeoutHandle;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => {
        const error = new Error(`Request ${requestId} timed out after ${timeoutMs}ms`);
        error.name = 'TimeoutError';
        reject(error);
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutHandle);
      return result;
    } catch (error) {
      clearTimeout(timeoutHandle);
      throw error;
    }
  }

  /**
   * Estimate tokens used (rough approximation)
   */
  _estimateTokens(result) {
    if (!result) return 0;

    // Rough estimate: 1 token ≈ 4 characters
    const text = typeof result === 'string' 
      ? result 
      : JSON.stringify(result);
    
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate unique request ID
   */
  _generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get fallback response when API fails
   */
  _getFallbackResponse(options) {
    if (options.fallback) {
      return options.fallback;
    }

    // Default fallback
    return {
      message: 'We are experiencing high demand. Your report has been generated using our standard recommendations. For a personalized report, please try again in a few minutes.',
      useStandardReport: true
    };
  }

  /**
   * Batch multiple requests with rate limiting
   */
  async executeBatch(apiCalls, options = {}) {
    const batchSize = options.batchSize || 3;
    const delayBetweenBatches = options.delay || 1000;

    const results = [];
    
    for (let i = 0; i < apiCalls.length; i += batchSize) {
      const batch = apiCalls.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(call => this.execute(call, options))
      );

      results.push(...batchResults);

      // Delay between batches
      if (i + batchSize < apiCalls.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    return results;
  }

  /**
   * Get cost estimate before making call
   */
  estimateCost(inputTokens, outputTokens) {
    const totalTokens = inputTokens + outputTokens;
    return {
      tokens: totalTokens,
      cost: totalTokens * this.costPerToken,
      currency: 'ZAR'
    };
  }
}

// Export singleton with production settings
export const guardedClient = new GuardedClient({
  timeout: 5000, // 5 seconds for demo reliability
  maxTokens: 3000, // Cap at 3K tokens
  maxRetries: 1,
  costPerToken: 0.000015 // Claude Sonnet 4 pricing
});
