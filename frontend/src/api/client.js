// Small fetch helper for our API. The session cookie is sent automatically
// because the frontend and the API share one origin.

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors; // field -> message, when the server sends them
  }
}

export async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 204) return null;

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      body.error ||
      (body.errors ? "Please fix the highlighted fields." : `Request failed (${response.status}).`);
    throw new ApiError(message, response.status, body.errors);
  }
  return body;
}
