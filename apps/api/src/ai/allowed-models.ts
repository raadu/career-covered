// Single source of truth for which Groq models the API will accept.
// Mirror any change here in apps/web/src/utils/AIModelUtils.ts.
export const ALLOWED_MODEL_IDS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
] as const;
