/**
 * Response Caching Layer for GPT-5 MCP Server
 * 
 * This module provides caching functionality to reduce API calls
 * and improve response times for repeated queries.
 */

import crypto from 'crypto';

interface CacheEntry {
  response: string;
  timestamp: number;
  hits: number;
}

export class ResponseCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 100, ttlMinutes: number = 60) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
  }

  /**
   * Generate cache key from request parameters
   */
  private generateKey(params: {
    tool: string;
    prompt?: string;
    code?: string;
    model?: string;
  }): string {
    const data = JSON.stringify(params);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get cached response if available and not expired
   */
  get(params: any): string | null {
    const key = this.generateKey(params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;
    return entry.response;
  }

  /**
   * Store response in cache
   */
  set(params: any, response: string): void {
    const key = this.generateKey(params);

    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{ key: string; hits: number; age: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key: key.substring(0, 8),
      hits: entry.hits,
      age: Math.floor((Date.now() - entry.timestamp) / 1000),
    }));

    const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);
    const hitRate = entries.length > 0 ? totalHits / entries.length : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      entries,
    };
  }

  /**
   * Remove expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

// Export singleton instance
export const cache = new ResponseCache();
