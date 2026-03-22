import OpenAI from 'openai';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

/**
 * Shared OpenAI client instance.
 * When the API key is absent the client is still created — individual service
 * calls will fail, and the UI should catch errors and show a user-facing
 * message instead of crashing.
 */
export const openaiClient: OpenAI | null = apiKey
  ? new OpenAI({ apiKey })
  : null;

/**
 * Whether the OpenAI integration is configured.
 * UI components should check this before offering AI features.
 */
export const isOpenAIConfigured = !!apiKey;
