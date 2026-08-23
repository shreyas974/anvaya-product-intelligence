import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient, buildUrl } from '@/services/api/apiClient';
import { apiConfig } from '@/services/api/apiConfig';
import { HttpError } from '@/types/api.types';

describe('ApiClient & Request Helpers', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    apiConfig.baseUrl = 'http://localhost:8000/api';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('buildUrl', () => {
    it('builds a clean URL without params', () => {
      const url = buildUrl('/products');
      expect(url).toBe('http://localhost:8000/api/products');
    });

    it('attaches query parameters properly', () => {
      const url = buildUrl('/products', {
        page: 2,
        limit: 10,
        search: 'samsung',
        empty: undefined,
        nullVal: null,
      });
      expect(url).toContain('http://localhost:8000/api/products?');
      expect(url).toContain('page=2');
      expect(url).toContain('limit=10');
      expect(url).toContain('search=samsung');
      expect(url).not.toContain('empty');
      expect(url).not.toContain('nullVal');
    });
  });

  describe('HTTP Methods & Success Responses', () => {
    it('executes GET request successfully and parses JSON', async () => {
      const mockData = { success: true, data: { id: 'prod-001', title: 'Test Product' } };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) => (header.toLowerCase() === 'content-type' ? 'application/json' : null),
        },
        json: async () => mockData,
      } as unknown as Response);

      const result = await apiClient.get<typeof mockData>('/products/prod-001');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/products/prod-001',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('executes POST request with JSON body serialization', async () => {
      const payload = { sku: 'TEST-123', title: 'New Test Item' };
      const responseData = { success: true, data: { id: 'prod-999', ...payload } };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        headers: {
          get: () => 'application/json',
        },
        json: async () => responseData,
      } as unknown as Response);

      const result = await apiClient.post<typeof responseData>('/products', payload);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/products',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
          body: JSON.stringify(payload),
        })
      );
      expect(result).toEqual(responseData);
    });

    it('executes PUT, PATCH, and DELETE requests', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: true }),
      } as unknown as Response);

      await apiClient.put('/products/1', { name: 'updated' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/products/1'),
        expect.objectContaining({ method: 'PUT' })
      );

      await apiClient.patch('/products/1', { price: 100 });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/products/1'),
        expect.objectContaining({ method: 'PATCH' })
      );

      await apiClient.delete('/products/1');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/products/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Error Handling', () => {
    it('throws HttpError on HTTP 404 with parsed error response', async () => {
      const errorPayload = { success: false, message: 'Product not found', error: 'NotFound', statusCode: 404 };
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: { get: () => 'application/json' },
        json: async () => errorPayload,
      } as unknown as Response);

      await expect(apiClient.get('/products/invalid-id')).rejects.toThrow(HttpError);

      try {
        await apiClient.get('/products/invalid-id');
      } catch (err) {
        const httpErr = err as HttpError;
        expect(httpErr.status).toBe(404);
        expect(httpErr.message).toBe('Product not found');
        expect(httpErr.responseData).toEqual(errorPayload);
      }
    });

    it('handles network disconnection errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch (net::ERR_CONNECTION_REFUSED)'));

      await expect(apiClient.get('/products')).rejects.toThrow(HttpError);

      try {
        await apiClient.get('/products');
      } catch (err) {
        const httpErr = err as HttpError;
        expect(httpErr.status).toBe(0);
        expect(httpErr.statusText).toBe('Network Error');
      }
    });

    it('handles request timeout via AbortError', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      global.fetch = vi.fn().mockRejectedValue(abortError);

      try {
        await apiClient.get('/long-running', { timeoutMs: 10 });
      } catch (err) {
        const httpErr = err as HttpError;
        expect(httpErr.status).toBe(408);
        expect(httpErr.message).toContain('timed out');
      }
    });
  });
});
