import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NewPasswordForm } from './new-password-form';
import { supabase } from '@/services/supabase_client';
import { toast } from 'sonner';

// --- MOCKS ---
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    Link: ({ to, children }: any) => <a href={to}>{children}</a>,
  };
});

vi.mock('@/services/supabase_client', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('NewPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<NewPasswordForm />);
    expect(screen.getByLabelText(/nuova password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/conferma password/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(<NewPasswordForm />);
    
    fireEvent.change(screen.getByLabelText(/nuova password/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/conferma password/i), { target: { value: 'DifferentPass!' } });
    
    fireEvent.click(screen.getByRole('button', { name: /imposta password/i }));

    await waitFor(() => {
      expect(screen.getByText("Le password non coincidono")).toBeInTheDocument();
    });
  });

  it('updates password successfully and redirects', async () => {
    render(<NewPasswordForm />);
    
    // 1. Fill Valid Passwords
    fireEvent.change(screen.getByLabelText(/nuova password/i), { target: { value: 'NewStrongPass1!' } });
    fireEvent.change(screen.getByLabelText(/conferma password/i), { target: { value: 'NewStrongPass1!' } });

    // 2. Mock Success
    (supabase.auth.updateUser as any).mockResolvedValue({ error: null });

    // 3. Submit
    fireEvent.click(screen.getByRole('button', { name: /imposta password/i }));

    // 4. Assert Supabase call (happens immediately)
    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'NewStrongPass1!' });
      expect(toast.success).toHaveBeenCalledWith("Password aggiornata con successo!");
    });

    // 5. Assert Redirect (happens after 1.2s delay)
    // We increase timeout to 3000ms so the test waits long enough for the delay to finish
    await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 }); 
  });
});