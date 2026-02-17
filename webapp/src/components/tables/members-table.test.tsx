import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MembersTable } from './members-table';
import { BrowserRouter } from 'react-router-dom';

// --- MOCKS ---
// 1. Mock Tanstack Query so useQueryClient doesn't crash the test
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() })
}));

// 2. Mock Supabase for the status update function
vi.mock('@/services/supabase_client', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({ eq: vi.fn() }))
    }))
  }
}));

// 3. Mock Sonner for the toast notifications
vi.mock('sonner', () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() }
}));

// 4. Mock Dropdown to prevent nested button warnings
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => null,
  DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
}));

const mockData = Array.from({ length: 10 }, (_, i) => ({
  id: `${i}`,
  nome: `User${i}`,
  cognome: `Test${i}`,
  email: `user${i}@test.com`,
  ruolo: 'member',
  stato: i % 2 === 0 ? 'attivo' : 'sospeso',
  avatar_url: null
}));

const renderTable = () => render(
  <BrowserRouter>
    <MembersTable data={mockData as any} currentUserRole="admin" />
  </BrowserRouter>
);

describe('MembersTable', () => {
  it('renders correct number of rows (Pagination limit is 8)', () => {
    renderTable();
    
    expect(screen.getByText('User0 Test0')).toBeInTheDocument();
    expect(screen.getByText('User7 Test7')).toBeInTheDocument();
    
    // User8 should be paginated to page 2
    expect(screen.queryByText('User8 Test8')).not.toBeInTheDocument();
  });

  it('filters by name', () => {
    renderTable();
    const searchInput = screen.getByPlaceholderText(/cerca per nome/i);
    fireEvent.change(searchInput, { target: { value: 'User5' } });

    expect(screen.getByText('User5 Test5')).toBeInTheDocument();
    expect(screen.queryByText('User0 Test0')).not.toBeInTheDocument();
  });
});