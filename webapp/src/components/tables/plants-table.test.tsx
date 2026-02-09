import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PlantsTable } from './plants-table';

const mockData = [
  { id: '1', nome: 'Solar 1', potenza: 5, stato: 'attivo', tipo: 'fotovoltaico', data_attivazione: '2023-01-01' },
  { id: '2', nome: 'Wind A', potenza: 10, stato: 'offline', tipo: 'eolico', data_attivazione: '2023-02-01' }
];

describe('PlantsTable', () => {
  it('renders all plants initially', () => {
    render(<PlantsTable data={mockData} />);
    expect(screen.getByText('Solar 1')).toBeInTheDocument();
    expect(screen.getByText('Wind A')).toBeInTheDocument();
  });

  it('filters plants by name', () => {
    render(<PlantsTable data={mockData} />);
    const searchInput = screen.getByPlaceholderText(/cerca impianto/i);
    fireEvent.change(searchInput, { target: { value: 'Wind' } });

    expect(screen.getByText('Wind A')).toBeInTheDocument();
    expect(screen.queryByText('Solar 1')).not.toBeInTheDocument();
  });
});