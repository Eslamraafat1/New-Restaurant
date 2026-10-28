export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
    public code: "network" | "timeout" | "http" | "validation" = "http",
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
