// MCP tool definitions
export const TOOLS = [
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
          description: "Programming language",
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
          description: "Refactoring goal",
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
          description: "Level of detail",
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
          description: "Error message or description",
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
