# Enhancements for GPT-5 MCP Server

This directory contains optional enhancements that can be added to the base MCP server.

## Available Enhancements

### 1. Response Caching (`cache.ts`)

**Purpose**: Reduce API calls and improve response times by caching responses.

**Features**:
- SHA-256 based cache keys
- Configurable TTL (Time To Live)
- LRU eviction policy
- Cache statistics and hit rate tracking
- Automatic cleanup of expired entries

**Usage**:
```typescript
import { cache } from './enhancements/cache.js';

// Check cache before API call
const cached = cache.get({ tool: 'gpt5_code_complete', prompt: 'test' });
if (cached) {
  return cached;
}

// Store response in cache
cache.set({ tool: 'gpt5_code_complete', prompt: 'test' }, response);

// Get statistics
const stats = cache.getStats();
console.log(`Cache hit rate: ${stats.hitRate}%`);
```

**Configuration**:
```typescript
// In your main server file
const cache = new ResponseCache(
  100,  // maxSize: maximum number of cached entries
  60    // ttlMinutes: cache entry lifetime in minutes
);
```

---

### 2. Monitoring & Analytics (`monitoring.ts`)

**Purpose**: Track usage, performance, and errors for better insights.

**Features**:
- Request logging with timestamps
- Success/failure tracking
- Token usage and cost estimation
- Tool usage statistics
- Error categorization
- Performance metrics (response time, requests per minute)
- Export metrics to JSON

**Usage**:
```typescript
import { monitor } from './enhancements/monitoring.js';

// Log a request
const startTime = Date.now();
try {
  const response = await callAPI(...);
  monitor.logRequest({
    timestamp: Date.now(),
    tool: 'gpt5_code_complete',
    model: 'gpt-5.5',
    success: true,
    responseTime: Date.now() - startTime,
    tokensUsed: response.usage?.total_tokens,
  });
} catch (error) {
  monitor.logRequest({
    timestamp: Date.now(),
    tool: 'gpt5_code_complete',
    model: 'gpt-5.5',
    success: false,
    responseTime: Date.now() - startTime,
    error: error.message,
  });
}

// Get metrics
const metrics = monitor.getMetrics();
console.log(`Success rate: ${metrics.successRate}%`);
console.log(`Total cost: $${metrics.totalCost.toFixed(2)}`);

// Export to file
const fs = require('fs');
fs.writeFileSync('metrics.json', monitor.exportMetrics());
```

---

### 3. Additional Tools (`additional-tools.ts`)

**Purpose**: Extend the server with 5 new powerful tools.

**New Tools**:

#### 3.1 `gpt5_generate_tests`
Generate unit tests for code.

**Parameters**:
- `code` (required): Code to test
- `language`: Programming language
- `framework`: Testing framework (jest, pytest, junit, etc.)
- `coverage`: basic | comprehensive | edge-cases

**Example**:
```
@gpt5_generate_tests framework="jest" coverage="comprehensive"
function add(a, b) { return a + b; }
```

#### 3.2 `gpt5_optimize`
Optimize code for performance, memory, or readability.

**Parameters**:
- `code` (required): Code to optimize
- `language`: Programming language
- `optimization_target`: performance | memory | readability | all
- `constraints`: Any constraints

**Example**:
```
@gpt5_optimize optimization_target="performance" language="python"
[paste code]
```

#### 3.3 `gpt5_generate_docs`
Generate documentation for code.

**Parameters**:
- `code` (required): Code to document
- `language`: Programming language
- `style`: jsdoc | pydoc | javadoc | markdown
- `include_examples`: Include usage examples (default: true)

**Example**:
```
@gpt5_generate_docs style="jsdoc" language="javascript"
[paste code]
```

#### 3.4 `gpt5_convert_code`
Convert code from one language to another.

**Parameters**:
- `code` (required): Code to convert
- `from_language` (required): Source language
- `to_language` (required): Target language
- `preserve_comments`: Keep comments (default: true)

**Example**:
```
@gpt5_convert_code from_language="python" to_language="typescript"
[paste Python code]
```

#### 3.5 `gpt5_security_audit`
Perform security audit on code.

**Parameters**:
- `code` (required): Code to audit
- `language`: Programming language
- `focus`: all | injection | xss | auth | crypto | data-exposure

**Example**:
```
@gpt5_security_audit focus="injection" language="javascript"
[paste code]
```

---

## Integration Guide

### Step 1: Add to package.json

No additional dependencies needed! All enhancements use only Node.js built-ins and existing dependencies.

### Step 2: Import in main server

```typescript
// In src/index.ts
import { cache } from './enhancements/cache.js';
import { monitor } from './enhancements/monitoring.js';
import {
  ADDITIONAL_TOOLS,
  handleGenerateTests,
  handleOptimize,
  handleGenerateDocs,
  handleConvertCode,
  handleSecurityAudit,
} from './enhancements/additional-tools.js';
```

### Step 3: Add tools to server

```typescript
// Merge with existing TOOLS array
const TOOLS = [
  ...EXISTING_TOOLS,
  ...ADDITIONAL_TOOLS,
];
```

### Step 4: Add handlers

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();

  try {
    // Check cache first
    const cached = cache.get({ tool: name, ...args });
    if (cached) {
      return { content: [{ type: "text", text: cached }] };
    }

    let result;
    switch (name) {
      // Existing tools...
      case "gpt5_generate_tests":
        result = await handleGenerateTests(args, callGPT5API);
        break;
      case "gpt5_optimize":
        result = await handleOptimize(args, callGPT5API);
        break;
      case "gpt5_generate_docs":
        result = await handleGenerateDocs(args, callGPT5API);
        break;
      case "gpt5_convert_code":
        result = await handleConvertCode(args, callGPT5API);
        break;
      case "gpt5_security_audit":
        result = await handleSecurityAudit(args, callGPT5API);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // Cache the response
    cache.set({ tool: name, ...args }, result.content[0].text);

    // Log the request
    monitor.logRequest({
      timestamp: Date.now(),
      tool: name,
      model: args.model || 'gpt-5.5',
      success: true,
      responseTime: Date.now() - startTime,
    });

    return result;
  } catch (error: any) {
    // Log error
    monitor.logRequest({
      timestamp: Date.now(),
      tool: name,
      model: args.model || 'gpt-5.5',
      success: false,
      responseTime: Date.now() - startTime,
      error: error.message,
    });

    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});
```

### Step 5: Add monitoring endpoint (optional)

```typescript
// Add a special tool to view metrics
{
  name: "gpt5_metrics",
  description: "View server metrics and statistics",
  inputSchema: {
    type: "object",
    properties: {},
  },
}

// Handler
case "gpt5_metrics":
  const metrics = monitor.getMetrics();
  const cacheStats = cache.getStats();
  return {
    content: [{
      type: "text",
      text: `
Server Metrics:
- Uptime: ${metrics.uptime}s
- Total Requests: ${metrics.totalRequests}
- Success Rate: ${metrics.successRate.toFixed(2)}%
- Avg Response Time: ${metrics.averageResponseTime.toFixed(0)}ms
- Total Cost: $${metrics.totalCost.toFixed(2)}

Cache Stats:
- Size: ${cacheStats.size}/${cacheStats.maxSize}
- Hit Rate: ${cacheStats.hitRate.toFixed(2)}%

Tool Usage:
${monitor.getToolStats().map(t => `- ${t.tool}: ${t.count} (${t.percentage.toFixed(1)}%)`).join('\n')}
      `.trim()
    }]
  };
```

---

## Performance Impact

### Caching
- **Benefit**: 50-90% reduction in API calls for repeated queries
- **Cost**: ~1-5MB memory per 100 cached entries
- **Recommendation**: Enable for production use

### Monitoring
- **Benefit**: Valuable insights into usage patterns and costs
- **Cost**: ~100KB memory per 1000 requests logged
- **Recommendation**: Enable for production use

### Additional Tools
- **Benefit**: 5 new powerful capabilities
- **Cost**: Minimal (only loaded when used)
- **Recommendation**: Enable based on user needs

---

## Configuration Examples

### Conservative (Low Memory)
```typescript
const cache = new ResponseCache(50, 30);  // 50 entries, 30 min TTL
const monitor = new Monitor(500);          // Keep 500 logs
```

### Balanced (Recommended)
```typescript
const cache = new ResponseCache(100, 60); // 100 entries, 60 min TTL
const monitor = new Monitor(1000);         // Keep 1000 logs
```

### Aggressive (High Performance)
```typescript
const cache = new ResponseCache(500, 120); // 500 entries, 2 hour TTL
const monitor = new Monitor(5000);          // Keep 5000 logs
```

---

## Maintenance

### Cache Cleanup
Run periodic cleanup to remove expired entries:

```typescript
// Run every hour
setInterval(() => {
  const removed = cache.cleanup();
  console.log(`Cleaned up ${removed} expired cache entries`);
}, 60 * 60 * 1000);
```

### Export Metrics
Export metrics periodically for analysis:

```typescript
// Export daily
setInterval(() => {
  const timestamp = new Date().toISOString().split('T')[0];
  fs.writeFileSync(
    `metrics-${timestamp}.json`,
    monitor.exportMetrics()
  );
}, 24 * 60 * 60 * 1000);
```

---

## Troubleshooting

### Cache Not Working
- Check if cache key generation is consistent
- Verify TTL is not too short
- Check cache size limit

### High Memory Usage
- Reduce cache size
- Reduce monitor log retention
- Run cleanup more frequently

### Metrics Not Accurate
- Ensure all requests are logged
- Check for clock skew
- Verify token counting logic

---

## Future Enhancements

Planned features:
- [ ] Persistent cache (Redis/file-based)
- [ ] Distributed monitoring
- [ ] Real-time metrics dashboard
- [ ] Advanced analytics
- [ ] Rate limiting
- [ ] Request queuing

---

## Support

For issues or questions about enhancements:
1. Check this README
2. Review the source code comments
3. Test in isolation before integrating
4. Create an issue if problems persist

---

**Version**: 1.0.0
**Last Updated**: 2026-05-15
**Status**: Production Ready
