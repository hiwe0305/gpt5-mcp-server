import type { 
  CodeCompleteInput, 
  CodeReviewInput, 
  RefactorInput, 
  ExplainCodeInput, 
  DebugInput,
  Message 
} from "../types/index.js";
import { callApi } from "../api/client.js";

// Tool handler types
export type ToolHandler<T> = (args: T) => Promise<{ content: Array<{ type: string; text: string }> }>;

// Helper to extract response text
function getResponseText(response: { choices: Array<{ message: { content: string } }> }): string {
  return response.choices[0]?.message?.content ?? "";
}

export const handlers = {
  codeComplete: async (args: CodeCompleteInput) => {
    const { prompt, code_context, model = "gpt-5.5", temperature = 0.7 } = args;

    const systemPrompt = `You are an expert coding assistant specialized in writing clean, efficient, and well-documented code.
${code_context ? `\n\nExisting code context:\n\`\`\`\n${code_context}\n\`\`\`` : ""}

Provide complete, working code with:
- Clear comments
- Error handling
- Best practices
- Type safety where applicable`;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ];

    const response = await callApi({ model, messages, temperature });
    return { content: [{ type: "text", text: getResponseText(response) }] };
  },

  codeReview: async (args: CodeReviewInput) => {
    const { code, language, focus = "all" } = args;

    const focusInstructions = {
      bugs: "Focus on finding bugs, logical errors, and potential runtime issues",
      performance: "Focus on performance optimization opportunities",
      security: "Focus on security vulnerabilities and input validation",
      style: "Focus on code style, readability, and best practices",
      all: "Comprehensive review covering bugs, performance, security, and style",
    };

    const systemPrompt = `You are an expert code reviewer.
${focusInstructions[focus as keyof typeof focusInstructions]}
${language ? `Language: ${language}` : ""}

Provide structured feedback:
1. **Issues Found** (severity: critical/high/medium/low)
2. **Specific Recommendations**
3. **Code Examples** (corrected code)
4. **Overall Assessment**`;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Review this code:\n\n\`\`\`${language || ""}\n${code}\n\`\`\`` },
    ];

    const response = await callApi({ model: "gpt-5.5", messages, temperature: 0.3 });
    return { content: [{ type: "text", text: getResponseText(response) }] };
  },

  refactor: async (args: RefactorInput) => {
    const { code, goal, language } = args;

    const systemPrompt = `You are an expert at code refactoring.
${language ? `Language: ${language}` : ""}
Refactoring goal: ${goal}

Provide:
1. **Refactored Code** - Complete working version
2. **Explanation of Changes**
3. **Benefits**
4. **Migration Notes**`;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Refactor this code:\n\n\`\`\`${language || ""}\n${code}\n\`\`\`` },
    ];

    const response = await callApi({ model: "gpt-5.5", messages, temperature: 0.5 });
    return { content: [{ type: "text", text: getResponseText(response) }] };
  },

  explainCode: async (args: ExplainCodeInput) => {
    const { code, language, detail_level = "detailed" } = args;

    const detailInstructions = {
      brief: "Provide a concise summary of what the code does",
      detailed: "Explain logic, data flow, and key concepts",
      expert: "Expert-level analysis: complexity, design patterns, optimization",
    };

    const systemPrompt = `You are an expert at explaining code.
${language ? `Language: ${language}` : ""}
${detailInstructions[detail_level as keyof typeof detailInstructions]}

Structure:
1. **Overview**
2. **Step-by-Step Breakdown**
3. **Key Concepts**
4. **Potential Issues**
${detail_level === "expert" ? "5. **Complexity Analysis**\n6. **Optimization Suggestions**" : ""}`;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Explain this code:\n\n\`\`\`${language || ""}\n${code}\n\`\`\`` },
    ];

    const response = await callApi({ model: "gpt-5.5", messages, temperature: 0.4 });
    return { content: [{ type: "text", text: getResponseText(response) }] };
  },

  debug: async (args: DebugInput) => {
    const { code, error_message, language } = args;

    const systemPrompt = `You are an expert debugger.
${language ? `Language: ${language}` : ""}

Analyze and provide:
1. **Root Cause** - What's causing the issue
2. **Fixed Code** - Corrected version
3. **Prevention** - How to avoid similar issues
4. **Additional Checks** - Other potential issues`;

    const userMessage = error_message
      ? `Debug with error:\n\nError: ${error_message}\n\nCode:\n\`\`\`${language || ""}\n${code}\n\`\`\``
      : `Debug and find potential issues:\n\n\`\`\`${language || ""}\n${code}\n\`\`\``;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    const response = await callApi({ model: "gpt-5.5", messages, temperature: 0.3 });
    return { content: [{ type: "text", text: getResponseText(response) }] };
  },
};
