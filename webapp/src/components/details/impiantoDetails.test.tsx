import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImpiantoDetails } from './impiantoDetails';

describe('ImpiantoDetails', () => {
  const mockImpianto = {
    id: '123',
    nome: 'Impianto Test',
    tipo: 'Fotovoltaico',
    potenza: 6.5,
    produttore: 'SunPower',
    data_attivazione: '2023-01-01',
    stato: 'Attivo',
    pod: 'IT001E123456789'
  };

  const mockOnClose = vi.fn();

  it('renders nothing if impianto is null', () => {
    const { container } = render(<ImpiantoDetails impianto={null} onClose={mockOnClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders plant details correctly', () => {
    render(<ImpiantoDetails impianto={mockImpianto} onClose={mockOnClose} />);

    expect(screen.getByText('Impianto Test')).toBeInTheDocument();
    expect(screen.getByText('6.5 kW')).toBeInTheDocument();
    expect(screen.getByText('SunPower')).toBeInTheDocument();
    expect(screen.getByText('IT001E123456789')).toBeInTheDocument();
    // Check status badge
    expect(screen.getByText('Attivo')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ImpiantoDetails impianto={mockImpianto} onClose={mockOnClose} />);
    
    // There are two close buttons usually (X icon and "Chiudi" button)
    // We can target the text "Chiudi"
    const closeBtn = screen.getByText('Chiudi');
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});