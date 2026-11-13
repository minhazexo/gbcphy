export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const jsonResponse = (
  body: unknown,
  status = 200,
  headers: HeadersInit = {},
): Response => {
  const merged = new Headers(headers);
  merged.set("Content-Type", "application/json; charset=utf-8");
  merged.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(body), { status, headers: merged });
};
