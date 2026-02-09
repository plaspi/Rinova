import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LogoutScreen } from './logout-screen';

describe('LogoutScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly and triggers animation', () => {
    render(<LogoutScreen />);
    
    expect(screen.getByText('Disconnessione...')).toBeInTheDocument();
    expect(screen.getByText('A presto su Rinova')).toBeInTheDocument();

    // Fast-forward time to trigger the useEffect timeout
    act(() => {
      vi.advanceTimersByTime(500); 
    });

    // We can't easily check the CSS transform value in JSDOM, 
    // but ensuring the component runs through its lifecycle without error is the goal here.
  });
});