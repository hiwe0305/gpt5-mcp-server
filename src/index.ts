#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { loadConfig } from "./config/index.js";
import { TOOLS } from "./tools/definitions.js";
import { handlers } from "./tools/handlers.js";
import { formatError } from "./utils/index.js";

const config = loadConfig();

const server = new Server(
  { name: "gpt5-coding-assistant", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const argsData = args as any;

  try {
    switch (name) {
      case "gpt5_code_complete":
        return await handlers.codeComplete(argsData);
      case "gpt5_code_review":
        return await handlers.codeReview(argsData);
      case "gpt5_refactor":
        return await handlers.refactor(argsData);
      case "gpt5_explain_code":
        return await handlers.explainCode(argsData);
      case "gpt5_debug":
        return await handlers.debug(argsData);
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: formatError(error) }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`GPT-5 MCP Server v1.0.0 running on stdio`);
  console.error(`API Endpoint: ${config.apiUrl}`);
  console.error(`Available tools: ${TOOLS.map(t => t.name).join(", ")}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
