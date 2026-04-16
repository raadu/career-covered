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
  apiKey: string;
  prompt: string;
  model: string;
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: GROQ_BASE_URL,
    prepareHeaders: (headers) => {
       headers.set('Content-Type', 'application/json');
       return headers;
    }
  }),
  tagTypes: ['CoverLetter'],
  endpoints: (builder) => ({
    /**
     * Generates a cover letter using the Groq API.
     */
    generateCoverLetter: builder.mutation<string, GenerateRequest>({
      query: ({ apiKey, prompt, model }) => ({
        url: API_ENDPOINTS.CHAT_COMPLETIONS,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
        body: {
          model: model,
          messages: [
            {
               role: 'user',
               content: prompt
            }
          ],
          temperature: 0.7
        },
      }),
      transformResponse: (response: GroqResponse) => {
        return response.choices?.[0]?.message?.content || 'Error: No response generated.';
      },
    }),
    
    // Add future endpoints here...
  }),
});

export const { useGenerateCoverLetterMutation } = apiSlice;
