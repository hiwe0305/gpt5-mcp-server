import axios, { AxiosError } from "axios";
import type { ApiParams } from "../types/index.js";
import { loadConfig } from "../config/index.js";

export interface ApiResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function callApi(params: ApiParams): Promise<ApiResponse> {
  const config = loadConfig();

  try {
    const response = await axios.post<ApiResponse>(
      `${config.apiUrl}/chat/completions`,
      {
        model: params.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.max_tokens ?? config.maxTokens,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        timeout: config.timeout,
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response) {
        throw new ApiError(
          `API Error: ${error.response.status}`,
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        throw new ApiError("Network Error: No response from API server");
      }
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
