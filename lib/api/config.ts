/**
 * Central API configuration. Components never hardcode URLs – they call the services in lib/api/*.
 * NEXT_PUBLIC_API_BASE_URL below is an EXAMPLE; the backend developer must supply the real address.
 */
export const apiConfig = {
  useDemo: process.env.NEXT_PUBLIC_USE_DEMO_API !== "false",
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api",
  timeoutMs: 10_000,
};
