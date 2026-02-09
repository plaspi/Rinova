import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from './homePage';
import { useAuth } from '@/context/authContext';
// FIX 1: Import SidebarProvider
import { SidebarProvider } from '@/components/sidebar/sidebarLayout';
import { useQuery } from '@tanstack/react-query'; 
import { BrowserRouter } from 'react-router-dom';

// --- MOCKS ---

vi.mock('@/context/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('recharts', async () => {
  const Original = await vi.importActual('recharts');
  return {
    ...Original,
    ResponsiveContainer: ({ children }: any) => <div style={{ width: 500, height: 500 }}>{children}</div>,
    AreaChart: () => <div data-testid="mock-area-chart">Chart Rendered</div>,
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
  };
});

// FIX 2: Wrap in SidebarProvider so <SidebarTrigger> works
const renderHome = () => render(
  <BrowserRouter>
    <SidebarProvider>
      <HomePage />
    </SidebarProvider>
  </BrowserRouter>
);

describe('HomePage', () => {
  const mockStats = {
    produzione: 120.5,
    consumo: 80.2,
    batteria: 45, 
    risparmio_co2: 12,
    trend_produzione: "+10%",
    trend_consumo: "-5%"
  };

  const mockPlants = [
    { id: '1', nome: 'Impianto Nord', status: 'attivo' },
    { id: '2', nome: 'Impianto Sud', status: 'offline' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({ isPro: false });

    (useQuery as any).mockImplementation(({ queryKey }: any) => {
      const key = queryKey[0];
      
      if (key === 'dashboard-summary') return { data: mockStats, isLoading: false };
      if (key === 'dashboard-chart') return { data: [1,2,3], isLoading: false };
      if (key === 'dashboard-plants') return { data: mockPlants, isLoading: false };

      return { data: null, isLoading: false };
    });
  });

  it('renders KPI cards with correct data', () => {
    renderHome();
    expect(screen.getByText('120.5')).toBeInTheDocument(); 
    expect(screen.getByText('80.2')).toBeInTheDocument(); 
    expect(screen.getByText('45')).toBeInTheDocument();   
    expect(screen.getByText('+10%')).toBeInTheDocument();
  });

  it('renders plant list correctly', () => {
    renderHome();
    expect(screen.getByText('Impianto Nord')).toBeInTheDocument();
    expect(screen.getByText('Attivo')).toBeInTheDocument();
    expect(screen.getByText('Impianto Sud')).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('shows lock message for Free users on "Edit Widgets"', () => {
    (useAuth as any).mockReturnValue({ isPro: false });
    renderHome();
    const editBtn = screen.getByText(/modifica widget/i);
    fireEvent.click(editBtn);
  });

  it('shows loading state when data is fetching', () => {
    (useQuery as any).mockImplementation(() => ({ 
      data: undefined, 
      isLoading: true 
    }));

    renderHome();
    const loaders = screen.getAllByText('...');
    expect(loaders.length).toBeGreaterThan(0);
  });
});