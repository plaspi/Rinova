import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CerPage from './CerPage';
import { SidebarProvider } from '@/components/sidebar/sidebarLayout';
import { BrowserRouter } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

// --- MOCKS ---
vi.mock('@/context/authContext', () => ({
  useAuth: () => ({ user: { id: '123' }, isPro: true }), 
}));

vi.mock('@/services/supabase_client', () => ({
  supabase: { 
    auth: { getUser: vi.fn(), getSession: vi.fn() },
    from: vi.fn(() => ({ select: vi.fn(), eq: vi.fn() })) 
  }
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  Toaster: () => null
}));

// FIX: Mock Trigger as DIV to avoid <button><button> nesting error
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => <div onClick={onClick} role="button">{children}</div>,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => null,
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

const renderPage = () => render(
  <BrowserRouter>
    <SidebarProvider>
      <CerPage />
    </SidebarProvider>
  </BrowserRouter>
);

describe('CerPage', () => {
  const mockUserStatusMember = { id: '123', membership: { cer_id: 'cer_1', role: 'member' } };
  //const mockUserStatusAdmin = { id: '123', membership: { cer_id: 'cer_1', role: 'admin' } };
  
  const mockAnnunci = [
    { 
      id: 1, titolo: 'Avviso Importante', messaggio: 'Test messaggio', tipo: 'info', 
      created_at: new Date().toISOString(), is_pinned: false, author_id: '999', 
      users: { name: 'Admin', surname: 'User' }
    }
  ];
  
  const mockMembri = [
    { id: '123', nome: 'Mario', cognome: 'Rossi', role: 'member', stato: 'attivo', email: 'mario@test.com' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useMutation as any).mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it('renders "Non fai ancora parte di una CER" when no membership found', () => {
    (useQuery as any).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === 'cer-user-status') return { data: { id: '123', membership: null }, isLoading: false };
      return { data: [], isLoading: false };
    });

    renderPage();
    expect(screen.getByText(/non fai ancora parte di una cer/i)).toBeInTheDocument();
  });

  it('renders Dashboard for active members', () => {
    (useQuery as any).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === 'cer-user-status') return { data: mockUserStatusMember, isLoading: false };
      if (queryKey[0] === 'cer-annunci') return { data: mockAnnunci, isLoading: false };
      if (queryKey[0] === 'cer-membri') return { data: mockMembri, isLoading: false };
      return { data: null, isLoading: false };
    });

    renderPage();
    // Use Regex to be safe against case sensitivity
    expect(screen.getAllByText(/Attiva/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Avviso Importante')).toBeInTheDocument();
  });

  it('renders Member Table correctly', () => {
    (useQuery as any).mockImplementation(({ queryKey }: any) => {
      if (queryKey[0] === 'cer-user-status') return { data: mockUserStatusMember, isLoading: false };
      if (queryKey[0] === 'cer-membri') return { data: mockMembri, isLoading: false };
      return { data: [], isLoading: false };
    });

    renderPage();
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    expect(screen.getAllByText(/attivo/i).length).toBeGreaterThan(0);
  });
});