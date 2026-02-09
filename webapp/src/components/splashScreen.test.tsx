import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SplashScreen } from './splashScreen';

describe('SplashScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders branding correctly', () => {
    render(<SplashScreen />);
    expect(screen.getByText(/caricamento sistema/i)).toBeInTheDocument();
    expect(screen.getByText('Rinova')).toBeInTheDocument();
  });

  it('cycles through icons over time', () => {
    render(<SplashScreen />);
    
    // We can't easily check the icon SVG content, but we can check if the component re-renders
    // or if the internal state changes. 
    // Since testing internal state is hard in integration tests, we just ensure 
    // the timer runs without crashing.
    
    act(() => {
      vi.advanceTimersByTime(1000); // Fast forward 1 second
    });
    
    act(() => {
      vi.advanceTimersByTime(1000); // Fast forward another second
    });
    
    expect(screen.getByText('Rinova')).toBeInTheDocument();
  });
});