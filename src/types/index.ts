// MCP tool input schemas
export interface CodeCompleteInput {
  prompt: string;
  code_context?: string;
  model?: "gpt-5.5" | "gpt-5.4" | "gpt-5.4-mini" | "gpt-4";
  temperature?: number;
}

export interface CodeReviewInput {
  code: string;
  language?: string;
  focus?: "bugs" | "performance" | "security" | "style" | "all";
}

export interface RefactorInput {
  code: string;
  goal: string;
  language?: string;
}

export interface ExplainCodeInput {
  code: string;
  language?: string;
  detail_level?: "brief" | "detailed" | "expert";
}

export interface DebugInput {
  code: string;
  error_message?: string;
  language?: string;
}

// API types
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ApiParams {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}
