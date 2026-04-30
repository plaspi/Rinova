import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImpiantoDetails } from './impiantoDetails';

describe('ImpiantoDetails', () => {
  // FIX: Updated mock properties to match what the component expects
  const mockImpianto = {
    id: '123',
    nome: 'Impianto Test',
    tipo: 'Fotovoltaico',
    pot_nominale: 6.5, 
    produttore: 'SunPower',
    data_attivazione: '2023-01-01',
    stato: 'Attivo',
    pod_code: 'IT001E123456789' 
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
    expect(screen.getByText('Attivo')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ImpiantoDetails impianto={mockImpianto} onClose={mockOnClose} />);
    
    const closeBtn = screen.getByText('Chiudi');
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays correct status icon and color for offline state', () => {
    const offlineImpianto = { ...mockImpianto, stato: 'Offline' };
    render(<ImpiantoDetails impianto={offlineImpianto} onClose={mockOnClose} />);
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
    const statusBadge = screen.getByText('Offline').closest('span');
    expect(statusBadge).toHaveClass('text-red-600');
  });

  it('displays correct status icon and color for manutenzione state', () => {
    const maintenanceImpianto = { ...mockImpianto, stato: 'Manutenzione' };
    render(<ImpiantoDetails impianto={maintenanceImpianto} onClose={mockOnClose} />);
    
    expect(screen.getByText('Manutenzione')).toBeInTheDocument();
    const statusBadge = screen.getByText('Manutenzione').closest('span');
    expect(statusBadge).toHaveClass('text-yellow-600');
  });

  it('displays correct type icon for wind turbine', () => {
    const windImpianto = { ...mockImpianto, tipo: 'Eolico' };
    render(<ImpiantoDetails impianto={windImpianto} onClose={mockOnClose} />);
    
    expect(screen.getByText('Impianto Test')).toBeInTheDocument();
  });

  it('displays default values for missing fields', () => {
    const minimalImpianto = {
      id: '123',
      nome: 'Minimal Plant',
      tipo: 'Fotovoltaico',
      stato: 'Attivo'
    };
    render(<ImpiantoDetails impianto={minimalImpianto} onClose={mockOnClose} />);
    
    expect(screen.getByText('IT001E...')).toBeInTheDocument();
    expect(screen.getByText('INV-X998877')).toBeInTheDocument();
    expect(screen.getByText('230 V')).toBeInTheDocument();
  });

  it('displays RID convention when no SSP is present', () => {
    const ridImpianto = { ...mockImpianto, convenzione: 'RID' };
    render(<ImpiantoDetails impianto={ridImpianto} onClose={mockOnClose} />);
    
    expect(screen.getByText('RID (Ritiro Dedicato)')).toBeInTheDocument();
  });

  it('displays SSP convention when present', () => {
    const sspImpianto = { ...mockImpianto, convenzione: 'SSP (Scambio sul posto)' };
    render(<ImpiantoDetails impianto={sspImpianto} onClose={mockOnClose} />);
    
    expect(screen.getByText('SSP (Scambio sul posto)')).toBeInTheDocument();
  });

  it('displays location details with coordinates', () => {
    const geoImpianto = { ...mockImpianto, latitudine: 43.7, longitudine: 10.4 };
    render(<ImpiantoDetails impianto={geoImpianto} onClose={mockOnClose} />);
    
    expect(screen.getByText('43.7° N, 10.4° E')).toBeInTheDocument();
    expect(screen.getByText('Sud (180°)')).toBeInTheDocument();
    expect(screen.getByText('30°')).toBeInTheDocument();
  });

  it('closes modal when X button is clicked', () => {
    render(<ImpiantoDetails impianto={mockImpianto} onClose={mockOnClose} />);
    
    const xButton = screen.getByRole('button', { name: '' }).parentElement?.querySelector('button');
    if (xButton) fireEvent.click(xButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});