import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginForm } from './login-form';
import { supabase } from '@/services/supabase_client';
import { toast } from 'sonner';

// --- 1. MOCK REACT ROUTER DOM ---
const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to}>{children}</a>,
  };
});

// --- 2. MOCK SUPABASE ---
vi.mock('@/services/supabase_client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

// --- 3. MOCK TOASTS ---
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LoginForm', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } });
  });

  it('renders login fields and buttons correctly', async () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /accedi/i })).toBeInTheDocument();
    expect(screen.getByText(/google/i)).toBeInTheDocument();
    expect(screen.getByText(/microsoft/i)).toBeInTheDocument();
  });

  it('shows validation error if fields are empty', async () => {
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /accedi/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText("Inserisci una mail valida")).toBeInTheDocument();
        expect(screen.getByText("Inserisci una password valida")).toBeInTheDocument();
    });
  });

  it('redirects to /home immediately if session already exists', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({ 
        data: { session: { user: { id: '123' } } } 
    });

    render(<LoginForm />);

    await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith('/home');
    });
  });

  it('logs in successfully with email and password', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: { id: '123' } },
        error: null
    });

    const submitButton = screen.getByRole('button', { name: /accedi/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
            email: 'user@example.com',
            password: 'password123'
        });
        
        expect(toast.success).toHaveBeenCalledWith("Bentornato!");
        expect(navigateMock).toHaveBeenCalledWith('/home');
    });
  });

  it('shows error toast when login fails', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });

    (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
    });

    const submitButton = screen.getByRole('button', { name: /accedi/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
        expect(navigateMock).not.toHaveBeenCalled();
    });
  });

  it('calls OAuth provider when clicking social buttons', async () => {
    render(<LoginForm />);

    (supabase.auth.signInWithOAuth as any).mockResolvedValue({ error: null });

    // 1. Click Google
    const googleBtn = screen.getByText(/google/i);
    fireEvent.click(googleBtn);

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(expect.objectContaining({
        provider: 'google'
    }));

    // 2. WAIT for loading to finish (Button must be enabled again)
    // Without this, the second click fails because the button is still disabled!
    await waitFor(() => {
        expect(googleBtn).not.toBeDisabled();
    });

    // 3. Click Microsoft
    const microsoftBtn = screen.getByText(/microsoft/i);
    fireEvent.click(microsoftBtn);

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(expect.objectContaining({
        provider: 'azure'
    }));
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find the toggle button (next to the input)
    const toggleButton = passwordInput.nextElementSibling as HTMLElement; 
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});