import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsPage from './SettingsPage';
import { useAuth } from '@/context/authContext';
import { useTheme } from '@/components/themeProvider';
import { BrowserRouter } from 'react-router-dom';
import { SidebarProvider } from '@/components/sidebar/sidebarLayout';

// --- MOCKS ---
vi.mock('@/context/authContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/components/themeProvider', () => ({
  useTheme: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const renderSettings = () => render(
  <BrowserRouter>
    <SidebarProvider>
      <SettingsPage />
    </SidebarProvider>
  </BrowserRouter>
);

describe('SettingsPage', () => {
  const mockUpdateSettings = vi.fn();
  const mockSetTheme = vi.fn();

  const mockSettings = {
    theme: 'system',
    language: 'it',
    notifications: { email: true, push: false, marketing: false }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({ 
      settings: mockSettings, 
      updateSettings: mockUpdateSettings 
    });

    (useTheme as any).mockReturnValue({ 
      setTheme: mockSetTheme,
      theme: 'system'
    });
  });

  it('renders default General tab correctly', () => {
    renderSettings();
    expect(screen.getByText('Lingua e Regione')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Italiano (Italia)')).toBeInTheDocument();
  });

  it('switches tabs correctly', () => {
    renderSettings();
    fireEvent.click(screen.getByText('Notifiche'));
    expect(screen.getByText('Canali di Comunicazione')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Aspetto'));
    expect(screen.getByText('Tema Interfaccia')).toBeInTheDocument();
  });

  it('shows "Unsaved Changes" footer when modified', async () => {
    renderSettings();
    fireEvent.click(screen.getByText('Notifiche'));

    // Toggle switch
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]); 

    await waitFor(() => {
      expect(screen.getByText('Hai modifiche non salvate.')).toBeInTheDocument();
    });
  });

  it('saves changes when Save button is clicked', async () => {
    renderSettings();
    fireEvent.click(screen.getByText('Notifiche'));

    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]); 

    const saveBtn = screen.getByText('Salva Modifiche');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalled();
    });
  });
});