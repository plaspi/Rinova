import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserPasswordForm } from './userPasswordForm';
import { supabase } from '@/services/supabase_client';
import { toast } from 'sonner';

vi.mock('@/services/supabase_client', () => ({
  supabase: { 
    auth: { updateUser: vi.fn() } 
  }
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('UserPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error if passwords do not match', async () => {
    render(<UserPasswordForm />);
    
    const inputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(inputs[0], { target: { value: 'Pass1' } });
    fireEvent.change(inputs[1], { target: { value: 'Pass2' } });

    fireEvent.click(screen.getByText('Aggiorna Password'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Le password non coincidono o sono vuote.");
    });
  });

  it('calls updateUser on valid submission', async () => {
    render(<UserPasswordForm />);
    
    const inputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(inputs[0], { target: { value: 'NewSafePass1!' } });
    fireEvent.change(inputs[1], { target: { value: 'NewSafePass1!' } });

    (supabase.auth.updateUser as any).mockResolvedValue({ error: null });

    fireEvent.click(screen.getByText('Aggiorna Password'));

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'NewSafePass1!' });
      expect(toast.success).toHaveBeenCalledWith("Password aggiornata.");
    });
  });
});