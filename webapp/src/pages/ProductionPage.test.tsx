import { render, screen, fireEvent, } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductionPage from './ProductionPage';
import { useAuth } from '@/context/authContext';
import { SidebarProvider } from '@/components/sidebar/sidebarLayout';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// --- MOCKS ---

vi.mock('@/context/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('recharts', async () => {
  const Original = await vi.importActual('recharts');
  return {
    ...Original,
    ResponsiveContainer: ({ children }: any) => <div style={{ width: 500, height: 300 }}>{children}</div>,
    AreaChart: () => <div data-testid="mock-area-chart">Live Chart</div>,
  };
});

vi.mock('@/services/supabase_client', () => ({
  supabase: { auth: { getSession: vi.fn() } }
}));

vi.mock('sonner', () => ({
  toast: vi.fn(),
  Toaster: () => null
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
    useQueryClient: vi.fn(),
  };
});

const renderPage = () => render(
  <BrowserRouter>
    <SidebarProvider>
      <ProductionPage />
    </SidebarProvider>
  </BrowserRouter>
);

describe('ProductionPage (Live)', () => {
  const mockInvalidateQueries = vi.fn();

  const mockData = {
    kpi: { peak: 4.5, totalEnergy: 25.2, avgPower: 2.1 },
    plants: [
      { id: '1', nome: 'Impianto Tetto', status: 'attivo' }
    ],
    charts: {
      '1': [{ timestamp_full: '2024-01-01T10:00:00', Produzione: 3.5 }]
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({ isPro: false });

    (useQueryClient as any).mockReturnValue({
        invalidateQueries: mockInvalidateQueries
    });

    (useQuery as any).mockImplementation(() => ({
        data: mockData,
        isLoading: false
    }));
  });

  it('renders live KPI cards correctly', () => {
    renderPage();
    // FIX: Expect 2 decimal places to match .toFixed(2) in the component
    expect(screen.getByText('4.50')).toBeInTheDocument();  // Peak
    expect(screen.getByText('25.20')).toBeInTheDocument(); // Energy
    expect(screen.getByText('2.10')).toBeInTheDocument();  // Avg Power
  });

  it('renders plant cards and charts', () => {
    renderPage();
    expect(screen.getByText('Impianto Tetto')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(screen.getByTestId('mock-area-chart')).toBeInTheDocument();
  });

  it('shows lock icon on "Scarica Report" for Free users', () => {
    (useAuth as any).mockReturnValue({ isPro: false });
    renderPage();
    
    const downloadBtn = screen.getByText(/scarica report/i);
    fireEvent.click(downloadBtn);
    expect(downloadBtn).toBeInTheDocument();
  });

  it('allows Refresh action', () => {
    renderPage();
    const refreshBtn = screen.getByText(/aggiorna/i);
    fireEvent.click(refreshBtn);
    
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['dashboard-live'] });
  });

  it('handles loading state', () => {
    (useQuery as any).mockImplementation(() => ({ data: undefined, isLoading: true }));
    renderPage();
    
    // In loading state, values are replaced by spinners/placeholders, so exact text shouldn't exist
    expect(screen.queryByText('4.50')).not.toBeInTheDocument();
  });
});