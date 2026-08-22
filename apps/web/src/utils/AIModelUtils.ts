// Constants for the AI model provider.
export const PROVIDER_NAME = 'Groq';
export const PROVIDER_URL = 'https://console.groq.com/home';

export interface AiModelOption {
  id: string;
  label: string;
  description: string;
}

// Selectable models. Mirror any change here in apps/api/src/ai/allowed-models.ts.
export const AVAILABLE_MODELS: AiModelOption[] = [
  {
    id: 'openai/gpt-oss-120b',
    label: 'GPT-OSS 120B',
    description: 'Best quality (default)',
  },
  {
    id: 'openai/gpt-oss-20b',
    label: 'GPT-OSS 20B',
    description: 'Fastest, lighter-weight',
  },
  {
    id: 'groq/compound',
    label: 'Compound',
    description: "Groq's agentic model with web search",
  },
  {
    id: 'qwen/qwen3.6-27b',
    label: 'Qwen 3.6 27B',
    description: 'Strong reasoning (preview)',
  },
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id;
