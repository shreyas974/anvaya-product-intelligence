import '@testing-library/jest-dom/vitest';

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined') {
  window.ResizeObserver = MockResizeObserver;
}
