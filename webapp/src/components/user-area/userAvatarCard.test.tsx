import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserAvatarCard } from './userAvatarCard';
import { useAuth } from '@/context/authContext';
import { supabase } from '@/services/supabase_client';
import { toast } from 'sonner';
import { BrowserRouter } from 'react-router-dom';

// --- MOCKS ---
vi.mock('@/context/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/supabase_client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
    from: vi.fn(), 
    rpc: vi.fn(),
    auth: { signOut: vi.fn() }
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const renderComponent = () => render(
  <BrowserRouter>
    <UserAvatarCard />
  </BrowserRouter>
);

describe('UserAvatarCard', () => {
  const mockRefreshProfile = vi.fn();
  const mockUser = { id: 'user_123', email: 'test@example.com' };
  const mockProfile = { name: 'Mario', surname: 'Rossi', avatar_url: 'http://old-avatar.jpg' };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: mockUser,
      profile: mockProfile,
      refreshProfile: mockRefreshProfile,
    });
  });

  it('renders user info correctly', () => {
    renderComponent();
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('handles avatar upload successfully', async () => {
    const { container } = renderComponent();

    const mockUpload = vi.fn().mockResolvedValue({ error: null });
    const mockGetUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'http://new-avatar.jpg' } });
    
    (supabase.storage.from as any).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetUrl,
    });

    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    
    (supabase.from as any).mockReturnValue({
      update: mockUpdate,
    });

    const file = new File(['dummy'], 'avatar.png', { type: 'image/png' });
    const fileInput = container.querySelector('#avatar-upload') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('user_123/avatar-'), 
        file,
        expect.anything()
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ avatar_url: 'http://new-avatar.jpg' })
      );
      expect(mockRefreshProfile).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Foto profilo aggiornata!");
    });
  });
});