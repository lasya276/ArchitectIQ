/**
 * Reusable API Layer for ArchitectIQ Frontend
 * Configured with environment variables and cross-origin credential support.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Includes HTTP-Only cookies automatically
  };

  const response = await fetch(url, config);

  if (response.status === 204) {
    return {} as T;
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage =
      (data && (data.detail || data.message)) ||
      `HTTP Error ${response.status}: ${response.statusText}`;
    throw new ApiError(response.status, errorMessage, data);
  }

  return data as T;
}
