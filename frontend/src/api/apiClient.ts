const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

type RequestOptions = RequestInit & {
  token?: string | null;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function readErrorMessage(response: Response) {
  const fallback = `Request failed with status ${response.status}`;
  const text = await response.text();
  if (!text) {
    return fallback;
  }

  try {
    const error = JSON.parse(text) as ApiErrorResponse;
    return error.message || error.error || fallback;
  } catch {
    return text;
  }
}
