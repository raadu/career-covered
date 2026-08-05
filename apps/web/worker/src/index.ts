export default {
  async fetch(request: Request, env: { ASSETS: Fetcher; BACKEND_URL?: string }) {
    const url = new URL(request.url);

    // ─── API / Auth requests → proxy to NestJS backend ───
    // (Includes /api/generate — the backend is the only place that calls
    // Groq, so rate-limiting and request validation always apply.)
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
