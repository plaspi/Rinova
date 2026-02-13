import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MembersTable } from './members-table';
import { BrowserRouter } from 'react-router-dom';

// --- MOCKS ---
// FIX: Using <div> instead of <button> for Trigger to prevent nesting errors 
// since MembersTable wraps a <Button> inside the Trigger.
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