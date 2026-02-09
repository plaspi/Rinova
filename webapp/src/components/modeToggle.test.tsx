import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ModeToggle } from './modeToggle';
import { useTheme } from '@/components/themeProvider';
import { useAuth } from '@/context/authContext';

// --- MOCKS ---
vi.mock('@/components/themeProvider', () => ({
  useTheme: vi.fn(),
}));

vi.mock('@/context/authContext', () => ({
  useAuth: vi.fn(),
}));

// Mock Dropdown Menu to be simple (no Portal)
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

describe('ModeToggle', () => {
  it('changes theme on click', () => {
    const mockSetTheme = vi.fn();
    const mockUpdateSettings = vi.fn();

    (useTheme as any).mockReturnValue({ setTheme: mockSetTheme });
    (useAuth as any).mockReturnValue({ updateSettings: mockUpdateSettings });

    render(<ModeToggle />);

    // Click "Dark"
    const darkBtn = screen.getByText('Dark');
    fireEvent.click(darkBtn);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: 'dark' });
  });
});