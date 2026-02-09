import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserAvatarCard } from './userAvatarCard';
import { useAuth } from '@/context/authContext';
import { supabase } from '@/services/supabase_client';
import { toast } from 'sonner';

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
    from: vi.fn(), // We mock the return value inside tests
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

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
    render(<UserAvatarCard />);
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('handles avatar upload successfully', async () => {
    const { container } = render(<UserAvatarCard />);

    // 1. Mock Storage Upload
    const mockUpload = vi.fn().mockResolvedValue({ error: null });
    const mockGetUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'http://new-avatar.jpg' } });
    
    (supabase.storage.from as any).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetUrl,
    });

    // 2. Mock Database Update (Chained Mocks)
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    
    (supabase.from as any).mockReturnValue({
      update: mockUpdate,
    });

    // 3. Simulate File Selection
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    
    // Find hidden input
    const fileInput = container.querySelector('#avatar-upload') as HTMLInputElement;
    if (!fileInput) throw new Error("File input not found!");

    fireEvent.change(fileInput, { target: { files: [file] } });

    // 4. Assertions
    await waitFor(() => {
      // Check Upload
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('user_123/avatar-'), 
        file,
        expect.anything()
      );

      // Check DB Update - Now mockUpdate captures the correct call
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ avatar_url: 'http://new-avatar.jpg' })
      );

      // Check Refresh & Toast
      expect(mockRefreshProfile).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Foto profilo aggiornata!");
    });
  });
});