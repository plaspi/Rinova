import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach} from 'vitest';
import { ForgotPasswordForm } from './forgot-password-form';
import { supabase } from '@/services/supabase_client';
import { toast } from 'sonner';

// --- FIX: MOCK REACT ROUTER DOM ---
// This prevents the "basename is null" error
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ to, children }: any) => <a href={to}>{children}</a>,
    useNavigate: () => vi.fn(),
  };
});

// --- MOCKS ---
vi.mock('@/services/supabase_client', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const originalLocation = window.location;

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  it('renders correctly', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText(/recupera password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('sends password reset email on valid submission', async () => {
    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null });

    fireEvent.click(screen.getByRole('button', { name: /invia email/i }));

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.objectContaining({ redirectTo: expect.stringContaining('update-password') })
      );
      expect(toast.success).toHaveBeenCalledWith("Email di recupero inviata");
      expect(screen.getByText(/email inviata!/i)).toBeInTheDocument();
    });
  });

  it('shows error toast on failure', async () => {
    render(<ForgotPasswordForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'fail@example.com' } });
    
    (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ 
      error: { message: 'Network error' } 
    });

    fireEvent.click(screen.getByRole('button', { name: /invia email/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });
  });
});