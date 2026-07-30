export default {
  async fetch(
    request: Request,
    env: { ASSETS: Fetcher; OWNER_GROQ_API_KEY: string },
  ) {
    const url = new URL(request.url);

    // ─── Cover letter generation → Groq API ───────────────────
    if (url.pathname === "/api/generate" && request.method === "POST") {
      const body = (await request.json()) as Record<string, unknown>;
      const { userApiKey, ...groqBody } = body;
      const apiKey =
        (userApiKey as string | undefined) || env.OWNER_GROQ_API_KEY;

      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: { message: "No API key available" } }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      const groqResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(groqBody),
        },
      );

      const data = await groqResponse.json();
      return new Response(JSON.stringify(data), {
        status: groqResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ─── Other API / Auth requests → proxy to NestJS backend ───
    if (
      url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/auth/")
    ) {
      const backendUrl = env.BACKEND_URL ?? "http://localhost:3000";
      const backendReq = new Request(
        `${backendUrl}${url.pathname}${url.search}`,
        {
          method: request.method,
          headers: request.headers,
          body: request.body,
        },
      );
      return fetch(backendReq);
    }

    // ─── Static assets ────────────────────────────────────────
    return env.ASSETS.fetch(request);
  },
};
