import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlantsTable } from './plants-table';

vi.mock('@/context/plantsContext', () => ({
  usePlants: () => ({ updatePlantStatus: vi.fn() })
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() })
}));

const mockData = [
  { id: '1', nome: 'Solar 1', potenza: 5, stato: 'attivo', tipo: 'fotovoltaico', data_attivazione: '2023-01-01', produttore: 'Prod A' },
  { id: '2', nome: 'Wind A', potenza: 10, stato: 'offline', tipo: 'eolico', data_attivazione: '2023-02-01', produttore: 'Prod B' }
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

  it('filters plants by ID', () => {
    render(<PlantsTable data={mockData} />);
    const searchInput = screen.getByPlaceholderText(/cerca impianto/i);
    fireEvent.change(searchInput, { target: { value: '1' } });

    expect(screen.getByText('Solar 1')).toBeInTheDocument();
    expect(screen.queryByText('Wind A')).not.toBeInTheDocument();
  });

  it('shows "Nessun impianto trovato" when no results match filter', () => {
    render(<PlantsTable data={mockData} />);
    const searchInput = screen.getByPlaceholderText(/cerca impianto/i);
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });

    expect(screen.getByText('Nessun impianto trovato.')).toBeInTheDocument();
  });

  it('displays plant power in kW', () => {
    render(<PlantsTable data={mockData} />);
    expect(screen.getByText('5 kW')).toBeInTheDocument();
    expect(screen.getByText('10 kW')).toBeInTheDocument();
  });

  it('displays plant status badges', () => {
    render(<PlantsTable data={mockData} />);
    expect(screen.getByText('attivo')).toBeInTheDocument();
    expect(screen.getByText('offline')).toBeInTheDocument();
  });

  it('displays activation date formatted correctly', () => {
    render(<PlantsTable data={mockData} />);
    const expectedDate = new Date('2023-01-01').toLocaleDateString();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it('clears filter and shows all plants when search is empty', () => {
    render(<PlantsTable data={mockData} />);
    const searchInput = screen.getByPlaceholderText(/cerca impianto/i) as HTMLInputElement;
    
    fireEvent.change(searchInput, { target: { value: 'Wind' } });
    expect(screen.queryByText('Solar 1')).not.toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Solar 1')).toBeInTheDocument();
    expect(screen.getByText('Wind A')).toBeInTheDocument();
  });
});