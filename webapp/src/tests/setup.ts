import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// 1. STUB ENVIRONMENT VARIABLES FOR SUPABASE
vi.stubEnv('VITE_SUPABASE_URL', 'https://mock.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock-anon-key');
vi.stubEnv('VITE_API_URL', 'http://localhost:3000');

// 2. MOCK LOCAL STORAGE
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: function (key: string) { return store[key] || null; },
    setItem: function (key: string, value: string) { store[key] = value.toString(); },
    removeItem: function (key: string) { delete store[key]; },
    clear: function () { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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

// 3. MOCK RESIZEOBSERVER (For Recharts & Sidebar)
const ResizeObserverMock = vi.fn(function() {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// 4. MOCK SCROLLTO
vi.stubGlobal('scrollTo', vi.fn());