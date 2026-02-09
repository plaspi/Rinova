import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from './LoginPage';
import RegistrationPage from './RegistrationPage';
import { BrowserRouter } from 'react-router-dom';

// --- MOCKS ---
// Mock the heavy children components to test only the Page Layout logic
vi.mock('@/components/forms/login-form', () => ({ LoginForm: () => <div data-testid="login-form">Login Form</div> }));
vi.mock('@/components/forms/registration-form', () => ({ RegistrationForm: () => <div data-testid="reg-form">Reg Form</div> }));
vi.mock('@/components/registrationCarousel', () => ({ RegistrationCarousel: () => <div data-testid="carousel">Carousel</div> }));
vi.mock('@/components/rinova-logo', () => ({ RinovaLogo: () => <svg data-testid="logo" /> }));

// Mock Auth Context to prevent redirection logic
vi.mock('@/context/authContext', () => ({ useAuth: () => ({ user: null }) }));

describe('Auth Pages', () => {
  it('LoginPage renders form and carousel', () => {
    render(<BrowserRouter><LoginPage /></BrowserRouter>);
    
    // Check Header Text
    expect(screen.getByText('Accedi')).toBeInTheDocument();
    
    // Check Components
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
  });

  it('RegistrationPage renders form and carousel', () => {
    render(<BrowserRouter><RegistrationPage /></BrowserRouter>);
    
    // Check Header Text
    expect(screen.getByText('Crea un account')).toBeInTheDocument();
    
    // Check Components
    expect(screen.getByTestId('reg-form')).toBeInTheDocument();
    expect(screen.getByTestId('carousel')).toBeInTheDocument();
  });
});