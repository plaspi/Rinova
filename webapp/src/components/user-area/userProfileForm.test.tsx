import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProfileForm } from './userProfileForm';
import { useAuth } from '@/context/authContext';
import { supabase } from '@/services/supabase_client';
import { toast } from 'sonner';

// --- MOCKS ---
vi.mock('@/context/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/supabase_client', () => ({
  supabase: { 
    from: vi.fn(() => ({ 
      select: vi.fn(), 
      update: vi.fn(() => ({ eq: vi.fn() })) 
    })) 
  }
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('UserProfileForm', () => {
  const mockProfile = {
    name: 'Mario',
    surname: 'Rossi',
    email: 'test@example.com',
    zip_code: '00100',
    city: 'Roma',
    province: 'RM'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: { id: '123' }, profile: mockProfile });
  });

  it('pre-fills form with profile data', () => {
    render(<UserProfileForm />);
    expect(screen.getByLabelText('Nome')).toHaveValue('Mario');
    expect(screen.getByLabelText('Cognome')).toHaveValue('Rossi');
    expect(screen.getByLabelText('CAP')).toHaveValue('00100');
  });

  it('calls update on form submission', async () => {
    render(<UserProfileForm />);
    
    // Change name
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Luigi' } });

    // Mock Update Success
    const mockUpdate = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({
      update: () => ({ eq: mockUpdate })
    });

    fireEvent.click(screen.getByRole('button', { name: /salva anagrafica/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Profilo salvato.");
    });
  });
});