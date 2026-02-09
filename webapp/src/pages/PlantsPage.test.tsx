import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlantsPage from './PlantsPage';
import { SidebarProvider } from '@/components/sidebar/sidebarLayout';
import { BrowserRouter } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

// --- MOCKS ---
vi.mock('@/context/authContext', () => ({
  useAuth: () => ({ user: { id: '123' }, isPro: false }),
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

// CRITICAL: Mock Leaflet Map to avoid JSDOM errors
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="mock-map">{children}</div>,
  TileLayer: () => <div />,
  Marker: () => <div />,
  useMapEvents: () => null,
}));

vi.mock('leaflet', () => ({
  default: {
    icon: vi.fn(),
    Marker: { prototype: { options: {} } }
  }
}));

vi.mock('@/services/supabase_client', () => ({
  supabase: { from: vi.fn() }
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
  Toaster: () => null
}));

const renderPage = () => render(
  <BrowserRouter>
    <SidebarProvider>
      <PlantsPage />
    </SidebarProvider>
  </BrowserRouter>
);

describe('PlantsPage', () => {
  const mockPlants = [
    { id: '1', nome: 'Impianto Casa', potenza: 6.0, stato: 'attivo', tipo: 'fotovoltaico', data_attivazione: '2023-01-01' },
    { id: '2', nome: 'Impianto Box', potenza: 3.0, stato: 'offline', tipo: 'eolico', data_attivazione: '2023-05-01' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useMutation as any).mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it('renders list of plants and KPI', () => {
    (useQuery as any).mockImplementation(() => ({
      data: mockPlants,
      isLoading: false
    }));

    renderPage();

    // Check KPIs
    expect(screen.getByText('9.00 kW')).toBeInTheDocument();
    
    // Check Table
    expect(screen.getByText('Impianto Casa')).toBeInTheDocument();
    expect(screen.getByText('Impianto Box')).toBeInTheDocument();
    expect(screen.getAllByText(/attivo/i).length).toBeGreaterThan(0);
  });

  it('opens "Nuovo Impianto" dialog', () => {
    (useQuery as any).mockImplementation(() => ({ data: [], isLoading: false }));
    renderPage();

    // Use regex to find button flexibly
    const addBtn = screen.getByText(/nuovo impianto/i);
    fireEvent.click(addBtn);

    expect(screen.getByText('Registra Nuovo Impianto')).toBeInTheDocument();
    expect(screen.getByTestId('mock-map')).toBeInTheDocument();
  });
});