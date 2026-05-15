#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Configuration from environment
const GPT5_API_URL = process.env.GPT5_API_URL || "https://api.openai.com/v1";
const GPT5_API_KEY = process.env.GPT5_API_KEY;

if (!GPT5_API_KEY) {
  console.error("Error: GPT5_API_KEY environment variable is required");
  process.exit(1);
}

// Create MCP server
const server = new Server(
  {
    name: "gpt5-coding-assistant",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const TOOLS = [
  {
    name: "gpt5_code_complete",
    description: "Complete code using GPT-5.5 model for coding tasks",
    inputSchema: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Coding task description or question",
        },
        code_context: {
          type: "string",
          description: "Existing code context (optional)",
        },
        model: {
          type: "string",
          enum: ["gpt-5.5", "gpt-5.4", "gpt-5.4-mini", "gpt-4"],
          default: "gpt-5.5",
          description: "Model to use",
        },
        temperature: {
          type: "number",
          minimum: 0,
          maximum: 2,
          default: 0.7,
          description: "Sampling temperature",
        },
      },
      required: ["prompt"],
    },
  },
  {
    name: "gpt5_code_review",
    description: "Review code using GPT-5.5 for bugs, performance, security, and style",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Code to review",
        },
        language: {
          type: "string",
          description: "Programming language (e.g., typescript, python, rust)",
        },
        focus: {
          type: "string",
          enum: ["bugs", "performance", "security", "style", "all"],
          default: "all",
          description: "Review focus area",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "gpt5_refactor",
    description: "Refactor code using GPT-5.5 with specific goals",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Code to refactor",
        },
        goal: {
          type: "string",
          description: "Refactoring goal (e.g., improve performance, reduce complexity)",
        },
        language: {
          type: "string",
          description: "Programming language",
        },
      },
      required: ["code", "goal"],
    },
  },
  {
    name: "gpt5_explain_code",
    description: "Explain code using GPT-5.5 in detail",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Code to explain",
        },
        language: {
          type: "string",
          description: "Programming language",
        },
        detail_level: {
          type: "string",
          enum: ["brief", "detailed", "expert"],
          default: "detailed",
          description: "Level of detail in explanation",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "gpt5_debug",
    description: "Debug code and find issues using GPT-5.5",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Code with potential bugs",
        },
        error_message: {
          type: "string",
          description: "Error message or description of the issue",
        },
        language: {
          type: "string",
          description: "Programming language",
        },
      },
      required: ["code"],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "gpt5_code_complete":
        return await handleCodeComplete(args);
      case "gpt5_code_review":
        return await handleCodeReview(args);
      case "gpt5_refactor":
        return await handleRefactor(args);
      case "gpt5_explain_code":
        return await handleExplainCode(args);
      case "gpt5_debug":
        return await handleDebug(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}\n\nStack: ${error.stack || "N/A"}`,
        },
      ],
      isError: true,
    };
  }
});

// Tool implementations
async function handleCodeComplete(args: any) {
  const { prompt, code_context, model = "gpt-5.5", temperature = 0.7 } = args;

  const systemPrompt = `You are an expert coding assistant specialized in writing clean, efficient, and well-documented code.
${code_context ? `\n\nExisting code context:\n\`\`\`\n${code_context}\n\`\`\`` : ""}

Provide complete, working code with:
- Clear comments
- Error handling
- Best practices
- Type safety where applicable`;

  const response = await callGPT5API({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature,
  });

  return {
    content: [
      {
        type: "text",
        text: response.choices[0].message.content,
      },
    ],
  };
}

async function handleCodeReview(args: any) {
  const { code, language, focus = "all" } = args;

  const focusInstructions = {
    bugs: "Focus on finding bugs, logical errors, and potential runtime issues",
    performance: "Focus on performance optimization opportunities and algorithmic improvements",
    security: "Focus on security vulnerabilities, input validation, and potential exploits",
    style: "Focus on code style, readability, and adherence to best practices",
    all: "Provide comprehensive review covering bugs, performance, security, and style",
  };

  const systemPrompt = `You are an expert code reviewer with deep knowledge of software engineering best practices.
${focusInstructions[focus as keyof typeof focusInstructions]}.
${language ? `Language: ${language}` : ""}

Provide structured feedback with:
1. **Issues Found** (severity: critical/high/medium/low)
   - Description of each issue
   - Line numbers or code snippets
   - Why it's a problem
2. **Specific Recommendations**
   - How to fix each issue
   - Alternative approaches
3. **Code Examples**
   - Show corrected code where applicable
4. **Overall Assessment**
   - Summary of code quality
   - Positive aspects`;

  const response = await callGPT5API({
    model: "gpt-5.5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Review this code:\n\n\`\`\`${language || ""}\n${code}\n\`\`\`` },
    ],
    temperature: 0.3,
  });

  return {
    content: [
      {
        type: "text",
        text: response.choices[0].message.content,
      },
    ],
  };
}

async function handleRefactor(args: any) {
  const { code, goal, language } = args;

  const systemPrompt = `You are an expert at code refactoring with deep understanding of design patterns and clean code principles.
${language ? `Language: ${language}` : ""}

Refactoring goal: ${goal}

Provide:
1. **Refactored Code**
   - Complete, working refactored version
   - Maintain functionality
2. **Explanation of Changes**
   - What was changed and why
   - Design patterns applied
3. **Benefits**
   - Improvements in readability, maintainability, performance
4. **Migration Notes**
   - Any breaking changes
   - How to update calling code`;

  const response = await callGPT5API({
    model: "gpt-5.5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Refactor this code:\n\n\`\`\`${language || ""}\n${code}\n\`\`\`` },
    ],
    temperature: 0.5,
  });

  return {
    content: [
      {
        type: "text",
        text: response.choices[0].message.content,
      },
    ],
  };
}

async function handleExplainCode(args: any) {
  const { code, language, detail_level = "detailed" } = args;

  const detailInstructions = {
    brief: "Provide a concise summary of what the code does",
    detailed: "Provide detailed explanation of logic, data flow, and key concepts",
    expert: "Provide expert-level analysis including algorithmic complexity, design patterns, and optimization opportunities",
  };

  const systemPrompt = `You are an expert at explaining code clearly and comprehensively.
${language ? `Language: ${language}` : ""}

${detailInstructions[detail_level as keyof typeof detailInstructions]}.

Structure your explanation:
1. **Overview** - What the code does at a high level
2. **Step-by-Step Breakdown** - Explain each section
3. **Key Concepts** - Important patterns or techniques used
4. **Potential Issues** - Any concerns or edge cases
${detail_level === "expert" ? "5. **Complexity Analysis** - Time and space complexity\n6. **Optimization Suggestions**" : ""}`;

  const response = await callGPT5API({
    model: "gpt-5.5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Explain this code:\n\n\`\`\`${language || ""}\n${code}\n\`\`\`` },
    ],
    temperature: 0.4,
  });

  return {
    content: [
      {
        type: "text",
        text: response.choices[0].message.content,
      },
    ],
  };
}

async function handleDebug(args: any) {
  const { code, error_message, language } = args;

  const systemPrompt = `You are an expert debugger with deep knowledge of common programming errors and debugging techniques.
${language ? `Language: ${language}` : ""}

Analyze the code and ${error_message ? "error message" : "potential issues"} to:
1. **Identify the Root Cause**
   - What's causing the issue
   - Why it's happening
2. **Provide a Fix**
   - Corrected code
   - Explanation of the fix
3. **Explain Prevention**
   - How to avoid similar issues
   - Best practices
4. **Additional Checks**
   - Other potential issues in the code
   - Edge cases to consider`;

  const userMessage = error_message
    ? `Debug this code with error:\n\nError: ${error_message}\n\nCode:\n\`\`\`${language || ""}\n${code}\n\`\`\``
    : `Debug this code and find potential issues:\n\n\`\`\`${language || ""}\n${code}\n\`\`\``;

  const response = await callGPT5API({
    model: "gpt-5.5",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
  });

  return {
    content: [
      {
        type: "text",
        text: response.choices[0].message.content,
      },
    ],
  };
}

// GPT-5 API client
async function callGPT5API(params: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
}) {
  try {
    const response = await axios.post(
      `${GPT5_API_URL}/chat/completions`,
      {
        model: params.model,
        messages: params.messages,
        temperature: params.temperature || 0.7,
        max_tokens: 4096,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GPT5_API_KEY}`,
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      );
    } else if (error.request) {
      throw new Error(`Network Error: No response from API server`);
    } else {
      throw new Error(`Request Error: ${error.message}`);
    }
  }
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GPT-5 MCP Server v1.0.0 running on stdio");
  console.error(`API Endpoint: ${GPT5_API_URL}`);
  console.error("Available tools: gpt5_code_complete, gpt5_code_review, gpt5_refactor, gpt5_explain_code, gpt5_debug");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
