import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotFound from './NotFound';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NotFound Page', () => {
  it('renders 404 message', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    expect(screen.getByText(/calo di tensione/i)).toBeInTheDocument();
    expect(screen.getByText('ERR_404')).toBeInTheDocument();
  });

  it('navigates home when button clicked', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    const homeBtn = screen.getByText(/vai alla dashboard/i);
    fireEvent.click(homeBtn);
    
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });
});