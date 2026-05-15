// Environment configuration
export interface Config {
  apiUrl: string;
  apiKey: string;
  timeout: number;
  maxTokens: number;
}

export function loadConfig(): Config {
  const apiKey = process.env.GPT5_API_KEY;
  if (!apiKey) {
    console.error("Error: GPT5_API_KEY environment variable is required");
    process.exit(1);
  }

  return {
    apiUrl: process.env.GPT5_API_URL || "https://api.openai.com/v1",
    apiKey,
    timeout: parseInt(process.env.API_TIMEOUT || "60000", 10),
    maxTokens: parseInt(process.env.MAX_TOKENS || "4096", 10),
  };
}
