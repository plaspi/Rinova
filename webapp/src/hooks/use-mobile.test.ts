import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  it('returns false for desktop width', () => {
    // 1. Mock Desktop Width
    window.innerWidth = 1024;
    
    // 2. Run Hook
    const { result } = renderHook(() => useIsMobile());
    
    // 3. Assert
    expect(result.current).toBe(false);
  });

  // Note: Testing the resize event listener in JSDOM is complex because we mocked matchMedia globally in setup.ts.
  // The basic test above confirms the initial logic works.
});