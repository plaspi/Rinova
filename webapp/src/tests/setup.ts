import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi,  } from 'vitest';

// Cleanup DOM after each test
afterEach(() => {
  cleanup();
});

// GLOBAL MOCK: window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false, // Default to Desktop view
    media: query,
    onchange: null,
    addListener: vi.fn(), 
    removeListener: vi.fn(), 
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 2. MOCK RESIZEOBSERVER (For Recharts & Sidebar)
const ResizeObserverMock = vi.fn(function() {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// 3. MOCK SCROLLTO
vi.stubGlobal('scrollTo', vi.fn());