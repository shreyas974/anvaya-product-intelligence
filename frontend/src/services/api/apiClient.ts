import { HttpError } from '@/types/api.types';
import { apiConfig } from './apiConfig';
import { supabase } from '@/supabase';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
  body?: unknown;
}

/**
 * Builds full URL with search query parameters.
 */
export function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  baseUrl = apiConfig.baseUrl
): string {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${normalizedBase}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Core fetch wrapper with timeout, json formatting, and typed response handling.
 */
export async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    params,
    timeoutMs = apiConfig.timeoutMs,
    body,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const url = buildUrl(path, params);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const {
  data: { session },
} = await supabase.auth.getSession();

const headers: Record<string, string> = {
  'Accept': 'application/json',
  ...(customHeaders as Record<string, string>),
};

if (session?.access_token) {
  headers['Authorization'] = `Bearer ${session.access_token}`;
}

  let serializedBody: BodyInit | undefined;
  if (body !== undefined) {
    if (typeof body === 'string' || body instanceof FormData || body instanceof Blob) {
      serializedBody = body;
    } else {
      headers['Content-Type'] = 'application/json';
      serializedBody = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: serializedBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse JSON response body if present
    const contentType = response.headers.get('content-type');
    let responseData: unknown;

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      try {
        responseData = text ? JSON.parse(text) : undefined;
      } catch {
        responseData = text;
      }
    }

    if (!response.ok) {
      const message =
        responseData && typeof responseData === 'object' && 'message' in responseData
          ? String((responseData as { message: unknown }).message)
          : `Request failed with status ${response.status}`;

      throw new HttpError(response.status, response.statusText, responseData, message);
    }

    return responseData as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof HttpError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new HttpError(408, 'Request Timeout', undefined, `Request to ${path} timed out after ${timeoutMs}ms`);
    }

    const networkErrorMsg = error instanceof Error ? error.message : 'Unknown Network Error';
    throw new HttpError(0, 'Network Error', undefined, `Network error: ${networkErrorMsg}`);
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
