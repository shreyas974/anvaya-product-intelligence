/**
 * ANVAYA Frontend API Configuration
 * Supports live backend and automatic client-side mock/cloud fallback when deployed to production.
 */

const getEnvVar = (key: string, defaultValue: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
    return String(import.meta.env[key]);
  }
  return defaultValue;
};

export const getUseMocksDefault = (): boolean => {
  const envVal = getEnvVar('VITE_USE_MOCKS', 'false');
  return envVal === 'true' || envVal === '1';
};


export const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'http://127.0.0.1:8000/api/v1');

export interface ApiConfig {
  baseUrl: string;
  useMocks: boolean;
  timeoutMs: number;
  simulatedLatencyMinMs: number;
  simulatedLatencyMaxMs: number;
}

export const apiConfig: ApiConfig = {
  baseUrl: API_BASE_URL,
  useMocks: getUseMocksDefault(),
  timeoutMs: 8000,
  simulatedLatencyMinMs: 0,
  simulatedLatencyMaxMs: 0,
};

/**
 * Check if the application should use mock services directly.
 */
export function isUseMocks(): boolean {
  return apiConfig.useMocks;
}

/**
 * Set mock mode dynamically (useful for tests or demo toggles).
 */
export function setUseMocks(value: boolean): void {
  apiConfig.useMocks = value;
}

/**
 * Get configured API base URL.
 */
export function getApiBaseUrl(): string {
  return apiConfig.baseUrl;
}

/**
 * Set API base URL dynamically.
 */
export function setApiBaseUrl(url: string): void {
  apiConfig.baseUrl = url;
}

export async function simulateLatency(minMs = apiConfig.simulatedLatencyMinMs, maxMs = apiConfig.simulatedLatencyMaxMs): Promise<void> {
  if (minMs <= 0 && maxMs <= 0) return;
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
