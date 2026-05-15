/**
 * Monitoring and Analytics Module for GPT-5 MCP Server
 * 
 * Tracks usage, performance, and errors for better insights
 */

interface UsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensUsed: number;
  totalCost: number;
  averageResponseTime: number;
  requestsByTool: Map<string, number>;
  errorsByType: Map<string, number>;
}

interface RequestLog {
  timestamp: number;
  tool: string;
  model: string;
  success: boolean;
  responseTime: number;
  tokensUsed?: number;
  error?: string;
}

export class Monitor {
  private metrics: UsageMetrics;
  private requestLogs: RequestLog[];
  private maxLogs: number;
  private startTime: number;

  constructor(maxLogs: number = 1000) {
    this.maxLogs = maxLogs;
    this.startTime = Date.now();
    this.requestLogs = [];
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      averageResponseTime: 0,
      requestsByTool: new Map(),
      errorsByType: new Map(),
    };
  }

  /**
   * Log a request
   */
  logRequest(log: RequestLog): void {
    this.requestLogs.push(log);

    // Keep only recent logs
    if (this.requestLogs.length > this.maxLogs) {
      this.requestLogs.shift();
    }

    // Update metrics
    this.metrics.totalRequests++;
    
    if (log.success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
      if (log.error) {
        const count = this.metrics.errorsByType.get(log.error) || 0;
        this.metrics.errorsByType.set(log.error, count + 1);
      }
    }

    // Update tool usage
    const toolCount = this.metrics.requestsByTool.get(log.tool) || 0;
    this.metrics.requestsByTool.set(log.tool, toolCount + 1);

    // Update tokens and cost
    if (log.tokensUsed) {
      this.metrics.totalTokensUsed += log.tokensUsed;
      // Estimate cost (adjust based on your pricing)
      this.metrics.totalCost += this.estimateCost(log.model, log.tokensUsed);
    }

    // Update average response time
    const totalTime = this.requestLogs.reduce((sum, r) => sum + r.responseTime, 0);
    this.metrics.averageResponseTime = totalTime / this.requestLogs.length;
  }

  /**
   * Estimate cost based on model and tokens
   */
  private estimateCost(model: string, tokens: number): number {
    // Pricing per 1K tokens (adjust based on actual pricing)
    const pricing: Record<string, number> = {
      'gpt-5.5': 0.03,
      'gpt-5.4': 0.02,
      'gpt-5.4-mini': 0.01,
      'gpt-4': 0.03,
    };

    const pricePerToken = (pricing[model] || 0.02) / 1000;
    return tokens * pricePerToken;
  }

  /**
   * Get current metrics
   */
  getMetrics(): UsageMetrics & {
    uptime: number;
    successRate: number;
    requestsPerMinute: number;
  } {
    const uptime = Date.now() - this.startTime;
    const successRate = this.metrics.totalRequests > 0
      ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100
      : 0;
    const requestsPerMinute = (this.metrics.totalRequests / (uptime / 60000));

    return {
      ...this.metrics,
      uptime: Math.floor(uptime / 1000),
      successRate,
      requestsPerMinute,
    };
  }

  /**
   * Get recent logs
   */
  getRecentLogs(count: number = 10): RequestLog[] {
    return this.requestLogs.slice(-count);
  }

  /**
   * Get tool usage statistics
   */
  getToolStats(): Array<{ tool: string; count: number; percentage: number }> {
    const total = this.metrics.totalRequests;
    return Array.from(this.metrics.requestsByTool.entries())
      .map(([tool, count]) => ({
        tool,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Array<{ error: string; count: number }> {
    return Array.from(this.metrics.errorsByType.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.getMetrics(),
      toolStats: this.getToolStats(),
      errorStats: this.getErrorStats(),
      recentLogs: this.getRecentLogs(20),
    }, null, 2);
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.startTime = Date.now();
    this.requestLogs = [];
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      averageResponseTime: 0,
      requestsByTool: new Map(),
      errorsByType: new Map(),
    };
  }
}

// Export singleton instance
export const monitor = new Monitor();
