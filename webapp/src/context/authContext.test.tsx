import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './authContext';
import { supabase } from '@/services/supabase_client';

// Mock Supabase Client
vi.mock('@/services/supabase_client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'member' }, error: null }),
        })),
      })),
    })),
  },
}));

// Test Consumer Component to access Context values
const TestConsumer = () => {
  const { user, isLoading, signOut } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>No User</div>;
  return (
    <div>
      <span>User: {user.email}</span>
      <button onClick={signOut}>Log Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockUser = { id: '123', email: 'test@example.com' };
  const mockSession = { user: mockUser };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with session if found', async () => {
    // 1. Mock Session Found
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: mockSession } });
    (supabase.auth.onAuthStateChange as any).mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // 2. Expect Loading then User
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });
  });

  it('handles logout correctly', async () => {
    // 1. Start Logged In
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: mockSession } });
    (supabase.auth.onAuthStateChange as any).mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    (supabase.auth.signOut as any).mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => screen.getByText('User: test@example.com'));

    // 2. Enable Fake Timers BEFORE clicking
    vi.useFakeTimers();

    // 3. Click Logout
    const btn = screen.getByText('Log Out');
    fireEvent.click(btn);

    // 4. Fast-forward the 2500ms delay
    await act(async () => {
        vi.advanceTimersByTime(2500);
    });

    vi.useRealTimers();

    // 5. Verify
    await waitFor(() => {
        expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});