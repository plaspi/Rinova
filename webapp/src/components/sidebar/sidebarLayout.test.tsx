import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Sidebar, SidebarProvider, SidebarTrigger } from './sidebarLayout';
import { useAuth } from '@/context/authContext';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/context/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/components/logout-screen', () => ({
  LogoutScreen: () => <div data-testid="logout-screen">Logging out...</div>
}));

// Mock Dropdown to be flattened (Always visible)
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => null,
  DropdownMenuGroup: ({ children }: any) => <div>{children}</div>,
}));

const renderSidebar = () => {
  return render(
    <BrowserRouter>
      <SidebarProvider>
        <Sidebar />
        <SidebarTrigger /> 
      </SidebarProvider>
    </BrowserRouter>
  );
};

describe('Sidebar Component', () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: { email: 'test@rinova.it' },
      profile: {
        name: 'Mario',
        surname: 'Rossi',
        role: 'admin',
        avatar_url: null,
      },
      signOut: mockSignOut,
      isLoggingOut: false,
    });
  });

  it('renders user details correctly', () => {
    renderSidebar();
    
    // FIX: Use getAllByText because the name appears in the Footer AND the Dropdown Header
    expect(screen.getAllByText('Mario Rossi').length).toBeGreaterThan(0);
    expect(screen.getAllByText('test@rinova.it').length).toBeGreaterThan(0);
    
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderSidebar();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Produzione Live')).toBeInTheDocument();
    expect(screen.getByText('Gestione CER')).toBeInTheDocument();
  });

  it('handles logout interaction', () => {
    renderSidebar();

    // Since we mocked the dropdown to be open, we can click immediately
    const logoutItem = screen.getByText(/log out/i);
    fireEvent.click(logoutItem);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('shows logout screen when isLoggingOut is true', () => {
    (useAuth as any).mockReturnValue({
      user: { email: 'test@rinova.it' },
      profile: { name: 'Mario', surname: 'Rossi' },
      isLoggingOut: true, 
    });

    renderSidebar();
    expect(screen.getByTestId('logout-screen')).toBeInTheDocument();
  });
});