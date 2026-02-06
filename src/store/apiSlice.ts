import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
    baseUrl: 'https://api.groq.com/openai/v1',
    prepareHeaders: (headers) => {
       headers.set('Content-Type', 'application/json');
       return headers;
    }
  }),
  endpoints: (builder) => ({
    generateCoverLetter: builder.mutation<string, GenerateRequest>({
      query: ({ apiKey, prompt, model }) => ({
        url: '/chat/completions',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
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
  }),
});

export const { useGenerateCoverLetterMutation } = apiSlice;
