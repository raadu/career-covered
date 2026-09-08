import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GROQ_BASE_URL, API_ENDPOINTS } from 'utils/apiConfigUtils';

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface GenerateRequest {
  prompt: string;
  model: string;
  userApiKey?: string;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: GROQ_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['CoverLetter'],
  endpoints: (builder) => ({
    /**
     * Generates a cover letter via the Cloudflare Worker proxy.
     */
    generateCoverLetter: builder.mutation<string, GenerateRequest>({
      query: ({ prompt, model, userApiKey }) => ({
        url: API_ENDPOINTS.CHAT_COMPLETIONS,
        method: 'POST',
        body: {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          // GPT-OSS reasoning models default to "medium" reasoning effort
          // on Groq, which shares the same token budget as the actual
          // answer — under a tight length limit (esp. character limit) plus
          // a long job description, the model can burn the whole budget on
          // hidden reasoning and return an empty completion. This is a
          // straightforward writing task, so "low" is enough and leaves
          // the budget for the letter itself.
          reasoning_effort: 'low',
          ...(userApiKey && { userApiKey }),
        },
      }),
      transformResponse: (response: GroqResponse) => {
        const content = response.choices?.[0]?.message?.content;
        // Throwing here (rather than returning a placeholder string) makes
        // RTK Query treat this as a failed mutation, so the caller's error
        // handling runs instead of silently saving a fake "generated"
        // letter as if the request had succeeded.
        if (!content) {
          throw new Error('The AI did not return any content.');
        }
        return content;
      },
    }),

    // Add future endpoints here...
  }),
});

export const { useGenerateCoverLetterMutation } = apiSlice;
