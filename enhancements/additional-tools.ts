/**
 * Additional Tools for GPT-5 MCP Server
 * 
 * New tools: test generation, code optimization, documentation generation
 */

export const ADDITIONAL_TOOLS = [
  {
    name: "gpt5_generate_tests",
    description: "Generate unit tests for code using GPT-5.5",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Code to generate tests for",
        },
        language: {
          type: "string",
          description: "Programming language",
        },
        framework: {
          type: "string",
          description: "Testing framework (e.g., jest, pytest, junit)",
        },
        coverage: {
          type: "string",
          enum: ["basic", "comprehensive", "edge-cases"],
          default: "comprehensive",
          description: "Test coverage level",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "gpt5_optimize",
    description: "Optimize code for performance, memory, or readability",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Code to optimize",
        },
        language: {
          type: "string",
          description: "Programming language",
        },
        optimization_target: {
          type: "string",
          enum: ["performance", "memory", "readability", "all"],
          default: "performance",
          description: "Optimization target",
        },
        constraints: {
          type: "string",
          description: "Any constraints or requirements",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "gpt5_generate_docs",
    description: "Generate documentation for code",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Code to document",
        },
        language: {
          type: "string",
          description: "Programming language",
        },
        style: {
          type: "string",
          enum: ["jsdoc", "pydoc", "javadoc", "markdown"],
          description: "Documentation style",
        },
        include_examples: {
          type: "boolean",
          default: true,
          description: "Include usage examples",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "gpt5_convert_code",
    description: "Convert code from one language to another",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Code to convert",
        },
        from_language: {
          type: "string",
          description: "Source language",
        },
        to_language: {
          type: "string",
          description: "Target language",
        },
        preserve_comments: {
          type: "boolean",
          default: true,
          description: "Preserve comments in conversion",
        },
      },
      required: ["code", "from_language", "to_language"],
    },
  },
  {
    name: "gpt5_security_audit",
    description: "Perform security audit on code",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "Code to audit",
        },
        language: {
          type: "string",
          description: "Programming language",
        },
        focus: {
          type: "string",
          enum: ["all", "injection", "xss", "auth", "crypto", "data-exposure"],
          default: "all",
          description: "Security focus area",
        },
      },
      required: ["code"],
    },
  },
];

/**
 * Handler for test generation
 */
export async function handleGenerateTests(
  args: any,
  callAPI: (params: any) => Promise<any>
) {
  const { code, language, framework, coverage = "comprehensive" } = args;

  const coverageInstructions = {
    basic: "Generate basic happy-path tests",
    comprehensive: "Generate comprehensive tests covering main functionality and common edge cases",
    "edge-cases": "Generate extensive tests focusing on edge cases, error conditions, and boundary values",
  };

  const systemPrompt = `You are an expert at writing unit tests.
${language ? `Language: ${language}` : ""}
${framework ? `Framework: ${framework}` : ""}

${coverageInstructions[coverage as keyof typeof coverageInstructions]}

Provide:
1. **Test Suite** - Complete, runnable tests
2. **Test Cases** - List of what each test covers
3. **Setup/Teardown** - Any required setup or cleanup
4. **Mocking** - Mock external dependencies if needed
5. **Coverage Notes** - What is and isn't covered`;

  const response = await callAPI({
    model: "gpt-5.5",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate ${coverage} tests for this code:\n\n\`\`\`${language || ""}\n${code}\n\`\`\``,
      },
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

/**
 * Handler for code optimization
 */
export async function handleOptimize(
  args: any,
  callAPI: (params: any) => Promise<any>
) {
  const { code, language, optimization_target = "performance", constraints } = args;

  const targetInstructions = {
    performance: "Optimize for execution speed and algorithmic efficiency",
    memory: "Optimize for memory usage and reduce allocations",
    readability: "Optimize for code clarity, maintainability, and readability",
    all: "Balance performance, memory usage, and readability",
  };

  const systemPrompt = `You are an expert at code optimization.
${language ? `Language: ${language}` : ""}

Optimization target: ${targetInstructions[optimization_target as keyof typeof targetInstructions]}
${constraints ? `\nConstraints: ${constraints}` : ""}

Provide:
1. **Optimized Code** - Complete optimized version
2. **Changes Made** - Detailed list of optimizations
3. **Performance Impact** - Expected improvements
4. **Trade-offs** - Any trade-offs made
5. **Benchmarking** - Suggestions for measuring improvements`;

  const response = await callAPI({
    model: "gpt-5.5",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Optimize this code for ${optimization_target}:\n\n\`\`\`${language || ""}\n${code}\n\`\`\``,
      },
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

/**
 * Handler for documentation generation
 */
export async function handleGenerateDocs(
  args: any,
  callAPI: (params: any) => Promise<any>
) {
  const { code, language, style, include_examples = true } = args;

  const systemPrompt = `You are an expert at writing technical documentation.
${language ? `Language: ${language}` : ""}
${style ? `Documentation style: ${style}` : ""}

Generate clear, comprehensive documentation including:
1. **Overview** - What the code does
2. **Parameters/Arguments** - Description of inputs
3. **Return Values** - Description of outputs
4. **Exceptions/Errors** - Possible errors
${include_examples ? "5. **Usage Examples** - Practical examples" : ""}
6. **Notes** - Important considerations`;

  const response = await callAPI({
    model: "gpt-5.5",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate documentation for this code:\n\n\`\`\`${language || ""}\n${code}\n\`\`\``,
      },
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

/**
 * Handler for code conversion
 */
export async function handleConvertCode(
  args: any,
  callAPI: (params: any) => Promise<any>
) {
  const { code, from_language, to_language, preserve_comments = true } = args;

  const systemPrompt = `You are an expert at converting code between programming languages.

Convert from ${from_language} to ${to_language}.
${preserve_comments ? "Preserve all comments and documentation." : ""}

Provide:
1. **Converted Code** - Complete working code in target language
2. **Conversion Notes** - Important changes or adaptations
3. **Idioms** - Language-specific idioms used
4. **Dependencies** - Required libraries or packages
5. **Compatibility** - Any compatibility considerations`;

  const response = await callAPI({
    model: "gpt-5.5",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Convert this ${from_language} code to ${to_language}:\n\n\`\`\`${from_language}\n${code}\n\`\`\``,
      },
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

/**
 * Handler for security audit
 */
export async function handleSecurityAudit(
  args: any,
  callAPI: (params: any) => Promise<any>
) {
  const { code, language, focus = "all" } = args;

  const focusInstructions = {
    all: "Comprehensive security audit covering all common vulnerabilities",
    injection: "Focus on SQL injection, command injection, and code injection",
    xss: "Focus on Cross-Site Scripting (XSS) vulnerabilities",
    auth: "Focus on authentication and authorization issues",
    crypto: "Focus on cryptographic implementations and key management",
    "data-exposure": "Focus on sensitive data exposure and privacy issues",
  };

  const systemPrompt = `You are a security expert specializing in code auditing.
${language ? `Language: ${language}` : ""}

${focusInstructions[focus as keyof typeof focusInstructions]}

Provide:
1. **Vulnerabilities Found** - Detailed list with severity (Critical/High/Medium/Low)
2. **Exploit Scenarios** - How each vulnerability could be exploited
3. **Remediation** - Specific fixes for each issue
4. **Secure Code Examples** - Show corrected code
5. **Best Practices** - General security recommendations`;

  const response = await callAPI({
    model: "gpt-5.5",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Perform security audit on this code:\n\n\`\`\`${language || ""}\n${code}\n\`\`\``,
      },
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
