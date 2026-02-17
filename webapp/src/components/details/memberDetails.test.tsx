import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemberDetails } from './memberDetails';

describe('MemberDetails', () => {
  // FIX: Updated mock properties
  const mockMember = {
    id: 'user_1',
    nome: 'Luigi',
    cognome: 'Verdi',
    email: 'luigi@test.com',
    ruolo: 'Member',
    stato: 'attivo',
    impianto: 'IT001E999', 
    avatar_url: null,
    ssn: 'VRDLGU80A01H501U' 
  };

  const mockOnClose = vi.fn();

  it('renders member info correctly', () => {
    render(<MemberDetails member={mockMember} onClose={mockOnClose} />);

    expect(screen.getByText('Luigi Verdi')).toBeInTheDocument();
    expect(screen.getByText('luigi@test.com')).toBeInTheDocument();
    expect(screen.getByText('IT001E999')).toBeInTheDocument();
    expect(screen.getByText('VRDLGU80A01H501U')).toBeInTheDocument();
  });

  it('renders status badge correctly', () => {
    render(<MemberDetails member={mockMember} onClose={mockOnClose} />);
    // FIX: Look for capitalized "Attivo"
    expect(screen.getByText('Attivo')).toHaveClass('text-green-600'); 
  });

  it('calls onClose when close button is clicked', () => {
    render(<MemberDetails member={mockMember} onClose={mockOnClose} />);
    
    const closeBtn = screen.getByRole('button', { name: /chiudi/i });
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});