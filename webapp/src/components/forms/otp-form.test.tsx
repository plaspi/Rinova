import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OTPForm } from './otp-form';
import { supabase } from '@/services/supabase_client';
import { toast } from 'sonner';

const navigateMock = vi.fn();
const useLocationMock = vi.fn().mockReturnValue({ state: { email: 'test@example.com' } });

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => useLocationMock(),
  };
});

vi.mock('@/services/supabase_client', () => ({
  supabase: {
    auth: {
      verifyOtp: vi.fn(),
      resend: vi.fn(),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/ui/input-otp', () => ({
  InputOTP: ({ value, onChange }: any) => (
    <input 
      data-testid="otp-mock" 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
    />
  ),
  InputOTPGroup: ({ children }: any) => <div>{children}</div>,
  InputOTPSlot: () => <div />,
}));

describe('OTPForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // NOTE: No global useFakeTimers here, we use it locally only

  it('submits verification when 6 digits are entered', async () => {
    render(<OTPForm />);
    
    const input = screen.getByTestId('otp-mock');
    fireEvent.change(input, { target: { value: '123456' } });

    (supabase.auth.verifyOtp as any).mockResolvedValue({ error: null });

    fireEvent.click(screen.getByRole('button', { name: /verifica codice/i }));

    await waitFor(() => {
      expect(supabase.auth.verifyOtp).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith('/home');
    });
  });

  it('shows error if code is invalid', async () => {
    render(<OTPForm />);
    const input = screen.getByTestId('otp-mock');
    fireEvent.change(input, { target: { value: '000000' } });

    (supabase.auth.verifyOtp as any).mockResolvedValue({ error: { message: 'Invalid' } });

    fireEvent.click(screen.getByRole('button', { name: /verifica codice/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('handles timer and resend logic', async () => {
    vi.useFakeTimers(); // Start timers just for this test
    render(<OTPForm />);
    
    expect(screen.getByText(/60s/i)).toBeInTheDocument();

    // Advance time and force React to process the state update
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    // Check UI has updated (Synchronously, no waitFor needed)
    expect(screen.getByText(/invia di nuovo/i)).not.toHaveTextContent(/tra/);

    (supabase.auth.resend as any).mockResolvedValue({ error: null });
    fireEvent.click(screen.getByRole('button', { name: /invia di nuovo/i }));

    expect(supabase.auth.resend).toHaveBeenCalled();
    
    vi.useRealTimers(); // Cleanup
  });
});